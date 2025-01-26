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
const node_assert_1 = __importDefault(require("node:assert"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const eventBus_1 = __importDefault(require("./eventBus"));
const availability_1 = __importDefault(require("./extension/availability"));
const bind_1 = __importDefault(require("./extension/bind"));
const bridge_1 = __importDefault(require("./extension/bridge"));
const configure_1 = __importDefault(require("./extension/configure"));
const externalConverters_1 = __importDefault(require("./extension/externalConverters"));
const externalExtensions_1 = __importDefault(require("./extension/externalExtensions"));
// Extensions
const frontend_1 = __importDefault(require("./extension/frontend"));
const groups_1 = __importDefault(require("./extension/groups"));
const homeassistant_1 = __importDefault(require("./extension/homeassistant"));
const networkMap_1 = __importDefault(require("./extension/networkMap"));
const onEvent_1 = __importDefault(require("./extension/onEvent"));
const otaUpdate_1 = __importDefault(require("./extension/otaUpdate"));
const publish_1 = __importDefault(require("./extension/publish"));
const receive_1 = __importDefault(require("./extension/receive"));
const mqtt_1 = __importDefault(require("./mqtt"));
const state_1 = __importDefault(require("./state"));
const logger_1 = __importDefault(require("./util/logger"));
const settings = __importStar(require("./util/settings"));
const utils_1 = __importDefault(require("./util/utils"));
const zigbee_1 = __importDefault(require("./zigbee"));
const AllExtensions = [
    publish_1.default,
    receive_1.default,
    networkMap_1.default,
    homeassistant_1.default,
    configure_1.default,
    bridge_1.default,
    groups_1.default,
    bind_1.default,
    onEvent_1.default,
    otaUpdate_1.default,
    externalConverters_1.default,
    frontend_1.default,
    externalExtensions_1.default,
    availability_1.default,
];
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
        this.extensions = [
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
        ];
        if (settings.get().frontend.enabled) {
            this.extensions.push(new frontend_1.default(...this.extensionArgs));
        }
        if (settings.get().homeassistant.enabled) {
            this.extensions.push(new homeassistant_1.default(...this.extensionArgs));
        }
    }
    async start() {
        this.state.start();
        const info = await utils_1.default.getZigbee2MQTTVersion();
        logger_1.default.info(`Starting Zigbee2MQTT version ${info.version} (commit #${info.commitHash})`);
        try {
            this.sdNotify = process.env.NOTIFY_SOCKET ? await Promise.resolve().then(() => __importStar(require('sd-notify'))) : undefined;
            logger_1.default.debug('sd-notify loaded');
            /* v8 ignore start */
        }
        catch {
            logger_1.default.debug('sd-notify is not installed');
        }
        /* v8 ignore stop */
        // Start zigbee
        try {
            await this.zigbee.start();
            this.eventBus.onAdapterDisconnected(this, this.onZigbeeAdapterDisconnected);
        }
        catch (error) {
            logger_1.default.error('Failed to start zigbee-herdsman');
            logger_1.default.error('Check https://www.zigbee2mqtt.io/guide/installation/20_zigbee2mqtt-fails-to-start_crashes-runtime.html for possible solutions');
            logger_1.default.error('Exiting...');
            logger_1.default.error(error.stack);
            /* v8 ignore start */
            if (error.message.includes('USB adapter discovery error (No valid USB adapter found)')) {
                logger_1.default.error('If this happens after updating to Zigbee2MQTT 2.0.0, see https://github.com/Koenkk/zigbee2mqtt/discussions/24364');
            }
            /* v8 ignore stop */
            return await this.exit(1);
        }
        // Log zigbee clients on startup
        let deviceCount = 0;
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            // `definition` validated by `isSupported`
            const model = device.isSupported
                ? `${device.definition.model} - ${device.definition.vendor} ${device.definition.description}`
                : 'Not supported';
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
        // Call extensions
        await this.callExtensions('start', [...this.extensions]);
        // Send all cached states.
        if (settings.get().advanced.cache_state_send_on_startup && settings.get().advanced.cache_state) {
            for (const entity of this.zigbee.devicesAndGroupsIterator()) {
                if (this.state.exists(entity)) {
                    await this.publishEntityState(entity, this.state.get(entity), 'publishCached');
                }
            }
        }
        this.eventBus.onLastSeenChanged(this, (data) => utils_1.default.publishLastSeen(data, settings.get(), false, this.publishEntityState));
        logger_1.default.info(`Zigbee2MQTT started!`);
        const watchdogInterval = this.sdNotify?.watchdogInterval() || 0;
        if (watchdogInterval > 0) {
            this.sdNotify?.startWatchdogMode(Math.floor(watchdogInterval / 2));
        }
        this.sdNotify?.ready();
    }
    async enableDisableExtension(enable, name) {
        if (!enable) {
            const extension = this.extensions.find((e) => e.constructor.name === name);
            if (extension) {
                await this.callExtensions('stop', [extension]);
                this.extensions.splice(this.extensions.indexOf(extension), 1);
            }
        }
        else {
            const Extension = AllExtensions.find((e) => e.name === name);
            (0, node_assert_1.default)(Extension, `Extension '${name}' does not exist`);
            const extension = new Extension(...this.extensionArgs);
            this.extensions.push(extension);
            await this.callExtensions('start', [extension]);
        }
    }
    async addExtension(extension) {
        this.extensions.push(extension);
        await this.callExtensions('start', [extension]);
    }
    async stop(restart = false) {
        this.sdNotify?.stopping(process.pid);
        // Call extensions
        await this.callExtensions('stop', this.extensions);
        this.eventBus.removeListeners(this);
        // Wrap-up
        this.state.stop();
        await this.mqtt.disconnect();
        let code = 0;
        try {
            await this.zigbee.stop();
            logger_1.default.info('Stopped Zigbee2MQTT');
        }
        catch (error) {
            logger_1.default.error(`Failed to stop Zigbee2MQTT (${error.message})`);
            code = 1;
        }
        this.sdNotify?.stopWatchdogMode();
        return await this.exit(code, restart);
    }
    async exit(code, restart = false) {
        await logger_1.default.end();
        return await this.exitCallback(code, restart);
    }
    async onZigbeeAdapterDisconnected() {
        logger_1.default.error('Adapter disconnected, stopping');
        await this.stop();
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
            retain: utils_1.default.getObjectProperty(entity.options, 'retain', false),
            qos: utils_1.default.getObjectProperty(entity.options, 'qos', 0),
        };
        const retention = utils_1.default.getObjectProperty(entity.options, 'retention', false);
        if (retention !== false) {
            options.properties = { messageExpiryInterval: retention };
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
                manufacturerName: entity.zh.manufacturerName?.split('\u0000')[0],
            };
        }
        // Add lastseen
        const lastSeen = settings.get().advanced.last_seen;
        if (entity.isDevice() && lastSeen !== 'disable' && entity.zh.lastSeen) {
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
            if (output === 'attribute_and_json' || output === 'json') {
                await this.mqtt.publish(entity.name, (0, json_stable_stringify_without_jsonify_1.default)(message), options);
            }
            if (output === 'attribute_and_json' || output === 'attribute') {
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
            if (key === 'color' && utils_1.default.objectHasProperties(subPayload, ['r', 'g', 'b'])) {
                subPayload = [subPayload.r, subPayload.g, subPayload.b];
            }
            // Check Array first, since it is also an Object
            if (subPayload === null || subPayload === undefined) {
                message = '';
            }
            else if (Array.isArray(subPayload)) {
                message = subPayload.map((x) => `${x}`).join(',');
            }
            else if (typeof subPayload === 'object') {
                await this.iteratePayloadAttributeOutput(`${topicRoot}${key}-`, subPayload, options);
            }
            else {
                message = typeof subPayload === 'string' ? subPayload : (0, json_stable_stringify_without_jsonify_1.default)(subPayload);
            }
            if (message !== null) {
                await this.mqtt.publish(`${topicRoot}${key}`, message, options);
            }
        }
    }
    async callExtensions(method, extensions) {
        for (const extension of extensions) {
            try {
                await extension[method]?.();
            }
            catch (error) {
                logger_1.default.error(`Failed to call '${extension.constructor.name}' '${method}' (${error.stack})`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtBLDhEQUFpQztBQUVqQyxvRUFBa0M7QUFDbEMsa0hBQThEO0FBRTlELHFEQUF5RDtBQUN6RCwyRUFBcUU7QUFFckUsMERBQWtDO0FBQ2xDLDRFQUE2RDtBQUM3RCw0REFBNkM7QUFDN0MsZ0VBQWlEO0FBQ2pELHNFQUF1RDtBQUN2RCx3RkFBeUU7QUFDekUsd0ZBQXlFO0FBQ3pFLGFBQWE7QUFDYixvRUFBcUQ7QUFDckQsZ0VBQWlEO0FBQ2pELDhFQUErRDtBQUMvRCx3RUFBeUQ7QUFDekQsa0VBQW1EO0FBQ25ELHNFQUF1RDtBQUN2RCxrRUFBbUQ7QUFDbkQsa0VBQW1EO0FBQ25ELGtEQUEwQjtBQUMxQixvREFBNEI7QUFDNUIsMkRBQW1DO0FBQ25DLDBEQUE0QztBQUM1Qyx5REFBaUM7QUFDakMsc0RBQThCO0FBSTlCLE1BQU0sYUFBYSxHQUFHO0lBQ2xCLGlCQUFnQjtJQUNoQixpQkFBZ0I7SUFDaEIsb0JBQW1CO0lBQ25CLHVCQUFzQjtJQUN0QixtQkFBa0I7SUFDbEIsZ0JBQWU7SUFDZixnQkFBZTtJQUNmLGNBQWE7SUFDYixpQkFBZ0I7SUFDaEIsbUJBQWtCO0lBQ2xCLDRCQUEyQjtJQUMzQixrQkFBaUI7SUFDakIsNEJBQTJCO0lBQzNCLHNCQUFxQjtDQUN4QixDQUFDO0FBYUYsTUFBYSxVQUFVO0lBQ1gsUUFBUSxDQUFXO0lBQ25CLE1BQU0sQ0FBUztJQUNmLEtBQUssQ0FBUTtJQUNiLElBQUksQ0FBTztJQUNYLGVBQWUsQ0FBc0I7SUFDckMsWUFBWSxDQUFvRDtJQUNoRSxVQUFVLENBQWM7SUFDeEIsYUFBYSxDQUFnQjtJQUM3QixRQUFRLENBQTJCO0lBRTNDLFlBQVksZUFBb0MsRUFBRSxZQUErRDtRQUM3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