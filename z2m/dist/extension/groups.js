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
const node_assert_1 = __importDefault(require("node:assert"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const es6_1 = __importDefault(require("fast-deep-equal/es6"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const device_1 = __importDefault(require("../model/device"));
const group_1 = __importDefault(require("../model/group"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importStar(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const STATE_PROPERTIES = {
    state: () => true,
    brightness: (_value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === "brightness")),
    color_temp: (_value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === "color_temp")),
    color: (_value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === "color_xy" || f.name === "color_hs")),
    color_mode: (value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) &&
        (e.features.some((f) => f.name === `color_${value}`) || (value === "color_temp" && e.features.some((f) => f.name === "color_temp")))),
};
class Groups extends extension_1.default {
    #topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/group/members/(remove|add|remove_all)$`);
    lastOptimisticState = {};
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        this.eventBus.onStateChange(this, this.onStateChange);
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    async onStateChange(data) {
        const reason = "groupOptimistic";
        if (data.reason === reason || data.reason === "publishCached") {
            return;
        }
        const payload = {};
        let endpointName;
        const endpointNames = data.entity instanceof device_1.default ? data.entity.getEndpointNames() : [];
        for (let prop of Object.keys(data.update)) {
            const value = data.update[prop];
            const endpointNameMatch = endpointNames.find((n) => prop.endsWith(`_${n}`));
            if (endpointNameMatch) {
                prop = prop.substring(0, prop.length - endpointNameMatch.length - 1);
                endpointName = endpointNameMatch;
            }
            if (prop in STATE_PROPERTIES) {
                payload[prop] = value;
            }
        }
        const payloadKeys = Object.keys(payload);
        if (payloadKeys.length) {
            const entity = data.entity;
            const groups = [];
            for (const group of this.zigbee.groupsIterator()) {
                if (group.options && (group.options.optimistic == null || group.options.optimistic)) {
                    groups.push(group);
                }
            }
            if (entity instanceof device_1.default) {
                const endpoint = entity.endpoint(endpointName);
                if (endpoint) {
                    for (const group of groups) {
                        if (group.zh.hasMember(endpoint) &&
                            !(0, es6_1.default)(this.lastOptimisticState[group.ID], payload) &&
                            this.shouldPublishPayloadForGroup(group, payload)) {
                            this.lastOptimisticState[group.ID] = payload;
                            await this.publishEntityState(group, payload, reason);
                        }
                    }
                }
            }
            else {
                // Invalidate the last optimistic group state when group state is changed directly.
                delete this.lastOptimisticState[entity.ID];
                const groupsToPublish = new Set();
                for (const member of entity.zh.members) {
                    const device = this.zigbee.resolveEntity(member.getDevice());
                    if (device.options.disabled) {
                        continue;
                    }
                    const exposes = device.exposes();
                    const memberPayload = {};
                    for (const key of payloadKeys) {
                        if (STATE_PROPERTIES[key](payload[key], exposes)) {
                            memberPayload[key] = payload[key];
                        }
                    }
                    const endpointName = device.endpointName(member);
                    if (endpointName) {
                        for (const key of Object.keys(memberPayload)) {
                            memberPayload[`${key}_${endpointName}`] = memberPayload[key];
                            delete memberPayload[key];
                        }
                    }
                    await this.publishEntityState(device, memberPayload, reason);
                    for (const zigbeeGroup of groups) {
                        if (zigbeeGroup.zh.hasMember(member) && this.shouldPublishPayloadForGroup(zigbeeGroup, payload)) {
                            groupsToPublish.add(zigbeeGroup);
                        }
                    }
                }
                groupsToPublish.delete(entity);
                for (const group of groupsToPublish) {
                    await this.publishEntityState(group, payload, reason);
                }
            }
        }
    }
    shouldPublishPayloadForGroup(group, payload) {
        return (group.options.off_state === "last_member_state" ||
            !payload ||
            (payload.state !== "OFF" && payload.state !== "CLOSE") ||
            this.areAllMembersOffOrClosed(group));
    }
    areAllMembersOffOrClosed(group) {
        for (const member of group.zh.members) {
            // biome-ignore lint/style/noNonNullAssertion: TODO: biome migration: valid from loop?
            const device = this.zigbee.resolveEntity(member.getDevice());
            if (this.state.exists(device)) {
                const state = this.state.get(device);
                const endpointNames = device.isDevice() && device.getEndpointNames();
                const stateKey = endpointNames &&
                    endpointNames.length >= member.ID &&
                    device.definition?.meta?.multiEndpoint &&
                    (!device.definition.meta.multiEndpointSkip || !device.definition.meta.multiEndpointSkip.includes("state"))
                    ? `state_${endpointNames[member.ID - 1]}`
                    : "state";
                if (state[stateKey] === "ON" || state[stateKey] === "OPEN") {
                    return false;
                }
            }
        }
        return true;
    }
    parseMQTTMessage(data) {
        const topicRegexMatch = data.topic.match(this.#topicRegex);
        if (topicRegexMatch) {
            const type = topicRegexMatch[1];
            let resolvedGroup;
            let groupKey;
            let skipDisableReporting = false;
            const message = JSON.parse(data.message);
            if (typeof message !== "object" || message.device == null) {
                return [message, { type, skipDisableReporting }, "Invalid payload"];
            }
            const deviceKey = message.device;
            skipDisableReporting = message.skip_disable_reporting != null ? message.skip_disable_reporting : false;
            if (type !== "remove_all") {
                if (!("group" in message) || message.group == null) {
                    return [message, { type, skipDisableReporting }, "Invalid payload"];
                }
                groupKey = message.group;
                const group = this.zigbee.resolveEntity(message.group);
                if (!group || !(group instanceof group_1.default)) {
                    return [message, { type, skipDisableReporting }, `Group '${message.group}' does not exist`];
                }
                resolvedGroup = group;
            }
            const resolvedDevice = this.zigbee.resolveEntity(message.device);
            if (!resolvedDevice || !(resolvedDevice instanceof device_1.default)) {
                return [message, { type, skipDisableReporting }, `Device '${message.device}' does not exist`];
            }
            const endpointKey = message.endpoint ?? "default";
            const resolvedEndpoint = resolvedDevice.endpoint(message.endpoint);
            if (!resolvedEndpoint) {
                return [message, { type, skipDisableReporting }, `Device '${resolvedDevice.name}' does not have endpoint '${endpointKey}'`];
            }
            return [
                message,
                {
                    resolvedGroup,
                    resolvedDevice,
                    resolvedEndpoint,
                    type,
                    groupKey,
                    deviceKey,
                    endpointKey,
                    skipDisableReporting,
                },
                undefined,
            ];
        }
        return [undefined, undefined, undefined];
    }
    async onMQTTMessage(data) {
        const [raw, parsed, error] = this.parseMQTTMessage(data);
        if (!raw || !parsed) {
            return;
        }
        if (error) {
            await this.publishResponse(parsed.type, raw, {}, error);
            return;
        }
        const { resolvedGroup, resolvedDevice, resolvedEndpoint, type, groupKey, deviceKey, endpointKey, skipDisableReporting } = parsed;
        const changedGroups = [];
        (0, node_assert_1.default)(resolvedDevice, "`resolvedDevice` is missing");
        (0, node_assert_1.default)(resolvedEndpoint, "`resolvedEndpoint` is missing");
        try {
            if (type === "add") {
                (0, node_assert_1.default)(resolvedGroup, "`resolvedGroup` is missing");
                logger_1.default.info(`Adding endpoint '${resolvedEndpoint.ID}' of device '${resolvedDevice.name}' to group '${resolvedGroup.name}'`);
                await resolvedEndpoint.addToGroup(resolvedGroup.zh);
                changedGroups.push(resolvedGroup);
                // biome-ignore lint/style/noNonNullAssertion: valid from resolved asserts
                const respPayload = { device: deviceKey, endpoint: endpointKey, group: groupKey };
                await this.publishResponse(parsed.type, raw, respPayload);
            }
            else if (type === "remove") {
                (0, node_assert_1.default)(resolvedGroup, "`resolvedGroup` is missing");
                logger_1.default.info(`Removing endpoint '${resolvedEndpoint.ID}' of device '${resolvedDevice.name}' from group '${resolvedGroup.name}'`);
                await resolvedEndpoint.removeFromGroup(resolvedGroup.zh);
                changedGroups.push(resolvedGroup);
                // biome-ignore lint/style/noNonNullAssertion: valid from resolved asserts
                const respPayload = { device: deviceKey, endpoint: endpointKey, group: groupKey };
                await this.publishResponse(parsed.type, raw, respPayload);
            }
            else {
                // remove_all
                logger_1.default.info(`Removing endpoint '${resolvedEndpoint.ID}' of device '${resolvedDevice.name}' from all groups`);
                for (const group of this.zigbee.groupsIterator((g) => g.members.includes(resolvedEndpoint))) {
                    changedGroups.push(group);
                }
                await resolvedEndpoint.removeFromAllGroups();
                // biome-ignore lint/style/noNonNullAssertion: valid from resolved asserts
                const respPayload = { device: deviceKey, endpoint: endpointKey };
                await this.publishResponse(parsed.type, raw, respPayload);
            }
        }
        catch (e) {
            const errorMsg = `Failed to ${type} ${type === "add" ? "to" : "from"} group (${e.message})`;
            await this.publishResponse(parsed.type, raw, {}, errorMsg);
            // biome-ignore lint/style/noNonNullAssertion: always Error
            logger_1.default.debug(e.stack);
            return;
        }
        for (const group of changedGroups) {
            this.eventBus.emitGroupMembersChanged({ group, action: type, endpoint: resolvedEndpoint, skipDisableReporting });
        }
    }
    async publishResponse(type, request, data, error) {
        const response = utils_1.default.getResponse(request, data, error);
        await this.mqtt.publish(`bridge/response/group/members/${type}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
        if (error) {
            logger_1.default.error(error);
        }
    }
}
exports.default = Groups;
__decorate([
    bind_decorator_1.default
], Groups.prototype, "onStateChange", null);
__decorate([
    bind_decorator_1.default
], Groups.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9ncm91cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4REFBaUM7QUFDakMsb0VBQWtDO0FBQ2xDLDhEQUF5QztBQUN6QyxrSEFBOEQ7QUFFOUQsNkRBQXFDO0FBQ3JDLDJEQUFtQztBQUVuQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLHVEQUFtRDtBQUNuRCw0REFBb0M7QUFFcEMsTUFBTSxnQkFBZ0IsR0FBZ0Y7SUFDbEcsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7SUFDakIsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxxQkFBYSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO0lBQ3pILFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEscUJBQWEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQztJQUN6SCxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLHFCQUFhLEVBQUMsQ0FBQyxD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