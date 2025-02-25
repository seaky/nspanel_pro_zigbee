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
                const stateKey = endpointNames &&
                    endpointNames.length >= member.ID &&
                    device.definition?.meta?.multiEndpoint &&
                    (!device.definition.meta.multiEndpointSkip || !device.definition.meta.multiEndpointSkip.includes('state'))
                    ? `state_${endpointNames[member.ID - 1]}`
                    : 'state';
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