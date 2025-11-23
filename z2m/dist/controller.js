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
exports.Controller = void 0;
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const eventBus_1 = __importDefault(require("./eventBus"));
// Extensions
const availability_1 = __importDefault(require("./extension/availability"));
const bind_1 = __importDefault(require("./extension/bind"));
const bridge_1 = __importDefault(require("./extension/bridge"));
const configure_1 = __importDefault(require("./extension/configure"));
const externalConverters_1 = __importDefault(require("./extension/externalConverters"));
const externalExtensions_1 = __importDefault(require("./extension/externalExtensions"));
const groups_1 = __importDefault(require("./extension/groups"));
const health_1 = __importDefault(require("./extension/health"));
const networkMap_1 = __importDefault(require("./extension/networkMap"));
const onEvent_1 = __importDefault(require("./extension/onEvent"));
const otaUpdate_1 = __importDefault(require("./extension/otaUpdate"));
const publish_1 = __importDefault(require("./extension/publish"));
const receive_1 = __importDefault(require("./extension/receive"));
const mqtt_1 = __importDefault(require("./mqtt"));
const state_1 = __importDefault(require("./state"));
const logger_1 = __importDefault(require("./util/logger"));
const sd_notify_1 = require("./util/sd-notify");
const settings = __importStar(require("./util/settings"));
const utils_1 = __importDefault(require("./util/utils"));
const zigbee_1 = __importDefault(require("./zigbee"));
class Controller {
    eventBus;
    zigbee;
    state;
    mqtt;
    restartCallback;
    exitCallback;
    extensions;
    extensionArgs;
    sdNotify;
    constructor(restartCallback, exitCallback) {
        logger_1.default.init();
        (0, zigbee_herdsman_1.setLogger)(logger_1.default);
        (0, zigbee_herdsman_converters_1.setLogger)(logger_1.default);
        this.eventBus = new eventBus_1.default();
        this.zigbee = new zigbee_1.default(this.eventBus);
        this.mqtt = new mqtt_1.default(this.eventBus);
        this.state = new state_1.default(this.eventBus, this.zigbee);
        this.restartCallback = restartCallback;
        this.exitCallback = exitCallback;
        // Initialize extensions.
        this.extensionArgs = [
            this.zigbee,
            this.mqtt,
            this.state,
            this.publishEntityState,
            this.eventBus,
            this.enableDisableExtension,
            this.restartCallback,
            this.addExtension,
        ];
        this.extensions = new Set([
            new externalConverters_1.default(...this.extensionArgs),
            new onEvent_1.default(...this.extensionArgs),
            new bridge_1.default(...this.extensionArgs),
            new publish_1.default(...this.extensionArgs),
            new receive_1.default(...this.extensionArgs),
            new configure_1.default(...this.extensionArgs),
            new networkMap_1.default(...this.extensionArgs),
            new groups_1.default(...this.extensionArgs),
            new bind_1.default(...this.extensionArgs),
            new otaUpdate_1.default(...this.extensionArgs),
            new externalExtensions_1.default(...this.extensionArgs),
            new availability_1.default(...this.extensionArgs),
            new health_1.default(...this.extensionArgs),
        ]);
    }
    async start() {
        if (settings.get().frontend.enabled) {
            const { Frontend } = await import("./extension/frontend.js");
            this.extensions.add(new Frontend(...this.extensionArgs));
        }
        if (settings.get().homeassistant.enabled) {
            const { HomeAssistant } = await import("./extension/homeassistant.js");
            this.extensions.add(new HomeAssistant(...this.extensionArgs));
        }
        this.state.start();
        const info = await utils_1.default.getZigbee2MQTTVersion();
        logger_1.default.info(`Starting Zigbee2MQTT version ${info.version} (commit #${info.commitHash})`);
        // Start zigbee
        try {
            await this.zigbee.start();
            this.eventBus.onAdapterDisconnected(this, this.onZigbeeAdapterDisconnected);
        }
        catch (error) {
            logger_1.default.error("Failed to start zigbee-herdsman");
            logger_1.default.error("Check https://www.zigbee2mqtt.io/guide/installation/20_zigbee2mqtt-fails-to-start_crashes-runtime.html for possible solutions");
            logger_1.default.error("Exiting...");
            // biome-ignore lint/style/noNonNullAssertion: always Error
            logger_1.default.error(error.stack);
            /* v8 ignore start */
            if (error.message.includes("USB adapter discovery error (No valid USB adapter found)")) {
                logger_1.default.error("If this happens after updating to Zigbee2MQTT 2.0.0, see https://github.com/Koenkk/zigbee2mqtt/discussions/24364");
            }
            /* v8 ignore stop */
            return await this.exit(1);
        }
        // Log zigbee clients on startup
        let deviceCount = 0;
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            // `definition` validated by `isSupported`
            const model = device.isSupported
                ? // biome-ignore lint/style/noNonNullAssertion: valid from `isSupported`
                    `${device.definition.model} - ${device.definition.vendor} ${device.definition.description}`
                : "Not supported";
            logger_1.default.info(`${device.name} (${device.ieeeAddr}): ${model} (${device.zh.type})`);
            deviceCount++;
        }
        logger_1.default.info(`Currently ${deviceCount} devices are joined.`);
        // MQTT
        try {
            await this.mqtt.connect();
        }
        catch (error) {
            logger_1.default.error(`MQTT failed to connect, exiting... (${error.message})`);
            await this.zigbee.stop();
            return await this.exit(1);
        }
        // copy current Set of extensions to ignore possible external extensions added while looping
        for (const extension of new Set(this.extensions)) {
            await this.startExtension(extension);
        }
        // Send all cached states.
        if (settings.get().advanced.cache_state_send_on_startup && settings.get().advanced.cache_state) {
            for (const entity of this.zigbee.devicesAndGroupsIterator()) {
                if (this.state.exists(entity)) {
                    await this.publishEntityState(entity, this.state.get(entity), "publishCached");
                }
            }
        }
        this.eventBus.onLastSeenChanged(this, (data) => utils_1.default.publishLastSeen(data, settings.get(), false, this.publishEntityState));
        logger_1.default.info("Zigbee2MQTT started!");
        this.sdNotify = await (0, sd_notify_1.initSdNotify)();
        settings.setOnboarding(false);
    }
    async enableDisableExtension(enable, name) {
        if (enable) {
            switch (name) {
                case "Frontend": {
                    if (!settings.get().frontend.enabled) {
                        throw new Error("Tried to enable Frontend extension disabled in settings");
                    }
                    // this is not actually used, not tested either
                    /* v8 ignore start */
                    const { Frontend } = await import("./extension/frontend.js");
                    await this.addExtension(new Frontend(...this.extensionArgs));
                    break;
                    /* v8 ignore stop */
                }
                case "HomeAssistant": {
                    if (!settings.get().homeassistant.enabled) {
                        throw new Error("Tried to enable HomeAssistant extension disabled in settings");
                    }
                    const { HomeAssistant } = await import("./extension/homeassistant.js");
                    await this.addExtension(new HomeAssistant(...this.extensionArgs));
                    break;
                }
                default: {
                    throw new Error(`Extension ${name} does not exist (should be added with 'addExtension') or is built-in that cannot be enabled at runtime`);
                }
            }
        }
        else {
            switch (name) {
                case "Frontend": {
                    if (settings.get().frontend.enabled) {
                        throw new Error("Tried to disable Frontend extension enabled in settings");
                    }
                    break;
                }
                case "HomeAssistant": {
                    if (settings.get().homeassistant.enabled) {
                        throw new Error("Tried to disable HomeAssistant extension enabled in settings");
                    }
                    break;
                }
                case "Availability":
                case "Bind":
                case "Bridge":
                case "Configure":
                case "ExternalConverters":
                case "ExternalExtensions":
                case "Groups":
                case "NetworkMap":
                case "OnEvent":
                case "OTAUpdate":
                case "Publish":
                case "Receive": {
                    throw new Error(`Built-in extension ${name} cannot be disabled at runtime`);
                }
            }
            const extension = this.getExtension(name);
            if (extension) {
                await this.removeExtension(extension);
            }
        }
    }
    getExtension(name) {
        for (const extension of this.extensions) {
            if (extension.constructor.name === name) {
                return extension;
            }
        }
    }
    async addExtension(extension) {
        for (const ext of this.extensions) {
            if (ext.constructor.name === extension.constructor.name) {
                throw new Error(`Extension with name ${ext.constructor.name} already present`);
            }
        }
        this.extensions.add(extension);
        await this.startExtension(extension);
    }
    async removeExtension(extension) {
        if (this.extensions.delete(extension)) {
            await this.stopExtension(extension);
        }
    }
    async startExtension(extension) {
        try {
            await extension.start();
        }
        catch (error) {
            logger_1.default.error(`Failed to start '${extension.constructor.name}' (${error.stack})`);
        }
    }
    async stopExtension(extension) {
        try {
            await extension.stop();
        }
        catch (error) {
            logger_1.default.error(`Failed to stop '${extension.constructor.name}' (${error.stack})`);
        }
    }
    async stop(restart = false, code = 0) {
        this.sdNotify?.notifyStopping();
        let localCode = 0;
        for (const extension of this.extensions) {
            try {
                await extension.stop();
            }
            catch (error) {
                logger_1.default.error(`Failed to stop '${extension.constructor.name}' (${error.stack})`);
                localCode = 1;
            }
        }
        this.eventBus.removeListeners(this);
        // Wrap-up
        this.state.stop();
        await this.mqtt.disconnect();
        try {
            await this.zigbee.stop();
            logger_1.default.info("Stopped Zigbee2MQTT");
        }
        catch (error) {
            logger_1.default.error(`Failed to stop Zigbee2MQTT (${error.stack})`);
            localCode = 1;
        }
        this.sdNotify?.stop();
        return await this.exit(code !== 0 ? code : localCode, restart);
    }
    async exit(code, restart = false) {
        await logger_1.default.end();
        return await this.exitCallback(code, restart);
    }
    async onZigbeeAdapterDisconnected() {
        logger_1.default.error("Adapter disconnected, stopping");
        await this.stop(false, 2);
    }
    async publishEntityState(entity, payload, stateChangeReason) {
        let message = { ...payload };
        // Update state cache with new state.
        const newState = this.state.set(entity, payload, stateChangeReason);
        if (settings.get().advanced.cache_state) {
            // Add cached state to payload
            message = newState;
        }
        const options = {
            clientOptions: {
                retain: utils_1.default.getObjectProperty(entity.options, "retain", false),
                qos: utils_1.default.getObjectProperty(entity.options, "qos", 0),
            },
            meta: {
                isEntityState: true,
            },
        };
        const retention = utils_1.default.getObjectProperty(entity.options, "retention", false);
        if (retention !== false) {
            options.clientOptions.properties = { messageExpiryInterval: retention };
        }
        if (entity.isDevice() && settings.get().mqtt.include_device_information) {
            message.device = {
                friendlyName: entity.name,
                model: entity.definition?.model,
                ieeeAddr: entity.ieeeAddr,
                networkAddress: entity.zh.networkAddress,
                type: entity.zh.type,
                manufacturerID: entity.zh.manufacturerID,
                powerSource: entity.zh.powerSource,
                applicationVersion: entity.zh.applicationVersion,
                stackVersion: entity.zh.stackVersion,
                zclVersion: entity.zh.zclVersion,
                hardwareVersion: entity.zh.hardwareVersion,
                dateCode: entity.zh.dateCode,
                softwareBuildID: entity.zh.softwareBuildID,
                // Manufacturer name can contain \u0000, remove this.
                // https://github.com/home-assistant/core/issues/85691
                /* v8 ignore next */
                manufacturerName: entity.zh.manufacturerName?.split("\u0000")[0],
            };
        }
        // Add lastseen
        const lastSeen = settings.get().advanced.last_seen;
        if (entity.isDevice() && lastSeen !== "disable" && entity.zh.lastSeen) {
            message.last_seen = utils_1.default.formatDate(entity.zh.lastSeen, lastSeen);
        }
        // Add device linkquality.
        if (entity.isDevice() && entity.zh.linkquality !== undefined) {
            message.linkquality = entity.zh.linkquality;
        }
        for (const extension of this.extensions) {
            extension.adjustMessageBeforePublish?.(entity, message);
        }
        // Filter mqtt message attributes
        utils_1.default.filterProperties(entity.options.filtered_attributes, message);
        if (!utils_1.default.objectIsEmpty(message)) {
            const output = settings.get().advanced.output;
            if (output === "attribute_and_json" || output === "json") {
                await this.mqtt.publish(entity.name, (0, json_stable_stringify_without_jsonify_1.default)(message), options);
            }
            if (output === "attribute_and_json" || output === "attribute") {
                await this.iteratePayloadAttributeOutput(`${entity.name}/`, message, options);
            }
        }
        this.eventBus.emitPublishEntityState({ entity, message, stateChangeReason, payload });
    }
    async iteratePayloadAttributeOutput(topicRoot, payload, options) {
        for (const [key, value] of Object.entries(payload)) {
            let subPayload = value;
            let message = null;
            // Special cases
            if (key === "color" && utils_1.default.objectHasProperties(subPayload, ["r", "g", "b"])) {
                subPayload = [subPayload.r, subPayload.g, subPayload.b];
            }
            // Check Array first, since it is also an Object
            if (subPayload === null || subPayload === undefined) {
                message = "";
            }
            else if (Array.isArray(subPayload)) {
                message = subPayload.map((x) => `${x}`).join(",");
            }
            else if (typeof subPayload === "object") {
                await this.iteratePayloadAttributeOutput(`${topicRoot}${key}-`, subPayload, options);
            }
            else {
                message = typeof subPayload === "string" ? subPayload : (0, json_stable_stringify_without_jsonify_1.default)(subPayload);
            }
            if (message !== null) {
                await this.mqtt.publish(`${topicRoot}${key}`, message, options);
            }
        }
    }
}
exports.Controller = Controller;
__decorate([
    bind_decorator_1.default
], Controller.prototype, "enableDisableExtension", null);
__decorate([
    bind_decorator_1.default
], Controller.prototype, "addExtension", null);
__decorate([
    bind_decorator_1.default
], Controller.prototype, "onZigbeeAdapterDisconnected", null);
__decorate([
    bind_decorator_1.default
], Controller.prototype, "publishEntityState", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFDOUQscURBQXlEO0FBQ3pELDJFQUFxRTtBQUNyRSwwREFBa0M7QUFDbEMsYUFBYTtBQUNiLDRFQUE2RDtBQUM3RCw0REFBNkM7QUFDN0MsZ0VBQWlEO0FBQ2pELHNFQUF1RDtBQUV2RCx3RkFBeUU7QUFDekUsd0ZBQXlFO0FBQ3pFLGdFQUFpRDtBQUNqRCxnRUFBaUQ7QUFDakQsd0VBQXlEO0FBQ3pELGtFQUFtRDtBQUNuRCxzRUFBdUQ7QUFDdkQsa0VBQW1EO0FBQ25ELGtFQUFtRDtBQUNuRCxrREFBcUQ7QUFDckQsb0RBQTRCO0FBRTVCLDJEQUFtQztBQUNuQyxnREFBOEM7QUFDOUMsMERBQTRDO0FBQzVDLHlEQUFpQztBQUNqQyxzREFBOEI7QUFFOUIsTUFBYSxVQUFVO0lBQ0gsUUFBUSxDQUFXO0lBQ25CLE1BQU0sQ0FBUztJQUNmLEtBQUssQ0FBUTtJQUNiLElBQUksQ0FBTztJQUNuQixlQUFlLENBQXNCO0lBQ3JDLFlBQVksQ0FBb0Q7SUFDeEQsVUFBVSxDQUFpQjtJQUMzQixhQUFhLENBQTBDO0lBQy9ELFFBQVEsQ0FBMkM7SUFFM0QsWUFBWSxlQUFvQyxFQUFFLFlBQStEO1FBQzdHLGdCQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZCxJQUFBLDJCQUFXLEVBQUMsZ0JBQU0sQ0FBQyxDQUFDO1FBQ3BCLElBQUEsc0NBQVksRUFBQyxnQkFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7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