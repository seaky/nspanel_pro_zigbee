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
exports.loadTopicGetSetRegex = void 0;
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const device_1 = __importDefault(require("../model/device"));
const group_1 = __importDefault(require("../model/group"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
// TODO: get rid of this, use class member
let topicGetSetRegex;
// Used by `publish.test.ts` to reload regex when changing `mqtt.base_topic`.
const loadTopicGetSetRegex = () => {
    topicGetSetRegex = new RegExp(`^${settings.get().mqtt.base_topic}/(?!bridge)(.+?)/(get|set)(?:/(.+))?$`);
};
exports.loadTopicGetSetRegex = loadTopicGetSetRegex;
const STATE_VALUES = ["on", "off", "toggle", "open", "close", "stop", "lock", "unlock"];
const SCENE_CONVERTER_KEYS = ["scene_store", "scene_add", "scene_remove", "scene_remove_all", "scene_rename"];
class Publish extends extension_1.default {
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        (0, exports.loadTopicGetSetRegex)();
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    parseTopic(topic) {
        // The function supports the following topic formats (below are for 'set'. 'get' will look the same):
        // - <base_topic>/device_name/set (auto-matches endpoint and attribute is defined in the payload)
        // - <base_topic>/device_name/set/attribute (default endpoint used)
        // - <base_topic>/device_name/endpoint/set (attribute is defined in the payload)
        // - <base_topic>/device_name/endpoint/set/attribute (payload is the value)
        // Make the rough split on get/set keyword.
        // Before the get/set is the device name and optional endpoint name.
        // After it there will be an optional attribute name.
        const match = topic.match(topicGetSetRegex);
        if (!match) {
            return undefined;
        }
        const deviceNameAndEndpoint = match[1];
        const attribute = match[3];
        // Now parse the device/group name, and endpoint name
        const entity = this.zigbee.resolveEntityAndEndpoint(deviceNameAndEndpoint);
        return { ID: entity.ID, endpoint: entity.endpointID, type: match[2], attribute: attribute };
    }
    parseMessage(parsedTopic, data) {
        if (parsedTopic.attribute) {
            try {
                return { [parsedTopic.attribute]: JSON.parse(data.message) };
            }
            catch {
                return { [parsedTopic.attribute]: data.message };
            }
        }
        else {
            try {
                return JSON.parse(data.message);
            }
            catch {
                return STATE_VALUES.includes(data.message.toLowerCase()) ? { state: data.message } : undefined;
            }
        }
    }
    updateMessageHomeAssistant(message, entityState) {
        /**
         * Home Assistant always publishes 'state', even when e.g. only setting
         * the color temperature. This would lead to 2 zigbee publishes, where the first one
         * (state) is probably unnecessary.
         */
        if (settings.get().homeassistant.enabled) {
            const hasColorTemp = message.color_temp !== undefined;
            const hasColor = message.color !== undefined;
            const hasBrightness = message.brightness !== undefined;
            if (entityState.state === "ON" && (hasColorTemp || hasColor) && !hasBrightness) {
                delete message.state;
                logger_1.default.debug("Skipping state because of Home Assistant");
            }
        }
    }
    async onMQTTMessage(data) {
        const parsedTopic = this.parseTopic(data.topic);
        if (!parsedTopic) {
            return;
        }
        const re = this.zigbee.resolveEntity(parsedTopic.ID);
        if (!re) {
            logger_1.default.error(`Entity '${parsedTopic.ID}' is unknown`);
            return;
        }
        // Get entity details
        let definition;
        if (re instanceof device_1.default) {
            if (!re.definition) {
                logger_1.default.error(`Cannot publish to unsupported device '${re.name}'`);
                return;
            }
            definition = re.definition;
        }
        else {
            definition = re.membersDefinitions();
        }
        const target = re instanceof group_1.default ? re.zh : re.endpoint(parsedTopic.endpoint);
        if (!target) {
            logger_1.default.error(`Device '${re.name}' has no endpoint '${parsedTopic.endpoint}'`);
            return;
        }
        // Convert the MQTT message to a Zigbee message.
        const message = this.parseMessage(parsedTopic, data);
        if (!message) {
            logger_1.default.error(`Invalid message '${message}', skipping...`);
            return;
        }
        const device = re instanceof device_1.default ? re.zh : undefined;
        const entitySettings = re.options;
        const entityState = this.state.get(re);
        const membersState = re instanceof group_1.default
            ? // biome-ignore lint/style/noNonNullAssertion: TODO: biome migration: might be a bit much assumed here?
                Object.fromEntries(re.zh.members.map((e) => [e.deviceIeeeAddress, this.state.get(this.zigbee.resolveEntity(e.deviceIeeeAddress))]))
            : undefined;
        const converters = this.getDefinitionConverters(definition);
        this.updateMessageHomeAssistant(message, entityState);
        /**
         * Order state & brightness based on current bulb state
         *
         * Not all bulbs support setting the color/color_temp while it is off
         * this results in inconsistent behavior between different vendors.
         *
         * bulb on => move state & brightness to the back
         * bulb off => move state & brightness to the front
         */
        const entries = Object.entries(message);
        const sorter = typeof message.state === "string" && message.state.toLowerCase() === "off" ? 1 : -1;
        entries.sort((a) => (["state", "brightness", "brightness_percent"].includes(a[0]) ? sorter : sorter * -1));
        // For each attribute call the corresponding converter
        const usedConverters = {};
        const toPublish = {};
        const toPublishEntity = {};
        const addToToPublish = (entity, payload) => {
            const ID = entity.ID;
            if (!(ID in toPublish)) {
                toPublish[ID] = {};
                toPublishEntity[ID] = entity;
            }
            toPublish[ID] = { ...toPublish[ID], ...payload };
        };
        const endpointNames = re instanceof device_1.default ? re.getEndpointNames() : [];
        const propertyEndpointRegex = new RegExp(`^(.*?)_(${endpointNames.join("|")})$`);
        let scenesChanged = false;
        for (const entry of entries) {
            let key = entry[0];
            const value = entry[1];
            let endpointName = parsedTopic.endpoint;
            let localTarget = target;
            let endpointOrGroupID = utils_1.default.isZHEndpoint(target) ? target.ID : target.groupID;
            // When the key has a endpointName included (e.g. state_right), this will override the target.
            const propertyEndpointMatch = key.match(propertyEndpointRegex);
            if (re instanceof device_1.default && propertyEndpointMatch) {
                endpointName = propertyEndpointMatch[2];
                key = propertyEndpointMatch[1];
                // biome-ignore lint/style/noNonNullAssertion: endpointName is always matched to an existing endpoint of the device since `propertyEndpointRegex` only contains valid endpoints for this device
                localTarget = re.endpoint(endpointName);
                endpointOrGroupID = localTarget.ID;
            }
            if (usedConverters[endpointOrGroupID] === undefined)
                usedConverters[endpointOrGroupID] = [];
            // Match any key if the toZigbee converter defines no key.
            const converter = converters.find((c) => (!c.key || c.key.includes(key)) && (re instanceof group_1.default || !c.endpoints || (endpointName && c.endpoints.includes(endpointName))));
            if (parsedTopic.type === "set" && converter && usedConverters[endpointOrGroupID].includes(converter)) {
                // Use a converter for set only once
                // (e.g. light_onoff_brightness converters can convert state and brightness)
                continue;
            }
            if (!converter) {
                logger_1.default.error(`No converter available for '${key}' on '${re.name}': (${(0, json_stable_stringify_without_jsonify_1.default)(message[key])})`);
                continue;
            }
            // If the endpoint_name name is a number, try to map it to a friendlyName
            if (!Number.isNaN(Number(endpointName)) && re.isDevice() && utils_1.default.isZHEndpoint(localTarget) && re.endpointName(localTarget)) {
                endpointName = re.endpointName(localTarget);
            }
            // Converter didn't return a result, skip
            const entitySettingsKeyValue = entitySettings;
            const meta = {
                endpoint_name: endpointName,
                options: entitySettingsKeyValue,
                message: { ...message },
                device,
                state: entityState,
                membersState,
                mapped: definition,
                /* v8 ignore next */
                publish: (payload) => this.publishEntityState(re, payload),
            };
            // Strip endpoint name from meta.message properties.
            if (endpointName) {
                for (const [key, value] of Object.entries(meta.message)) {
                    if (key.endsWith(endpointName)) {
                        delete meta.message[key];
                        const keyWithoutEndpoint = key.substring(0, key.length - endpointName.length - 1);
                        meta.message[keyWithoutEndpoint] = value;
                    }
                }
            }
            try {
                if (parsedTopic.type === "set" && converter.convertSet) {
                    logger_1.default.debug(`Publishing '${parsedTopic.type}' '${key}' to '${re.name}'`);
                    const result = await converter.convertSet(localTarget, key, value, meta);
                    const optimistic = entitySettings.optimistic === undefined || entitySettings.optimistic;
                    if (result?.state && optimistic) {
                        const msg = result.state;
                        if (endpointName) {
                            for (const key of Object.keys(msg)) {
                                msg[`${key}_${endpointName}`] = msg[key];
                                delete msg[key];
                            }
                        }
                        // filter out attribute listed in filtered_optimistic
                        utils_1.default.filterProperties(entitySettings.filtered_optimistic, msg);
                        addToToPublish(re, msg);
                    }
                    if (result?.membersState && optimistic) {
                        for (const [ieeeAddr, state] of Object.entries(result.membersState)) {
                            // biome-ignore lint/style/noNonNullAssertion: might be a bit much assumed here?
                            addToToPublish(this.zigbee.resolveEntity(ieeeAddr), state);
                        }
                    }
                }
                else if (parsedTopic.type === "get" && converter.convertGet) {
                    logger_1.default.debug(`Publishing get '${parsedTopic.type}' '${key}' to '${re.name}'`);
                    await converter.convertGet(localTarget, key, meta);
                }
                else {
                    logger_1.default.error(`No converter available for '${parsedTopic.type}' '${key}' (${message[key]})`);
                    continue;
                }
            }
            catch (error) {
                const message = `Publish '${parsedTopic.type}' '${key}' to '${re.name}' failed: '${error}'`;
                logger_1.default.error(message);
                // biome-ignore lint/style/noNonNullAssertion: always Error
                logger_1.default.debug(error.stack);
            }
            usedConverters[endpointOrGroupID].push(converter);
            if (!scenesChanged && converter.key) {
                scenesChanged = converter.key.some((k) => SCENE_CONVERTER_KEYS.includes(k));
            }
        }
        for (const [ID, payload] of Object.entries(toPublish)) {
            if (!utils_1.default.objectIsEmpty(payload)) {
                await this.publishEntityState(toPublishEntity[ID], payload);
            }
        }
        if (scenesChanged) {
            this.eventBus.emitScenesChanged({ entity: re });
        }
    }
    getDefinitionConverters(definition) {
        if (Array.isArray(definition)) {
            return definition.length ? Array.from(new Set(definition.flatMap((d) => d.toZigbee))) : [];
        }
        return definition?.toZigbee;
    }
}
exports.default = Publish;
__decorate([
    bind_decorator_1.default
], Publish.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vcHVibGlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvRUFBa0M7QUFDbEMsa0hBQThEO0FBRzlELDZEQUFxQztBQUNyQywyREFBbUM7QUFDbkMsNERBQW9DO0FBQ3BDLDJEQUE2QztBQUM3QywwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDLDBDQUEwQztBQUMxQyxJQUFJLGdCQUF3QixDQUFDO0FBQzdCLDZFQUE2RTtBQUN0RSxNQUFNLG9CQUFvQixHQUFHLEdBQVMsRUFBRTtJQUMzQyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzdHLENBQUMsQ0FBQztBQUZXLFFBQUEsb0JBQW9CLHdCQUUvQjtBQUVGLE1BQU0sWUFBWSxHQUEwQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvRyxNQUFNLG9CQUFvQixHQUEwQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBU3JJLE1BQXFCLE9BQVEsU0FBUSxtQkFBUztJQUMxQyw2Q0FBNkM7SUFDcEMsS0FBSyxDQUFDLEtBQUs7UUFDaEIsSUFBQSw0QkFBb0IsR0FBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFhO1FBQ3BCLHFHQUFxRztRQUNyRyxpR0FBaUc7UUFD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