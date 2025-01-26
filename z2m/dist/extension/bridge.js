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
const zhc = __importStar(require("zigbee-herdsman-converters"));
const device_1 = __importDefault(require("../model/device"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const REQUEST_REGEX = new RegExp(`${settings.get().mqtt.base_topic}/bridge/request/(.*)`);
class Bridge extends extension_1.default {
    zigbee2mqttVersion;
    zigbeeHerdsmanVersion;
    zigbeeHerdsmanConvertersVersion;
    coordinatorVersion;
    restartRequired = false;
    lastJoinedDeviceIeeeAddr;
    lastBridgeLoggingPayload;
    logTransport;
    requestLookup = {
        'device/options': this.deviceOptions,
        'device/configure_reporting': this.deviceConfigureReporting,
        'device/remove': this.deviceRemove,
        'device/interview': this.deviceInterview,
        'device/generate_external_definition': this.deviceGenerateExternalDefinition,
        'device/rename': this.deviceRename,
        'group/add': this.groupAdd,
        'group/options': this.groupOptions,
        'group/remove': this.groupRemove,
        'group/rename': this.groupRename,
        permit_join: this.permitJoin,
        restart: this.restart,
        backup: this.backup,
        'touchlink/factory_reset': this.touchlinkFactoryReset,
        'touchlink/identify': this.touchlinkIdentify,
        'install_code/add': this.installCodeAdd,
        'touchlink/scan': this.touchlinkScan,
        health_check: this.healthCheck,
        coordinator_check: this.coordinatorCheck,
        options: this.bridgeOptions,
    };
    async start() {
        const debugToMQTTFrontend = settings.get().advanced.log_debug_to_mqtt_frontend;
        const baseTopic = settings.get().mqtt.base_topic;
        const bridgeLogging = (message, level, namespace) => {
            const payload = (0, json_stable_stringify_without_jsonify_1.default)({ message, level, namespace });
            if (payload !== this.lastBridgeLoggingPayload) {
                this.lastBridgeLoggingPayload = payload;
                void this.mqtt.publish(`bridge/logging`, payload, {}, baseTopic, true);
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
                    if (info.level !== 'debug') {
                        bridgeLogging(info.message, info.level, info.namespace);
                    }
                    next();
                }
            }
            this.logTransport = new EventTransport();
        }
        logger_1.default.addTransport(this.logTransport);
        this.zigbee2mqttVersion = await utils_1.default.getZigbee2MQTTVersion();
        this.zigbeeHerdsmanVersion = await utils_1.default.getDependencyVersion('zigbee-herdsman');
        this.zigbeeHerdsmanConvertersVersion = await utils_1.default.getDependencyVersion('zigbee-herdsman-converters');
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
                type: 'device_joined',
                data: { friendly_name: data.device.name, ieee_address: data.device.ieeeAddr },
            };
            await this.mqtt.publish('bridge/event', (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: false, qos: 0 });
        });
        this.eventBus.onDeviceLeave(this, async (data) => {
            await this.publishDevices();
            await this.publishDefinitions();
            const payload = { type: 'device_leave', data: { ieee_address: data.ieeeAddr, friendly_name: data.name } };
            await this.mqtt.publish('bridge/event', (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: false, qos: 0 });
        });
        this.eventBus.onDeviceNetworkAddressChanged(this, async () => {
            await this.publishDevices();
        });
        this.eventBus.onDeviceInterview(this, async (data) => {
            await this.publishDevices();
            let payload;
            if (data.status === 'successful') {
                payload = {
                    type: 'device_interview',
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
                    type: 'device_interview',
                    data: { friendly_name: data.device.name, status: data.status, ieee_address: data.device.ieeeAddr },
                };
            }
            await this.mqtt.publish('bridge/event', (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: false, qos: 0 });
        });
        this.eventBus.onDeviceAnnounce(this, async (data) => {
            await this.publishDevices();
            const payload = {
                type: 'device_announce',
                data: { friendly_name: data.device.name, ieee_address: data.device.ieeeAddr },
            };
            await this.mqtt.publish('bridge/event', (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: false, qos: 0 });
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
        const match = data.topic.match(REQUEST_REGEX);
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
        return await this.changeEntityOptions('device', message);
    }
    async groupOptions(message) {
        return await this.changeEntityOptions('group', message);
    }
    async bridgeOptions(message) {
        if (typeof message !== 'object' || typeof message.options !== 'object') {
            throw new Error(`Invalid payload`);
        }
        const newSettings = message.options;
        this.restartRequired = settings.apply(newSettings);
        // Apply some settings on-the-fly.
        if (newSettings.homeassistant) {
            await this.enableDisableExtension(settings.get().homeassistant.enabled, 'HomeAssistant');
        }
        if (newSettings.advanced?.log_level != undefined) {
            logger_1.default.setLevel(settings.get().advanced.log_level);
        }
        if (newSettings.advanced?.log_namespaced_levels != undefined) {
            logger_1.default.setNamespacedLevels(settings.get().advanced.log_namespaced_levels);
        }
        if (newSettings.advanced?.log_debug_namespace_ignore != undefined) {
            logger_1.default.setDebugNamespaceIgnore(settings.get().advanced.log_debug_namespace_ignore);
        }
        logger_1.default.info('Successfully changed options');
        await this.publishInfo();
        return utils_1.default.getResponse(message, { restart_required: this.restartRequired });
    }
    async deviceRemove(message) {
        return await this.removeEntity('device', message);
    }
    async groupRemove(message) {
        return await this.removeEntity('group', message);
    }
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
        if (typeof message === 'object' && message.friendly_name === undefined) {
            throw new Error(`Invalid payload`);
        }
        const friendlyName = typeof message === 'object' ? message.friendly_name : message;
        const ID = typeof message === 'object' && message.id !== undefined ? message.id : null;
        const group = settings.addGroup(friendlyName, ID);
        this.zigbee.createGroup(group.ID);
        await this.publishGroups();
        return utils_1.default.getResponse(message, { friendly_name: group.friendly_name, id: group.ID });
    }
    async deviceRename(message) {
        return await this.renameEntity('device', message);
    }
    async groupRename(message) {
        return await this.renameEntity('group', message);
    }
    async restart(message) {
        // Wait 500 ms before restarting so response can be send.
        setTimeout(this.restartCallback, 500);
        logger_1.default.info('Restarting Zigbee2MQTT');
        return utils_1.default.getResponse(message, {});
    }
    async backup(message) {
        await this.zigbee.backup();
        const dataPath = data_1.default.getPath();
        const files = utils_1.default
            .getAllFiles(dataPath)
            .map((f) => [f, f.substring(dataPath.length + 1)])
            .filter((f) => !f[1].startsWith('log'));
        const zip = new jszip_1.default();
        files.forEach((f) => zip.file(f[1], node_fs_1.default.readFileSync(f[0])));
        const base64Zip = await zip.generateAsync({ type: 'base64' });
        return utils_1.default.getResponse(message, { zip: base64Zip });
    }
    async installCodeAdd(message) {
        if (typeof message === 'object' && message.value === undefined) {
            throw new Error('Invalid payload');
        }
        const value = typeof message === 'object' ? message.value : message;
        await this.zigbee.addInstallCode(value);
        logger_1.default.info('Successfully added new install code');
        return utils_1.default.getResponse(message, { value });
    }
    async permitJoin(message) {
        let time;
        let device;
        if (typeof message === 'object') {
            if (message.time === undefined) {
                throw new Error('Invalid payload');
            }
            time = Number.parseInt(message.time, 10);
            if (message.device) {
                const resolved = this.zigbee.resolveEntity(message.device);
                if (resolved instanceof device_1.default) {
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
        if (typeof message !== 'object' || message.ieee_address === undefined || message.channel === undefined) {
            throw new Error('Invalid payload');
        }
        logger_1.default.info(`Start Touchlink identify of '${message.ieee_address}' on channel ${message.channel}`);
        await this.zigbee.touchlinkIdentify(message.ieee_address, message.channel);
        return utils_1.default.getResponse(message, { ieee_address: message.ieee_address, channel: message.channel });
    }
    async touchlinkFactoryReset(message) {
        let result = false;
        let payload = {};
        if (typeof message === 'object' && message.ieee_address !== undefined && message.channel !== undefined) {
            logger_1.default.info(`Start Touchlink factory reset of '${message.ieee_address}' on channel ${message.channel}`);
            result = await this.zigbee.touchlinkFactoryReset(message.ieee_address, message.channel);
            payload = {
                ieee_address: message.ieee_address,
                channel: message.channel,
            };
        }
        else {
            logger_1.default.info('Start Touchlink factory reset of first found device');
            result = await this.zigbee.touchlinkFactoryResetFirst();
        }
        if (result) {
            logger_1.default.info('Successfully factory reset device through Touchlink');
            return utils_1.default.getResponse(message, payload);
        }
        else {
            logger_1.default.error('Failed to factory reset device through Touchlink');
            throw new Error('Failed to factory reset device through Touchlink');
        }
    }
    async touchlinkScan(message) {
        logger_1.default.info('Start Touchlink scan');
        const result = await this.zigbee.touchlinkScan();
        const found = result.map((r) => {
            return { ieee_address: r.ieeeAddr, channel: r.channel };
        });
        logger_1.default.info('Finished Touchlink scan');
        return utils_1.default.getResponse(message, { found });
    }
    /**
     * Utils
     */
    async changeEntityOptions(entityType, message) {
        if (typeof message !== 'object' || message.id === undefined || message.options === undefined) {
            throw new Error(`Invalid payload`);
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
    async deviceConfigureReporting(message) {
        if (typeof message !== 'object' ||
            message.id === undefined ||
            message.endpoint === undefined ||
            message.cluster === undefined ||
            message.maximum_report_interval === undefined ||
            message.minimum_report_interval === undefined ||
            message.reportable_change === undefined ||
            message.attribute === undefined) {
            throw new Error(`Invalid payload`);
        }
        const device = this.getEntity('device', message.id);
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
    async deviceInterview(message) {
        if (typeof message !== 'object' || message.id === undefined) {
            throw new Error(`Invalid payload`);
        }
        const device = this.getEntity('device', message.id);
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
        if (typeof message !== 'object' || message.id === undefined) {
            throw new Error(`Invalid payload`);
        }
        const device = this.getEntity('device', message.id);
        const source = await zhc.generateExternalDefinitionSource(device.zh);
        return utils_1.default.getResponse(message, { id: message.id, source });
    }
    async renameEntity(entityType, message) {
        const deviceAndHasLast = entityType === 'device' && typeof message === 'object' && message.last === true;
        if (typeof message !== 'object' || (message.from === undefined && !deviceAndHasLast) || message.to === undefined) {
            throw new Error(`Invalid payload`);
        }
        if (deviceAndHasLast && !this.lastJoinedDeviceIeeeAddr) {
            throw new Error('No device has joined since start');
        }
        const from = deviceAndHasLast ? this.lastJoinedDeviceIeeeAddr : message.from;
        const to = message.to;
        const homeAssisantRename = message.homeassistant_rename !== undefined ? message.homeassistant_rename : false;
        const entity = this.getEntity(entityType, from);
        const oldFriendlyName = entity.options.friendly_name;
        settings.changeFriendlyName(from, to);
        // Clear retained messages
        await this.mqtt.publish(oldFriendlyName, '', { retain: true });
        this.eventBus.emitEntityRenamed({ entity: entity, homeAssisantRename, from: oldFriendlyName, to });
        if (entity instanceof device_1.default) {
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
        const ID = typeof message === 'object' ? message.id : message.trim();
        const entity = this.getEntity(entityType, ID);
        const friendlyName = entity.name;
        const entityID = entity.ID;
        let block = false;
        let force = false;
        let blockForceLog = '';
        if (entityType === 'device' && typeof message === 'object') {
            block = !!message.block;
            force = !!message.force;
            blockForceLog = ` (block: ${block}, force: ${force})`;
        }
        else if (entityType === 'group' && typeof message === 'object') {
            force = !!message.force;
            blockForceLog = ` (force: ${force})`;
        }
        try {
            logger_1.default.info(`Removing ${entityType} '${entity.name}'${blockForceLog}`);
            const name = entity.name;
            if (entity instanceof device_1.default) {
                if (block) {
                    settings.blockDevice(entity.ieeeAddr);
                }
                if (force) {
                    entity.zh.removeFromDatabase();
                }
                else {
                    await entity.zh.removeFromNetwork();
                }
                this.eventBus.emitEntityRemoved({ id: entityID, name, type: 'device' });
                settings.removeDevice(entityID);
            }
            else {
                if (force) {
                    entity.zh.removeFromDatabase();
                }
                else {
                    await entity.zh.removeFromNetwork();
                }
                this.eventBus.emitEntityRemoved({ id: entityID, name, type: 'group' });
                settings.removeGroup(entityID);
            }
            // Remove from state
            this.state.remove(entityID);
            // Clear any retained messages
            await this.mqtt.publish(friendlyName, '', { retain: true });
            logger_1.default.info(`Successfully removed ${entityType} '${friendlyName}'${blockForceLog}`);
            if (entity instanceof device_1.default) {
                await this.publishGroups();
                await this.publishDevices();
                // Refresh Cluster definition
                await this.publishDefinitions();
                const responseData = { id: ID, block, force };
                return utils_1.default.getResponse(message, responseData);
            }
            else {
                await this.publishGroups();
                const responseData = { id: ID, force };
                return utils_1.default.getResponse(message, 
                // @ts-expect-error typing infer does not work here
                responseData);
            }
        }
        catch (error) {
            throw new Error(`Failed to remove ${entityType} '${friendlyName}'${blockForceLog} (${error})`);
        }
    }
    getEntity(type, ID) {
        const entity = this.zigbee.resolveEntity(ID);
        if (!entity || entity.constructor.name.toLowerCase() !== type) {
            throw new Error(`${utils_1.default.capitalize(type)} '${ID}' does not exist`);
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
            version: this.zigbee2mqttVersion.version,
            commit: this.zigbee2mqttVersion.commitHash,
            zigbee_herdsman_converters: this.zigbeeHerdsmanConvertersVersion,
            zigbee_herdsman: this.zigbeeHerdsmanVersion,
            coordinator: {
                ieee_address: this.zigbee.firstCoordinatorEndpoint().getDevice().ieeeAddr,
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
        await this.mqtt.publish('bridge/info', (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: true, qos: 0 }, settings.get().mqtt.base_topic, true);
    }
    async publishDevices() {
        const devices = [];
        for (const device of this.zigbee.devicesIterator()) {
            const endpoints = {};
            for (const endpoint of device.zh.endpoints) {
                const data = {
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
                        ? { type: 'endpoint', ieee_address: bind.target.getDevice().ieeeAddr, endpoint: bind.target.ID }
                        : { type: 'group', id: bind.target.groupID };
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
                interviewing: device.zh.interviewing,
                interview_completed: device.zh.interviewCompleted,
                manufacturer: device.zh.manufacturerName,
                endpoints,
            });
        }
        await this.mqtt.publish('bridge/devices', (0, json_stable_stringify_without_jsonify_1.default)(devices), { retain: true, qos: 0 }, settings.get().mqtt.base_topic, true);
    }
    async publishGroups() {
        const groups = [];
        for (const group of this.zigbee.groupsIterator()) {
            const members = [];
            for (const member of group.zh.members) {
                members.push({ ieee_address: member.getDevice().ieeeAddr, endpoint: member.ID });
            }
            groups.push({
                id: group.ID,
                friendly_name: group.ID === 901 ? 'default_bind_group' : group.name,
                description: group.options.description,
                scenes: utils_1.default.getScenes(group.zh),
                members,
            });
        }
        await this.mqtt.publish('bridge/groups', (0, json_stable_stringify_without_jsonify_1.default)(groups), { retain: true, qos: 0 }, settings.get().mqtt.base_topic, true);
    }
    async publishDefinitions() {
        const data = {
            clusters: zigbee_herdsman_1.Zcl.Clusters,
            custom_clusters: {},
        };
        for (const device of this.zigbee.devicesIterator((d) => !utils_1.default.objectIsEmpty(d.customClusters))) {
            data.custom_clusters[device.ieeeAddr] = device.customClusters;
        }
        await this.mqtt.publish('bridge/definitions', (0, json_stable_stringify_without_jsonify_1.default)(data), { retain: true, qos: 0 }, settings.get().mqtt.base_topic, true);
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
            icon = icon.replace('${zigbeeModel}', utils_1.default.sanitizeImageParameter(device.zh.modelID ?? ''));
            icon = icon.replace('${model}', utils_1.default.sanitizeImageParameter(device.definition.model));
        }
        const payload = {
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
], Bridge.prototype, "deviceConfigureReporting", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceInterview", null);
__decorate([
    bind_decorator_1.default
], Bridge.prototype, "deviceGenerateExternalDefinition", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9icmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxzREFBeUI7QUFFekIsb0VBQWtDO0FBQ2xDLGtIQUE4RDtBQUM5RCxrREFBMEI7QUFDMUIsNEVBQWtEO0FBRWxELDBFQUEwQztBQUUxQyxxREFBb0M7QUFDcEMsZ0VBQWtEO0FBRWxELDZEQUFxQztBQUVyQyx3REFBZ0M7QUFDaEMsNERBQW9DO0FBQ3BDLDJEQUE2QztBQUM3QywwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDLE1BQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLHNCQUFzQixDQUFDLENBQUM7QUFFMUYsTUFBcUIsTUFBTyxTQUFRLG1CQUFTO0lBQ2pDLGtCQUFrQixDQUEwQztJQUM1RCxxQkFBcUIsQ0FBcUI7SUFDMUMsK0JBQStCLENBQXFCO0lBQ3BELGtCQUFrQixDQUF5QjtJQUMzQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLHdCQUF3QixDQUFVO0lBQ2xDLHdCQUF3QixDQUFVO0lBQ2xDLFlBQVksQ0FBcUI7SUFDakMsYUFBYSxHQUFnSDtRQUNqSSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYTtRQUNwQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsd0JBQXdCO1FBQzNELGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWTtRQUNsQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsZUFBZTtRQUN4QyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsZ0NBQWdDO1FBQzVFLGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWTtRQUNsQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVE7UUFDMUIsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZO1FB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