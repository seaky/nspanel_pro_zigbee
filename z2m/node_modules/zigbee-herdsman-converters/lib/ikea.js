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
exports.legacy = exports.manufacturerOptions = void 0;
exports.ikeaLight = ikeaLight;
exports.ikeaOta = ikeaOta;
exports.ikeaBattery = ikeaBattery;
exports.ikeaConfigureStyrbar = ikeaConfigureStyrbar;
exports.ikeaConfigureRemote = ikeaConfigureRemote;
exports.ikeaAirPurifier = ikeaAirPurifier;
exports.ikeaVoc = ikeaVoc;
exports.ikeaConfigureGenPollCtrl = ikeaConfigureGenPollCtrl;
exports.tradfriOccupancy = tradfriOccupancy;
exports.tradfriRequestedBrightness = tradfriRequestedBrightness;
exports.tradfriCommandsOnOff = tradfriCommandsOnOff;
exports.tradfriCommandsLevelCtrl = tradfriCommandsLevelCtrl;
exports.styrbarCommandOn = styrbarCommandOn;
exports.ikeaDotsClick = ikeaDotsClick;
exports.ikeaArrowClick = ikeaArrowClick;
exports.ikeaMediaCommands = ikeaMediaCommands;
exports.addCustomClusterManuSpecificIkeaAirPurifier = addCustomClusterManuSpecificIkeaAirPurifier;
exports.addCustomClusterManuSpecificIkeaVocIndexMeasurement = addCustomClusterManuSpecificIkeaVocIndexMeasurement;
exports.addCustomClusterManuSpecificIkeaUnknown = addCustomClusterManuSpecificIkeaUnknown;
const semver = __importStar(require("semver"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const constants = __importStar(require("../lib/constants"));
const exposes_1 = require("../lib/exposes");
const modernExtend_1 = require("../lib/modernExtend");
const ota_1 = require("../lib/ota");
const reporting = __importStar(require("../lib/reporting"));
const globalStore = __importStar(require("../lib/store"));
const utils_1 = require("../lib/utils");
exports.manufacturerOptions = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.IKEA_OF_SWEDEN };
const bulbOnEvent = async (type, data, device, options, state) => {
    /**
     * IKEA bulbs lose their configured reportings when losing power.
     * A deviceAnnounce indicates they are powered on again.
     * Reconfigure the configured reoprting here.
     *
     * Additionally some other information is lost like
     *   color_options.execute_if_off. We also restore these.
     *
     * NOTE: binds are not lost so rebinding is not needed!
     */
    if (type === 'deviceAnnounce') {
        for (const endpoint of device.endpoints) {
            for (const c of endpoint.configuredReportings) {
                await endpoint.configureReporting(c.cluster.name, [
                    {
                        attribute: c.attribute.name,
                        minimumReportInterval: c.minimumReportInterval,
                        maximumReportInterval: c.maximumReportInterval,
                        reportableChange: c.reportableChange,
                    },
                ]);
            }
        }
        // NOTE: execute_if_off default is false
        //       we only restore if true, to save unneeded network writes
        const colorOptions = state.color_options;
        if (colorOptions?.execute_if_off === true) {
            await device.endpoints[0].write('lightingColorCtrl', { options: 1 });
        }
        const levelConfig = state.level_config;
        if (levelConfig?.execute_if_off === true) {
            await device.endpoints[0].write('genLevelCtrl', { options: 1 });
        }
        if (levelConfig?.on_level !== undefined) {
            const onLevelRaw = levelConfig.on_level;
            let onLevel;
            if (typeof onLevelRaw === 'string' && onLevelRaw.toLowerCase() == 'previous') {
                onLevel = 255;
            }
            else {
                onLevel = Number(onLevelRaw);
            }
            if (onLevel > 255)
                onLevel = 254;
            if (onLevel < 1)
                onLevel = 1;
            await device.endpoints[0].write('genLevelCtrl', { onLevel: onLevel });
        }
    }
};
function ikeaLight(args) {
    const colorTemp = args?.colorTemp ? (args.colorTemp === true ? { range: [250, 454] } : args.colorTemp) : undefined;
    const levelConfig = args?.levelConfig
        ? args.levelConfig
        : { disabledFeatures: ['on_off_transition_time', 'on_transition_time', 'off_transition_time', 'on_level'] };
    const result = (0, modernExtend_1.light)({ ...args, colorTemp, levelConfig });
    result.ota = ota_1.tradfri;
    result.onEvent = bulbOnEvent;
    if ((0, utils_1.isObject)(args?.colorTemp) && args.colorTemp.viaColor) {
        result.toZigbee = (0, utils_1.replaceToZigbeeConvertersInArray)(result.toZigbee, [toZigbee_1.default.light_color_colortemp], [toZigbee_1.default.light_color_and_colortemp_via_color]);
    }
    if (args?.colorTemp || args?.color) {
        result.exposes.push(exposes_1.presets.light_color_options());
    }
    // Never use a transition when transitioning to OFF as this turns on the light when sending OFF twice
    // when the bulb has firmware > 1.0.012.
    // https://github.com/Koenkk/zigbee2mqtt/issues/19211
    // https://github.com/Koenkk/zigbee2mqtt/issues/22030#issuecomment-2292063140
    // Some old softwareBuildID are not a valid semver, e.g. `1.1.1.0-5.7.2.0`
    // https://github.com/Koenkk/zigbee2mqtt/issues/23863
    result.meta = {
        ...result.meta,
        noOffTransitionWhenOff: (entity) => {
            const softwareBuildID = entity.getDevice().softwareBuildID;
            return softwareBuildID && !softwareBuildID.includes('-') && semver.gt(softwareBuildID ?? '0.0.0', '1.0.021', true);
        },
    };
    return result;
}
function ikeaOta() {
    return (0, modernExtend_1.ota)(ota_1.tradfri);
}
function ikeaBattery() {
    const exposes = [
        exposes_1.presets
            .numeric('battery', exposes_1.access.STATE_GET)
            .withUnit('%')
            .withDescription('Remaining battery in %')
            .withValueMin(0)
            .withValueMax(100)
            .withCategory('diagnostic'),
    ];
    const fromZigbee = [
        {
            cluster: 'genPowerCfg',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const payload = {};
                if (msg.data.batteryPercentageRemaining !== undefined && msg.data['batteryPercentageRemaining'] < 255) {
                    // Some devices do not comply to the ZCL and report a
                    // batteryPercentageRemaining of 100 when the battery is full (should be 200).
                    let dividePercentage = true;
                    if (model.model === 'E2103') {
                        if (semver.lt(meta.device.softwareBuildID, '24.4.13', true)) {
                            dividePercentage = false;
                        }
                    }
                    else {
                        // IKEA corrected this on newer remote fw version, but many people are still
                        // 2.2.010 which is the last version supporting group bindings. We try to be
                        // smart and pick the correct one for IKEA remotes.
                        // If softwareBuildID is below 2.4.0 it should not be divided
                        if (semver.lt(meta.device.softwareBuildID, '2.4.0', true)) {
                            dividePercentage = false;
                        }
                    }
                    let percentage = msg.data['batteryPercentageRemaining'];
                    percentage = dividePercentage ? percentage / 2 : percentage;
                    payload.battery = (0, utils_1.precisionRound)(percentage, 2);
                }
                return payload;
            },
        },
    ];
    const toZigbee = [
        {
            key: ['battery'],
            convertGet: async (entity, key, meta) => {
                await entity.read('genPowerCfg', ['batteryPercentageRemaining']);
            },
        },
    ];
    const defaultReporting = { min: '1_HOUR', max: 'MAX', change: 10 };
    const configure = [
        (0, modernExtend_1.setupConfigureForReporting)('genPowerCfg', 'batteryPercentageRemaining', defaultReporting, exposes_1.access.STATE_GET),
        (0, utils_1.configureSetPowerSourceWhenUnknown)('Battery'),
    ];
    return { exposes, fromZigbee, toZigbee, configure, isModernExtend: true };
}
function ikeaConfigureStyrbar() {
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            // https://github.com/Koenkk/zigbee2mqtt/issues/15725
            if (semver.gte(device.softwareBuildID, '2.4.0', true)) {
                const endpoint = device.getEndpoint(1);
                await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl', 'genScenes']);
            }
        },
    ];
    return { configure, isModernExtend: true };
}
function ikeaConfigureRemote() {
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            // Firmware 2.3.075 >= only supports binding to endpoint, before only to group
            // - https://github.com/Koenkk/zigbee2mqtt/issues/2772#issuecomment-577389281
            // - https://github.com/Koenkk/zigbee2mqtt/issues/7716
            const endpoint = device.getEndpoint(1);
            const version = device.softwareBuildID.split('.').map((n) => Number(n));
            const bindTarget = version[0] > 2 || (version[0] == 2 && version[1] > 3) || (version[0] == 2 && version[1] == 3 && version[2] >= 75)
                ? coordinatorEndpoint
                : constants.defaultBindGroup;
            await endpoint.bind('genOnOff', bindTarget);
        },
    ];
    return { configure, isModernExtend: true };
}
function ikeaAirPurifier() {
    const exposes = [
        exposes_1.presets.fan().withModes(['off', 'auto', '1', '2', '3', '4', '5', '6', '7', '8', '9']),
        exposes_1.presets.numeric('fan_speed', exposes_1.access.STATE_GET).withValueMin(0).withValueMax(9).withDescription('Current fan speed'),
        exposes_1.presets
            .numeric('pm25', exposes_1.access.STATE_GET)
            .withLabel('PM25')
            .withUnit('µg/m³')
            .withDescription('Measured PM2.5 (particulate matter) concentration'),
        exposes_1.presets
            .enum('air_quality', exposes_1.access.STATE_GET, ['excellent', 'good', 'moderate', 'poor', 'unhealthy', 'hazardous', 'out_of_range', 'unknown'])
            .withDescription('Calculated air quality'),
        exposes_1.presets.binary('led_enable', exposes_1.access.ALL, true, false).withDescription('Controls the LED').withCategory('config'),
        exposes_1.presets.binary('child_lock', exposes_1.access.ALL, 'LOCK', 'UNLOCK').withDescription('Controls physical input on the device').withCategory('config'),
        exposes_1.presets
            .binary('replace_filter', exposes_1.access.STATE_GET, true, false)
            .withDescription('Indicates if the filter is older than 6 months and needs replacing')
            .withCategory('diagnostic'),
        exposes_1.presets
            .numeric('filter_age', exposes_1.access.STATE_GET)
            .withUnit('minutes')
            .withDescription('Duration the filter has been used')
            .withCategory('diagnostic'),
        exposes_1.presets
            .numeric('device_age', exposes_1.access.STATE_GET)
            .withUnit('minutes')
            .withDescription('Duration the air purifier has been used')
            .withCategory('diagnostic'),
    ];
    const fromZigbee = [
        {
            cluster: 'manuSpecificIkeaAirPurifier',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.particulateMatter25Measurement !== undefined) {
                    const pm25Property = (0, utils_1.postfixWithEndpointName)('pm25', msg, model, meta);
                    let pm25 = parseFloat(msg.data['particulateMatter25Measurement']);
                    // Air Quality
                    // Scale based on EU AQI (https://www.eea.europa.eu/themes/air/air-quality-index)
                    // Using German IAQ labels to match the Develco Air Quality Sensor
                    let airQuality;
                    const airQualityProperty = (0, utils_1.postfixWithEndpointName)('air_quality', msg, model, meta);
                    if (pm25 <= 10) {
                        airQuality = 'excellent';
                    }
                    else if (pm25 <= 20) {
                        airQuality = 'good';
                    }
                    else if (pm25 <= 25) {
                        airQuality = 'moderate';
                    }
                    else if (pm25 <= 50) {
                        airQuality = 'poor';
                    }
                    else if (pm25 <= 75) {
                        airQuality = 'unhealthy';
                    }
                    else if (pm25 <= 800) {
                        airQuality = 'hazardous';
                    }
                    else if (pm25 < 65535) {
                        airQuality = 'out_of_range';
                    }
                    else {
                        airQuality = 'unknown';
                    }
                    pm25 = pm25 == 65535 ? -1 : pm25;
                    state[pm25Property] = pm25;
                    state[airQualityProperty] = airQuality;
                }
                if (msg.data.filterRunTime !== undefined) {
                    // Filter needs to be replaced after 6 months
                    state['replace_filter'] = parseInt(msg.data['filterRunTime']) >= 259200;
                    state['filter_age'] = parseInt(msg.data['filterRunTime']);
                }
                if (msg.data.deviceRunTime !== undefined) {
                    state['device_age'] = parseInt(msg.data['deviceRunTime']);
                }
                if (msg.data.controlPanelLight !== undefined) {
                    state['led_enable'] = msg.data['controlPanelLight'] == 0;
                }
                if (msg.data.childLock !== undefined) {
                    state['child_lock'] = msg.data['childLock'] == 0 ? 'UNLOCK' : 'LOCK';
                }
                if (msg.data.fanSpeed !== undefined) {
                    let fanSpeed = msg.data['fanSpeed'];
                    if (fanSpeed >= 10) {
                        fanSpeed = ((fanSpeed - 5) * 2) / 10;
                    }
                    else {
                        fanSpeed = 0;
                    }
                    state['fan_speed'] = fanSpeed;
                }
                if (msg.data.fanMode !== undefined) {
                    let fanMode = msg.data['fanMode'];
                    if (fanMode >= 10) {
                        fanMode = (((fanMode - 5) * 2) / 10).toString();
                    }
                    else if (fanMode == 1) {
                        fanMode = 'auto';
                    }
                    else {
                        fanMode = 'off';
                    }
                    state['fan_mode'] = fanMode;
                    state['fan_state'] = fanMode === 'off' ? 'OFF' : 'ON';
                }
                return state;
            },
        },
    ];
    const toZigbee = [
        {
            key: ['fan_mode', 'fan_state'],
            convertSet: async (entity, key, value, meta) => {
                if (key == 'fan_state' && typeof value === 'string' && value.toLowerCase() == 'on') {
                    value = 'auto';
                }
                else {
                    value = value.toString().toLowerCase();
                }
                let fanMode;
                switch (value) {
                    case 'off':
                        fanMode = 0;
                        break;
                    case 'auto':
                        fanMode = 1;
                        break;
                    default:
                        fanMode = (Number(value) / 2.0) * 10 + 5;
                }
                await entity.write('manuSpecificIkeaAirPurifier', { fanMode: fanMode }, exports.manufacturerOptions);
                return { state: { fan_mode: value, fan_state: value === 'off' ? 'OFF' : 'ON' } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['fanMode']);
            },
        },
        {
            key: ['fan_speed'],
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['fanSpeed']);
            },
        },
        {
            key: ['pm25', 'air_quality'],
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['particulateMatter25Measurement']);
            },
        },
        {
            key: ['replace_filter', 'filter_age'],
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['filterRunTime']);
            },
        },
        {
            key: ['device_age'],
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['deviceRunTime']);
            },
        },
        {
            key: ['child_lock'],
            convertSet: async (entity, key, value, meta) => {
                (0, utils_1.assertString)(value);
                await entity.write('manuSpecificIkeaAirPurifier', { childLock: value.toLowerCase() === 'unlock' ? 0 : 1 }, exports.manufacturerOptions);
                return { state: { child_lock: value.toLowerCase() === 'lock' ? 'LOCK' : 'UNLOCK' } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['childLock']);
            },
        },
        {
            key: ['led_enable'],
            convertSet: async (entity, key, value, meta) => {
                await entity.write('manuSpecificIkeaAirPurifier', { controlPanelLight: value ? 0 : 1 }, exports.manufacturerOptions);
                return { state: { led_enable: value ? true : false } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificIkeaAirPurifier', ['controlPanelLight']);
            },
        },
    ];
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['manuSpecificIkeaAirPurifier']);
            await endpoint.configureReporting('manuSpecificIkeaAirPurifier', [
                {
                    attribute: 'particulateMatter25Measurement',
                    minimumReportInterval: modernExtend_1.TIME_LOOKUP['1_MINUTE'],
                    maximumReportInterval: modernExtend_1.TIME_LOOKUP['1_HOUR'],
                    reportableChange: 1,
                },
            ], exports.manufacturerOptions);
            await endpoint.configureReporting('manuSpecificIkeaAirPurifier', [
                {
                    attribute: 'filterRunTime',
                    minimumReportInterval: modernExtend_1.TIME_LOOKUP['1_HOUR'],
                    maximumReportInterval: modernExtend_1.TIME_LOOKUP['1_HOUR'],
                    reportableChange: 0,
                },
            ], exports.manufacturerOptions);
            await endpoint.configureReporting('manuSpecificIkeaAirPurifier', [{ attribute: 'fanMode', minimumReportInterval: 0, maximumReportInterval: modernExtend_1.TIME_LOOKUP['1_HOUR'], reportableChange: 1 }], exports.manufacturerOptions);
            await endpoint.configureReporting('manuSpecificIkeaAirPurifier', [{ attribute: 'fanSpeed', minimumReportInterval: 0, maximumReportInterval: modernExtend_1.TIME_LOOKUP['1_HOUR'], reportableChange: 1 }], exports.manufacturerOptions);
            await endpoint.read('manuSpecificIkeaAirPurifier', ['controlPanelLight', 'childLock', 'filterRunTime']);
        },
    ];
    return { exposes, fromZigbee, toZigbee, configure, isModernExtend: true };
}
function ikeaVoc(args) {
    return (0, modernExtend_1.numeric)({
        name: 'voc_index',
        label: 'VOC index',
        cluster: 'manuSpecificIkeaVocIndexMeasurement',
        attribute: 'measuredValue',
        reporting: { min: '1_MINUTE', max: '2_MINUTES', change: 1 },
        description: 'Sensirion VOC index',
        access: 'STATE',
        ...args,
    });
}
function ikeaConfigureGenPollCtrl(args) {
    args = { endpointId: 1, ...args };
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            const endpoint = device.getEndpoint(args.endpointId);
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 24) {
                await endpoint.write('genPollCtrl', { checkinInterval: 172800 });
            }
        },
    ];
    return { configure, isModernExtend: true };
}
function tradfriOccupancy() {
    const exposes = [
        exposes_1.presets.binary('occupancy', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected occupancy'),
        exposes_1.presets
            .binary('illuminance_above_threshold', exposes_1.access.STATE, true, false)
            .withDescription('Indicates whether the device detected bright light (works only in night mode)')
            .withCategory('diagnostic'),
    ];
    const fromZigbee = [
        {
            cluster: 'genOnOff',
            type: 'commandOnWithTimedOff',
            options: [exposes_1.options.occupancy_timeout(), exposes_1.options.illuminance_below_threshold_check()],
            convert: (model, msg, publish, options, meta) => {
                const onlyWhenOnFlag = (msg.data.ctrlbits & 1) != 0;
                if (onlyWhenOnFlag &&
                    (!options || options.illuminance_below_threshold_check === undefined || options.illuminance_below_threshold_check) &&
                    !globalStore.hasValue(msg.endpoint, 'timer'))
                    return;
                const timeout = options && options.occupancy_timeout !== undefined ? Number(options.occupancy_timeout) : msg.data.ontime / 10;
                // Stop existing timer because motion is detected and set a new one.
                clearTimeout(globalStore.getValue(msg.endpoint, 'timer'));
                globalStore.clearValue(msg.endpoint, 'timer');
                if (timeout !== 0) {
                    const timer = setTimeout(() => {
                        publish({ occupancy: false });
                        globalStore.clearValue(msg.endpoint, 'timer');
                    }, timeout * 1000);
                    globalStore.putValue(msg.endpoint, 'timer', timer);
                }
                return { occupancy: true, illuminance_above_threshold: onlyWhenOnFlag };
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function tradfriRequestedBrightness() {
    const exposes = [
        exposes_1.presets.numeric('requested_brightness_level', exposes_1.access.STATE).withValueMin(76).withValueMax(254).withCategory('diagnostic'),
        exposes_1.presets.numeric('requested_brightness_percent', exposes_1.access.STATE).withValueMin(30).withValueMax(100).withCategory('diagnostic'),
    ];
    const fromZigbee = [
        {
            // Possible values are 76 (30%) or 254 (100%)
            cluster: 'genLevelCtrl',
            type: 'commandMoveToLevelWithOnOff',
            convert: (model, msg, publish, options, meta) => {
                return {
                    requested_brightness_level: msg.data.level,
                    requested_brightness_percent: (0, utils_1.mapNumberRange)(msg.data.level, 0, 254, 0, 100),
                };
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function tradfriCommandsOnOff() {
    const exposes = [exposes_1.presets.action(['toggle'])];
    const fromZigbee = [
        {
            cluster: 'genOnOff',
            type: 'commandToggle',
            convert: (model, msg, publish, options, meta) => {
                return { action: (0, utils_1.postfixWithEndpointName)('toggle', msg, model, meta) };
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function tradfriCommandsLevelCtrl() {
    const actionLookup = {
        commandStepWithOnOff: 'brightness_up_click',
        commandStep: 'brightness_down_click',
        commandMoveWithOnOff: 'brightness_up_hold',
        commandStopWithOnOff: 'brightness_up_release',
        commandMove: 'brightness_down_hold',
        commandStop: 'brightness_down_release',
        commandMoveToLevelWithOnOff: 'toggle_hold',
    };
    const exposes = [exposes_1.presets.action(Object.values(actionLookup))];
    const fromZigbee = [
        {
            cluster: 'genLevelCtrl',
            type: [
                'commandStepWithOnOff',
                'commandStep',
                'commandMoveWithOnOff',
                'commandStopWithOnOff',
                'commandMove',
                'commandStop',
                'commandMoveToLevelWithOnOff',
            ],
            convert: (model, msg, publish, options, meta) => {
                return { action: actionLookup[msg.type] };
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function styrbarCommandOn() {
    // The STYRBAR sends an on +- 500ms after the arrow release. We don't want to send the ON action in this case.
    // https://github.com/Koenkk/zigbee2mqtt/issues/13335
    const exposes = [exposes_1.presets.action(['on'])];
    const fromZigbee = [
        {
            cluster: 'genOnOff',
            type: 'commandOn',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const arrowReleaseAgo = Date.now() - globalStore.getValue(msg.endpoint, 'arrow_release', 0);
                if (arrowReleaseAgo > 700) {
                    return { action: 'on' };
                }
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function ikeaDotsClick(args) {
    args = {
        actionLookup: {
            commandAction1: 'initial_press',
            commandAction2: 'long_press',
            commandAction3: 'short_release',
            commandAction4: 'long_release',
            commandAction6: 'double_press',
        },
        dotsPrefix: false,
        ...args,
    };
    const actions = args.endpointNames
        .map((b) => Object.values(args.actionLookup).map((a) => (args.dotsPrefix ? `dots_${b}_${a}` : `${b}_${a}`)))
        .flat();
    const exposes = [exposes_1.presets.action(actions)];
    const fromZigbee = [
        {
            // For remotes with firmware 1.0.012 (20211214)
            cluster: 64639,
            type: 'raw',
            convert: (model, msg, publish, options, meta) => {
                if (!Buffer.isBuffer(msg.data))
                    return;
                let action;
                const button = msg.data[5];
                switch (msg.data[6]) {
                    case 1:
                        action = 'initial_press';
                        break;
                    case 2:
                        action = 'double_press';
                        break;
                    case 3:
                        action = 'long_press';
                        break;
                }
                return { action: args.dotsPrefix ? `dots_${button}_${action}` : `${button}_${action}` };
            },
        },
        {
            // For remotes with firmware 1.0.32 (20221219) an SOMRIG
            cluster: 'tradfriButton',
            type: ['commandAction1', 'commandAction2', 'commandAction3', 'commandAction4', 'commandAction6'],
            convert: (model, msg, publish, options, meta) => {
                const button = (0, utils_1.getEndpointName)(msg, model, meta);
                const action = (0, utils_1.getFromLookup)(msg.type, args.actionLookup);
                return { action: args.dotsPrefix ? `dots_${button}_${action}` : `${button}_${action}` };
            },
        },
    ];
    const configure = [(0, modernExtend_1.setupConfigureForBinding)('tradfriButton', 'output', args.endpointNames)];
    return { exposes, fromZigbee, configure, isModernExtend: true };
}
function ikeaArrowClick(args) {
    args = { styrbar: false, bind: true, ...args };
    const actions = ['arrow_left_click', 'arrow_left_hold', 'arrow_left_release', 'arrow_right_click', 'arrow_right_hold', 'arrow_right_release'];
    const exposes = [exposes_1.presets.action(actions)];
    const fromZigbee = [
        {
            cluster: 'genScenes',
            type: 'commandTradfriArrowSingle',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                if (msg.data.value === 2)
                    return; // This is send on toggle hold
                const direction = msg.data.value === 257 ? 'left' : 'right';
                return { action: `arrow_${direction}_click` };
            },
        },
        {
            cluster: 'genScenes',
            type: 'commandTradfriArrowHold',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const direction = msg.data.value === 3329 ? 'left' : 'right';
                globalStore.putValue(msg.endpoint, 'direction', direction);
                return { action: `arrow_${direction}_hold` };
            },
        },
        {
            cluster: 'genScenes',
            type: 'commandTradfriArrowRelease',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                if (args.styrbar)
                    globalStore.putValue(msg.endpoint, 'arrow_release', Date.now());
                const direction = globalStore.getValue(msg.endpoint, 'direction');
                if (direction) {
                    globalStore.clearValue(msg.endpoint, 'direction');
                    const duration = msg.data.value / 1000;
                    const result = { action: `arrow_${direction}_release`, duration, action_duration: duration };
                    if (!(0, utils_1.isLegacyEnabled)(options))
                        delete result.duration;
                    return result;
                }
            },
        },
    ];
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [(0, modernExtend_1.setupConfigureForBinding)('genScenes', 'output')];
    return result;
}
function ikeaMediaCommands() {
    const actions = ['track_previous', 'track_next', 'volume_up', 'volume_down', 'volume_up_hold', 'volume_down_hold'];
    const exposes = [exposes_1.presets.action(actions)];
    const fromZigbee = [
        {
            cluster: 'genLevelCtrl',
            type: 'commandMoveWithOnOff',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const direction = msg.data.movemode === 1 ? 'down' : 'up';
                return { action: `volume_${direction}` };
            },
        },
        {
            cluster: 'genLevelCtrl',
            type: 'commandMove',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const direction = msg.data.movemode === 1 ? 'down_hold' : 'up_hold';
                return { action: `volume_${direction}` };
            },
        },
        {
            cluster: 'genLevelCtrl',
            type: 'commandStep',
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const direction = msg.data.stepmode === 1 ? 'previous' : 'next';
                return { action: `track_${direction}` };
            },
        },
    ];
    const configure = [(0, modernExtend_1.setupConfigureForBinding)('genLevelCtrl', 'output')];
    return { exposes, fromZigbee, configure, isModernExtend: true };
}
function addCustomClusterManuSpecificIkeaAirPurifier() {
    return (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificIkeaAirPurifier', {
        ID: 0xfc7d,
        manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.IKEA_OF_SWEDEN,
        attributes: {
            filterRunTime: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT32 },
            replaceFilter: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
            filterLifeTime: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT32 },
            controlPanelLight: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
            particulateMatter25Measurement: { ID: 0x0004, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
            childLock: { ID: 0x0005, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
            fanMode: { ID: 0x0006, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
            fanSpeed: { ID: 0x0007, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
            deviceRunTime: { ID: 0x0008, type: zigbee_herdsman_1.Zcl.DataType.UINT32 },
        },
        commands: {},
        commandsResponse: {},
    });
}
function addCustomClusterManuSpecificIkeaVocIndexMeasurement() {
    return (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificIkeaVocIndexMeasurement', {
        ID: 0xfc7e,
        manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.IKEA_OF_SWEDEN,
        attributes: {
            measuredValue: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.SINGLE_PREC },
            measuredMinValue: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.SINGLE_PREC },
            measuredMaxValue: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.SINGLE_PREC },
        },
        commands: {},
        commandsResponse: {},
    });
}
// Seems to be present on newer IKEA devices like: VINDSTYRKA, RODRET, and BADRING
//  Also observed on some older devices that had a post DIRIGERA release fw update.
//  No attributes known.
function addCustomClusterManuSpecificIkeaUnknown() {
    return (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificIkeaUnknown', {
        ID: 0xfc7c,
        manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.IKEA_OF_SWEDEN,
        attributes: {},
        commands: {},
        commandsResponse: {},
    });
}
exports.legacy = {
    fromZigbee: {
        E1744_play_pause: {
            cluster: 'genOnOff',
            type: 'commandToggle',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.isLegacyEnabled)(options)) {
                    return { action: 'play_pause' };
                }
            },
        },
        E1744_skip: {
            cluster: 'genLevelCtrl',
            type: 'commandStep',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.isLegacyEnabled)(options)) {
                    const direction = msg.data.stepmode === 1 ? 'backward' : 'forward';
                    return {
                        action: `skip_${direction}`,
                        step_size: msg.data.stepsize,
                        transition_time: msg.data.transtime,
                    };
                }
            },
        },
        E1743_brightness_down: {
            cluster: 'genLevelCtrl',
            type: 'commandMove',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.isLegacyEnabled)(options)) {
                    return { click: 'brightness_down' };
                }
            },
        },
        E1743_brightness_up: {
            cluster: 'genLevelCtrl',
            type: 'commandMoveWithOnOff',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.isLegacyEnabled)(options)) {
                    return { click: 'brightness_up' };
                }
            },
        },
        E1743_brightness_stop: {
            cluster: 'genLevelCtrl',
            type: 'commandStopWithOnOff',
            options: [exposes_1.options.legacy()],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.isLegacyEnabled)(options)) {
                    return { click: 'brightness_stop' };
                }
            },
        },
    },
    toZigbee: {},
};
//# sourceMappingURL=ikea.js.map