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
const TOPIC_REGEX = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/group/members/(remove|add|remove_all)$`);
const STATE_PROPERTIES = {
    state: () => true,
    brightness: (value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === 'brightness')),
    color_temp: (value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === 'color_temp')),
    color: (value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) && e.features.some((f) => f.name === 'color_xy' || f.name === 'color_hs')),
    color_mode: (value, exposes) => exposes.some((e) => (0, utils_1.isLightExpose)(e) &&
        (e.features.some((f) => f.name === `color_${value}`) || (value === 'color_temp' && e.features.some((f) => f.name === 'color_temp')))),
};
class Groups extends extension_1.default {
    lastOptimisticState = {};
    async start() {
        this.eventBus.onStateChange(this, this.onStateChange);
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    async onStateChange(data) {
        const reason = 'groupOptimistic';
        if (data.reason === reason || data.reason === 'publishCached') {
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
                if (group.options && (group.options.optimistic == undefined || group.options.optimistic)) {
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
        return (group.options.off_state === 'last_member_state' ||
            !payload ||
            (payload.state !== 'OFF' && payload.state !== 'CLOSE') ||
            this.areAllMembersOffOrClosed(group));
    }
    areAllMembersOffOrClosed(group) {
        for (const member of group.zh.members) {
            const device = this.zigbee.resolveEntity(member.getDevice());
            if (this.state.exists(device)) {
                const state = this.state.get(device);
                const endpointNames = device.isDevice() && device.getEndpointNames();
                const stateKey = endpointNames && endpointNames.length >= member.ID ? `state_${endpointNames[member.ID - 1]}` : 'state';
                if (state[stateKey] === 'ON' || state[stateKey] === 'OPEN') {
                    return false;
                }
            }
        }
        return true;
    }
    parseMQTTMessage(data) {
        const topicRegexMatch = data.topic.match(TOPIC_REGEX);
        if (topicRegexMatch) {
            const type = topicRegexMatch[1];
            let resolvedGroup;
            let groupKey;
            let skipDisableReporting = false;
            const message = JSON.parse(data.message);
            if (typeof message !== 'object' || message.device == undefined) {
                return [message, { type, skipDisableReporting }, 'Invalid payload'];
            }
            const deviceKey = message.device;
            skipDisableReporting = message.skip_disable_reporting != undefined ? message.skip_disable_reporting : false;
            if (type !== 'remove_all') {
                groupKey = message.group;
                if (message.group == undefined) {
                    return [message, { type, skipDisableReporting }, `Invalid payload`];
                }
                resolvedGroup = this.zigbee.resolveEntity(message.group);
                if (!resolvedGroup || !(resolvedGroup instanceof group_1.default)) {
                    return [message, { type, skipDisableReporting }, `Group '${message.group}' does not exist`];
                }
            }
            const resolvedDevice = this.zigbee.resolveEntity(message.device);
            if (!resolvedDevice || !(resolvedDevice instanceof device_1.default)) {
                return [message, { type, skipDisableReporting }, `Device '${message.device}' does not exist`];
            }
            const endpointKey = message.endpoint ?? 'default';
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
        else {
            return [undefined, undefined, undefined];
        }
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
        (0, node_assert_1.default)(resolvedDevice, '`resolvedDevice` is missing');
        (0, node_assert_1.default)(resolvedEndpoint, '`resolvedEndpoint` is missing');
        try {
            if (type === 'add') {
                (0, node_assert_1.default)(resolvedGroup, '`resolvedGroup` is missing');
                logger_1.default.info(`Adding '${resolvedDevice.name}' to '${resolvedGroup.name}'`);
                await resolvedEndpoint.addToGroup(resolvedGroup.zh);
                changedGroups.push(resolvedGroup);
                await this.publishResponse(parsed.type, raw, {
                    device: deviceKey, // valid from resolved asserts
                    endpoint: endpointKey, // valid from resolved asserts
                    group: groupKey, // valid from resolved asserts
                });
            }
            else if (type === 'remove') {
                (0, node_assert_1.default)(resolvedGroup, '`resolvedGroup` is missing');
                logger_1.default.info(`Removing '${resolvedDevice.name}' from '${resolvedGroup.name}'`);
                await resolvedEndpoint.removeFromGroup(resolvedGroup.zh);
                changedGroups.push(resolvedGroup);
                await this.publishResponse(parsed.type, raw, {
                    device: deviceKey, // valid from resolved asserts
                    endpoint: endpointKey, // valid from resolved asserts
                    group: groupKey, // valid from resolved asserts
                });
            }
            else {
                // remove_all
                logger_1.default.info(`Removing '${resolvedDevice.name}' from all groups`);
                for (const group of this.zigbee.groupsIterator((g) => g.members.includes(resolvedEndpoint))) {
                    changedGroups.push(group);
                }
                await resolvedEndpoint.removeFromAllGroups();
                await this.publishResponse(parsed.type, raw, {
                    device: deviceKey, // valid from resolved asserts
                    endpoint: endpointKey, // valid from resolved asserts
                });
            }
        }
        catch (e) {
            const errorMsg = `Failed to ${type} from group (${e.message})`;
            await this.publishResponse(parsed.type, raw, {}, errorMsg);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9ncm91cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw4REFBaUM7QUFFakMsb0VBQWtDO0FBQ2xDLDhEQUF5QztBQUN6QyxrSEFBOEQ7QUFJOUQsNkRBQXFDO0FBQ3JDLDJEQUFtQztBQUNuQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLHVEQUFtRDtBQUNuRCw0REFBb0M7QUFFcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsd0RBQXdELENBQUMsQ0FBQztBQUUzSCxNQUFNLGdCQUFnQixHQUFnRjtJQUNsRyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtJQUNqQixVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLHFCQUFhLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUM7SUFDeEgsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxxQkFBYSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO0lBQ3hILEtBQUssRUFBRSxDQUFD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