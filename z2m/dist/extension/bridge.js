"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const jszip_1 = __importDefault(require("jszip"));
const object_assign_deep_1 = __importDefault(require("object-assign-deep"));
const winston_transport_1 = __importDefault(require("winston-transport"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const device_1 = require("zigbee-herdsman/dist/controller/model/device");
const zhc = __importStar(require("zigbee-herdsman-converters"));
const device_2 = __importDefault(require("../model/device"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importStar(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
class Bridge extends extension_1.default {
    #requestRegex = new RegExp(`${settings.get().mqtt.base_topic}/bridge/request/(.*)`);
    // set on `start`
    #osInfo;
    zigbee2mqttVersion;
    zigbeeHerdsmanVersion;
    zigbeeHerdsmanConvertersVersion;
    coordinatorVersion;
    restartRequired = false;
    lastJoinedDeviceIeeeAddr;
    lastBridgeLoggingPayload;
    logTransport;
    requestLookup = {
        "device/options": this.deviceOptions,
        /** @deprecated 3.0 */
        "device/configure_reporting": this.deviceReportingConfigure,
        "device/reporting/configure": this.deviceReportingConfigure,
        "device/reporting/read": this.deviceReportingRead,
        "device/remove": this.deviceRemove,
        "device/interview": this.deviceInterview,
        "device/generate_external_definition": this.deviceGenerateExternalDefinition,
        "device/rename": this.deviceRename,
        "group/add": this.groupAdd,
        "group/options": this.groupOptions,
        "group/remove": this.groupRemove,
        "group/rename": this.groupRename,
        permit_join: this.permitJoin,
        restart: this.restart,
        backup: this.backup,
        "touchlink/factory_reset": this.touchlinkFactoryReset,
        "touchlink/identify": this.touchlinkIdentify,
        "install_code/add": this.installCodeAdd,
        "touchlink/scan": this.touchlinkScan,
        health_check: this.healthCheck,
        coordinator_check: this.coordinatorCheck,
        options: this.bridgeOptions,
        action: this.action,
    };
    async start() {
        const debugToMQTTFrontend = settings.get().advanced.log_debug_to_mqtt_frontend;
        const bridgeLogging = (message, level, namespace) => {
            const payload = (0, json_stable_stringify_without_jsonify_1.default)({ message, level, namespace });
            if (payload !== this.lastBridgeLoggingPayload) {
                this.lastBridgeLoggingPayload = payload;
                void this.mqtt.publish("bridge/logging", payload, { skipLog: true });
            }
        };
        if (debugToMQTTFrontend) {
            class DebugEventTransport extends winston_transport_1.default {
                log(info, next) {
                    bridgeLogging(info.message, info.level, info.namespace);
                    next();
                }
            }
            this.logTransport = new DebugEventTransport();
        }
        else {
            class EventTransport extends winston_transport_1.default {
                log(info, next) {
                    if (info.level !== "debug") {
                        bridgeLogging(info.message, info.level, info.namespace);
                    }
                    next();
                }
            }
            this.logTransport = new EventTransport();
        }
        logger_1.default.addTransport(this.logTransport);
        const os = await import("node:os");
        const process = await import("node:process");
        const logicalCpuCores = os.cpus();
        this.#osInfo = {
            version: `${os.version()} - ${os.release()} - ${os.arch()}`,
            node_version: process.version,
            cpus: `${[...new Set(logicalCpuCores.map((cpu) => cpu.model))].join(" | ")} (x${logicalCpuCores.length})`,
            memory_mb: Math.round(os.totalmem() / 1024 / 1024),
        };
        this.zigbee2mqttVersion = await utils_1.default.getZigbee2MQTTVersion();
        this.zigbeeHerdsmanVersion = await utils_1.default.getDependencyVersion("zigbee-herdsman");
        this.zigbeeHerdsmanConvertersVersion = await utils_1.default.getDependencyVersion("zigbee-herdsman-converters");
        this.coordinatorVersion = await this.zigbee.getCoordinatorVersion();
        this.eventBus.onEntityRenamed(this, async () => {
            await this.publishInfo();
        });
        this.eventBus.onGroupMembersChanged(this, async () => {
            await this.publishGroups();
        });
        this.eventBus.onDevicesChanged(this, async () => {
            await this.publishDevices();
            await this.publishInfo();
            await this.publishDefinitions();
        });
        this.eventBus.onPermitJoinChanged(this, async () => {
            if (!this.zigbee.isStopping()) {
                await this.publishInfo();
            }
        });
        this.eventBus.onScenesChanged(this, async () => {
            await this.publishDevices();
            await this.publishGroups();
        });
        // Zigbee events
        this.eventBus.onDeviceJoined(this, async (data) => {
            this.lastJoinedDeviceIeeeAddr = data.device.ieeeAddr;
            await this.publishDevices();
            const payload = {
                type: "device_joined",
                data: { friendly_name: data.device.name, ieee_address: data.device.ieeeAddr },
            };
            await this.mqtt.publish("bridge/event", (0, json_stable_stringify_without_jsonify_1.default)(payload));
        });
        this.eventBus.onDeviceLeave(this, async (data) => {
            await this.publishDevices();
            await this.publishDefinitions();
            const payload = { type: "device_leave", data: { ieee_address: data.ieeeAddr, friendly_name: data.name } };
            await this.mqtt.publish("bridge/event", (0, json_stable_stringify_without_jsonify_1.default)(payload));
        });
        this.eventBus.onDeviceNetworkAddressChanged(this, async () => {
            await this.publishDevices();
        });
        this.eventBus.onDeviceInterview(this, async (data) => {
            await this.publishDevices();
            let payload;
            if (data.status === "successful") {
                payload = {
                    type: "device_interview",
                    data: {
                        friendly_name: data.device.name,
                        status: data.status,
                        ieee_address: data.device.ieeeAddr,
                        supported: data.device.isSupported,
                        definition: this.getDefinitionPayload(data.device),
                    },
                };
            }
            else {
                payload = {
                    type: "device_interview",
                    data: { friendly_name: data.device.name, status: data.status, ieee_address: data.device.ieeeAddr },
                };
            }
            await this.mqtt.publish("bridge/event", (0, json_stable_stringify_without_jsonify_1.default)(payload));
        });
        this.eventBus.onDeviceAnnounce(this, async (data) => {
            await this.publishDevices();
            const payload = {
                type: "device_announce",
                data: { friendly_name: data.device.name, ieee_address: data.device.ieeeAddr },
            };
            await this.mqtt.publish("bridge/event", (0, json_stable_stringify_without_jsonify_1.default)(payload));
        });
        await this.publishInfo();
        await this.publishDevices();
        await this.publishGroups();
        await this.publishDefinitions();
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    async stop() {
        await super.stop();
        logger_1.default.removeTransport(this.logTransport);
    }
    async onMQTTMessage(data) {
        const match = data.topic.match(this.#requestRegex);
        if (!match) {
            return;
        }
        const key = match[1].toLowerCase();
        if (key in this.requestLookup) {
            const message = utils_1.default.parseJSON(data.message, data.message);
            try {
                const response = await this.requestLookup[key](message);
                await this.mqtt.publish(`bridge/response/${match[1]}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
            }
            catch (error) {
                logger_1.default.error(`Request '${data.topic}' failed with error: '${error.message}'`);
                // biome-ignore lint/style/noNonNullAssertion: always using Error
                logger_1.default.debug(error.stack);
                const response = utils_1.default.getResponse(message, {}, error.message);
                await this.mqtt.publish(`bridge/response/${match[1]}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
            }
        }
    }
    /**
     * Requests
     */
    async deviceOptions(message) {
        return await this.changeEntityOptions("device", message);
    }
    async groupOptions(message) {
        return await this.changeEntityOptions("group", message);
    }
    async bridgeOptions(message) {
        if (typeof message !== "object" || typeof message.options !== "object") {
            throw new Error("Invalid payload");
        }
        const newSettings = message.options;
        this.restartRequired = settings.apply(newSettings);
        // Apply some settings on-the-fly.
        if (newSettings.homeassistant) {
            await this.enableDisableExtension(settings.get().homeassistant.enabled, "HomeAssistant");
        }
        if (newSettings.advanced?.log_level != null) {
            logger_1.default.setLevel(settings.get().advanced.log_level);
        }
        if (newSettings.advanced?.log_namespaced_levels != null) {
            logger_1.default.setNamespacedLevels(settings.get().advanced.log_namespaced_levels);
        }
        if (newSettings.advanced?.log_debug_namespace_ignore != null) {
            logger_1.default.setDebugNamespaceIgnore(settings.get().advanced.log_debug_namespace_ignore);
        }
        logger_1.default.info("Successfully changed options");
        await this.publishInfo();
        return utils_1.default.getResponse(message, { restart_required: this.restartRequired });
    }
    async deviceRemove(message) {
        return await this.removeEntity("device", message);
    }
    async groupRemove(message) {
        return await this.removeEntity("group", message);
    }
    // biome-ignore lint/suspicious/useAwait: API
    async healthCheck(message) {
        return utils_1.default.getResponse(message, { healthy: true });
    }
    async coordinatorCheck(message) {
        const result = await this.zigbee.coordinatorCheck();
        const missingRouters = result.missingRouters.map((d) => {
            return { ieee_address: d.ieeeAddr, friendly_name: d.name };
        });
        return utils_1.default.getResponse(message, { missing_routers: missingRouters });
    }
    async groupAdd(message) {
        if (typeof message === "object" && message.friendly_name === undefined) {
            throw new Error("Invalid payload");
        }
        const friendlyName = typeof message === "object" ? message.friendly_name : message;
        const ID = typeof message === "object" && message.id !== undefined ? message.id : null;
        const group = settings.addGroup(friendlyName, ID);
        this.zigbee.createGroup(group.ID);
        await this.publishGroups();
        return utils_1.default.getResponse(message, { friendly_name: group.friendly_name, id: group.ID });
    }
    async deviceRename(message) {
        return await this.renameEntity("device", message);
    }
    async groupRename(message) {
        return await this.renameEntity("group", message);
    }
    // biome-ignore lint/suspicious/useAwait: API
    async restart(message) {
        // Wait 500 ms before restarting so response can be send.
        setTimeout(this.restartCallback, 500);
        logger_1.default.info("Restarting Zigbee2MQTT");
        return utils_1.default.getResponse(message, {});
    }
    async backup(message) {
        await this.zigbee.backup();
        const dataPath = data_1.default.getPath();
        const files = utils_1.default
            .getAllFiles(dataPath)
            .map((f) => [f, f.substring(dataPath.length + 1)])
            .filter((f) => !f[1].startsWith("log"));
        const zip = new jszip_1.default();
        for (const f of files) {
            zip.file(f[1], node_fs_1.default.readFileSync(f[0]));
        }
        const base64Zip = await zip.generateAsync({ type: "base64" });
        return utils_1.default.getResponse(message, { zip: base64Zip });
    }
    async installCodeAdd(message) {
        if (typeof message === "object" && message.value === undefined) {
            throw new Error("Invalid payload");
        }
        const value = typeof message === "object" ? message.value : message;
        await this.zigbee.addInstallCode(value);
        logger_1.default.info("Successfully added new install code");
        return utils_1.default.getResponse(message, { value });
    }
    async permitJoin(message) {
        let time;
        let device;
        if (typeof message === "object") {
            if (message.time === undefined) {
                throw new Error("Invalid payload");
            }
            time = Number.parseInt(message.time, 10);
            if (message.device) {
                const resolved = this.zigbee.resolveEntity(message.device);
                if (resolved instanceof device_2.default) {
                    device = resolved;
                }
                else {
                    throw new Error(`Device '${message.device}' does not exist`);
                }
            }
        }
        else {
            time = Number.parseInt(message, 10);
        }
        await this.zigbee.permitJoin(time, device);
        const response = { time };
        if (device) {
            response.device = device.name;
        }
        return utils_1.default.getResponse(message, response);
    }
    async touchlinkIdentify(message) {
        if (typeof message !== "object" || message.ieee_address === undefined || message.channel === undefined) {
            throw new Error("Invalid payload");
        }
        logger_1.default.info(`Start Touchlink identify of '${message.ieee_address}' on channel ${message.channel}`);
        await this.zigbee.touchlinkIdentify(message.ieee_address, message.channel);
        return utils_1.default.getResponse(message, { ieee_address: message.ieee_address, channel: message.channel });
    }
    async touchlinkFactoryReset(message) {
        let result = false;
        let payload = {};
        if (typeof message === "object" && message.ieee_address !== undefined && message.channel !== undefined) {
            logger_1.default.info(`Start Touchlink factory reset of '${message.ieee_address}' on channel ${message.channel}`);
            result = await this.zigbee.touchlinkFactoryReset(message.ieee_address, message.channel);
            payload = {
                ieee_address: message.ieee_address,
                channel: message.channel,
            };
        }
        else {
            logger_1.default.info("Start Touchlink factory reset of first found device");
            result = await this.zigbee.touchlinkFactoryResetFirst();
        }
        if (result) {
            logger_1.default.info("Successfully factory reset device through Touchlink");
            return utils_1.default.getResponse(message, payload);
        }
        logger_1.default.error("Failed to factory reset device through Touchlink");
        throw new Error("Failed to factory reset device through Touchlink");
    }
    async touchlinkScan(message) {
        logger_1.default.info("Start Touchlink scan");
        const result = await this.zigbee.touchlinkScan();
        const found = result.map((r) => {
            return { ieee_address: r.ieeeAddr, channel: r.channel };
        });
        logger_1.default.info("Finished Touchlink scan");
        return utils_1.default.getResponse(message, { found });
    }
    /**
     * Utils
     */
    async changeEntityOptions(entityType, message) {
        if (typeof message !== "object" || message.id === undefined || message.options === undefined) {
            throw new Error("Invalid payload");
        }
        const cleanup = (o) => {
            delete o.friendlyName;
            delete o.friendly_name;
            delete o.ID;
            delete o.type;
            delete o.devices;
            return o;
        };
        const ID = message.id;
        const entity = this.getEntity(entityType, ID);
        const oldOptions = (0, object_assign_deep_1.default)({}, cleanup(entity.options));
        if (message.options.icon) {
            const base64Match = utils_1.default.matchBase64File(message.options.icon);
            if (base64Match) {
                const fileSettings = utils_1.default.saveBase64DeviceIcon(base64Match);
                message.options.icon = fileSettings;
                logger_1.default.debug(`Saved base64 image as file to '${fileSettings}'`);
            }
        }
        const restartRequired = settings.changeEntityOptions(ID, message.options);
        if (restartRequired)
            this.restartRequired = true;
        const newOptions = cleanup(entity.options);
        await this.publishInfo();
        logger_1.default.info(`Changed config for ${entityType} ${ID}`);
        this.eventBus.emitEntityOptionsChanged({ from: oldOptions, to: newOptions, entity });
        return utils_1.default.getResponse(message, { from: oldOptions, to: newOptions, id: ID, restart_required: this.restartRequired });
    }
    async deviceReportingConfigure(message) {
        if (typeof message !== "object" ||
            message.id === undefined ||
            message.endpoint === undefined ||
            message.cluster === undefined ||
            message.attribute === undefined ||
            typeof message.maximum_report_interval !== "number" ||
            typeof message.minimum_report_interval !== "number" ||
            (message.reportable_change !== undefined && typeof message.reportable_change !== "number")) {
            throw new Error("Invalid payload");
        }
        const device = this.getEntity("device", message.id);
        const endpoint = device.endpoint(message.endpoint);
        if (!endpoint) {
            throw new Error(`Device '${device.ID}' does not have endpoint '${message.endpoint}'`);
        }
        const coordinatorEndpoint = this.zigbee.firstCoordinatorEndpoint();
        await endpoint.bind(message.cluster, coordinatorEndpoint);
        await endpoint.configureReporting(message.cluster, [
            {
                attribute: message.attribute,
                minimumReportInterval: message.minimum_report_interval,
                maximumReportInterval: message.maximum_report_interval,
                reportableChange: message.reportable_change,
            },
        ], message.options);
        await this.publishDevices();
        logger_1.default.info(`Configured reporting for '${message.id}', '${message.cluster}.${message.attribute}'`);
        return utils_1.default.getResponse(message, {
            id: message.id,
            endpoint: message.endpoint,
            cluster: message.cluster,
            maximum_report_interval: message.maximum_report_interval,
            minimum_report_interval: message.minimum_report_interval,
            reportable_change: message.reportable_change,
            attribute: message.attribute,
        });
    }
    async deviceReportingRead(message) {
        if (typeof message !== "object" ||
            message.id === undefined ||
            message.endpoint === undefined ||
            message.cluster === undefined ||
            message.configs === undefined) {
            throw new Error("Invalid payload");
        }
        const device = this.getEntity("device", message.id);
        const endpoint = device.endpoint(message.endpoint);
        if (!endpoint) {
            throw new Error(`Device '${device.ID}' does not have endpoint '${message.endpoint}'`);
        }
        const response = await endpoint.readReportingConfig(message.cluster, message.configs, message.manufacturer_code ? { manufacturerCode: message.manufacturer_code } : {});
        await this.publishDevices();
        const responseData = {
            id: message.id,
            endpoint: message.endpoint,
            cluster: message.cluster,
            configs: response,
        };
        if (message.manufacturer_code) {
            responseData.manufacturer_code = message.manufacturer_code;
        }
        return utils_1.default.getResponse(message, responseData);
    }
    async deviceInterview(message) {
        if (typeof message !== "object" || message.id === undefined) {
            throw new Error("Invalid payload");
        }
        const device = this.getEntity("device", message.id);
        logger_1.default.info(`Interviewing '${device.name}'`);
        try {
            await device.zh.interview(true);
            logger_1.default.info(`Successfully interviewed '${device.name}'`);
        }
        catch (error) {
            throw new Error(`interview of '${device.name}' (${device.ieeeAddr}) failed: ${error}`, { cause: error });
        }
        // A re-interview can for example result in a different modelId, therefore reconsider the definition.
        await device.resolveDefinition(true);
        this.eventBus.emitDevicesChanged();
        this.eventBus.emitExposesChanged({ device });
        return utils_1.default.getResponse(message, { id: message.id });
    }
    async deviceGenerateExternalDefinition(message) {
        if (typeof message !== "object" || message.id === undefined) {
            throw new Error("Invalid payload");
        }
        const device = this.getEntity("device", message.id);
        const source = await zhc.generateExternalDefinitionSource(device.zh);
        return utils_1.default.getResponse(message, { id: message.id, source });
    }
    async action(message) {
        if (typeof message !== "object" || !message.action) {
            throw new Error("Invalid payload");
        }
        const action = zhc.ACTIONS[message.action];
        if (action === undefined) {
            throw new Error("Invalid action");
        }
        const response = await action(this.zigbee.zhController, message.params ?? {});
        return utils_1.default.getResponse(message, response);
    }
    async renameEntity(entityType, message) {
        const deviceAndHasLast = entityType === "device" && typeof message === "object" && message.last === true;
        if (typeof message !== "object" || (message.from === undefined && !deviceAndHasLast) || message.to === undefined) {
            throw new Error("Invalid payload");
        }
        if (deviceAndHasLast && !this.lastJoinedDeviceIeeeAddr) {
            throw new Error("No device has joined since start");
        }
        const from = deviceAndHasLast ? this.lastJoinedDeviceIeeeAddr : message.from;
        (0, utils_1.assertString)(message.to, "to");
        const to = message.to.trim();
        const homeAssisantRename = message.homeassistant_rename !== undefined ? message.homeassistant_rename : false;
        const entity = this.getEntity(entityType, from);
        const oldFriendlyName = entity.options.friendly_name;
        settings.changeFriendlyName(from, to);
        // Clear retained messages
        await this.mqtt.publish(oldFriendlyName, "", { clientOptions: { retain: true } });
        this.eventBus.emitEntityRenamed({ entity: entity, homeAssisantRename, from: oldFriendlyName, to });
        if (entity instanceof device_2.default) {
            await this.publishDevices();
        }
        else {
            await this.publishGroups();
            await this.publishInfo();
        }
        // Republish entity state
        await this.publishEntityState(entity, {});
        return utils_1.default.getResponse(message, { from: oldFriendlyName, to, homeassistant_rename: homeAssisantRename });
    }
    async removeEntity(entityType, message) {
        const ID = typeof message === "object" ? message.id : message.trim();
        const entity = this.getEntity(entityType, ID);
        // note: entity.name is dynamically retrieved, will change once device is removed (friendly => ieee)
        const friendlyName = entity.name;
        let block = false;
        let force = false;
        let blockForceLog = "";
        if (entityType === "device" && typeof message === "object") {
            block = !!message.block;
            force = !!message.force;
            blockForceLog = ` (block: ${block}, force: ${force})`;
        }
        else if (entityType === "group" && typeof message === "object") {
            force = !!message.force;
            blockForceLog = ` (force: ${force})`;
        }
        try {
            logger_1.default.info(`Removing ${entityType} '${friendlyName}'${blockForceLog}`);
            if (entity instanceof device_2.default) {
                if (block) {
                    settings.blockDevice(entity.ieeeAddr);
                }
                if (force) {
                    entity.zh.removeFromDatabase();
                }
                else {
                    await entity.zh.removeFromNetwork();
                }
                settings.removeDevice(entity.ID);
            }
            else {
                if (force) {
                    entity.zh.removeFromDatabase();
                }
                else {
                    await entity.zh.removeFromNetwork();
                }
                this.zigbee.removeGroupFromLookup(entity.ID);
                settings.removeGroup(entity.ID);
            }
            this.eventBus.emitEntityRemoved({ entity, name: friendlyName });
            // Remove from state
            this.state.remove(entity.ID);
            // Clear any retained messages
            await this.mqtt.publish(friendlyName, "", { clientOptions: { retain: true } });
            logger_1.default.info(`Successfully removed ${entityType} '${friendlyName}'${blockForceLog}`);
            if (entity instanceof device_2.default) {
                await this.publishGroups();
                await this.publishDevices();
                // Refresh Cluster definition
                await this.publishDefinitions();
                const responseData = { id: ID, block, force };
                return utils_1.default.getResponse(message, responseData);
            }
            await this.publishGroups();
            const responseData = { id: ID, force };
            return utils_1.default.getResponse(message, 
            // @ts-expect-error typing infer does not work here
            responseData);
        }
        catch (error) {
            throw new Error(`Failed to remove ${entityType} '${friendlyName}'${blockForceLog} (${error})`);
        }
    }
    getEntity(type, id) {
        const entity = this.zigbee.resolveEntity(id);
        if (!entity || entity.constructor.name.toLowerCase() !== type) {
            throw new Error(`${utils_1.default.capitalize(type)} '${id}' does not exist`);
        }
        return entity;
    }
    async publishInfo() {
        const config = (0, object_assign_deep_1.default)({}, settings.get());
        // @ts-expect-error hidden from publish
        delete config.advanced.network_key;
        delete config.mqtt.password;
        delete config.frontend.auth_token;
        const networkParams = await this.zigbee.getNetworkParameters();
        const payload = {
            os: this.#osInfo,
            mqtt: this.mqtt.info,
            version: this.zigbee2mqttVersion.version,
            commit: this.zigbee2mqttVersion.commitHash,
            zigbee_herdsman_converters: this.zigbeeHerdsmanConvertersVersion,
            zigbee_herdsman: this.zigbeeHerdsmanVersion,
            coordinator: {
                ieee_address: this.zigbee.firstCoordinatorEndpoint().deviceIeeeAddress,
                ...this.coordinatorVersion,
            },
            network: {
                pan_id: networkParams.panID,
                extended_pan_id: networkParams.extendedPanID,
                channel: networkParams.channel,
            },
            log_level: logger_1.default.getLevel(),
            permit_join: this.zigbee.getPermitJoin(),
            permit_join_end: this.zigbee.getPermitJoinEnd(),
            restart_required: this.restartRequired,
            config,
            config_schema: settings.schemaJson,
        };
        await this.mqtt.publish("bridge/info", (0, json_stable_stringify_without_jsonify_1.default)(payload), { clientOptions: { retain: true }, skipLog: true });
    }
    async publishDevices() {
        const devices = [];
        for (const device of this.zigbee.devicesIterator()) {
            const endpoints = {};
            for (const endpoint of device.zh.endpoints) {
                const data = {
                    name: device.endpointName(endpoint),
                    scenes: utils_1.default.getScenes(endpoint),
                    bindings: [],
                    configured_reportings: [],
                    clusters: {
                        input: endpoint.getInputClusters().map((c) => c.name),
                        output: endpoint.getOutputClusters().map((c) => c.name),
                    },
                };
                for (const bind of endpoint.binds) {
                    const target = utils_1.default.isZHEndpoint(bind.target)
                        ? { type: "endpoint", ieee_address: bind.target.deviceIeeeAddress, endpoint: bind.target.ID }
                        : { type: "group", id: bind.target.groupID };
                    data.bindings.push({ cluster: bind.cluster.name, target });
                }
                for (const configuredReporting of endpoint.configuredReportings) {
                    data.configured_reportings.push({
                        cluster: configuredReporting.cluster.name,
                        attribute: configuredReporting.attribute.name || configuredReporting.attribute.ID,
                        minimum_report_interval: configuredReporting.minimumReportInterval,
                        maximum_report_interval: configuredReporting.maximumReportInterval,
                        reportable_change: configuredReporting.reportableChange,
                    });
                }
                endpoints[endpoint.ID] = data;
            }
            devices.push({
                ieee_address: device.ieeeAddr,
                type: device.zh.type,
                network_address: device.zh.networkAddress,
                supported: device.isSupported,
                friendly_name: device.name,
                disabled: !!device.options.disabled,
                description: device.options.description,
                definition: this.getDefinitionPayload(device),
                power_source: device.zh.powerSource,
                software_build_id: device.zh.softwareBuildID,
                date_code: device.zh.dateCode,
                model_id: device.zh.modelID,
                /** @deprecated interviewing and interview_completed are superceded by interview_state */
                interviewing: device.zh.interviewState === device_1.InterviewState.InProgress,
                interview_completed: device.zh.interviewState === device_1.InterviewState.Successful,
                interview_state: device.zh.interviewState,
                manufacturer: device.zh.manufacturerName,
                endpoints,
            });
        }
        await this.mqtt.publish("bridge/devices", (0, json_stable_stringify_without_jsonify_1.default)(devices), { clientOptions: { retain: true }, skipLog: true });
    }
    async publishGroups() {
        const groups = [];
        for (const group of this.zigbee.groupsIterator()) {
            const members = [];
            for (const member of group.zh.members) {
                members.push({ ieee_address: member.deviceIeeeAddress, endpoint: member.ID });
            }
            groups.push({
                id: group.ID,
                friendly_name: group.ID === utils_1.DEFAULT_BIND_GROUP_ID ? "default_bind_group" : group.name,
                description: group.options.description,
                scenes: utils_1.default.getScenes(group.zh),
                members,
            });
        }
        await this.mqtt.publish("bridge/groups", (0, json_stable_stringify_without_jsonify_1.default)(groups), { clientOptions: { retain: true }, skipLog: true });
    }
    async publishDefinitions() {
        const data = {
            clusters: zigbee_herdsman_1.Zcl.Clusters,
            custom_clusters: {},
            actions: Object.keys(zhc.ACTIONS),
        };
        for (const device of this.zigbee.devicesIterator((d) => !utils_1.default.objectIsEmpty(d.customClusters))) {
            data.custom_clusters[device.ieeeAddr] = device.customClusters;
        }
        await this.mqtt.publish("bridge/definitions", (0, json_stable_stringify_without_jsonify_1.default)(data), { clientOptions: { retain: true }, skipLog: true });
    }
    getDefinitionPayload(device) {
        if (!device.definition) {
            return undefined;
        }
        // TODO: better typing to avoid @ts-expect-error
        // @ts-expect-error icon is valid for external definitions
        const definitionIcon = device.definition.icon;
        let icon = device.options.icon ?? definitionIcon;
        if (icon) {
            /* v8 ignore next */
            icon = icon.replace("$zigbeeModel", utils_1.default.sanitizeImageParameter(device.zh.modelID ?? ""));
            icon = icon.replace("$model", utils_1.default.sanitizeImageParameter(device.definition.model));
        }
        const payload = {
            source: device.definition.externalConverterName ? "external" : device.definition.generated ? "generated" : "native",
            model: device.definition.model,
            vendor: device.definition.vendor,
            description: device.definition.description,
            exposes: device.exposes(),
            supports_ota: !!device.definition.ota,
            options: device.definition.options ?? [],
            icon,
        };
        return payload;
    }
}
exports.default = Bridge;
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "onMQTTMessage", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceOptions", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "groupOptions", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "bridgeOptions", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceRemove", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "groupRemove", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "healthCheck", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "coordinatorCheck", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "groupAdd", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceRename", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "groupRename", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "restart", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "backup", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "installCodeAdd", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "permitJoin", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "touchlinkIdentify", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "touchlinkFactoryReset", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "touchlinkScan", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceReportingConfigure", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceReportingRead", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceInterview", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceGenerateExternalDefinition", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "action", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9icmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzREFBeUI7QUFDekIsb0VBQWtDO0FBQ2xDLGtIQUE4RDtBQUM5RCxrREFBMEI7QUFDMUIsNEVBQWtEO0FBRWxELDBFQUEwQztBQUMxQyxxREFBb0M7QUFDcEMseUVBQTRFO0FBQzVFLGdFQUFrRDtBQUNsRCw2REFBcUM7QUFHckMsd0RBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsdURBQXlFO0FBQ3pFLDREQUFvQztBQUVwQyxNQUFxQixNQUFPLFNBQVEsbUJBQVM7SUFDekMsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLHNCQUFzQixDQUFDLENBQUM7SUFDcEYsaUJBQWlCO0lBQ2pCLE9BQU8sQ0FBdUM7SUFDdEMsa0JBQWtCLENBQTBDO0lBQzVELHFCQUFxQixDQUFxQjtJQUMxQywrQkFBK0IsQ0FBcUI7SUFDcEQsa0JBQWtCLENBQXlCO0lBQzNDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDeEIsd0JBQXdCLENBQVU7SUFDbEMsd0JBQXdCLENBQVU7SUFDbEMsWUFBWSxDQUFxQjtJQUNqQyxhQUFhLEdBQWdIO1FBQ2pJLGdCQUFnQixFQUFFLElBQUksQ0FBQyxhQUFhO1FBQ3BDLHNCQUFzQjtRQUN0Qiw0QkFBNEIsRUFBRSxJQUFJLENBQUMsd0JBQXdCO1FBQzNELDRCQUE0QixFQUFFLElBQUksQ0FBQyx3QkFBd0I7UUFDM0QsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtRQUNqRCxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVk7UUFDbEMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGVBQWU7UUFDeEMscUNB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