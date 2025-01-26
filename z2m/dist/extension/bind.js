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
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const TOPIC_REGEX = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/device/(bind|unbind)`);
const ALL_CLUSTER_CANDIDATES = [
    'genScenes',
    'genOnOff',
    'genLevelCtrl',
    'lightingColorCtrl',
    'closuresWindowCovering',
    'hvacThermostat',
    'msIlluminanceMeasurement',
    'msTemperatureMeasurement',
    'msRelativeHumidity',
    'msSoilMoisture',
    'msCO2',
];
// See zigbee-herdsman-converters
const DEFAULT_BIND_GROUP = { type: 'group_number', ID: 901, name: 'default_bind_group' };
const DEFAULT_REPORT_CONFIG = { minimumReportInterval: 5, maximumReportInterval: 3600, reportableChange: 1 };
const getColorCapabilities = async (endpoint) => {
    if (endpoint.getClusterAttributeValue('lightingColorCtrl', 'colorCapabilities') == null) {
        await endpoint.read('lightingColorCtrl', ['colorCapabilities']);
    }
    const value = endpoint.getClusterAttributeValue('lightingColorCtrl', 'colorCapabilities');
    return {
        colorTemperature: (value & (1 << 4)) > 0,
        colorXY: (value & (1 << 3)) > 0,
    };
};
const REPORT_CLUSTERS = {
    genOnOff: [{ attribute: 'onOff', ...DEFAULT_REPORT_CONFIG, minimumReportInterval: 0, reportableChange: 0 }],
    genLevelCtrl: [{ attribute: 'currentLevel', ...DEFAULT_REPORT_CONFIG }],
    lightingColorCtrl: [
        {
            attribute: 'colorTemperature',
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorTemperature,
        },
        {
            attribute: 'currentX',
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorXY,
        },
        {
            attribute: 'currentY',
            ...DEFAULT_REPORT_CONFIG,
            condition: async (endpoint) => (await getColorCapabilities(endpoint)).colorXY,
        },
    ],
    closuresWindowCovering: [
        { attribute: 'currentPositionLiftPercentage', ...DEFAULT_REPORT_CONFIG },
        { attribute: 'currentPositionTiltPercentage', ...DEFAULT_REPORT_CONFIG },
    ],
};
const POLL_ON_MESSAGE = [
    {
        // On messages that have the cluster and type of below
        cluster: {
            manuSpecificPhilips: [
                { type: 'commandHueNotification', data: { button: 2 } },
                { type: 'commandHueNotification', data: { button: 3 } },
            ],
            genLevelCtrl: [
                { type: 'commandStep', data: {} },
                { type: 'commandStepWithOnOff', data: {} },
                { type: 'commandStop', data: {} },
                { type: 'commandMoveWithOnOff', data: {} },
                { type: 'commandStopWithOnOff', data: {} },
                { type: 'commandMove', data: {} },
                { type: 'commandMoveToLevelWithOnOff', data: {} },
            ],
            genScenes: [{ type: 'commandRecall', data: {} }],
        },
        // Read the following attributes
        read: { cluster: 'genLevelCtrl', attributes: ['currentLevel'] },
        // When the bound devices/members of group have the following manufacturerIDs
        manufacturerIDs: [
            zigbee_herdsman_1.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V,
            zigbee_herdsman_1.Zcl.ManufacturerCode.ATMEL,
            zigbee_herdsman_1.Zcl.ManufacturerCode.GLEDOPTO_CO_LTD,
            zigbee_herdsman_1.Zcl.ManufacturerCode.MUELLER_LICHT_INTERNATIONAL_INC,
            zigbee_herdsman_1.Zcl.ManufacturerCode.TELINK_MICRO,
            zigbee_herdsman_1.Zcl.ManufacturerCode.BUSCH_JAEGER_ELEKTRO,
        ],
        manufacturerNames: ['GLEDOPTO', 'Trust International B.V.\u0000'],
    },
    {
        cluster: {
            genLevelCtrl: [
                { type: 'commandStepWithOnOff', data: {} },
                { type: 'commandMoveWithOnOff', data: {} },
                { type: 'commandStopWithOnOff', data: {} },
                { type: 'commandMoveToLevelWithOnOff', data: {} },
            ],
            genOnOff: [
                { type: 'commandOn', data: {} },
                { type: 'commandOff', data: {} },
                { type: 'commandOffWithEffect', data: {} },
                { type: 'commandToggle', data: {} },
            ],
            genScenes: [{ type: 'commandRecall', data: {} }],
            manuSpecificPhilips: [
                { type: 'commandHueNotification', data: { button: 1 } },
                { type: 'commandHueNotification', data: { button: 4 } },
            ],
        },
        read: { cluster: 'genOnOff', attributes: ['onOff'] },
        manufacturerIDs: [
            zigbee_herdsman_1.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V,
            zigbee_herdsman_1.Zcl.ManufacturerCode.ATMEL,
            zigbee_herdsman_1.Zcl.ManufacturerCode.GLEDOPTO_CO_LTD,
            zigbee_herdsman_1.Zcl.ManufacturerCode.MUELLER_LICHT_INTERNATIONAL_INC,
            zigbee_herdsman_1.Zcl.ManufacturerCode.TELINK_MICRO,
            zigbee_herdsman_1.Zcl.ManufacturerCode.BUSCH_JAEGER_ELEKTRO,
        ],
        manufacturerNames: ['GLEDOPTO', 'Trust International B.V.\u0000'],
    },
    {
        cluster: {
            genScenes: [{ type: 'commandRecall', data: {} }],
        },
        read: {
            cluster: 'lightingColorCtrl',
            attributes: [],
            // Since not all devices support the same attributes they need to be calculated dynamically
            // depending on the capabilities of the endpoint.
            attributesForEndpoint: async (endpoint) => {
                const supportedAttrs = await getColorCapabilities(endpoint);
                const readAttrs = [];
                if (supportedAttrs.colorXY) {
                    readAttrs.push('currentX', 'currentY');
                }
                if (supportedAttrs.colorTemperature) {
                    readAttrs.push('colorTemperature');
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
        manufacturerNames: ['GLEDOPTO', 'Trust International B.V.\u0000'],
    },
];
class Bind extends extension_1.default {
    pollDebouncers = {};
    async start() {
        this.eventBus.onDeviceMessage(this, this.poll);
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        this.eventBus.onGroupMembersChanged(this, this.onGroupMembersChanged);
    }
    parseMQTTMessage(data) {
        if (data.topic.match(TOPIC_REGEX)) {
            const type = data.topic.endsWith('unbind') ? 'unbind' : 'bind';
            let skipDisableReporting = false;
            const message = JSON.parse(data.message);
            if (typeof message !== 'object' || message.from == undefined || message.to == undefined) {
                return [message, { type, skipDisableReporting }, `Invalid payload`];
            }
            const sourceKey = message.from;
            const sourceEndpointKey = message.from_endpoint ?? 'default';
            const targetKey = message.to;
            const targetEndpointKey = message.to_endpoint;
            const clusters = message.clusters;
            skipDisableReporting = message.skip_disable_reporting != undefined ? message.skip_disable_reporting : false;
            const resolvedSource = this.zigbee.resolveEntity(message.from);
            if (!resolvedSource || !(resolvedSource instanceof device_1.default)) {
                return [message, { type, skipDisableReporting }, `Source device '${message.from}' does not exist`];
            }
            const resolvedTarget = message.to === DEFAULT_BIND_GROUP.name ? DEFAULT_BIND_GROUP : this.zigbee.resolveEntity(message.to);
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
        const { type, sourceKey, sourceEndpointKey, targetKey, targetEndpointKey, clusters, skipDisableReporting, resolvedSource, resolvedTarget, resolvedSourceEndpoint, resolvedBindTarget, } = parsed;
        (0, node_assert_1.default)(resolvedSource, '`resolvedSource` is missing');
        (0, node_assert_1.default)(resolvedTarget, '`resolvedTarget` is missing');
        (0, node_assert_1.default)(resolvedSourceEndpoint, '`resolvedSourceEndpoint` is missing');
        (0, node_assert_1.default)(resolvedBindTarget != undefined, '`resolvedBindTarget` is missing');
        const successfulClusters = [];
        const failedClusters = [];
        const attemptedClusters = [];
        // Find which clusters are supported by both the source and target.
        // Groups are assumed to support all clusters.
        const clusterCandidates = clusters ?? ALL_CLUSTER_CANDIDATES;
        for (const cluster of clusterCandidates) {
            let matchingClusters = false;
            const anyClusterValid = utils_1.default.isZHGroup(resolvedBindTarget) ||
                typeof resolvedBindTarget === 'number' ||
                (resolvedTarget instanceof device_1.default && resolvedTarget.zh.type === 'Coordinator');
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
                    if (type === 'bind') {
                        await resolvedSourceEndpoint.bind(cluster, resolvedBindTarget);
                    }
                    else {
                        await resolvedSourceEndpoint.unbind(cluster, resolvedBindTarget);
                    }
                    successfulClusters.push(cluster);
                    logger_1.default.info(`Successfully ${type === 'bind' ? 'bound' : 'unbound'} cluster '${cluster}' from '${resolvedSource.name}' to '${resolvedTarget.name}'`);
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
        else if (failedClusters.length === attemptedClusters.length) {
            await this.publishResponse(parsed.type, raw, {}, `Failed to ${type}`);
            return;
        }
        const responseData = {
            from: sourceKey, // valid with assert above on `resolvedSource`
            from_endpoint: sourceEndpointKey, // valid with assert above on `resolvedSourceEndpoint`
            to: targetKey, // valid with assert above on `resolvedTarget`
            to_endpoint: targetEndpointKey,
            clusters: successfulClusters,
            failed: failedClusters,
        };
        if (successfulClusters.length !== 0) {
            if (type === 'bind') {
                await this.setupReporting(resolvedSourceEndpoint.binds.filter((b) => successfulClusters.includes(b.cluster.name) && b.target === resolvedBindTarget));
            }
            else if (typeof resolvedBindTarget !== 'number' && !skipDisableReporting) {
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
        if (data.action === 'add') {
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
                    const entity = `${this.zigbee.resolveEntity(endpoint.getDevice()).name}/${endpoint.ID}`;
                    try {
                        await endpoint.bind(bind.cluster.name, coordinatorEndpoint);
                        const items = [];
                        for (const c of REPORT_CLUSTERS[bind.cluster.name]) {
                            if (!c.condition || (await c.condition(endpoint))) {
                                const i = { ...c };
                                delete i.condition;
                                items.push(i);
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
                    for (const item of REPORT_CLUSTERS[cluster]) {
                        if (!item.condition || (await item.condition(endpoint))) {
                            const i = { ...item };
                            delete i.condition;
                            items.push({ ...i, maximumReportInterval: 0xffff });
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
                    if (utils_1.default.isZHEndpoint(bind.target) && bind.target.getDevice().type !== 'Coordinator') {
                        toPoll.add(bind.target);
                    }
                }
            }
            // If message is published to a group, add members of the group
            const group = data.groupID && data.groupID !== 0 && this.zigbee.groupByID(data.groupID);
            if (group) {
                for (const member of group.zh.members) {
                    toPoll.add(member);
                }
            }
            for (const endpoint of toPoll) {
                const device = endpoint.getDevice();
                for (const poll of polls) {
                    // XXX: manufacturerID/manufacturerName can be undefined and won't match `includes`, but TS enforces same-type
                    if ((!poll.manufacturerIDs.includes(device.manufacturerID) && !poll.manufacturerNames.includes(device.manufacturerName)) ||
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
                                logger_1.default.error(`Failed to poll ${readAttrs} from ${this.zigbee.resolveEntity(device).name} (${error.message})`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vYmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLDhEQUFpQztBQUVqQyxvRUFBa0M7QUFDbEMsd0RBQWdDO0FBQ2hDLGtIQUE4RDtBQUU5RCxxREFBb0M7QUFHcEMsNkRBQXFDO0FBQ3JDLDJEQUFtQztBQUNuQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLDBEQUFrQztBQUNsQyw0REFBb0M7QUFFcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsc0NBQXNDLENBQUMsQ0FBQztBQUN6RyxNQUFNLHNCQUFzQixHQUEyQjtJQUNuRCxXQUFXO0lBQ1gsVUFBVTtJQUNWLGNBQWM7SUFDZCxtQkFBbUI7SUFDbkIsd0JBQXdCO0lBQ3hCLGdCQUFnQjtJQUNoQiwwQkFBMEI7SUFDMUIsMEJBQTBCO0lBQzFCLG9CQUFvQjtJQUNwQixnQkFBZ0I7SUFDaEIsT0FBTztDQUNWLENBQUM7QUFFRixpQ0FBaUM7QUFDakMsTUFBTSxrQkFBa0IsR0FBRyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQztBQUN2RixNQUFNLHFCQUFxQixHQUFHLEVBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsQ0FBQztBQUUzRyxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxRQUFxQixFQUEwRCxFQUFFO0lBQ2pILElBQUksUUFBUSxDQUFDLHdCQUF3QixDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdEYs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