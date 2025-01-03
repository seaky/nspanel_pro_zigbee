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
exports.TIME_LOOKUP = void 0;
exports.setupAttributes = setupAttributes;
exports.setupConfigureForReporting = setupConfigureForReporting;
exports.setupConfigureForBinding = setupConfigureForBinding;
exports.setupConfigureForReading = setupConfigureForReading;
exports.determineEndpoint = determineEndpoint;
exports.forceDeviceType = forceDeviceType;
exports.forcePowerSource = forcePowerSource;
exports.linkQuality = linkQuality;
exports.battery = battery;
exports.deviceTemperature = deviceTemperature;
exports.identify = identify;
exports.onOff = onOff;
exports.commandsOnOff = commandsOnOff;
exports.customTimeResponse = customTimeResponse;
exports.illuminance = illuminance;
exports.temperature = temperature;
exports.pressure = pressure;
exports.flow = flow;
exports.humidity = humidity;
exports.soilMoisture = soilMoisture;
exports.occupancy = occupancy;
exports.co2 = co2;
exports.pm25 = pm25;
exports.light = light;
exports.commandsLevelCtrl = commandsLevelCtrl;
exports.commandsColorCtrl = commandsColorCtrl;
exports.lightingBallast = lightingBallast;
exports.lock = lock;
exports.windowCovering = windowCovering;
exports.commandsWindowCovering = commandsWindowCovering;
exports.iasZoneAlarm = iasZoneAlarm;
exports.iasWarning = iasWarning;
exports.electricityMeter = electricityMeter;
exports.ota = ota;
exports.commandsScenes = commandsScenes;
exports.enumLookup = enumLookup;
exports.numeric = numeric;
exports.binary = binary;
exports.actionEnumLookup = actionEnumLookup;
exports.quirkAddEndpointCluster = quirkAddEndpointCluster;
exports.quirkCheckinInterval = quirkCheckinInterval;
exports.reconfigureReportingsOnDeviceAnnounce = reconfigureReportingsOnDeviceAnnounce;
exports.deviceEndpoints = deviceEndpoints;
exports.deviceAddCustomCluster = deviceAddCustomCluster;
exports.ignoreClusterReport = ignoreClusterReport;
exports.bindCluster = bindCluster;
const zigbee_herdsman_1 = require("zigbee-herdsman");
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const globalLegacy = __importStar(require("../lib/legacy"));
const logger_1 = require("../lib/logger");
const ota_1 = require("../lib/ota");
const globalStore = __importStar(require("../lib/store"));
const exposes_1 = require("./exposes");
const light_1 = require("./light");
const utils_1 = require("./utils");
function getEndpointsWithCluster(device, cluster, type) {
    if (!device.endpoints) {
        throw new Error(device.ieeeAddr + ' ' + device.endpoints);
    }
    const endpoints = type === 'input'
        ? device.endpoints.filter((ep) => ep.getInputClusters().find((c) => ((0, utils_1.isNumber)(cluster) ? c.ID === cluster : c.name === cluster)))
        : device.endpoints.filter((ep) => ep.getOutputClusters().find((c) => ((0, utils_1.isNumber)(cluster) ? c.ID === cluster : c.name === cluster)));
    if (endpoints.length === 0) {
        throw new Error(`Device ${device.ieeeAddr} has no ${type} cluster ${cluster}`);
    }
    return endpoints;
}
const IAS_EXPOSE_LOOKUP = {
    occupancy: exposes_1.presets.binary('occupancy', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected occupancy'),
    contact: exposes_1.presets.binary('contact', exposes_1.access.STATE, false, true).withDescription('Indicates whether the device is opened or closed'),
    smoke: exposes_1.presets.binary('smoke', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected smoke'),
    water_leak: exposes_1.presets.binary('water_leak', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected a water leak'),
    carbon_monoxide: exposes_1.presets.binary('carbon_monoxide', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected carbon monoxide'),
    sos: exposes_1.presets.binary('sos', exposes_1.access.STATE, true, false).withLabel('SOS').withDescription('Indicates whether the SOS alarm is triggered'),
    vibration: exposes_1.presets.binary('vibration', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected vibration'),
    alarm: exposes_1.presets.binary('alarm', exposes_1.access.STATE, true, false).withDescription('Indicates whether the alarm is triggered'),
    gas: exposes_1.presets.binary('gas', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected gas'),
    alarm_1: exposes_1.presets.binary('alarm_1', exposes_1.access.STATE, true, false).withDescription('Indicates whether IAS Zone alarm 1 is active'),
    alarm_2: exposes_1.presets.binary('alarm_2', exposes_1.access.STATE, true, false).withDescription('Indicates whether IAS Zone alarm 2 is active'),
    tamper: exposes_1.presets.binary('tamper', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device is tampered').withCategory('diagnostic'),
    rain: exposes_1.presets.binary('rain', exposes_1.access.STATE, true, false).withDescription('Indicates whether the device detected rainfall'),
    battery_low: exposes_1.presets
        .binary('battery_low', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the battery of the device is almost empty')
        .withCategory('diagnostic'),
    supervision_reports: exposes_1.presets
        .binary('supervision_reports', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device issues reports on zone operational status')
        .withCategory('diagnostic'),
    restore_reports: exposes_1.presets
        .binary('restore_reports', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device issues reports on alarm no longer being present')
        .withCategory('diagnostic'),
    ac_status: exposes_1.presets
        .binary('ac_status', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device mains voltage supply is at fault')
        .withCategory('diagnostic'),
    test: exposes_1.presets
        .binary('test', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device is currently performing a test')
        .withCategory('diagnostic'),
    trouble: exposes_1.presets
        .binary('trouble', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device is currently havin trouble')
        .withCategory('diagnostic'),
    battery_defect: exposes_1.presets
        .binary('battery_defect', exposes_1.access.STATE, true, false)
        .withDescription('Indicates whether the device battery is defective')
        .withCategory('diagnostic'),
};
exports.TIME_LOOKUP = {
    MAX: 65000,
    '4_HOURS': 14400,
    '1_HOUR': 3600,
    '30_MINUTES': 1800,
    '5_MINUTES': 300,
    '2_MINUTES': 120,
    '1_MINUTE': 60,
    '10_SECONDS': 10,
    '5_SECONDS': 5,
    '1_SECOND': 1,
    MIN: 0,
};
function convertReportingConfigTime(time) {
    if ((0, utils_1.isString)(time)) {
        if (!(time in exports.TIME_LOOKUP))
            throw new Error(`Reporting time '${time}' is unknown`);
        return exports.TIME_LOOKUP[time];
    }
    else {
        return time;
    }
}
async function setupAttributes(entity, coordinatorEndpoint, cluster, config, configureReporting = true, read = true) {
    const endpoints = (0, utils_1.isEndpoint)(entity) ? [entity] : getEndpointsWithCluster(entity, cluster, 'input');
    const ieeeAddr = (0, utils_1.isEndpoint)(entity) ? entity.deviceIeeeAddress : entity.ieeeAddr;
    for (const endpoint of endpoints) {
        logger_1.logger.debug(`Configure reporting: ${configureReporting}, read: ${read} for ${ieeeAddr}/${endpoint.ID} ${cluster} ${JSON.stringify(config)}`, 'zhc:setupattribute');
        // Split into chunks of 4 to prevent to message becoming too big.
        const chunks = (0, utils_1.splitArrayIntoChunks)(config, 4);
        if (configureReporting) {
            await endpoint.bind(cluster, coordinatorEndpoint);
            for (const chunk of chunks) {
                await endpoint.configureReporting(cluster, chunk.map((a) => ({
                    minimumReportInterval: convertReportingConfigTime(a.min),
                    maximumReportInterval: convertReportingConfigTime(a.max),
                    reportableChange: a.change,
                    attribute: a.attribute,
                })));
            }
        }
        if (read) {
            for (const chunk of chunks) {
                try {
                    // Don't fail configuration if reading this attribute fails
                    // https://github.com/Koenkk/zigbee-herdsman-converters/pull/7074
                    await endpoint.read(cluster, chunk.map((a) => ((0, utils_1.isString)(a) ? a : (0, utils_1.isObject)(a.attribute) ? a.attribute.ID : a.attribute)));
                }
                catch (e) {
                    logger_1.logger.debug(`Reading attribute failed: ${e}`, 'zhc:setupattribute');
                }
            }
        }
    }
}
function setupConfigureForReporting(cluster, attribute, config, access, endpointNames) {
    const configureReporting = !!config;
    const read = !!(access & exposes_1.access.GET);
    if (configureReporting || read) {
        const configure = async (device, coordinatorEndpoint, definition) => {
            const reportConfig = config ? { ...config, attribute: attribute } : { attribute, min: -1, max: -1, change: -1 };
            let entities = [device];
            if (endpointNames) {
                const definitionEndpoints = definition.endpoint(device);
                const endpointIds = endpointNames.map((e) => definitionEndpoints[e]);
                entities = device.endpoints.filter((e) => endpointIds.includes(e.ID));
            }
            for (const entity of entities) {
                await setupAttributes(entity, coordinatorEndpoint, cluster, [reportConfig], configureReporting, read);
            }
        };
        return configure;
    }
    else {
        return undefined;
    }
}
function setupConfigureForBinding(cluster, clusterType, endpointNames) {
    const configure = async (device, coordinatorEndpoint, definition) => {
        if (endpointNames) {
            const definitionEndpoints = definition.endpoint(device);
            const endpointIds = endpointNames.map((e) => definitionEndpoints[e]);
            const endpoints = device.endpoints.filter((e) => endpointIds.includes(e.ID));
            for (const endpoint of endpoints) {
                await endpoint.bind(cluster, coordinatorEndpoint);
            }
        }
        else {
            const endpoints = getEndpointsWithCluster(device, cluster, clusterType);
            for (const endpoint of endpoints) {
                await endpoint.bind(cluster, coordinatorEndpoint);
            }
        }
    };
    return configure;
}
function setupConfigureForReading(cluster, attributes, endpointNames) {
    const configure = async (device, coordinatorEndpoint, definition) => {
        if (endpointNames) {
            const definitionEndpoints = definition.endpoint(device);
            const endpointIds = endpointNames.map((e) => definitionEndpoints[e]);
            const endpoints = device.endpoints.filter((e) => endpointIds.includes(e.ID));
            for (const endpoint of endpoints) {
                await endpoint.read(cluster, attributes);
            }
        }
        else {
            const endpoints = getEndpointsWithCluster(device, cluster, 'input');
            for (const endpoint of endpoints) {
                await endpoint.read(cluster, attributes);
            }
        }
    };
    return configure;
}
function determineEndpoint(entity, meta, cluster) {
    const { device, endpoint_name } = meta;
    if (endpoint_name !== undefined) {
        // In case an explicit endpoint is given, always send it to that endpoint
        return entity;
    }
    else {
        // In case no endpoint is given, match the first endpoint which support the cluster.
        return device.endpoints.find((e) => e.supportsInputCluster(cluster)) ?? device.endpoints[0];
    }
}
// #region General
function forceDeviceType(args) {
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            device.type = args.type;
            device.save();
        },
    ];
    return { configure, isModernExtend: true };
}
function forcePowerSource(args) {
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            device.powerSource = args.powerSource;
            device.save();
        },
    ];
    return { configure, isModernExtend: true };
}
function linkQuality(args) {
    args = { reporting: false, attribute: 'modelId', reportingConfig: { min: '1_HOUR', max: '4_HOURS', change: 0 }, ...args };
    const exposes = [
        exposes_1.presets
            .numeric('linkquality', exposes_1.access.STATE)
            .withUnit('lqi')
            .withDescription('Link quality (signal strength)')
            .withValueMin(0)
            .withValueMax(255)
            .withCategory('diagnostic'),
    ];
    const fromZigbee = [
        {
            cluster: 'genBasic',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                return { linkquality: msg.linkquality };
            },
        },
    ];
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.reporting) {
        result.configure = [setupConfigureForReporting('genBasic', args.attribute, args.reportingConfig, exposes_1.access.GET)];
    }
    return result;
}
function battery(args) {
    args = {
        percentage: true,
        voltage: false,
        lowStatus: false,
        percentageReporting: true,
        voltageReporting: false,
        dontDividePercentage: false,
        percentageReportingConfig: { min: '1_HOUR', max: 'MAX', change: 10 },
        voltageReportingConfig: { min: '1_HOUR', max: 'MAX', change: 10 },
        ...args,
    };
    const exposes = [];
    if (args.percentage) {
        exposes.push(exposes_1.presets
            .numeric('battery', exposes_1.access.STATE_GET)
            .withUnit('%')
            .withDescription('Remaining battery in %')
            .withValueMin(0)
            .withValueMax(100)
            .withCategory('diagnostic'));
    }
    if (args.voltage) {
        exposes.push(exposes_1.presets.numeric('voltage', exposes_1.access.STATE_GET).withUnit('mV').withDescription('Reported battery voltage in millivolts').withCategory('diagnostic'));
    }
    if (args.lowStatus) {
        exposes.push(exposes_1.presets.binary('battery_low', exposes_1.access.STATE, true, false).withDescription('Empty battery indicator').withCategory('diagnostic'));
    }
    const fromZigbee = [
        {
            cluster: 'genPowerCfg',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const payload = {};
                if (msg.data.batteryPercentageRemaining !== undefined && msg.data['batteryPercentageRemaining'] < 255) {
                    // Some devices do not comply to the ZCL and report a
                    // batteryPercentageRemaining of 100 when the battery is full (should be 200).
                    const dontDividePercentage = args.dontDividePercentage;
                    let percentage = msg.data['batteryPercentageRemaining'];
                    percentage = dontDividePercentage ? percentage : percentage / 2;
                    if (args.percentage)
                        payload.battery = (0, utils_1.precisionRound)(percentage, 2);
                }
                if (msg.data.batteryVoltage !== undefined && msg.data['batteryVoltage'] < 255) {
                    // Deprecated: voltage is = mV now but should be V
                    if (args.voltage)
                        payload.voltage = msg.data['batteryVoltage'] * 100;
                    if (args.voltageToPercentage) {
                        payload.battery = (0, utils_1.batteryVoltageToPercentage)(payload.voltage, args.voltageToPercentage);
                    }
                }
                if (msg.data.batteryAlarmState !== undefined) {
                    const battery1Low = (msg.data.batteryAlarmState & (1 << 0) ||
                        msg.data.batteryAlarmState & (1 << 1) ||
                        msg.data.batteryAlarmState & (1 << 2) ||
                        msg.data.batteryAlarmState & (1 << 3)) > 0;
                    const battery2Low = (msg.data.batteryAlarmState & (1 << 10) ||
                        msg.data.batteryAlarmState & (1 << 11) ||
                        msg.data.batteryAlarmState & (1 << 12) ||
                        msg.data.batteryAlarmState & (1 << 13)) > 0;
                    const battery3Low = (msg.data.batteryAlarmState & (1 << 20) ||
                        msg.data.batteryAlarmState & (1 << 21) ||
                        msg.data.batteryAlarmState & (1 << 22) ||
                        msg.data.batteryAlarmState & (1 << 23)) > 0;
                    if (args.lowStatus)
                        payload.battery_low = battery1Low || battery2Low || battery3Low;
                }
                return payload;
            },
        },
    ];
    const toZigbee = [
        {
            key: ['battery', 'voltage'],
            convertGet: async (entity, key, meta) => {
                // Don't fail GET reqest if reading fails
                // Split reading is needed for more clear debug logs
                const ep = determineEndpoint(entity, meta, 'genPowerCfg');
                try {
                    await ep.read('genPowerCfg', ['batteryPercentageRemaining']);
                }
                catch (e) {
                    logger_1.logger.debug(`Reading batteryPercentageRemaining failed: ${e}, device probably doesn't support it`, 'zhc:setupattribute');
                }
                try {
                    await ep.read('genPowerCfg', ['batteryVoltage']);
                }
                catch (e) {
                    logger_1.logger.debug(`Reading batteryVoltage failed: ${e}, device probably doesn't support it`, 'zhc:setupattribute');
                }
            },
        },
    ];
    const result = { exposes, fromZigbee, toZigbee, isModernExtend: true };
    if (args.percentageReporting || args.voltageReporting) {
        const configure = [];
        if (args.percentageReporting) {
            configure.push(setupConfigureForReporting('genPowerCfg', 'batteryPercentageRemaining', args.percentageReportingConfig, exposes_1.access.STATE_GET));
        }
        if (args.voltageReporting) {
            configure.push(setupConfigureForReporting('genPowerCfg', 'batteryVoltage', args.voltageReportingConfig, exposes_1.access.STATE_GET));
        }
        configure.push((0, utils_1.configureSetPowerSourceWhenUnknown)('Battery'));
        result.configure = configure;
    }
    if (args.voltageToPercentage || args.dontDividePercentage) {
        const meta = { battery: {} };
        if (args.voltageToPercentage)
            meta.battery.voltageToPercentage = args.voltageToPercentage;
        if (args.dontDividePercentage)
            meta.battery.dontDividePercentage = args.dontDividePercentage;
        result.meta = meta;
    }
    return result;
}
function deviceTemperature(args) {
    return numeric({
        name: 'device_temperature',
        cluster: 'genDeviceTempCfg',
        attribute: 'currentTemperature',
        reporting: { min: '5_MINUTES', max: '1_HOUR', change: 1 },
        description: 'Temperature of the device',
        unit: '°C',
        access: 'STATE_GET',
        entityCategory: 'diagnostic',
        ...args,
    });
}
function identify(args) {
    args = { isSleepy: false, ...args };
    const normal = exposes_1.presets.enum('identify', exposes_1.access.SET, ['identify']).withDescription('Initiate device identification').withCategory('config');
    const sleepy = exposes_1.presets
        .enum('identify', exposes_1.access.SET, ['identify'])
        .withDescription('Initiate device identification. This device is asleep by default.' +
        'You may need to wake it up first before sending the identify command.')
        .withCategory('config');
    const exposes = args.isSleepy ? [sleepy] : [normal];
    const identifyTimeout = exposes_1.presets
        .numeric('identify_timeout', exposes_1.access.SET)
        .withDescription('Sets the duration of the identification procedure in seconds (i.e., how long the device would flash).' +
        'The value ranges from 1 to 30 seconds (default: 3).')
        .withValueMin(1)
        .withValueMax(30);
    const toZigbee = [
        {
            key: ['identify'],
            options: [identifyTimeout],
            convertSet: async (entity, key, value, meta) => {
                const identifyTimeout = meta.options.identify_timeout ?? 3;
                await entity.command('genIdentify', 'identify', { identifytime: identifyTimeout }, (0, utils_1.getOptions)(meta.mapped, entity));
            },
        },
    ];
    return { exposes, toZigbee, isModernExtend: true };
}
function onOff(args) {
    args = { powerOnBehavior: true, skipDuplicateTransaction: false, configureReporting: true, ...args };
    const exposes = args.description
        ? (0, utils_1.exposeEndpoints)(exposes_1.presets.switch(args.description), args.endpointNames)
        : (0, utils_1.exposeEndpoints)(exposes_1.presets.switch(), args.endpointNames);
    const fromZigbee = [args.skipDuplicateTransaction ? fromZigbee_1.default.on_off_skip_duplicate_transaction : fromZigbee_1.default.on_off];
    const toZigbee = [args?.endpointNames ? { ...toZigbee_1.default.on_off, endpoints: args?.endpointNames } : toZigbee_1.default.on_off];
    if (args.powerOnBehavior) {
        exposes.push(...(0, utils_1.exposeEndpoints)(exposes_1.presets.power_on_behavior(['off', 'on', 'toggle', 'previous']), args.endpointNames));
        fromZigbee.push(fromZigbee_1.default.power_on_behavior);
        toZigbee.push(toZigbee_1.default.power_on_behavior);
    }
    const result = { exposes, fromZigbee, toZigbee, isModernExtend: true };
    if (args.ota)
        result.ota = args.ota;
    if (args.configureReporting) {
        result.configure = [
            async (device, coordinatorEndpoint) => {
                await setupAttributes(device, coordinatorEndpoint, 'genOnOff', [{ attribute: 'onOff', min: 'MIN', max: 'MAX', change: 1 }]);
                if (args.powerOnBehavior) {
                    try {
                        // Don't fail configure if reading this attribute fails, some devices don't support it.
                        await setupAttributes(device, coordinatorEndpoint, 'genOnOff', [{ attribute: 'startUpOnOff', min: 'MIN', max: 'MAX', change: 1 }], false);
                    }
                    catch (e) {
                        if (e.message.includes('UNSUPPORTED_ATTRIBUTE')) {
                            logger_1.logger.debug('Reading startUpOnOff failed, this features is unsupported', 'zhc:onoff');
                        }
                        else {
                            throw e;
                        }
                    }
                }
            },
            (0, utils_1.configureSetPowerSourceWhenUnknown)('Mains (single phase)'),
        ];
    }
    return result;
}
function commandsOnOff(args) {
    args = { commands: ['on', 'off', 'toggle'], bind: true, legacyAction: false, ...args };
    let actions = args.commands;
    if (args.endpointNames) {
        actions = args.commands.map((c) => args.endpointNames.map((e) => `${c}_${e}`)).flat();
    }
    const exposes = [exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered action (e.g. a button click)')];
    const actionPayloadLookup = {
        commandOn: 'on',
        commandOff: 'off',
        commandOffWithEffect: 'off',
        commandToggle: 'toggle',
    };
    const fromZigbee = [
        {
            cluster: 'genOnOff',
            type: ['commandOn', 'commandOff', 'commandOffWithEffect', 'commandToggle'],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const payload = { action: (0, utils_1.postfixWithEndpointName)(actionPayloadLookup[msg.type], msg, model, meta) };
                (0, utils_1.addActionGroup)(payload, msg, model);
                return payload;
            },
        },
    ];
    if (args.legacyAction) {
        fromZigbee.push(...[globalLegacy.fromZigbee.genOnOff_cmdOn, globalLegacy.fromZigbee.genOnOff_cmdOff]);
    }
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [setupConfigureForBinding('genOnOff', 'output', args.endpointNames)];
    return result;
}
function customTimeResponse(start) {
    // The Zigbee Cluster Library specification states that the genTime.time response should be the
    // number of seconds since 1st Jan 2000 00:00:00 UTC. This extend modifies that:
    // 1970_UTC: number of seconds since the Unix Epoch (1st Jan 1970 00:00:00 UTC)
    // 2000_LOCAL: seconds since 1 January in the local time zone.
    // Disable the responses of zigbee-herdsman and respond here instead.
    const onEvent = async (type, data, device, options, state) => {
        if (!device.customReadResponse) {
            device.customReadResponse = (frame, endpoint) => {
                if (frame.isCluster('genTime')) {
                    const payload = {};
                    if (start === '1970_UTC') {
                        const time = Math.round(new Date().getTime() / 1000);
                        payload.time = time;
                        payload.localTime = time - new Date().getTimezoneOffset() * 60;
                    }
                    else if (start === '2000_LOCAL') {
                        const oneJanuary2000 = new Date('January 01, 2000 00:00:00 UTC+00:00').getTime();
                        const secondsUTC = Math.round((new Date().getTime() - oneJanuary2000) / 1000);
                        payload.time = secondsUTC - new Date().getTimezoneOffset() * 60;
                    }
                    endpoint.readResponse('genTime', frame.header.transactionSequenceNumber, payload).catch((e) => {
                        logger_1.logger.warning(`Custom time response failed for '${device.ieeeAddr}': ${e}`, 'zhc:customtimeresponse');
                    });
                    return true;
                }
                return false;
            };
        }
    };
    return { onEvent, isModernExtend: true };
}
// #endregion
// #region Measurement and Sensing
function illuminance(args) {
    const luxScale = (value, type) => {
        let result = value;
        if (type === 'from') {
            result = Math.pow(10, (result - 1) / 10000);
        }
        return result;
    };
    const rawIllinance = numeric({
        name: 'illuminance',
        cluster: 'msIlluminanceMeasurement',
        attribute: 'measuredValue',
        description: 'Raw measured illuminance',
        access: 'STATE_GET',
        ...args,
    });
    const illiminanceLux = numeric({
        name: 'illuminance_lux',
        cluster: 'msIlluminanceMeasurement',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 5 }, // 5 lux
        description: 'Measured illuminance in lux',
        unit: 'lx',
        scale: luxScale,
        access: 'STATE_GET',
        ...args,
    });
    const result = illiminanceLux;
    result.fromZigbee.push(...rawIllinance.fromZigbee);
    result.toZigbee.push(...rawIllinance.toZigbee);
    result.exposes.push(...rawIllinance.exposes);
    return result;
}
function temperature(args) {
    return numeric({
        name: 'temperature',
        cluster: 'msTemperatureMeasurement',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 100 },
        description: 'Measured temperature value',
        unit: '°C',
        scale: 100,
        access: 'STATE_GET',
        ...args,
    });
}
function pressure(args) {
    return numeric({
        name: 'pressure',
        cluster: 'msPressureMeasurement',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 50 }, // 5 kPa
        description: 'The measured atmospheric pressure',
        unit: 'kPa',
        scale: 10,
        access: 'STATE_GET',
        ...args,
    });
}
function flow(args) {
    return numeric({
        name: 'flow',
        cluster: 'msFlowMeasurement',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 10 },
        description: 'Measured water flow',
        unit: 'm³/h',
        scale: 10,
        access: 'STATE_GET',
        ...args,
    });
}
function humidity(args) {
    return numeric({
        name: 'humidity',
        cluster: 'msRelativeHumidity',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 100 },
        description: 'Measured relative humidity',
        unit: '%',
        scale: 100,
        access: 'STATE_GET',
        ...args,
    });
}
function soilMoisture(args) {
    return numeric({
        name: 'soil_moisture',
        cluster: 'msSoilMoisture',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 100 },
        description: 'Measured soil moisture value',
        unit: '%',
        scale: 100,
        access: 'STATE_GET',
        ...args,
    });
}
function occupancy(args) {
    args = { reporting: true, reportingConfig: { min: '10_SECONDS', max: '1_MINUTE', change: 0 }, ...args };
    const templateExposes = [exposes_1.presets.occupancy().withAccess(exposes_1.access.STATE_GET)];
    const exposes = args.endpointNames
        ? templateExposes.map((exp) => args.endpointNames.map((ep) => exp.withEndpoint(ep))).flat()
        : templateExposes;
    const fromZigbee = [
        {
            cluster: 'msOccupancySensing',
            type: ['attributeReport', 'readResponse'],
            options: [exposes_1.options.no_occupancy_since_false()],
            convert: (model, msg, publish, options, meta) => {
                if ('occupancy' in msg.data && (!args.endpointNames || args.endpointNames.includes((0, utils_1.getEndpointName)(msg, model, meta).toString()))) {
                    const propertyName = (0, utils_1.postfixWithEndpointName)('occupancy', msg, model, meta);
                    const payload = { [propertyName]: (msg.data['occupancy'] & 1) > 0 };
                    (0, utils_1.noOccupancySince)(msg.endpoint, options, publish, payload[propertyName] ? 'stop' : 'start');
                    return payload;
                }
            },
        },
    ];
    const toZigbee = [
        {
            key: ['occupancy'],
            convertGet: async (entity, key, meta) => {
                await determineEndpoint(entity, meta, 'msOccupancySensing').read('msOccupancySensing', ['occupancy']);
            },
        },
    ];
    const settingsExtends = [];
    const settingsTemplate = {
        cluster: 'msOccupancySensing',
        description: '',
        endpointNames: args.endpointNames,
        access: 'ALL',
        entityCategory: 'config',
    };
    const attributesForReading = [];
    if (args.pirConfig) {
        if (args.pirConfig.includes('otu_delay')) {
            settingsExtends.push(numeric({
                name: 'occupancy_timeout',
                attribute: 'pirOToUDelay',
                valueMin: 0,
                valueMax: 65534,
                unit: 's',
                ...settingsTemplate,
                description: 'Time in seconds before occupancy is cleared after the last detected movement.',
            }));
            attributesForReading.push('pirOToUDelay');
        }
        if (args.pirConfig.includes('uto_delay')) {
            settingsExtends.push(numeric({
                name: 'pir_uto_delay',
                attribute: 'pirUToODelay',
                valueMin: 0,
                valueMax: 65534,
                ...settingsTemplate,
            }));
            attributesForReading.push('pirUToODelay');
        }
        if (args.pirConfig.includes('uto_threshold')) {
            settingsExtends.push(numeric({
                name: 'pir_uto_threshold',
                attribute: 'pirUToOThreshold',
                valueMin: 1,
                valueMax: 254,
                ...settingsTemplate,
            }));
            attributesForReading.push('pirUToOThreshold');
        }
    }
    if (args.ultrasonicConfig) {
        if (args.pirConfig.includes('otu_delay')) {
            settingsExtends.push(numeric({
                name: 'ultrasonic_otu_delay',
                attribute: 'ultrasonicOToUDelay',
                valueMin: 0,
                valueMax: 65534,
                ...settingsTemplate,
            }));
            attributesForReading.push('ultrasonicOToUDelay');
        }
        if (args.pirConfig.includes('uto_delay')) {
            settingsExtends.push(numeric({
                name: 'ultrasonic_uto_delay',
                attribute: 'ultrasonicUToODelay',
                valueMin: 0,
                valueMax: 65534,
                ...settingsTemplate,
            }));
            attributesForReading.push('ultrasonicUToODelay');
        }
        if (args.pirConfig.includes('uto_threshold')) {
            settingsExtends.push(numeric({
                name: 'ultrasonic_uto_threshold',
                attribute: 'ultrasonicUToOThreshold',
                valueMin: 1,
                valueMax: 254,
                ...settingsTemplate,
            }));
            attributesForReading.push('ultrasonicUToOThreshold');
        }
    }
    if (args.contactConfig) {
        if (args.pirConfig.includes('otu_delay')) {
            settingsExtends.push(numeric({
                name: 'contact_otu_delay',
                attribute: 'contactOToUDelay',
                valueMin: 0,
                valueMax: 65534,
                ...settingsTemplate,
            }));
            attributesForReading.push('contactOToUDelay');
        }
        if (args.pirConfig.includes('uto_delay')) {
            settingsExtends.push(numeric({
                name: 'contact_uto_delay',
                attribute: 'contactUToODelay',
                valueMin: 0,
                valueMax: 65534,
                ...settingsTemplate,
            }));
            attributesForReading.push('contactUToODelay');
        }
        if (args.pirConfig.includes('uto_threshold')) {
            settingsExtends.push(numeric({
                name: 'contact_uto_threshold',
                attribute: 'contactUToOThreshold',
                valueMin: 1,
                valueMax: 254,
                ...settingsTemplate,
            }));
            attributesForReading.push('contactUToOThreshold');
        }
    }
    settingsExtends.map((extend) => exposes.push(...extend.exposes));
    settingsExtends.map((extend) => fromZigbee.push(...extend.fromZigbee));
    settingsExtends.map((extend) => toZigbee.push(...extend.toZigbee));
    const configure = [];
    if (attributesForReading.length > 0)
        configure.push(setupConfigureForReading('msOccupancySensing', attributesForReading, args.endpointNames));
    if (args.reporting) {
        configure.push(setupConfigureForReporting('msOccupancySensing', 'occupancy', args.reportingConfig, exposes_1.access.STATE_GET, args.endpointNames));
    }
    return { exposes, fromZigbee, toZigbee, configure, isModernExtend: true };
}
function co2(args) {
    return numeric({
        name: 'co2',
        cluster: 'msCO2',
        label: 'CO2',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 0.00005 }, // 50 ppm change
        description: 'Measured value',
        unit: 'ppm',
        scale: 0.000001,
        access: 'STATE_GET',
        ...args,
    });
}
function pm25(args) {
    return numeric({
        name: 'pm25',
        cluster: 'pm25Measurement',
        attribute: 'measuredValue',
        reporting: { min: '10_SECONDS', max: '1_HOUR', change: 1 },
        description: 'Measured PM2.5 (particulate matter) concentration',
        unit: 'µg/m³',
        access: 'STATE_GET',
        ...args,
    });
}
function light(args) {
    args = { effect: true, powerOnBehavior: true, configureReporting: false, ...args };
    if (args.colorTemp) {
        args.colorTemp = { startup: true, ...args.colorTemp };
    }
    const argsColor = args.color
        ? {
            modes: ['xy'],
            applyRedFix: false,
            enhancedHue: true,
            ...((0, utils_1.isObject)(args.color) ? args.color : {}),
        }
        : false;
    const lightExpose = (0, utils_1.exposeEndpoints)(exposes_1.presets.light().withBrightness(), args.endpointNames);
    const fromZigbee = [fromZigbee_1.default.on_off, fromZigbee_1.default.brightness, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.level_config];
    const toZigbee = [
        args?.endpointNames ? { ...toZigbee_1.default.light_onoff_brightness, endpoints: args?.endpointNames } : toZigbee_1.default.light_onoff_brightness,
        toZigbee_1.default.ignore_transition,
        toZigbee_1.default.level_config,
        toZigbee_1.default.ignore_rate,
        toZigbee_1.default.light_brightness_move,
        toZigbee_1.default.light_brightness_step,
    ];
    const meta = {};
    if (args.colorTemp || argsColor) {
        fromZigbee.push(fromZigbee_1.default.color_colortemp);
        if (args.colorTemp && argsColor)
            toZigbee.push(toZigbee_1.default.light_color_colortemp);
        else if (args.colorTemp)
            toZigbee.push(toZigbee_1.default.light_colortemp);
        else if (argsColor)
            toZigbee.push(toZigbee_1.default.light_color);
        toZigbee.push(toZigbee_1.default.light_color_mode, toZigbee_1.default.light_color_options);
    }
    if (args.colorTemp) {
        lightExpose.forEach((e) => e.withColorTemp(args.colorTemp.range));
        toZigbee.push(toZigbee_1.default.light_colortemp_move, toZigbee_1.default.light_colortemp_step);
        if (args.colorTemp.startup) {
            toZigbee.push(toZigbee_1.default.light_colortemp_startup);
            lightExpose.forEach((e) => e.withColorTempStartup(args.colorTemp.range));
        }
    }
    if (argsColor) {
        lightExpose.forEach((e) => e.withColor(argsColor.modes));
        toZigbee.push(toZigbee_1.default.light_hue_saturation_move, toZigbee_1.default.light_hue_saturation_step);
        if (argsColor.modes.includes('hs')) {
            meta.supportsHueAndSaturation = true;
        }
        if (argsColor.applyRedFix) {
            meta.applyRedFix = true;
        }
        if (!argsColor.enhancedHue) {
            meta.supportsEnhancedHue = false;
        }
    }
    if (args.levelConfig) {
        lightExpose.forEach((e) => e.withLevelConfig(args.levelConfig.disabledFeatures ?? []));
        toZigbee.push(toZigbee_1.default.level_config);
    }
    const exposes = lightExpose;
    if (args.effect) {
        const effects = exposes_1.presets.effect();
        if (args.color) {
            effects.values.push('colorloop', 'stop_colorloop');
        }
        exposes.push(...(0, utils_1.exposeEndpoints)(effects, args.endpointNames));
        toZigbee.push(toZigbee_1.default.effect);
    }
    if (args.powerOnBehavior) {
        exposes.push(...(0, utils_1.exposeEndpoints)(exposes_1.presets.power_on_behavior(['off', 'on', 'toggle', 'previous']), args.endpointNames));
        fromZigbee.push(fromZigbee_1.default.power_on_behavior);
        toZigbee.push(toZigbee_1.default.power_on_behavior);
    }
    if (args.turnsOffAtBrightness1 !== undefined) {
        meta.turnsOffAtBrightness1 = args.turnsOffAtBrightness1;
    }
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            await (0, light_1.configure)(device, coordinatorEndpoint, true);
            if (args.configureReporting) {
                await setupAttributes(device, coordinatorEndpoint, 'genOnOff', [{ attribute: 'onOff', min: 'MIN', max: 'MAX', change: 1 }]);
                await setupAttributes(device, coordinatorEndpoint, 'genLevelCtrl', [
                    { attribute: 'currentLevel', min: '10_SECONDS', max: 'MAX', change: 1 },
                ]);
                if (args.colorTemp) {
                    await setupAttributes(device, coordinatorEndpoint, 'lightingColorCtrl', [
                        { attribute: 'colorTemperature', min: '10_SECONDS', max: 'MAX', change: 1 },
                    ]);
                }
                if (argsColor) {
                    const attributes = [];
                    if (argsColor.modes.includes('xy')) {
                        attributes.push({ attribute: 'currentX', min: '10_SECONDS', max: 'MAX', change: 1 }, { attribute: 'currentY', min: '10_SECONDS', max: 'MAX', change: 1 });
                    }
                    if (argsColor.modes.includes('hs')) {
                        attributes.push({ attribute: argsColor.enhancedHue ? 'enhancedCurrentHue' : 'currentHue', min: '10_SECONDS', max: 'MAX', change: 1 }, { attribute: 'currentSaturation', min: '10_SECONDS', max: 'MAX', change: 1 });
                    }
                    await setupAttributes(device, coordinatorEndpoint, 'lightingColorCtrl', attributes);
                }
            }
        },
        (0, utils_1.configureSetPowerSourceWhenUnknown)('Mains (single phase)'),
    ];
    const result = { exposes, fromZigbee, toZigbee, configure, meta, isModernExtend: true };
    if (args.ota)
        result.ota = args.ota;
    return result;
}
function commandsLevelCtrl(args) {
    args = {
        commands: [
            'brightness_move_to_level',
            'brightness_move_up',
            'brightness_move_down',
            'brightness_step_up',
            'brightness_step_down',
            'brightness_stop',
        ],
        bind: true,
        legacyAction: false,
        ...args,
    };
    let actions = args.commands;
    if (args.endpointNames) {
        actions = args.commands.map((c) => args.endpointNames.map((e) => `${c}_${e}`)).flat();
    }
    const exposes = [
        exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered action (e.g. a button click)').withCategory('diagnostic'),
    ];
    const fromZigbee = [fromZigbee_1.default.command_move_to_level, fromZigbee_1.default.command_move, fromZigbee_1.default.command_step, fromZigbee_1.default.command_stop];
    if (args.legacyAction) {
        // Legacy converters with removed hasAlreadyProcessedMessage and redirects
        const legacyFromZigbee = [
            {
                cluster: 'genLevelCtrl',
                type: ['commandMove', 'commandMoveWithOnOff'],
                options: [exposes_1.options.legacy(), exposes_1.options.simulated_brightness(' Note: will only work when legacy: false is set.')],
                convert: (model, msg, publish, options, meta) => {
                    if ((0, utils_1.isLegacyEnabled)(options)) {
                        globalLegacy.ictcg1(model, msg, publish, options, 'move');
                        const direction = msg.data.movemode === 1 ? 'left' : 'right';
                        return { action: `rotate_${direction}`, rate: msg.data.rate };
                    }
                },
            },
            {
                cluster: 'genLevelCtrl',
                type: ['commandStop', 'commandStopWithOnOff'],
                options: [exposes_1.options.legacy()],
                convert: (model, msg, publish, options, meta) => {
                    if ((0, utils_1.isLegacyEnabled)(options)) {
                        const value = globalLegacy.ictcg1(model, msg, publish, options, 'stop');
                        return { action: `rotate_stop`, brightness: value };
                    }
                },
            },
            {
                cluster: 'genLevelCtrl',
                type: 'commandMoveToLevelWithOnOff',
                options: [exposes_1.options.legacy()],
                convert: (model, msg, publish, options, meta) => {
                    if ((0, utils_1.isLegacyEnabled)(options)) {
                        const value = globalLegacy.ictcg1(model, msg, publish, options, 'level');
                        const direction = msg.data.level === 0 ? 'left' : 'right';
                        return { action: `rotate_${direction}_quick`, level: msg.data.level, brightness: value };
                    }
                },
            },
        ];
        fromZigbee.push(...legacyFromZigbee);
    }
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [setupConfigureForBinding('genLevelCtrl', 'output', args.endpointNames)];
    return result;
}
function commandsColorCtrl(args) {
    args = {
        commands: [
            'color_temperature_move_stop',
            'color_temperature_move_up',
            'color_temperature_move_down',
            'color_temperature_step_up',
            'color_temperature_step_down',
            'enhanced_move_to_hue_and_saturation',
            'move_to_hue_and_saturation',
            'color_hue_step_up',
            'color_hue_step_down',
            'color_saturation_step_up',
            'color_saturation_step_down',
            'color_loop_set',
            'color_temperature_move',
            'color_move',
            'hue_move',
            'hue_stop',
            'move_to_saturation',
            'move_to_hue',
        ],
        bind: true,
        ...args,
    };
    let actions = args.commands;
    if (args.endpointNames) {
        actions = args.commands.map((c) => args.endpointNames.map((e) => `${c}_${e}`)).flat();
    }
    const exposes = [
        exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered action (e.g. a button click)').withCategory('diagnostic'),
    ];
    const fromZigbee = [
        fromZigbee_1.default.command_move_color_temperature,
        fromZigbee_1.default.command_step_color_temperature,
        fromZigbee_1.default.command_ehanced_move_to_hue_and_saturation,
        fromZigbee_1.default.command_move_to_hue_and_saturation,
        fromZigbee_1.default.command_step_hue,
        fromZigbee_1.default.command_step_saturation,
        fromZigbee_1.default.command_color_loop_set,
        fromZigbee_1.default.command_move_to_color_temp,
        fromZigbee_1.default.command_move_to_color,
        fromZigbee_1.default.command_move_hue,
        fromZigbee_1.default.command_move_to_saturation,
        fromZigbee_1.default.command_move_to_hue,
    ];
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [setupConfigureForBinding('lightingColorCtrl', 'output', args.endpointNames)];
    return result;
}
function lightingBallast() {
    const result = {
        fromZigbee: [fromZigbee_1.default.lighting_ballast_configuration],
        toZigbee: [toZigbee_1.default.ballast_config],
        exposes: [
            new exposes_1.Numeric('ballast_minimum_level', exposes_1.access.ALL)
                .withValueMin(1)
                .withValueMax(254)
                .withDescription('Specifies the minimum light output of the ballast'),
            new exposes_1.Numeric('ballast_maximum_level', exposes_1.access.ALL)
                .withValueMin(1)
                .withValueMax(254)
                .withDescription('Specifies the maximum light output of the ballast'),
        ],
        configure: [setupConfigureForReading('lightingBallastCfg', ['minLevel', 'maxLevel'])],
        isModernExtend: true,
    };
    return result;
}
function lock(args) {
    args = { ...args };
    const fromZigbee = [fromZigbee_1.default.lock, fromZigbee_1.default.lock_operation_event, fromZigbee_1.default.lock_programming_event, fromZigbee_1.default.lock_pin_code_response, fromZigbee_1.default.lock_user_status_response];
    const toZigbee = [
        { ...toZigbee_1.default.lock, endpoints: args?.endpointNames },
        toZigbee_1.default.pincode_lock,
        toZigbee_1.default.lock_userstatus,
        toZigbee_1.default.lock_auto_relock_time,
        toZigbee_1.default.lock_sound_volume,
    ];
    const exposes = [
        exposes_1.presets.lock(),
        exposes_1.presets.pincode(),
        exposes_1.presets.lock_action(),
        exposes_1.presets.lock_action_source_name(),
        exposes_1.presets.lock_action_user(),
        exposes_1.presets.auto_relock_time().withValueMin(0).withValueMax(3600),
        exposes_1.presets.sound_volume(),
    ];
    const configure = [
        setupConfigureForReporting('closuresDoorLock', 'lockState', { min: 'MIN', max: '1_HOUR', change: 0 }, exposes_1.access.STATE_GET),
    ];
    const meta = { pinCodeCount: args.pinCodeCount };
    return { fromZigbee, toZigbee, exposes, configure, meta, isModernExtend: true };
}
function windowCovering(args) {
    args = { stateSource: 'lift', configureReporting: true, ...args };
    let coverExpose = exposes_1.presets.cover();
    if (args.controls.includes('lift'))
        coverExpose = coverExpose.withPosition();
    if (args.controls.includes('tilt'))
        coverExpose = coverExpose.withTilt();
    const exposes = [coverExpose];
    const fromZigbee = [fromZigbee_1.default.cover_position_tilt];
    const toZigbee = [{ ...toZigbee_1.default.cover_state, endpoints: args?.endpointNames }, toZigbee_1.default.cover_position_tilt];
    const result = { exposes, fromZigbee, toZigbee, isModernExtend: true };
    if (args.configureReporting) {
        const configure = [];
        if (args.controls.includes('lift')) {
            configure.push(setupConfigureForReporting('closuresWindowCovering', 'currentPositionLiftPercentage', { min: '1_SECOND', max: 'MAX', change: 1 }, exposes_1.access.STATE_GET));
        }
        if (args.controls.includes('tilt')) {
            configure.push(setupConfigureForReporting('closuresWindowCovering', 'currentPositionTiltPercentage', { min: '1_SECOND', max: 'MAX', change: 1 }, exposes_1.access.STATE_GET));
        }
        result.configure = configure;
    }
    if (args.coverInverted || args.stateSource === 'tilt') {
        const meta = {};
        if (args.coverInverted)
            meta.coverInverted = true;
        if (args.stateSource === 'tilt')
            meta.coverStateFromTilt = true;
        result.meta = meta;
    }
    if (args.coverMode) {
        result.toZigbee.push(toZigbee_1.default.cover_mode);
        result.exposes.push(exposes_1.presets.cover_mode());
    }
    if (args.endpointNames) {
        result.exposes = (0, utils_1.flatten)(exposes.map((expose) => args.endpointNames.map((endpoint) => expose.clone().withEndpoint(endpoint))));
    }
    return result;
}
function commandsWindowCovering(args) {
    args = { commands: ['open', 'close', 'stop'], bind: true, legacyAction: false, ...args };
    let actions = args.commands;
    if (args.endpointNames) {
        actions = args.commands.map((c) => args.endpointNames.map((e) => `${c}_${e}`)).flat();
    }
    const exposes = [
        exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered action (e.g. a button click)').withCategory('diagnostic'),
    ];
    const actionPayloadLookup = {
        commandUpOpen: 'open',
        commandDownClose: 'close',
        commandStop: 'stop',
    };
    const fromZigbee = [
        {
            cluster: 'closuresWindowCovering',
            type: ['commandUpOpen', 'commandDownClose', 'commandStop'],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const payload = { action: (0, utils_1.postfixWithEndpointName)(actionPayloadLookup[msg.type], msg, model, meta) };
                (0, utils_1.addActionGroup)(payload, msg, model);
                return payload;
            },
        },
    ];
    if (args.legacyAction) {
        fromZigbee.push(...[globalLegacy.fromZigbee.cover_open, globalLegacy.fromZigbee.cover_close, globalLegacy.fromZigbee.cover_stop]);
    }
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [setupConfigureForBinding('closuresWindowCovering', 'output', args.endpointNames)];
    return result;
}
function iasZoneAlarm(args) {
    const exposes = [];
    const invertAlarmPayload = args.zoneType === 'contact';
    const bothAlarms = args.zoneAttributes.includes('alarm_1') && args.zoneAttributes.includes('alarm_2');
    let alarm1Name = 'alarm_1';
    let alarm2Name = 'alarm_2';
    if (args.zoneType === 'generic') {
        args.zoneAttributes.map((attr) => {
            let expose = IAS_EXPOSE_LOOKUP[attr];
            if (args.description) {
                expose = expose.clone().withDescription(args.description);
            }
            exposes.push(expose);
        });
    }
    else {
        if (bothAlarms) {
            exposes.push(exposes_1.presets
                .binary(args.zoneType + '_alarm_1', exposes_1.access.STATE, true, false)
                .withDescription(IAS_EXPOSE_LOOKUP[args.zoneType].description + ' (alarm_1)'));
            alarm1Name = args.zoneType + '_alarm_1';
            exposes.push(exposes_1.presets
                .binary(args.zoneType + '_alarm_2', exposes_1.access.STATE, true, false)
                .withDescription(IAS_EXPOSE_LOOKUP[args.zoneType].description + ' (alarm_2)'));
            alarm2Name = args.zoneType + '_alarm_2';
        }
        else {
            exposes.push(IAS_EXPOSE_LOOKUP[args.zoneType]);
            alarm1Name = args.zoneType;
            alarm2Name = args.zoneType;
        }
        args.zoneAttributes.map((attr) => {
            if (attr !== 'alarm_1' && attr !== 'alarm_2')
                exposes.push(IAS_EXPOSE_LOOKUP[attr]);
        });
    }
    const timeoutProperty = `${args.zoneType}_timeout`;
    const fromZigbee = [
        {
            cluster: 'ssIasZone',
            type: ['commandStatusChangeNotification', 'attributeReport', 'readResponse'],
            options: args.alarmTimeout
                ? [
                    exposes_1.presets
                        .numeric(timeoutProperty, exposes_1.access.SET)
                        .withValueMin(0)
                        .withDescription(`Time in seconds after which ${args.zoneType} is cleared after detecting it (default 90 seconds).`),
                ]
                : [],
            convert: (model, msg, publish, options, meta) => {
                if (args.alarmTimeout) {
                    const timeout = options?.[timeoutProperty] !== undefined ? Number(options[timeoutProperty]) : 90;
                    clearTimeout(globalStore.getValue(msg.endpoint, 'timer'));
                    if (timeout !== 0) {
                        const timer = setTimeout(() => publish({ [alarm1Name]: false, [alarm2Name]: false }), timeout * 1000);
                        globalStore.putValue(msg.endpoint, 'timer', timer);
                    }
                }
                const zoneStatus = msg.type === 'commandStatusChangeNotification' ? msg.data.zonestatus : msg.data.zoneStatus;
                if (zoneStatus !== undefined) {
                    let payload = {};
                    if (args.zoneAttributes.includes('tamper')) {
                        payload = { tamper: (zoneStatus & (1 << 2)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('battery_low')) {
                        payload = { battery_low: (zoneStatus & (1 << 3)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('supervision_reports')) {
                        payload = { supervision_reports: (zoneStatus & (1 << 4)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('restore_reports')) {
                        payload = { restore_reports: (zoneStatus & (1 << 5)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('trouble')) {
                        payload = { trouble: (zoneStatus & (1 << 6)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('ac_status')) {
                        payload = { ac_status: (zoneStatus & (1 << 7)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('test')) {
                        payload = { test: (zoneStatus & (1 << 8)) > 0, ...payload };
                    }
                    if (args.zoneAttributes.includes('battery_defect')) {
                        payload = { battery_defect: (zoneStatus & (1 << 9)) > 0, ...payload };
                    }
                    let alarm1Payload = (zoneStatus & 1) > 0;
                    let alarm2Payload = (zoneStatus & (1 << 1)) > 0;
                    if (invertAlarmPayload) {
                        alarm1Payload = !alarm1Payload;
                        alarm2Payload = !alarm2Payload;
                    }
                    if (bothAlarms) {
                        payload = { [alarm1Name]: alarm1Payload, ...payload };
                        payload = { [alarm2Name]: alarm2Payload, ...payload };
                    }
                    else if (args.zoneAttributes.includes('alarm_1')) {
                        payload = { [alarm1Name]: alarm1Payload, ...payload };
                    }
                    else if (args.zoneAttributes.includes('alarm_2')) {
                        payload = { [alarm2Name]: alarm2Payload, ...payload };
                    }
                    return payload;
                }
            },
        },
    ];
    let configure;
    if (args.zoneStatusReporting) {
        configure = [
            async (device, coordinatorEndpoint) => {
                await setupAttributes(device, coordinatorEndpoint, 'ssIasZone', [{ attribute: 'zoneStatus', min: 'MIN', max: 'MAX', change: 0 }]);
            },
        ];
    }
    return { fromZigbee, exposes, isModernExtend: true, ...(configure && { configure }) };
}
function iasWarning(args) {
    const warningMode = { stop: 0, burglar: 1, fire: 2, emergency: 3, police_panic: 4, fire_panic: 5, emergency_panic: 6 };
    // levels for siren, strobe and squawk are identical
    const level = { low: 0, medium: 1, high: 2, very_high: 3 };
    const exposes = [
        exposes_1.presets
            .composite('warning', 'warning', exposes_1.access.SET)
            .withFeature(exposes_1.presets.enum('mode', exposes_1.access.SET, Object.keys(warningMode)).withDescription('Mode of the warning (sound effect)'))
            .withFeature(exposes_1.presets.enum('level', exposes_1.access.SET, Object.keys(level)).withDescription('Sound level'))
            .withFeature(exposes_1.presets.enum('strobe_level', exposes_1.access.SET, Object.keys(level)).withDescription('Intensity of the strobe'))
            .withFeature(exposes_1.presets.binary('strobe', exposes_1.access.SET, true, false).withDescription('Turn on/off the strobe (light) during warning'))
            .withFeature(exposes_1.presets.numeric('strobe_duty_cycle', exposes_1.access.SET).withValueMax(10).withValueMin(0).withDescription('Length of the flash cycle'))
            .withFeature(exposes_1.presets.numeric('duration', exposes_1.access.SET).withUnit('s').withDescription('Duration in seconds of the alarm')),
    ];
    const toZigbee = [
        {
            key: ['warning'],
            convertSet: async (entity, key, value, meta) => {
                const values = {
                    // @ts-expect-error ignore
                    mode: value.mode || 'emergency',
                    // @ts-expect-error ignore
                    level: value.level || 'medium',
                    // @ts-expect-error ignore
                    strobe: value.strobe !== undefined ? value.strobe : true,
                    // @ts-expect-error ignore
                    duration: value.duration !== undefined ? value.duration : 10,
                    // @ts-expect-error ignore
                    strobeDutyCycle: value.strobe_duty_cycle !== undefined ? value.strobe_duty_cycle * 10 : 0,
                    // @ts-expect-error ignore
                    strobeLevel: value.strobe_level !== undefined ? utils.getFromLookup(value.strobe_level, strobeLevel) : 1,
                };
                let info;
                if (args?.reversePayload) {
                    info = (0, utils_1.getFromLookup)(values.mode, warningMode) + ((values.strobe ? 1 : 0) << 4) + ((0, utils_1.getFromLookup)(values.level, level) << 6);
                }
                else {
                    info = ((0, utils_1.getFromLookup)(values.mode, warningMode) << 4) + ((values.strobe ? 1 : 0) << 2) + (0, utils_1.getFromLookup)(values.level, level);
                }
                const payload = {
                    startwarninginfo: info,
                    warningduration: values.duration,
                    strobedutycycle: values.strobeDutyCycle,
                    strobelevel: values.strobeLevel,
                };
                await entity.command('ssIasWd', 'startWarning', payload, (0, utils_1.getOptions)(meta.mapped, entity));
            },
        },
    ];
    return { toZigbee, exposes, isModernExtend: true };
}
function electricityMeter(args) {
    args = {
        cluster: 'both',
        electricalMeasurementType: 'ac',
        configureReporting: true,
        threePhase: false,
        producedEnergy: false,
        acFrequency: false,
        powerFactor: false,
        ...args,
    };
    if (args.cluster !== 'electrical') {
        const divisors = new Set([
            args.cluster === 'metering' && (0, utils_1.isObject)(args.power) ? args.power?.divisor : false,
            (0, utils_1.isObject)(args.energy) ? args.energy?.divisor : false,
            (0, utils_1.isObject)(args.producedEnergy) ? args.producedEnergy?.divisor : false,
        ]);
        divisors.delete(false);
        const multipliers = new Set([
            args.cluster === 'metering' && (0, utils_1.isObject)(args.power) ? args.power?.multiplier : false,
            (0, utils_1.isObject)(args.energy) ? args.energy?.multiplier : false,
            (0, utils_1.isObject)(args.producedEnergy) ? args.producedEnergy?.multiplier : false,
        ]);
        multipliers.delete(false);
        if (multipliers.size > 1 || divisors.size > 1) {
            throw new Error(`When cluster is metering, power and energy divisor/multiplier should be equal, got divisors=${Array.from(divisors).join(', ')}, multipliers=${Array.from(multipliers).join(', ')}`);
        }
    }
    if (args.cluster === 'electrical' && args.producedEnergy) {
        throw new Error(`Produced energy is not supported with cluster 'electrical', use 'both' or 'metering'`);
    }
    if (args.cluster === 'metering' && args.acFrequency) {
        throw new Error(`AC frequency is not supported with cluster 'metering', use 'both' or 'electrical'`);
    }
    if (args.cluster === 'metering' && args.powerFactor) {
        throw new Error(`Power factor is not supported with cluster 'metering', use 'both' or 'electrical'`);
    }
    if (args.cluster === 'metering' && args.electricalMeasurementType === 'dc') {
        throw new Error(`DC attributes are not supported with cluster 'metering', use 'both' or 'ac'`);
    }
    let exposes = [];
    let fromZigbee;
    let toZigbee;
    const configureLookup = {
        haElectricalMeasurement: {
            // Report change with every 5W change
            power: { attribute: 'activePower', divisor: 'acPowerDivisor', multiplier: 'acPowerMultiplier', forced: args.power, change: 5 },
            power_phase_b: { attribute: 'activePowerPhB', divisor: 'acPowerDivisor', multiplier: 'acPowerMultiplier', forced: args.power, change: 5 },
            power_phase_c: { attribute: 'activePowerPhC', divisor: 'acPowerDivisor', multiplier: 'acPowerMultiplier', forced: args.power, change: 5 },
            // Report change with every 0.05A change
            current: { attribute: 'rmsCurrent', divisor: 'acCurrentDivisor', multiplier: 'acCurrentMultiplier', forced: args.current, change: 0.05 },
            // Report change every 1 Hz
            ac_frequency: {
                attribute: 'acFrequency',
                divisor: 'acFrequencyDivisor',
                multiplier: 'acFrequencyMultiplier',
                forced: (0, utils_1.isObject)(args.acFrequency) ? args.acFrequency : false,
                change: 1,
            },
            current_phase_b: {
                attribute: 'rmsCurrentPhB',
                divisor: 'acCurrentDivisor',
                multiplier: 'acCurrentMultiplier',
                forced: args.current,
                change: 0.05,
            },
            current_phase_c: {
                attribute: 'rmsCurrentPhC',
                divisor: 'acCurrentDivisor',
                multiplier: 'acCurrentMultiplier',
                forced: args.current,
                change: 0.05,
            },
            power_factor: {
                attribute: 'powerFactor',
                change: 10,
            },
            // Report change with every 5V change
            voltage: { attribute: 'rmsVoltage', divisor: 'acVoltageDivisor', multiplier: 'acVoltageMultiplier', forced: args.voltage, change: 5 },
            voltage_phase_b: {
                attribute: 'rmsVoltagePhB',
                divisor: 'acVoltageDivisor',
                multiplier: 'acVoltageMultiplier',
                forced: args.voltage,
                change: 5,
            },
            voltage_phase_c: {
                attribute: 'rmsVoltagePhC',
                divisor: 'acVoltageDivisor',
                multiplier: 'acVoltageMultiplier',
                forced: args.voltage,
                change: 5,
            },
            // Report change with every 100mW change
            dc_power: { attribute: 'dcPower', divisor: 'dcPowerDivisor', multiplier: 'dcPowerMultiplier', forced: args.power, change: 100 },
            // Report change with every 100mV change
            dc_voltage: { attribute: 'dcVoltage', divisor: 'dcVoltageDivisor', multiplier: 'dcVoltageMultiplier', forced: args.voltage, change: 100 },
            // Report change with every 100mA change
            dc_current: { attribute: 'dcCurrent', divisor: 'dcCurrentDivisor', multiplier: 'dcCurrentMultiplier', forced: args.current, change: 100 },
        },
        seMetering: {
            // Report change with every 5W change
            power: { attribute: 'instantaneousDemand', divisor: 'divisor', multiplier: 'multiplier', forced: args.power, change: 0.005 },
            // Report change with every 0.1kWh change
            energy: { attribute: 'currentSummDelivered', divisor: 'divisor', multiplier: 'multiplier', forced: args.energy, change: 0.1 },
            produced_energy: {
                attribute: 'currentSummReceived',
                divisor: 'divisor',
                multiplier: 'multiplier',
                forced: (0, utils_1.isObject)(args.producedEnergy) ? args.producedEnergy : false,
                change: 0.1,
            },
        },
    };
    if (args.power === false) {
        delete configureLookup.haElectricalMeasurement.power;
        delete configureLookup.seMetering.power;
        delete configureLookup.haElectricalMeasurement.power_phase_b;
        delete configureLookup.haElectricalMeasurement.power_phase_c;
        delete configureLookup.haElectricalMeasurement.dc_power;
    }
    if (args.voltage === false) {
        delete configureLookup.haElectricalMeasurement.voltage;
        delete configureLookup.haElectricalMeasurement.voltage_phase_b;
        delete configureLookup.haElectricalMeasurement.voltage_phase_c;
        delete configureLookup.haElectricalMeasurement.dc_voltage;
    }
    if (args.current === false) {
        delete configureLookup.haElectricalMeasurement.current;
        delete configureLookup.haElectricalMeasurement.current_phase_b;
        delete configureLookup.haElectricalMeasurement.current_phase_c;
        delete configureLookup.haElectricalMeasurement.dc_current;
    }
    if (args.energy === false) {
        delete configureLookup.seMetering.energy;
    }
    if (args.producedEnergy === false) {
        delete configureLookup.seMetering.produced_energy;
    }
    if (args.powerFactor === false) {
        delete configureLookup.haElectricalMeasurement.power_factor;
    }
    if (args.acFrequency === false) {
        delete configureLookup.haElectricalMeasurement.ac_frequency;
    }
    if (args.threePhase === false) {
        delete configureLookup.haElectricalMeasurement.power_phase_b;
        delete configureLookup.haElectricalMeasurement.power_phase_c;
        delete configureLookup.haElectricalMeasurement.current_phase_b;
        delete configureLookup.haElectricalMeasurement.current_phase_c;
        delete configureLookup.haElectricalMeasurement.voltage_phase_b;
        delete configureLookup.haElectricalMeasurement.voltage_phase_c;
    }
    if (args.electricalMeasurementType === 'dc') {
        delete configureLookup.haElectricalMeasurement.power;
        delete configureLookup.haElectricalMeasurement.voltage;
        delete configureLookup.haElectricalMeasurement.current;
        delete configureLookup.haElectricalMeasurement.power_factor;
        delete configureLookup.haElectricalMeasurement.ac_frequency;
        delete configureLookup.haElectricalMeasurement.power_phase_b;
        delete configureLookup.haElectricalMeasurement.power_phase_c;
        delete configureLookup.haElectricalMeasurement.current_phase_b;
        delete configureLookup.haElectricalMeasurement.current_phase_c;
        delete configureLookup.haElectricalMeasurement.voltage_phase_b;
        delete configureLookup.haElectricalMeasurement.voltage_phase_c;
    }
    if (args.electricalMeasurementType === 'ac') {
        delete configureLookup.haElectricalMeasurement.dc_power;
        delete configureLookup.haElectricalMeasurement.dc_voltage;
        delete configureLookup.haElectricalMeasurement.dc_current;
    }
    if (args.cluster === 'both') {
        if (args.power !== false)
            exposes.push(exposes_1.presets.power().withAccess(exposes_1.access.STATE_GET));
        if (args.voltage !== false)
            exposes.push(exposes_1.presets.voltage().withAccess(exposes_1.access.STATE_GET));
        if (args.acFrequency !== false)
            exposes.push(exposes_1.presets.ac_frequency().withAccess(exposes_1.access.STATE_GET));
        if (args.powerFactor !== false)
            exposes.push(exposes_1.presets.power_factor().withAccess(exposes_1.access.STATE_GET));
        if (args.current !== false)
            exposes.push(exposes_1.presets.current().withAccess(exposes_1.access.STATE_GET));
        if (args.energy !== false)
            exposes.push(exposes_1.presets.energy().withAccess(exposes_1.access.STATE_GET));
        if (args.producedEnergy !== false)
            exposes.push(exposes_1.presets.produced_energy().withAccess(exposes_1.access.STATE_GET));
        fromZigbee = [args.fzElectricalMeasurement ?? fromZigbee_1.default.electrical_measurement, args.fzMetering ?? fromZigbee_1.default.metering];
        toZigbee = [
            toZigbee_1.default.electrical_measurement_power,
            toZigbee_1.default.acvoltage,
            toZigbee_1.default.accurrent,
            toZigbee_1.default.currentsummdelivered,
            toZigbee_1.default.currentsummreceived,
            toZigbee_1.default.frequency,
            toZigbee_1.default.powerfactor,
        ];
        delete configureLookup.seMetering.power;
    }
    else if (args.cluster === 'metering') {
        if (args.power !== false)
            exposes.push(exposes_1.presets.power().withAccess(exposes_1.access.STATE_GET));
        if (args.energy !== false)
            exposes.push(exposes_1.presets.energy().withAccess(exposes_1.access.STATE_GET));
        if (args.producedEnergy !== false)
            exposes.push(exposes_1.presets.produced_energy().withAccess(exposes_1.access.STATE_GET));
        fromZigbee = [args.fzMetering ?? fromZigbee_1.default.metering];
        toZigbee = [toZigbee_1.default.metering_power, toZigbee_1.default.currentsummdelivered, toZigbee_1.default.currentsummreceived];
        delete configureLookup.haElectricalMeasurement;
    }
    else if (args.cluster === 'electrical') {
        if (args.power !== false)
            exposes.push(exposes_1.presets.power().withAccess(exposes_1.access.STATE_GET));
        if (args.voltage !== false)
            exposes.push(exposes_1.presets.voltage().withAccess(exposes_1.access.STATE_GET));
        if (args.current !== false)
            exposes.push(exposes_1.presets.current().withAccess(exposes_1.access.STATE_GET));
        if (args.acFrequency !== false)
            exposes.push(exposes_1.presets.ac_frequency().withAccess(exposes_1.access.STATE_GET));
        if (args.powerFactor !== false)
            exposes.push(exposes_1.presets.power_factor().withAccess(exposes_1.access.STATE_GET));
        fromZigbee = [args.fzElectricalMeasurement ?? fromZigbee_1.default.electrical_measurement];
        toZigbee = [toZigbee_1.default.electrical_measurement_power, toZigbee_1.default.acvoltage, toZigbee_1.default.accurrent, toZigbee_1.default.frequency, toZigbee_1.default.powerfactor];
        delete configureLookup.seMetering;
    }
    if (args.threePhase === true) {
        exposes.push(exposes_1.presets.power_phase_b().withAccess(exposes_1.access.STATE_GET), exposes_1.presets.power_phase_c().withAccess(exposes_1.access.STATE_GET), exposes_1.presets.voltage_phase_b().withAccess(exposes_1.access.STATE_GET), exposes_1.presets.voltage_phase_c().withAccess(exposes_1.access.STATE_GET), exposes_1.presets.current_phase_b().withAccess(exposes_1.access.STATE_GET), exposes_1.presets.current_phase_c().withAccess(exposes_1.access.STATE_GET));
        toZigbee.push(toZigbee_1.default.electrical_measurement_power_phase_b, toZigbee_1.default.electrical_measurement_power_phase_c, toZigbee_1.default.acvoltage_phase_b, toZigbee_1.default.acvoltage_phase_c, toZigbee_1.default.accurrent_phase_b, toZigbee_1.default.accurrent_phase_c);
    }
    if (args.endpointNames) {
        exposes = (0, utils_1.flatten)(exposes.map((expose) => args.endpointNames.map((endpoint) => expose.clone().withEndpoint(endpoint))));
    }
    const result = { exposes, fromZigbee, toZigbee, isModernExtend: true };
    if (args.configureReporting) {
        result.configure = [
            async (device, coordinatorEndpoint) => {
                for (const [cluster, properties] of Object.entries(configureLookup)) {
                    for (const endpoint of getEndpointsWithCluster(device, cluster, 'input')) {
                        const items = [];
                        for (const property of Object.values(properties)) {
                            let change = property.change;
                            let min = '10_SECONDS';
                            let max = 'MAX';
                            // Check if this property has a divisor and multiplier, e.g. AC frequency doesn't.
                            if ('divisor' in property) {
                                // In case multiplier or divisor was provided, use that instead of reading from device.
                                if (property.forced && (property.forced.divisor || property.forced.multiplier)) {
                                    endpoint.saveClusterAttributeKeyValue(cluster, {
                                        [property.divisor]: property.forced.divisor ?? 1,
                                        [property.multiplier]: property.forced.multiplier ?? 1,
                                    });
                                    endpoint.save();
                                }
                                else {
                                    await endpoint.read(cluster, [property.divisor, property.multiplier]);
                                }
                                const divisor = endpoint.getClusterAttributeValue(cluster, property.divisor);
                                (0, utils_1.assertNumber)(divisor, property.divisor);
                                const multiplier = endpoint.getClusterAttributeValue(cluster, property.multiplier);
                                (0, utils_1.assertNumber)(multiplier, property.multiplier);
                                change = property.change * (divisor / multiplier);
                            }
                            if ('forced' in property && property.forced) {
                                if ('min' in property.forced) {
                                    min = property.forced.min;
                                }
                                if ('max' in property.forced) {
                                    max = property.forced.max;
                                }
                                if ('change' in property.forced) {
                                    change = property.forced.change;
                                }
                            }
                            items.push({ attribute: property.attribute, min, max, change });
                        }
                        if (items.length) {
                            await setupAttributes(endpoint, coordinatorEndpoint, cluster, items);
                        }
                    }
                }
            },
        ];
    }
    return result;
}
// #endregion
// #region OTA
function ota(definition) {
    return { ota: definition !== undefined ? definition : ota_1.zigbeeOTA, isModernExtend: true };
}
function commandsScenes(args) {
    args = { commands: ['recall', 'store', 'add', 'remove', 'remove_all'], bind: true, ...args };
    let actions = args.commands;
    if (args.endpointNames) {
        actions = args.commands.map((c) => args.endpointNames.map((e) => `${c}_${e}`)).flat();
    }
    const exposesArray = [exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered scene action (e.g. recall a scene)')];
    const actionPayloadLookup = {
        commandRecall: 'recall',
        commandStore: 'store',
        commandAdd: 'add',
        commandRemove: 'remove',
        commandRemoveAll: 'remove_all',
    };
    const fromZigbee = [
        {
            cluster: 'genScenes',
            type: ['commandRecall', 'commandStore', 'commandAdd', 'commandRemove', 'commandRemoveAll'],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                let trailing = '';
                if (msg.type === 'commandRecall' || msg.type === 'commandStore') {
                    trailing = `_${msg.data.sceneid}`;
                }
                const payload = {
                    action: (0, utils_1.postfixWithEndpointName)(actionPayloadLookup[msg.type] + trailing, msg, model, meta),
                };
                (0, utils_1.addActionGroup)(payload, msg, model);
                return payload;
            },
        },
    ];
    const result = { exposes: exposesArray, fromZigbee, isModernExtend: true };
    if (args.bind)
        result.configure = [setupConfigureForBinding('genScenes', 'output', args.endpointNames)];
    return result;
}
function enumLookup(args) {
    const { name, lookup, cluster, attribute, description, zigbeeCommandOptions, endpointName, reporting, entityCategory } = args;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const access = exposes_1.access[args.access ?? 'ALL'];
    let expose = exposes_1.presets.enum(name, access, Object.keys(lookup)).withDescription(description);
    if (endpointName)
        expose = expose.withEndpoint(endpointName);
    if (entityCategory)
        expose = expose.withCategory(entityCategory);
    const fromZigbee = [
        {
            cluster: cluster.toString(),
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                if (attributeKey in msg.data && (!endpointName || (0, utils_1.getEndpointName)(msg, model, meta) === endpointName)) {
                    // skip undefined value
                    if (msg.data[attributeKey] !== undefined)
                        return { [expose.property]: (0, utils_1.getFromLookupByValue)(msg.data[attributeKey], lookup) };
                }
            },
        },
    ];
    const toZigbee = [
        {
            key: [name],
            convertSet: access & exposes_1.access.SET
                ? async (entity, key, value, meta) => {
                    const payloadValue = (0, utils_1.getFromLookup)(value, lookup);
                    const payload = (0, utils_1.isString)(attribute)
                        ? { [attribute]: payloadValue }
                        : { [attribute.ID]: { value: payloadValue, type: attribute.type } };
                    await determineEndpoint(entity, meta, cluster).write(cluster, payload, zigbeeCommandOptions);
                    return { state: { [key]: value } };
                }
                : undefined,
            convertGet: access & exposes_1.access.GET
                ? async (entity, key, meta) => {
                    await determineEndpoint(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                }
                : undefined,
        },
    ];
    const configure = [setupConfigureForReporting(cluster, attribute, reporting, access)];
    return { exposes: [expose], fromZigbee, toZigbee, configure, isModernExtend: true };
}
function numeric(args) {
    const { name, cluster, attribute, description, zigbeeCommandOptions, unit, reporting, valueMin, valueMax, valueStep, valueIgnore, scale, label, entityCategory, precision, } = args;
    const endpoints = args.endpointNames;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const access = exposes_1.access[args.access ?? 'ALL'];
    const exposes = [];
    const createExpose = (endpoint) => {
        let expose = exposes_1.presets.numeric(name, access).withDescription(description);
        if (endpoint)
            expose = expose.withEndpoint(endpoint);
        if (unit)
            expose = expose.withUnit(unit);
        if (valueMin !== undefined)
            expose = expose.withValueMin(valueMin);
        if (valueMax !== undefined)
            expose = expose.withValueMax(valueMax);
        if (valueStep !== undefined)
            expose = expose.withValueStep(valueStep);
        if (label !== undefined)
            expose = expose.withLabel(label);
        if (entityCategory)
            expose = expose.withCategory(entityCategory);
        return expose;
    };
    // Generate for multiple endpoints only if required.
    if (!endpoints) {
        exposes.push(createExpose(undefined));
    }
    else {
        for (const endpoint of endpoints) {
            exposes.push(createExpose(endpoint));
        }
    }
    const fromZigbee = [
        {
            cluster: cluster.toString(),
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                if (attributeKey in msg.data) {
                    const endpoint = endpoints?.find((e) => (0, utils_1.getEndpointName)(msg, model, meta) === e);
                    if (endpoints && !endpoint) {
                        return;
                    }
                    let value = msg.data[attributeKey];
                    (0, utils_1.assertNumber)(value);
                    if (valueIgnore && valueIgnore.includes(value))
                        return;
                    if (scale !== undefined) {
                        value = typeof scale === 'number' ? value / scale : scale(value, 'from');
                    }
                    (0, utils_1.assertNumber)(value);
                    if (precision != null)
                        value = (0, utils_1.precisionRound)(value, precision);
                    const expose = exposes.length === 1 ? exposes[0] : exposes.find((e) => e.endpoint === endpoint);
                    return { [expose.property]: value };
                }
            },
        },
    ];
    const toZigbee = [
        {
            key: [name],
            convertSet: access & exposes_1.access.SET
                ? async (entity, key, value, meta) => {
                    (0, utils_1.assertNumber)(value, key);
                    let payloadValue = value;
                    if (scale !== undefined) {
                        payloadValue = typeof scale === 'number' ? payloadValue * scale : scale(payloadValue, 'to');
                    }
                    (0, utils_1.assertNumber)(payloadValue);
                    if (precision != null)
                        payloadValue = (0, utils_1.precisionRound)(payloadValue, precision);
                    const payload = (0, utils_1.isString)(attribute)
                        ? { [attribute]: payloadValue }
                        : { [attribute.ID]: { value: payloadValue, type: attribute.type } };
                    await determineEndpoint(entity, meta, cluster).write(cluster, payload, zigbeeCommandOptions);
                    return { state: { [key]: value } };
                }
                : undefined,
            convertGet: access & exposes_1.access.GET
                ? async (entity, key, meta) => {
                    await determineEndpoint(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                }
                : undefined,
        },
    ];
    const configure = [setupConfigureForReporting(cluster, attribute, reporting, access, endpoints)];
    return { exposes, fromZigbee, toZigbee, configure, isModernExtend: true };
}
function binary(args) {
    const { name, valueOn, valueOff, cluster, attribute, description, zigbeeCommandOptions, endpointName, reporting, entityCategory } = args;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const access = exposes_1.access[args.access ?? 'ALL'];
    let expose = exposes_1.presets.binary(name, access, valueOn[0], valueOff[0]).withDescription(description);
    if (endpointName)
        expose = expose.withEndpoint(endpointName);
    if (entityCategory)
        expose = expose.withCategory(entityCategory);
    const fromZigbee = [
        {
            cluster: cluster.toString(),
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                if (attributeKey in msg.data && (!endpointName || (0, utils_1.getEndpointName)(msg, model, meta) === endpointName)) {
                    return { [expose.property]: msg.data[attributeKey] === valueOn[1] ? valueOn[0] : valueOff[0] };
                }
            },
        },
    ];
    const toZigbee = [
        {
            key: [name],
            convertSet: access & exposes_1.access.SET
                ? async (entity, key, value, meta) => {
                    const payloadValue = value === valueOn[0] ? valueOn[1] : valueOff[1];
                    const payload = (0, utils_1.isString)(attribute)
                        ? { [attribute]: payloadValue }
                        : { [attribute.ID]: { value: payloadValue, type: attribute.type } };
                    await determineEndpoint(entity, meta, cluster).write(cluster, payload, zigbeeCommandOptions);
                    return { state: { [key]: value } };
                }
                : undefined,
            convertGet: access & exposes_1.access.GET
                ? async (entity, key, meta) => {
                    await determineEndpoint(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                }
                : undefined,
        },
    ];
    const configure = [setupConfigureForReporting(cluster, attribute, reporting, access)];
    return { exposes: [expose], fromZigbee, toZigbee, configure, isModernExtend: true };
}
function actionEnumLookup(args) {
    const { actionLookup: lookup, attribute, cluster, buttonLookup } = args;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const commands = args.commands || ['attributeReport', 'readResponse'];
    const parse = args.parse;
    let actions = Object.keys(lookup)
        .map((a) => (args.endpointNames ? args.endpointNames.map((e) => `${a}_${e}`) : [a]))
        .flat();
    // allows direct external input to be used by other extends in the same device
    if (args.extraActions)
        actions = actions.concat(args.extraActions);
    const expose = exposes_1.presets.enum('action', exposes_1.access.STATE, actions).withDescription('Triggered action (e.g. a button click)').withCategory('diagnostic');
    const fromZigbee = [
        {
            cluster: cluster.toString(),
            type: commands,
            convert: (model, msg, publish, options, meta) => {
                if (attributeKey in msg.data) {
                    let value = parse ? parse(msg, attributeKey) : msg.data[attributeKey];
                    value = (0, utils_1.getFromLookupByValue)(value, lookup);
                    // endpointNames is used when action endpoint names don't overlap with other endpoint names
                    if (args.endpointNames)
                        value = (0, utils_1.postfixWithEndpointName)(value, msg, model, meta);
                    // buttonLookup is used when action endpoint names overlap with other endpoint names
                    if (args.buttonLookup) {
                        const endpointName = (0, utils_1.getFromLookupByValue)(msg.endpoint.ID, buttonLookup);
                        value = `${value}_${endpointName}`;
                    }
                    return { [expose.property]: value };
                }
            },
        },
    ];
    return { exposes: [expose], fromZigbee, isModernExtend: true };
}
function quirkAddEndpointCluster(args) {
    const { endpointID, inputClusters, outputClusters } = args;
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            const endpoint = device.getEndpoint(endpointID);
            if (endpoint == undefined) {
                logger_1.logger.error(`Quirk: cannot add clusters to endpoint ${endpointID}, endpoint does not exist!`, 'zhc:quirkaddendpointcluster');
                return;
            }
            inputClusters?.forEach((cluster) => {
                const clusterID = (0, utils_1.isString)(cluster) ? zigbee_herdsman_1.Zcl.Utils.getCluster(cluster, device.manufacturerID, device.customClusters).ID : cluster;
                if (!endpoint.inputClusters.includes(clusterID)) {
                    logger_1.logger.debug(`Quirk: adding input cluster ${clusterID} to endpoint ${endpointID}.`, 'zhc:quirkaddendpointcluster');
                    endpoint.inputClusters.push(clusterID);
                }
            });
            outputClusters?.forEach((cluster) => {
                const clusterID = (0, utils_1.isString)(cluster) ? zigbee_herdsman_1.Zcl.Utils.getCluster(cluster, device.manufacturerID, device.customClusters).ID : cluster;
                if (!endpoint.outputClusters.includes(clusterID)) {
                    logger_1.logger.debug(`Quirk: adding output cluster ${clusterID} to endpoint ${endpointID}.`, 'zhc:quirkaddendpointcluster');
                    endpoint.outputClusters.push(clusterID);
                }
            });
            device.save();
        },
    ];
    return { configure, isModernExtend: true };
}
function quirkCheckinInterval(timeout) {
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            device.checkinInterval = typeof timeout == 'number' ? timeout : exports.TIME_LOOKUP[timeout];
            device.save();
        },
    ];
    return { configure, isModernExtend: true };
}
function reconfigureReportingsOnDeviceAnnounce() {
    const onEvent = async (type, data, device, options, state) => {
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
        }
    };
    return { onEvent, isModernExtend: true };
}
function deviceEndpoints(args) {
    const result = {
        meta: { multiEndpoint: true },
        endpoint: (d) => args.endpoints,
        isModernExtend: true,
    };
    if (args.multiEndpointSkip)
        result.meta.multiEndpointSkip = args.multiEndpointSkip;
    return result;
}
function deviceAddCustomCluster(clusterName, clusterDefinition) {
    const addCluster = (device) => {
        if (!device.customClusters[clusterName]) {
            device.addCustomCluster(clusterName, clusterDefinition);
        }
    };
    const onEvent = async (type, data, device, options, state) => addCluster(device);
    const configure = [async (device) => addCluster(device)];
    return { onEvent, configure, isModernExtend: true };
}
function ignoreClusterReport(args) {
    const fromZigbee = [
        {
            cluster: args.cluster.toString(),
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => { },
        },
    ];
    return { fromZigbee, isModernExtend: true };
}
function bindCluster(args) {
    const configure = [setupConfigureForBinding(args.cluster, args.clusterType, args.endpointNames)];
    return { configure, isModernExtend: true };
}
// #endregion
//# sourceMappingURL=modernExtend.js.map