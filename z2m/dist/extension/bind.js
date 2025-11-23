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
const debounce_1 = __importDefault(require("debounce"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const device_1 = __importDefault(require("../model/device"));
const group_1 = __importDefault(require("../model/group"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importStar(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const ALL_CLUSTER_CANDIDATES = [
    "genScenes",
    "genOnOff",
    "genLevelCtrl",
    "lightingColorCtrl",
    "closuresWindowCovering",
    "hvacThermostat",
    "msIlluminanceMeasurement",
    "msTemperatureMeasurement",
    "msRelativeHumidity",
    "msSoilMoisture",
    "msCO2",
];
// See zigbee-herdsman-converters
const DEFAULT_BIND_GROUP = { type: "group_number", ID: utils_1.DEFAULT_BIND_GROUP_ID, name: "default_bind_group" };
const DEFAULT_REPORT_CONFIG = { minimumReportInterval: 5, maximumReportInterval: 3600, reportableChange: 1 };
const getColorCapabilities = async (endpoint) => {
    if (endpoint.getClusterAttributeValue("lightingColorCtrl", "colorCapabilities") == null) {
        await endpoint.read("lightingColorCtrl", ["colorCapabilities"]);
    }
    const value = endpoint.getClusterAttributeValue("lightingColorCtrl", "colorCapabilities");
    return {
        colorTemperature: (value & (1 << 4)) > 0,
        colorXY: (value & (1 << 3)) > 0,
    };
};
const REPORT_CLUSTERS = {
    genOnOff: [{ attribute: "onOff", ...DEFAULT_REPORT_CONFIG, minimumReportInterval: 0, reportableChange: 0 }],
    genLevelCtrl: [{ attribute: "currentLevel", ...DEFAULT_REPORT_CONFIG }],
    lightingColorCtrl: [
        {
            attribute: "colorTemperature",
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorTemperature,
        },
        {
            attribute: "currentX",
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorXY,
        },
        {
            attribute: "currentY",
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorXY,
        },
    ],
    closuresWindowCovering: [
        { attribute: "currentPositionLiftPercentage", ...DEFAULT_REPORT_CONFIG },
        { attribute: "currentPositionTiltPercentage", ...DEFAULT_REPORT_CONFIG },
    ],
};
const POLL_ON_MESSAGE = [
    {
        // On messages that have the cluster and type of below
        cluster: {
            manuSpecificPhilips: [
                { type: "commandHueNotification", data: { button: 2 } },
                { type: "commandHueNotification", data: { button: 3 } },
            ],
            genLevelCtrl: [
                { type: "commandStep", data: {} },
                { type: "commandStepWithOnOff", data: {} },
                { type: "commandStop", data: {} },
                { type: "commandMoveWithOnOff", data: {} },
                { type: "commandStopWithOnOff", data: {} },
                { type: "commandMove", data: {} },
                { type: "commandMoveToLevelWithOnOff", data: {} },
            ],
            genScenes: [{ type: "commandRecall", data: {} }],
        },
        // Read the following attributes
        read: { cluster: "genLevelCtrl", attributes: ["currentLevel"] },
        // When the bound devices/members of group have the following manufacturerIDs
        manufacturerIDs: [
            zigbee_herdsman_1.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V,
            zigbee_herdsman_1.Zcl.ManufacturerCode.ATMEL,
            zigbee_herdsman_1.Zcl.ManufacturerCode.GLEDOPTO_CO_LTD,
            zigbee_herdsman_1.Zcl.ManufacturerCode.MUELLER_LICHT_INTERNATIONAL_INC,
            zigbee_herdsman_1.Zcl.ManufacturerCode.TELINK_MICRO,
            zigbee_herdsman_1.Zcl.ManufacturerCode.BUSCH_JAEGER_ELEKTRO,
        ],
        manufacturerNames: ["GLEDOPTO", "Trust International B.V.\u0000"],
    },
    {
        cluster: {
            genLevelCtrl: [
                { type: "commandStepWithOnOff", data: {} },
                { type: "commandMoveWithOnOff", data: {} },
                { type: "commandStopWithOnOff", data: {} },
                { type: "commandMoveToLevelWithOnOff", data: {} },
            ],
            genOnOff: [
                { type: "commandOn", data: {} },
                { type: "commandOff", data: {} },
                { type: "commandOffWithEffect", data: {} },
                { type: "commandToggle", data: {} },
            ],
            genScenes: [{ type: "commandRecall", data: {} }],
            manuSpecificPhilips: [
                { type: "commandHueNotification", data: { button: 1 } },
                { type: "commandHueNotification", data: { button: 4 } },
            ],
        },
        read: { cluster: "genOnOff", attributes: ["onOff"] },
        manufacturerIDs: [
            zigbee_herdsman_1.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V,
            zigbee_herdsman_1.Zcl.ManufacturerCode.ATMEL,
            zigbee_herdsman_1.Zcl.ManufacturerCode.GLEDOPTO_CO_LTD,
            zigbee_herdsman_1.Zcl.ManufacturerCode.MUELLER_LICHT_INTERNATIONAL_INC,
            zigbee_herdsman_1.Zcl.ManufacturerCode.TELINK_MICRO,
            zigbee_herdsman_1.Zcl.ManufacturerCode.BUSCH_JAEGER_ELEKTRO,
        ],
        manufacturerNames: ["GLEDOPTO", "Trust International B.V.\u0000"],
    },
    {
        cluster: {
            genScenes: [{ type: "commandRecall", data: {} }],
        },
        read: {
            cluster: "lightingColorCtrl",
            attributes: [],
            // Since not all devices support the same attributes they need to be calculated dynamically
            // depending on the capabilities of the endpoint.
            attributesForEndpoint: async (endpoint) => {
                const supportedAttrs = await getColorCapabilities(endpoint);
                const readAttrs = [];
                if (supportedAttrs.colorXY) {
                    readAttrs.push("currentX", "currentY");
                }
                if (supportedAttrs.colorTemperature) {
                    readAttrs.push("colorTemperature");
                }
                return readAttrs;
            },
        },
        manufacturerIDs: [
            zigbee_herdsman_1.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V,
            zigbee_herdsman_1.Zcl.ManufacturerCode.ATMEL,
            zigbee_herdsman_1.Zcl.ManufacturerCode.GLEDOPTO_CO_LTD,
            zigbee_herdsman_1.Zcl.ManufacturerCode.MUELLER_LICHT_INTERNATIONAL_INC,
            zigbee_herdsman_1.Zcl.ManufacturerCode.TELINK_MICRO,
            // Note: ManufacturerCode.BUSCH_JAEGER is left out intentionally here as their devices don't support colors
        ],
        manufacturerNames: ["GLEDOPTO", "Trust International B.V.\u0000"],
    },
];
class Bind extends extension_1.default {
    #topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/device/(bind|unbind)`);
    pollDebouncers = {};
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        this.eventBus.onDeviceMessage(this, this.poll);
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        this.eventBus.onGroupMembersChanged(this, this.onGroupMembersChanged);
    }
    parseMQTTMessage(data) {
        if (data.topic.match(this.#topicRegex)) {
            const type = data.topic.endsWith("unbind") ? "unbind" : "bind";
            let skipDisableReporting = false;
            const message = JSON.parse(data.message);
            if (typeof message !== "object" || message.from == null || message.to == null) {
                return [message, { type, skipDisableReporting }, "Invalid payload"];
            }
            const sourceKey = message.from;
            const sourceEndpointKey = message.from_endpoint ?? "default";
            const targetKey = message.to;
            const targetEndpointKey = message.to_endpoint;
            const clusters = message.clusters;
            skipDisableReporting = message.skip_disable_reporting != null ? message.skip_disable_reporting : false;
            const resolvedSource = this.zigbee.resolveEntity(message.from);
            if (!resolvedSource || !(resolvedSource instanceof device_1.default)) {
                return [message, { type, skipDisableReporting }, `Source device '${message.from}' does not exist`];
            }
            const resolvedTarget = message.to === DEFAULT_BIND_GROUP.name || message.to === DEFAULT_BIND_GROUP.ID
                ? DEFAULT_BIND_GROUP
                : this.zigbee.resolveEntity(message.to);
            if (!resolvedTarget) {
                return [message, { type, skipDisableReporting }, `Target device or group '${message.to}' does not exist`];
            }
            const resolvedSourceEndpoint = resolvedSource.endpoint(sourceEndpointKey);
            if (!resolvedSourceEndpoint) {
                return [
                    message,
                    { type, skipDisableReporting },
                    `Source device '${resolvedSource.name}' does not have endpoint '${sourceEndpointKey}'`,
                ];
            }
            // resolves to 'default' endpoint if targetEndpointKey is invalid (used by frontend for 'Coordinator')
            const resolvedBindTarget = resolvedTarget instanceof device_1.default
                ? resolvedTarget.endpoint(targetEndpointKey)
                : resolvedTarget instanceof group_1.default
                    ? resolvedTarget.zh
                    : Number(resolvedTarget.ID);
            if (resolvedTarget instanceof device_1.default && !resolvedBindTarget) {
                return [
                    message,
                    { type, skipDisableReporting },
                    `Target device '${resolvedTarget.name}' does not have endpoint '${targetEndpointKey}'`,
                ];
            }
            return [
                message,
                {
                    type,
                    sourceKey,
                    sourceEndpointKey,
                    targetKey,
                    targetEndpointKey,
                    clusters,
                    skipDisableReporting,
                    resolvedSource,
                    resolvedTarget,
                    resolvedSourceEndpoint,
                    resolvedBindTarget,
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
        const { type, sourceKey, sourceEndpointKey, targetKey, targetEndpointKey, clusters, skipDisableReporting, resolvedSource, resolvedTarget, resolvedSourceEndpoint, resolvedBindTarget, } = parsed;
        (0, node_assert_1.default)(resolvedSource, "`resolvedSource` is missing");
        (0, node_assert_1.default)(resolvedTarget, "`resolvedTarget` is missing");
        (0, node_assert_1.default)(resolvedSourceEndpoint, "`resolvedSourceEndpoint` is missing");
        (0, node_assert_1.default)(resolvedBindTarget !== undefined, "`resolvedBindTarget` is missing");
        const successfulClusters = [];
        const failedClusters = [];
        const attemptedClusters = [];
        // Find which clusters are supported by both the source and target.
        // Groups are assumed to support all clusters.
        const clusterCandidates = clusters ?? ALL_CLUSTER_CANDIDATES;
        for (const cluster of clusterCandidates) {
            let matchingClusters = false;
            const anyClusterValid = utils_1.default.isZHGroup(resolvedBindTarget) ||
                typeof resolvedBindTarget === "number" ||
                (resolvedTarget instanceof device_1.default && resolvedTarget.zh.type === "Coordinator");
            if (!anyClusterValid && utils_1.default.isZHEndpoint(resolvedBindTarget)) {
                matchingClusters =
                    (resolvedBindTarget.supportsInputCluster(cluster) && resolvedSourceEndpoint.supportsOutputCluster(cluster)) ||
                        (resolvedSourceEndpoint.supportsInputCluster(cluster) && resolvedBindTarget.supportsOutputCluster(cluster));
            }
            const sourceValid = resolvedSourceEndpoint.supportsInputCluster(cluster) || resolvedSourceEndpoint.supportsOutputCluster(cluster);
            if (sourceValid && (anyClusterValid || matchingClusters)) {
                logger_1.default.debug(`${type}ing cluster '${cluster}' from '${resolvedSource.name}' to '${resolvedTarget.name}'`);
                attemptedClusters.push(cluster);
                try {
                    if (type === "bind") {
                        await resolvedSourceEndpoint.bind(cluster, resolvedBindTarget);
                    }
                    else {
                        await resolvedSourceEndpoint.unbind(cluster, resolvedBindTarget);
                    }
                    successfulClusters.push(cluster);
                    logger_1.default.info(`Successfully ${type === "bind" ? "bound" : "unbound"} cluster '${cluster}' from '${resolvedSource.name}' to '${resolvedTarget.name}'`);
                }
                catch (error) {
                    failedClusters.push(cluster);
                    logger_1.default.error(`Failed to ${type} cluster '${cluster}' from '${resolvedSource.name}' to '${resolvedTarget.name}' (${error})`);
                }
            }
        }
        if (attemptedClusters.length === 0) {
            logger_1.default.error(`Nothing to ${type} from '${resolvedSource.name}' to '${resolvedTarget.name}'`);
            await this.publishResponse(parsed.type, raw, {}, `Nothing to ${type}`);
            return;
        }
        if (failedClusters.length === attemptedClusters.length) {
            await this.publishResponse(parsed.type, raw, {}, `Failed to ${type}`);
            return;
        }
        const responseData = {
            // biome-ignore lint/style/noNonNullAssertion: valid with assert above on `resolvedSource`
            from: sourceKey,
            // biome-ignore lint/style/noNonNullAssertion: valid with assert above on `resolvedSourceEndpoint`
            from_endpoint: sourceEndpointKey,
            // biome-ignore lint/style/noNonNullAssertion: valid with assert above on `resolvedTarget`
            to: targetKey,
            to_endpoint: targetEndpointKey,
            clusters: successfulClusters,
            failed: failedClusters,
        };
        if (successfulClusters.length !== 0) {
            if (type === "bind") {
                await this.setupReporting(resolvedSourceEndpoint.binds.filter((b) => successfulClusters.includes(b.cluster.name) && b.target === resolvedBindTarget));
            }
            else if (typeof resolvedBindTarget !== "number" && !skipDisableReporting) {
                await this.disableUnnecessaryReportings(resolvedBindTarget);
            }
        }
        await this.publishResponse(parsed.type, raw, responseData);
        this.eventBus.emitDevicesChanged();
    }
    async publishResponse(type, request, data, error) {
        const response = utils_1.default.getResponse(request, data, error);
        await this.mqtt.publish(`bridge/response/device/${type}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
        if (error) {
            logger_1.default.error(error);
        }
    }
    async onGroupMembersChanged(data) {
        if (data.action === "add") {
            const bindsToGroup = [];
            for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
                for (const endpoint of device.zh.endpoints) {
                    for (const bind of endpoint.binds) {
                        if (bind.target === data.group.zh) {
                            bindsToGroup.push(bind);
                        }
                    }
                }
            }
            await this.setupReporting(bindsToGroup);
        }
        else {
            // action === remove/remove_all
            if (!data.skipDisableReporting) {
                await this.disableUnnecessaryReportings(data.endpoint);
            }
        }
    }
    getSetupReportingEndpoints(bind, coordinatorEp) {
        const endpoints = utils_1.default.isZHEndpoint(bind.target) ? [bind.target] : bind.target.members;
        return endpoints.filter((e) => {
            if (!e.supportsInputCluster(bind.cluster.name)) {
                return false;
            }
            const hasConfiguredReporting = e.configuredReportings.some((c) => c.cluster.name === bind.cluster.name);
            if (!hasConfiguredReporting) {
                return true;
            }
            const hasBind = e.binds.some((b) => b.cluster.name === bind.cluster.name && b.target === coordinatorEp);
            return !hasBind;
        });
    }
    async setupReporting(binds) {
        const coordinatorEndpoint = this.zigbee.firstCoordinatorEndpoint();
        for (const bind of binds) {
            if (bind.cluster.name in REPORT_CLUSTERS) {
                for (const endpoint of this.getSetupReportingEndpoints(bind, coordinatorEndpoint)) {
                    // biome-ignore lint/style/noNonNullAssertion: TODO: biome migration: ???
                    const resolvedDevice = this.zigbee.resolveEntity(endpoint.getDevice());
                    const entity = `${resolvedDevice.name}/${endpoint.ID}`;
                    try {
                        await endpoint.bind(bind.cluster.name, coordinatorEndpoint);
                        const items = [];
                        // biome-ignore lint/style/noNonNullAssertion: valid from outer `if`
                        for (const c of REPORT_CLUSTERS[bind.cluster.name]) {
                            if (!("condition" in c) || !c.condition || (await c.condition(endpoint))) {
                                const { attribute, minimumReportInterval, maximumReportInterval, reportableChange } = c;
                                items.push({ attribute, minimumReportInterval, maximumReportInterval, reportableChange });
                            }
                        }
                        await endpoint.configureReporting(bind.cluster.name, items);
                        logger_1.default.info(`Successfully setup reporting for '${entity}' cluster '${bind.cluster.name}'`);
                    }
                    catch (error) {
                        logger_1.default.warning(`Failed to setup reporting for '${entity}' cluster '${bind.cluster.name}' (${error.message})`);
                    }
                }
            }
        }
        this.eventBus.emitDevicesChanged();
    }
    async disableUnnecessaryReportings(target) {
        const coordinator = this.zigbee.firstCoordinatorEndpoint();
        const endpoints = utils_1.default.isZHEndpoint(target) ? [target] : target.members;
        const allBinds = [];
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            for (const endpoint of device.zh.endpoints) {
                for (const bind of endpoint.binds) {
                    allBinds.push(bind);
                }
            }
        }
        for (const endpoint of endpoints) {
            const device = this.zigbee.resolveEntity(endpoint.getDevice());
            const entity = `${device.name}/${endpoint.ID}`;
            const requiredClusters = [];
            const boundClusters = [];
            for (const bind of allBinds) {
                if (utils_1.default.isZHEndpoint(bind.target) ? bind.target === endpoint : bind.target.members.includes(endpoint)) {
                    requiredClusters.push(bind.cluster.name);
                }
            }
            for (const b of endpoint.binds) {
                if (b.target === coordinator && !requiredClusters.includes(b.cluster.name) && b.cluster.name in REPORT_CLUSTERS) {
                    boundClusters.push(b.cluster.name);
                }
            }
            for (const cluster of boundClusters) {
                try {
                    await endpoint.unbind(cluster, coordinator);
                    const items = [];
                    // biome-ignore lint/style/noNonNullAssertion: valid from loop (pushed to array only if in)
                    for (const item of REPORT_CLUSTERS[cluster]) {
                        if (!("condition" in item) || !item.condition || (await item.condition(endpoint))) {
                            const { attribute, minimumReportInterval, reportableChange } = item;
                            items.push({ attribute, minimumReportInterval, maximumReportInterval: 0xffff, reportableChange });
                        }
                    }
                    await endpoint.configureReporting(cluster, items);
                    logger_1.default.info(`Successfully disabled reporting for '${entity}' cluster '${cluster}'`);
                }
                catch (error) {
                    logger_1.default.warning(`Failed to disable reporting for '${entity}' cluster '${cluster}' (${error.message})`);
                }
            }
            this.eventBus.emitReconfigure({ device });
        }
    }
    async poll(data) {
        /**
         * This method poll bound endpoints and group members for state changes.
         *
         * A use case is e.g. a Hue Dimmer switch bound to a Hue bulb.
         * Hue bulbs only report their on/off state.
         * When dimming the bulb via the dimmer switch the state is therefore not reported.
         * When we receive a message from a Hue dimmer we read the brightness from the bulb (if bound).
         */
        const polls = POLL_ON_MESSAGE.filter((p) => p.cluster[data.cluster]?.some((c) => c.type === data.type && utils_1.default.equalsPartial(data.data, c.data)));
        if (polls.length) {
            const toPoll = new Set();
            // Add bound devices
            for (const endpoint of data.device.zh.endpoints) {
                for (const bind of endpoint.binds) {
                    if (utils_1.default.isZHEndpoint(bind.target) && bind.target.getDevice().type !== "Coordinator") {
                        toPoll.add(bind.target);
                    }
                }
            }
            if (data.groupID && data.groupID !== 0) {
                // If message is published to a group, add members of the group
                const group = this.zigbee.groupByID(data.groupID);
                if (group) {
                    for (const member of group.zh.members) {
                        toPoll.add(member);
                    }
                }
            }
            for (const endpoint of toPoll) {
                const device = endpoint.getDevice();
                for (const poll of polls) {
                    if (
                    // biome-ignore lint/style/noNonNullAssertion: manufacturerID/manufacturerName can be undefined and won't match `includes`, but TS enforces same-type
                    (!poll.manufacturerIDs.includes(device.manufacturerID) && !poll.manufacturerNames.includes(device.manufacturerName)) ||
                        !endpoint.supportsInputCluster(poll.read.cluster)) {
                        continue;
                    }
                    let readAttrs = poll.read.attributes;
                    if (poll.read.attributesForEndpoint) {
                        const attrsForEndpoint = await poll.read.attributesForEndpoint(endpoint);
                        readAttrs = [...poll.read.attributes, ...attrsForEndpoint];
                    }
                    const key = `${device.ieeeAddr}_${endpoint.ID}_${POLL_ON_MESSAGE.indexOf(poll)}`;
                    if (!this.pollDebouncers[key]) {
                        this.pollDebouncers[key] = (0, debounce_1.default)(async () => {
                            try {
                                await endpoint.read(poll.read.cluster, readAttrs);
                            }
                            catch (error) {
                                // biome-ignore lint/style/noNonNullAssertion: TODO: biome migration: ???
                                const resolvedDevice = this.zigbee.resolveEntity(device);
                                logger_1.default.error(`Failed to poll ${readAttrs} from ${resolvedDevice.name} (${error.message})`);
                            }
                        }, 1000);
                    }
                    this.pollDebouncers[key]();
                }
            }
        }
    }
}
exports.default = Bind;
__decorate([
    bind_decorator_1.default
], Bind.prototype, "onMQTTMessage", null);
__decorate([
    bind_decorator_1.default
], Bind.prototype, "onGroupMembersChanged", null);
__decorate([
    bind_decorator_1.default
], Bind.prototype, "poll", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vYmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUNqQyxvRUFBa0M7QUFDbEMsd0RBQWdDO0FBQ2hDLGtIQUE4RDtBQUM5RCxxREFBb0M7QUFHcEMsNkRBQXFDO0FBQ3JDLDJEQUFtQztBQUVuQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLHVEQUEyRDtBQUMzRCw0REFBb0M7QUFFcEMsTUFBTSxzQkFBc0IsR0FBMkI7SUFDbkQsV0FBVztJQUNYLFVBQVU7SUFDVixjQUFjO0lBQ2QsbUJBQW1CO0lBQ25CLHdCQUF3QjtJQUN4QixnQkFBZ0I7SUFDaEIsMEJBQTBCO0lBQzFCLDBCQUEwQjtJQUMxQixvQkFBb0I7SUFDcEIsZ0JBQWdCO0lBQ2hCLE9BQU87Q0FDVixDQUFDO0FBRUYsaUNBQWlDO0FBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSw2QkFBcUIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQztBQUN6RyxNQUFNLHFCQUFxQixHQUFHLEVBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsQ0FBQztBQUUzRyxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxRQUFxQixFQUEwRCxFQUFFO0lBQ2pILElBQUksUUFBUSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdEYsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxR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