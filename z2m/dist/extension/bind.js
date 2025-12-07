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
    #topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/device/(bind|unbind|binds/clear)`);
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
        if (data.topic.endsWith("binds/clear")) {
            const message = JSON.parse(data.message);
            if (typeof message !== "object" || typeof message.target !== "string") {
                await this.publishResponse("binds/clear", message, {}, "Invalid payload");
                return;
            }
            const target = this.zigbee.resolveEntity(message.target);
            if (!(target instanceof device_1.default)) {
                await this.publishResponse("binds/clear", message, {}, "Invalid target");
                return;
            }
            // this list is raw (not resolved) to allow clearing any specific target (not only currently known)
            const eui64List = message.ieee_list ?? ["0xffffffffffffffff"];
            await target.zh.clearAllBindings(eui64List);
            const responseData = {
                target: message.target,
                ieee_list: eui64List,
            };
            await this.publishResponse("binds/clear", message, responseData);
            this.eventBus.emitDevicesChanged();
            return;
        }
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
                allBinds.push(...endpoint.binds);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vYmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUNqQyxvRUFBa0M7QUFDbEMsd0RBQWdDO0FBQ2hDLGtIQUE4RDtBQUM5RCxxREFBb0M7QUFHcEMsNkRBQXFDO0FBQ3JDLDJEQUFtQztBQUVuQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLHVEQUEyRDtBQUMzRCw0REFBb0M7QUFFcEMsTUFBTSxzQkFBc0IsR0FBMkI7SUFDbkQsV0FBVztJQUNYLFVBQVU7SUFDVixjQUFjO0lBQ2QsbUJBQW1CO0lBQ25CLHdCQUF3QjtJQUN4QixnQkFBZ0I7SUFDaEIsMEJBQTBCO0lBQzFCLDBCQUEwQjtJQUMxQixvQkFBb0I7SUFDcEIsZ0JBQWdCO0lBQ2hCLE9BQU87Q0FDVixDQUFDO0FBRUYsaUNBQWlDO0FBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSw2QkFBcUIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQztBQUN6RyxNQUFNLHFCQUFxQixHQUFHLEVBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsQ0FBQztBQUUzRyxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxRQUFxQixFQUEwRCxFQUFFO0lBQ2pILElBQUksUUFBUSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdEYsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLEVBQUUsbUJBQW1CLENBQVcsQ0FBQztJQUVwRyxPQUFPO1FBQ0gsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3hDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7S0FDbEMsQ0FBQztBQUNOLENBQUMsQ0FBQztBQUVGLE1BQU0sZUFBZSxHQUFHO0lBQ3BCLFFBQVEsRUFBRSxDQUFDLEVBQUMsU0FBUyxFQUFFLE9BQWdCLEVBQUUsR0FBRyxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFDLENBQUM7SUFDbEgsWUFBWSxFQUFFLENBQUMsRUFBQyxTQUFTLEVBQUUsY0FBdUIsRUFBRSxHQUFHLHFCQUFxQixFQUFDLENBQUM7SUFDOUUsaUJBQWlCLEVBQUU7UUFDZjtZQUNJLFNBQVMsRUFBRSxrQkFBMkI7WUFDdEMsR0FBRyxxQkFBcUI7WUFDeEIsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFxQixFQUFvQixFQUFFLENBQUMsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO1NBQ3hIO1FBQ0Q7WUFDSSxTQUFTLEVBQUUsVUFBbUI7WUFDOUIsR0FBRyxxQkFBcUI7WUFDeEIsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFxQixFQUFvQixFQUFFLENBQUMsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTztTQUMvRztRQUNEO1lBQ0ksU0FBUyxFQUFFLFVBQW1CO1lBQzlCLEdBQUcscUJBQXFCO1lBQ3hCLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBcUIsRUFBb0IsRUFBRSxDQUFDLENBQUMsTUFBTSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU87U0FDL0c7S0FDSjtJQUNELHNCQUFzQixFQUFFO1FBQ3BCLEVBQUMsU0FBUyxFQUFFLCtCQUF3QyxFQUFFLEdBQUcscUJBQXFCLEVBQUM7UUFDL0UsRUFBQyxTQUFTLEVBQUUsK0JBQXdDLEVBQUUsR0FBRyxxQkFBcUIsRUFBQztLQUNsRjtDQUNKLENBQUM7QUFFRixNQUFNLGVBQWUsR0FBRztJQUNwQjtRQUNJLHNEQUFzRDtRQUN0RCxPQUFPLEVBQUU7WUFDTCxtQkFBbUIsRUFBRTtnQkFDakIsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxFQUFDO2dCQUNuRCxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDLEVBQUM7YUFDdEQ7WUFDRCxZQUFZLEVBQUU7Z0JBQ1YsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7Z0JBQy9CLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7Z0JBQ3hDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO2dCQUMvQixFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO2dCQUN4QyxFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO2dCQUN4QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztnQkFDL0IsRUFBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQzthQUNsRDtZQUNELFNBQVMsRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7U0FDakQ7UUFDRCxnQ0FBZ0M7UUFDaEMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLGNBQXVCLEVBQUUsVUFBVSxFQUFFLENBQUMsY0FBYyxDQUEwQyxFQUFDO1FBQy9HLDZFQUE2RTtRQUM3RSxlQUFlLEVBQUU7WUFDYixxQkFBRyxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QjtZQUM1QyxxQkFBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUs7WUFDMUIscUJBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlO1lBQ3BDLHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsK0JBQStCO1lBQ3BELHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtZQUNqQyxxQkFBRyxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQjtTQUM1QztRQUNELGlCQUFpQixFQUFFLENBQUMsVUFBVSxFQUFFLGdDQUFnQyxDQUFDO0tBQ3BFO0lBQ0Q7UUFDSSxPQUFPLEVBQUU7WUFDTCxZQUFZLEVBQUU7Z0JBQ1YsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztnQkFDeEMsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztnQkFDeEMsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztnQkFDeEMsRUFBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQzthQUNsRDtZQUNELFFBQVEsRUFBRTtnQkFDTixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztnQkFDN0IsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7Z0JBQ3hDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO2FBQ3BDO1lBQ0QsU0FBUyxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQztZQUM5QyxtQkFBbUIsRUFBRTtnQkFDakIsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxFQUFDO2dCQUNuRCxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDLEVBQUM7YUFDdEQ7U0FDSjtRQUNELElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxVQUFtQixFQUFFLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBc0MsRUFBQztRQUNoRyxlQUFlLEVBQUU7WUFDYixxQkFBRyxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QjtZQUM1QyxxQkFBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUs7WUFDMUIscUJBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlO1lBQ3BDLHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsK0JBQStCO1lBQ3BELHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtZQUNqQyxxQkFBRyxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQjtTQUM1QztRQUNELGlCQUFpQixFQUFFLENBQUMsVUFBVSxFQUFFLGdDQUFnQyxDQUFDO0tBQ3BFO0lBQ0Q7UUFDSSxPQUFPLEVBQUU7WUFDTCxTQUFTLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO1NBQ2pEO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsT0FBTyxFQUFFLG1CQUE0QjtZQUNyQyxVQUFVLEVBQUUsRUFBZ0Q7WUFDNUQsMkZBQTJGO1lBQzNGLGlEQUFpRDtZQUNqRCxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsUUFBcUIsRUFBdUQsRUFBRTtnQkFDeEcsTUFBTSxjQUFjLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxTQUFTLEdBQStDLEVBQUUsQ0FBQztnQkFFakUsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDO2dCQUVELElBQUksY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ2xDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztnQkFFRCxPQUFPLFNBQVMsQ0FBQztZQUNyQixDQUFDO1NBQ0o7UUFDRCxlQUFlLEVBQUU7WUFDYixxQkFBRyxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QjtZQUM1QyxxQkFBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUs7WUFDMUIscUJBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlO1lBQ3BDLHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsK0JBQStCO1lBQ3BELHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtZQUNqQywyR0FBMkc7U0FDOUc7UUFDRCxpQkFBaUIsRUFBRSxDQUFDLFVBQVUsRUFBRSxnQ0FBZ0MsQ0FBQztLQUNwRTtDQUNKLENBQUM7QUFnQkYsTUFBcUIsSUFBSyxTQUFRLG1CQUFTO0lBQ3ZDLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxrREFBa0QsQ0FBQyxDQUFDO0lBQ3ZHLGNBQWMsR0FBOEIsRUFBRSxDQUFDO0lBRXZELDZDQUE2QztJQUNwQyxLQUFLLENBQUMsS0FBSztRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLGdCQUFnQixDQUNwQixJQUEyQjtRQUUzQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMvRCxJQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQWlELENBQUM7WUFFekYsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDNUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDL0IsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsYUFBYSxJQUFJLFNBQVMsQ0FBQztZQUM3RCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ2xDLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3ZHLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQVcsQ0FBQztZQUV6RSxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxjQUFjLFlBQVksZ0JBQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsRUFBRSxrQkFBa0IsT0FBTyxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQztZQUNyRyxDQUFDO1lBRUQsTUFBTSxjQUFjLEdBQ2hCLE9BQU8sQ0FBQyxFQUFFLEtBQUssa0JBQWtCLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssa0JBQWtCLENBQUMsRUFBRTtnQkFDMUUsQ0FBQyxDQUFDLGtCQUFrQjtnQkFDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsRUFBRSwyQkFBMkIsT0FBTyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUM1RyxDQUFDO1lBRUQsTUFBTSxzQkFBc0IsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFMUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQzFCLE9BQU87b0JBQ0gsT0FBTztvQkFDUCxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBQztvQkFDNUIsa0JBQWtCLGNBQWMsQ0FBQyxJQUFJLDZCQUE2QixpQkFBaUIsR0FBRztpQkFDekYsQ0FBQztZQUNOLENBQUM7WUFFRCxzR0FBc0c7WUFDdEcsTUFBTSxrQkFBa0IsR0FDcEIsY0FBYyxZQUFZLGdCQUFNO2dCQUM1QixDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLGNBQWMsWUFBWSxlQUFLO29CQUMvQixDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQ25CLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLElBQUksY0FBYyxZQUFZLGdCQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxRCxPQUFPO29CQUNILE9BQU87b0JBQ1AsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7b0JBQzVCLGtCQUFrQixjQUFjLENBQUMsSUFBSSw2QkFBNkIsaUJBQWlCLEdBQUc7aUJBQ3pGLENBQUM7WUFDTixDQUFDO1lBRUQsT0FBTztnQkFDSCxPQUFPO2dCQUNQO29CQUNJLElBQUk7b0JBQ0osU0FBUztvQkFDVCxpQkFBaUI7b0JBQ2pCLFNBQVM7b0JBQ1QsaUJBQWlCO29CQUNqQixRQUFRO29CQUNSLG9CQUFvQjtvQkFDcEIsY0FBYztvQkFDZCxjQUFjO29CQUNkLHNCQUFzQjtvQkFDdEIsa0JBQWtCO2lCQUNyQjtnQkFDRCxTQUFTO2FBQ1osQ0FBQztRQUNOLENBQUM7UUFFRCxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRW1CLEFBQU4sS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUEyQjtRQUN6RCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7WUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUF3RCxDQUFDO1lBRWhHLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDcEUsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQzFFLE9BQU87WUFDWCxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxnQkFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3pFLE9BQU87WUFDWCxDQUFDO1lBRUQsbUdBQW1HO1lBQ25HLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTlELE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU1QyxNQUFNLFlBQVksR0FBeUQ7Z0JBQ3ZFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtnQkFDdEIsU0FBUyxFQUFFLFNBQVM7YUFDdkIsQ0FBQztZQUVGLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNuQyxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTztRQUNYLENBQUM7UUFFRCxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1IsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RCxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sRUFDRixJQUFJLEVBQ0osU0FBUyxFQUNULGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLFFBQVEsRUFDUixvQkFBb0IsRUFDcEIsY0FBYyxFQUNkLGNBQWMsRUFDZCxzQkFBc0IsRUFDdEIsa0JBQWtCLEdBQ3JCLEdBQUcsTUFBTSxDQUFDO1FBRVgsSUFBQSxxQkFBTSxFQUFDLGNBQWMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3RELElBQUEscUJBQU0sRUFBQyxjQUFjLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUN0RCxJQUFBLHFCQUFNLEVBQUMsc0JBQXNCLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUN0RSxJQUFBLHFCQUFNLEVBQUMsa0JBQWtCLEtBQUssU0FBUyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFFNUUsTUFBTSxrQkFBa0IsR0FBYSxFQUFFLENBQUM7UUFDeEMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQzFCLE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQzdCLG1FQUFtRTtRQUNuRSw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLElBQUksc0JBQXNCLENBQUM7UUFFN0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RDLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBRTdCLE1BQU0sZUFBZSxHQUNqQixlQUFLLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO2dCQUNuQyxPQUFPLGtCQUFrQixLQUFLLFFBQVE7Z0JBQ3RDLENBQUMsY0FBYyxZQUFZLGdCQUFNLElBQUksY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLENBQUM7WUFFbkYsSUFBSSxDQUFDLGVBQWUsSUFBSSxlQUFLLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztnQkFDN0QsZ0JBQWdCO29CQUNaLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksc0JBQXNCLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzNHLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksa0JBQWtCLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwSCxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksc0JBQXNCLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbEksSUFBSSxXQUFXLElBQUksQ0FBQyxlQUFlLElBQUksZ0JBQWdCLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksZ0JBQWdCLE9BQU8sV0FBVyxjQUFjLENBQUMsSUFBSSxTQUFTLGNBQWMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRWhDLElBQUksQ0FBQztvQkFDRCxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQzt3QkFDbEIsTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7b0JBQ25FLENBQUM7eUJBQU0sQ0FBQzt3QkFDSixNQUFNLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDckUsQ0FBQztvQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2pDLGdCQUFNLENBQUMsSUFBSSxDQUNQLGdCQUFnQixJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsYUFBYSxPQUFPLFdBQVcsY0FBYyxDQUFDLElBQUksU0FBUyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQ3pJLENBQUM7Z0JBQ04sQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNiLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdCLGdCQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxhQUFhLE9BQU8sV0FBVyxjQUFjLENBQUMsSUFBSSxTQUFTLGNBQWMsQ0FBQyxJQUFJLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDaEksQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDakMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLFVBQVUsY0FBYyxDQUFDLElBQUksU0FBUyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUM3RixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN2RSxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0RSxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFvRztZQUNsSCwwRkFBMEY7WUFDMUYsSUFBSSxFQUFFLFNBQVU7WUFDaEIsa0dBQWtHO1lBQ2xHLGFBQWEsRUFBRSxpQkFBa0I7WUFDakMsMEZBQTBGO1lBQzFGLEVBQUUsRUFBRSxTQUFVO1lBQ2QsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLE1BQU0sRUFBRSxjQUFjO1NBQ3pCLENBQUM7UUFFRixJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNsQyxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUNyQixzQkFBc0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLGtCQUFrQixDQUFDLENBQzdILENBQUM7WUFDTixDQUFDO2lCQUFNLElBQUksT0FBTyxrQkFBa0IsS0FBSyxRQUFRLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN6RSxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRU8sS0FBSyxDQUFDLGVBQWUsQ0FDekIsSUFBK0MsRUFDL0MsT0FBaUIsRUFDakIsSUFBdUIsRUFDdkIsS0FBYztRQUVkLE1BQU0sUUFBUSxHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsRUFBRSxJQUFBLCtDQUFTLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUUvRSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1IsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsQ0FBQztJQUNMLENBQUM7SUFFVyxBQUFOLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFtQztRQUNqRSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDeEIsTUFBTSxZQUFZLEdBQWMsRUFBRSxDQUFDO1lBRW5DLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBSyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQztnQkFDM0UsS0FBSyxNQUFNLFFBQVEsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUN6QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQ2hDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzVCLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxDQUFDO2FBQU0sQ0FBQztZQUNKLCtCQUErQjtZQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzdCLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCwwQkFBMEIsQ0FBQyxJQUFhLEVBQUUsYUFBMEI7UUFDaEUsTUFBTSxTQUFTLEdBQUcsZUFBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUV4RixPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV4RyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDMUIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxDQUFDO1lBRXhHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFnQjtRQUNqQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUVuRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3ZDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7b0JBQ2hGLHlFQUF5RTtvQkFDekUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFFLENBQUM7b0JBQ3hFLE1BQU0sTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBRXZELElBQUksQ0FBQzt3QkFDRCxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFFNUQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO3dCQUVqQixvRUFBb0U7d0JBQ3BFLEtBQUssTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBb0MsQ0FBRSxFQUFFLENBQUM7NEJBQ2xGLElBQUksQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO2dDQUN2RSxNQUFNLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLGdCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUV0RixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQzs0QkFDNUYsQ0FBQzt3QkFDTCxDQUFDO3dCQUVELE1BQU0sUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBb0MsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDNUYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMscUNBQXFDLE1BQU0sY0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7b0JBQy9GLENBQUM7b0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzt3QkFDYixnQkFBTSxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsTUFBTSxjQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFPLEtBQWUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUM3SCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsS0FBSyxDQUFDLDRCQUE0QixDQUFDLE1BQThCO1FBQzdELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUMzRCxNQUFNLFNBQVMsR0FBRyxlQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3pFLE1BQU0sUUFBUSxHQUFjLEVBQUUsQ0FBQztRQUUvQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQUssQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7WUFDM0UsS0FBSyxNQUFNLFFBQVEsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDO1FBRUQsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQVcsQ0FBQztZQUN6RSxNQUFNLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLE1BQU0sZ0JBQWdCLEdBQWEsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUVuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUMxQixJQUFJLGVBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQ3RHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0wsQ0FBQztZQUVELEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQzlHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNMLENBQUM7WUFFRCxLQUFLLE1BQU0sT0FBTyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLENBQUM7b0JBQ0QsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFFNUMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUVqQiwyRkFBMkY7b0JBQzNGLEtBQUssTUFBTSxJQUFJLElBQUksZUFBZSxDQUFDLE9BQXVDLENBQUUsRUFBRSxDQUFDO3dCQUMzRSxJQUFJLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs0QkFDaEYsTUFBTSxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxnQkFBZ0IsRUFBQyxHQUFHLElBQUksQ0FBQzs0QkFFbEUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO3dCQUNwRyxDQUFDO29CQUNMLENBQUM7b0JBRUQsTUFBTSxRQUFRLENBQUMsa0JBQWtCLENBQUMsT0FBdUMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbEYsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLE1BQU0sY0FBYyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2IsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLE1BQU0sY0FBYyxPQUFPLE1BQU8sS0FBZSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ3JILENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDTCxDQUFDO0lBRVcsQUFBTixLQUFLLENBQUMsSUFBSSxDQUFDLElBQTZCO1FBQzFDOzs7Ozs7O1dBT0c7UUFDSCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBc0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLGVBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdEksQ0FBQztRQUVGLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztZQUV0QyxvQkFBb0I7WUFDcEIsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUMsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hDLElBQUksZUFBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFFLENBQUM7d0JBQ3BGLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLCtEQUErRDtnQkFDL0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNSLEtBQUssTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdkIsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUVELEtBQUssTUFBTSxRQUFRLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQzVCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDdkI7b0JBQ0kscUpBQXFKO29CQUNySixDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGNBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLENBQUMsQ0FBQzt3QkFDdEgsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFDbkQsQ0FBQzt3QkFDQyxTQUFTO29CQUNiLENBQUM7b0JBRUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBRXJDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO3dCQUNsQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDekUsU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUM7b0JBQy9ELENBQUM7b0JBRUQsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxFQUFFLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUVqRixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUEsa0JBQVEsRUFBQyxLQUFLLElBQUksRUFBRTs0QkFDM0MsSUFBSSxDQUFDO2dDQUNELE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDdEQsQ0FBQzs0QkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dDQUNiLHlFQUF5RTtnQ0FDekUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFFLENBQUM7Z0NBQzFELGdCQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixTQUFTLFNBQVMsY0FBYyxDQUFDLElBQUksS0FBTSxLQUFlLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs0QkFDMUcsQ0FBQzt3QkFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ2IsQ0FBQztvQkFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXhjRCx1QkF3Y0M7QUE1V3VCO0lBQW5CLHdCQUFJO3lDQTZJSjtBQWdCVztJQUFYLHdCQUFJO2lEQXFCSjtBQWlIVztJQUFYLHdCQUFJO2dDQXdFSiJ9