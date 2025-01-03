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
const zigbee_herdsman_1 = require("zigbee-herdsman");
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const utils_1 = require("../lib/utils");
const e = exposes.presets;
const ea = exposes.access;
const switchTypesList = {
    switch: 0x00,
    'multi-click': 0x02,
};
const tzLocal = {
    tirouter: {
        key: ['transmit_power'],
        convertSet: async (entity, key, value, meta) => {
            await entity.write('genBasic', { 0x1337: { value, type: 0x28 } });
            return { state: { [key]: value } };
        },
        convertGet: async (entity, key, meta) => {
            await entity.read('genBasic', [0x1337]);
        },
    },
    multi_zig_sw_switch_type: {
        key: ['switch_type_1', 'switch_type_2', 'switch_type_3', 'switch_type_4'],
        convertGet: async (entity, key, meta) => {
            await entity.read('genOnOffSwitchCfg', ['switchType']);
        },
        convertSet: async (entity, key, value, meta) => {
            const data = (0, utils_1.getFromLookup)(value, switchTypesList);
            const payload = { switchType: data };
            await entity.write('genOnOffSwitchCfg', payload);
            return { state: { [`${key}`]: value } };
        },
    },
    ptvo_on_off: {
        key: ['state'],
        convertSet: async (entity, key, value, meta) => {
            return await toZigbee_1.default.on_off.convertSet(entity, key, value, meta);
        },
        convertGet: async (entity, key, meta) => {
            const cluster = 'genOnOff';
            if ((0, utils_1.isEndpoint)(entity) && (entity.supportsInputCluster(cluster) || entity.supportsOutputCluster(cluster))) {
                return await toZigbee_1.default.on_off.convertGet(entity, key, meta);
            }
            return;
        },
    },
};
const fzLocal = {
    tirouter: {
        cluster: 'genBasic',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = { linkquality: msg.linkquality };
            if (msg.data['4919'])
                result['transmit_power'] = msg.data['4919'];
            return result;
        },
    },
    humidity2: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            // multi-endpoint version based on the stastard onverter 'fz.humidity'
            const humidity = parseFloat(msg.data['measuredValue']) / 100.0;
            // https://github.com/Koenkk/zigbee2mqtt/issues/798
            // Sometimes the sensor publishes non-realistic vales, it should only publish message
            // in the 0 - 100 range, don't produce messages beyond these values.
            if (humidity >= 0 && humidity <= 100) {
                const multiEndpoint = model.meta && model.meta.multiEndpoint !== undefined && model.meta.multiEndpoint;
                const property = multiEndpoint ? (0, utils_1.postfixWithEndpointName)('humidity', msg, model, meta) : 'humidity';
                return { [property]: humidity };
            }
        },
    },
    illuminance2: {
        cluster: 'msIlluminanceMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            // multi-endpoint version based on the stastard onverter 'fz.illuminance'
            // DEPRECATED: only return lux here (change illuminance_lux -> illuminance)
            const illuminance = msg.data['measuredValue'];
            const illuminanceLux = illuminance === 0 ? 0 : Math.pow(10, (illuminance - 1) / 10000);
            const multiEndpoint = model.meta && model.meta.multiEndpoint !== undefined && model.meta.multiEndpoint;
            const property1 = multiEndpoint ? (0, utils_1.postfixWithEndpointName)('illuminance', msg, model, meta) : 'illuminance';
            const property2 = multiEndpoint ? (0, utils_1.postfixWithEndpointName)('illuminance_lux', msg, model, meta) : 'illuminance_lux';
            return { [property1]: illuminance, [property2]: illuminanceLux };
        },
    },
    pressure2: {
        cluster: 'msPressureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            // multi-endpoint version based on the stastard onverter 'fz.pressure'
            let pressure = 0;
            if (msg.data.scaledValue !== undefined) {
                const scale = msg.endpoint.getClusterAttributeValue('msPressureMeasurement', 'scale');
                pressure = msg.data['scaledValue'] / Math.pow(10, scale) / 100.0; // convert to hPa
            }
            else {
                pressure = parseFloat(msg.data['measuredValue']);
            }
            const multiEndpoint = model.meta && model.meta.multiEndpoint !== undefined && model.meta.multiEndpoint;
            const property = multiEndpoint ? (0, utils_1.postfixWithEndpointName)('pressure', msg, model, meta) : 'pressure';
            return { [property]: pressure };
        },
    },
    multi_zig_sw_battery: {
        cluster: 'genPowerCfg',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const voltage = msg.data['batteryVoltage'] * 100;
            const battery = (voltage - 2200) / 8;
            return { battery: battery > 100 ? 100 : battery, voltage: voltage };
        },
    },
    multi_zig_sw_switch_buttons: {
        cluster: 'genMultistateInput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const button = (0, utils_1.getKey)(model.endpoint?.(msg.device) ?? {}, msg.endpoint.ID);
            const actionLookup = { 0: 'release', 1: 'single', 2: 'double', 3: 'triple', 4: 'hold' };
            const value = msg.data['presentValue'];
            const action = actionLookup[value];
            return { action: button + '_' + action };
        },
    },
    multi_zig_sw_switch_config: {
        cluster: 'genOnOffSwitchCfg',
        type: ['readResponse', 'attributeReport'],
        convert: (model, msg, publish, options, meta) => {
            const channel = (0, utils_1.getKey)(model.endpoint?.(msg.device) ?? {}, msg.endpoint.ID);
            const { switchType } = msg.data;
            return { [`switch_type_${channel}`]: (0, utils_1.getKey)(switchTypesList, switchType) };
        },
    },
};
function ptvoGetMetaOption(device, key, defaultValue) {
    if (device != null) {
        const value = device.meta[key];
        if (value === undefined) {
            return defaultValue;
        }
        else {
            return value;
        }
    }
    return defaultValue;
}
function ptvoSetMetaOption(device, key, value) {
    if (device != null && key != null) {
        device.meta[key] = value;
    }
}
function ptvoAddStandardExposes(endpoint, expose, options, deviceOptions) {
    const epId = endpoint.ID;
    const epName = `l${epId}`;
    if (endpoint.supportsInputCluster('lightingColorCtrl')) {
        expose.push(e.light_brightness_colorxy().withEndpoint(epName));
        options['exposed_onoff'] = true;
        options['exposed_analog'] = true;
        options['exposed_colorcontrol'] = true;
    }
    else if (endpoint.supportsInputCluster('genLevelCtrl')) {
        expose.push(e.light_brightness().withEndpoint(epName));
        options['exposed_onoff'] = true;
        options['exposed_analog'] = true;
        options['exposed_levelcontrol'] = true;
    }
    if (endpoint.supportsInputCluster('genOnOff')) {
        if (!options['exposed_onoff']) {
            expose.push(e.switch().withEndpoint(epName));
        }
    }
    if (endpoint.supportsInputCluster('genAnalogInput') || endpoint.supportsOutputCluster('genAnalogInput')) {
        if (!options['exposed_analog']) {
            options['exposed_analog'] = true;
            expose.push(e.text(epName, ea.ALL).withEndpoint(epName).withProperty(epName).withDescription('State or sensor value'));
        }
    }
    if (endpoint.supportsInputCluster('msTemperatureMeasurement')) {
        expose.push(e.temperature().withEndpoint(epName));
    }
    if (endpoint.supportsInputCluster('msRelativeHumidity')) {
        expose.push(e.humidity().withEndpoint(epName));
    }
    if (endpoint.supportsInputCluster('msPressureMeasurement')) {
        expose.push(e.pressure().withEndpoint(epName));
    }
    if (endpoint.supportsInputCluster('msIlluminanceMeasurement')) {
        expose.push(e.illuminance().withEndpoint(epName));
    }
    if (endpoint.supportsInputCluster('msCO2')) {
        expose.push(e.co2());
    }
    if (endpoint.supportsInputCluster('pm25Measurement')) {
        expose.push(e.pm25());
    }
    if (endpoint.supportsInputCluster('haElectricalMeasurement')) {
        // haElectricalMeasurement may expose only one value defined explicitly
        if (!(options['exposed_voltage'] || options['exposed_current'] || options['exposed_power'])) {
            expose.push(e.voltage().withEndpoint(epName));
            expose.push(e.current().withEndpoint(epName));
            expose.push(e.power().withEndpoint(epName));
        }
    }
    if (endpoint.supportsInputCluster('seMetering')) {
        if (!options['exposed_energy']) {
            expose.push(e.energy().withEndpoint(epName));
        }
    }
    if (endpoint.supportsInputCluster('genPowerCfg')) {
        deviceOptions['expose_battery'] = true;
    }
    if (endpoint.supportsInputCluster('genMultistateInput') || endpoint.supportsOutputCluster('genMultistateInput')) {
        deviceOptions['expose_action'] = true;
    }
}
const definitions = [
    {
        zigbeeModel: ['ti.router'],
        model: 'ti.router',
        vendor: 'Custom devices (DiY)',
        description: 'Texas Instruments router',
        fromZigbee: [fzLocal.tirouter],
        toZigbee: [tzLocal.tirouter],
        exposes: [
            e
                .numeric('transmit_power', ea.ALL)
                .withValueMin(-20)
                .withValueMax(20)
                .withValueStep(1)
                .withUnit('dBm')
                .withDescription('Transmit power, supported from firmware 20221102. The max for CC1352 is 20 dBm and 5 dBm for CC2652' +
                ' (any higher value is converted to 5dBm)'),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(8);
            const payload = [{ attribute: 'zclVersion', minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 }];
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
            await endpoint.configureReporting('genBasic', payload);
        },
    },
    {
        zigbeeModel: ['SLZB-06p7', 'SLZB-07', 'SLZB-0xp7'],
        model: 'SLZB-06p7',
        vendor: 'SMLIGHT',
        description: 'Router',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        exposes: [],
        whiteLabel: [
            { vendor: 'SMLIGHT', model: 'SLZB-07', description: 'Router', fingerprint: [{ modelID: 'SLZB-07' }] },
            { vendor: 'SMLIGHT', model: 'SLZB-0xp7', description: 'Router', fingerprint: [{ modelID: 'SLZB-0xp7' }] },
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.endpoints[0];
            const payload = [{ attribute: 'zclVersion', minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 }];
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
            await endpoint.configureReporting('genBasic', payload);
        },
    },
    {
        zigbeeModel: ['lumi.router'],
        model: 'CC2530.ROUTER',
        vendor: 'Custom devices (DiY)',
        description: 'CC2530 router',
        fromZigbee: [fromZigbee_1.default.CC2530ROUTER_led, fromZigbee_1.default.CC2530ROUTER_meta, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [toZigbee_1.default.ptvo_switch_trigger],
        exposes: [e.binary('led', ea.STATE, true, false)],
    },
    {
        zigbeeModel: ['cc2538.router.v1'],
        model: 'CC2538.ROUTER.V1',
        vendor: 'Custom devices (DiY)',
        description: 'MODKAM stick СС2538 router',
        fromZigbee: [fromZigbee_1.default.ignore_basic_report],
        toZigbee: [],
        exposes: [],
    },
    {
        zigbeeModel: ['cc2538.router.v2'],
        model: 'CC2538.ROUTER.V2',
        vendor: 'Custom devices (DiY)',
        description: 'MODKAM stick СС2538 router with temperature sensor',
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.device_temperature],
        toZigbee: [],
        exposes: [e.device_temperature()],
    },
    {
        zigbeeModel: ['ptvo.switch'],
        model: 'ptvo.switch',
        vendor: 'Custom devices (DiY)',
        description: 'Multi-functional device',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.on_off,
            fromZigbee_1.default.ptvo_multistate_action,
            legacy.fz.ptvo_switch_buttons,
            fromZigbee_1.default.ptvo_switch_uart,
            fromZigbee_1.default.ptvo_switch_analog_input,
            fromZigbee_1.default.brightness,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.temperature,
            fzLocal.humidity2,
            fzLocal.pressure2,
            fzLocal.illuminance2,
            fromZigbee_1.default.electrical_measurement,
            fromZigbee_1.default.metering,
            fromZigbee_1.default.co2,
        ],
        toZigbee: [toZigbee_1.default.ptvo_switch_trigger, toZigbee_1.default.ptvo_switch_uart, toZigbee_1.default.ptvo_switch_analog_input, toZigbee_1.default.ptvo_switch_light_brightness, tzLocal.ptvo_on_off],
        exposes: (device, options) => {
            const expose = [];
            const exposeDeviceOptions = {};
            const deviceConfig = ptvoGetMetaOption(device, 'device_config', '');
            if (deviceConfig === '') {
                if (device != null && device.endpoints) {
                    for (const endpoint of device.endpoints) {
                        const exposeEpOptions = {};
                        ptvoAddStandardExposes(endpoint, expose, exposeEpOptions, exposeDeviceOptions);
                    }
                }
                else {
                    // fallback code
                    for (let epId = 1; epId <= 8; epId++) {
                        const epName = `l${epId}`;
                        expose.push(e.text(epName, ea.ALL).withEndpoint(epName).withProperty(epName).withDescription('State or sensor value'));
                        expose.push(e.switch().withEndpoint(epName));
                    }
                }
            }
            else {
                // device configuration description from a device
                const deviceConfigArray = deviceConfig.split(/[\r\n]+/);
                const allEndpoints = {};
                const allEndpointsSorted = [];
                let epConfig;
                for (let i = 0; i < deviceConfigArray.length; i++) {
                    epConfig = deviceConfigArray[i];
                    const matches = epConfig.match(/^([0-9A-F]+)/);
                    if (!matches || matches.length == 0) {
                        continue;
                    }
                    const epId = parseInt(matches[0], 16);
                    const epId2 = epId < 10 ? '0' + epId : epId;
                    epConfig = epConfig.replace(/^[0-9A-F]+/, epId2);
                    allEndpoints[epId] = '1';
                    allEndpointsSorted.push(epConfig);
                }
                for (const endpoint of device.endpoints) {
                    if (allEndpoints[endpoint.ID] !== undefined) {
                        continue;
                    }
                    epConfig = endpoint.ID.toString();
                    if (endpoint.ID < 10) {
                        epConfig = '0' + epConfig;
                    }
                    allEndpointsSorted.push(epConfig);
                }
                allEndpointsSorted.sort();
                for (let i = 0; i < allEndpointsSorted.length; i++) {
                    epConfig = allEndpointsSorted[i];
                    const epId = parseInt(epConfig.substr(0, 2), 10);
                    epConfig = epConfig.substring(2);
                    const epName = `l${epId}`;
                    const epValueAccessRights = epConfig.substr(0, 1);
                    const epStateType = epValueAccessRights === 'W' || epValueAccessRights === '*' ? ea.STATE_SET : ea.STATE;
                    const valueConfig = epConfig.substr(1);
                    const valueConfigItems = valueConfig ? valueConfig.split(',') : [];
                    let valueId = valueConfigItems[0] ? valueConfigItems[0] : '';
                    let valueDescription = valueConfigItems[1] ? valueConfigItems[1] : '';
                    let valueUnit = valueConfigItems[2] !== undefined ? valueConfigItems[2] : '';
                    if (exposeDeviceOptions[epName] === undefined) {
                        exposeDeviceOptions[epName] = {};
                    }
                    const exposeEpOptions = exposeDeviceOptions[epName];
                    if (valueId === '*') {
                        // GPIO output (Generic)
                        exposeEpOptions['exposed_onoff'] = true;
                        expose.push(e.switch().withEndpoint(epName));
                    }
                    else if (valueId === '#') {
                        // GPIO state (contact, gas, noise, occupancy, presence, smoke, sos, tamper, vibration, water leak)
                        exposeEpOptions['exposed_onoff'] = true;
                        let exposeObj = undefined;
                        switch (valueDescription) {
                            case 'g':
                                exposeObj = e.gas();
                                break;
                            case 'n':
                                exposeObj = e.noise_detected();
                                break;
                            case 'o':
                                exposeObj = e.occupancy();
                                break;
                            case 'p':
                                exposeObj = e.presence();
                                break;
                            case 'm':
                                exposeObj = e.smoke();
                                break;
                            case 's':
                                exposeObj = e.sos();
                                break;
                            case 't':
                                exposeObj = e.tamper();
                                break;
                            case 'v':
                                exposeObj = e.vibration();
                                break;
                            case 'w':
                                exposeObj = e.water_leak();
                                break;
                            default: // 'c'
                                exposeObj = e.contact();
                        }
                        expose.push(exposeObj.withProperty('state').withEndpoint(epName));
                    }
                    else if (valueConfigItems.length > 0) {
                        let valueName = undefined; // name in Z2M
                        let valueNumIndex = undefined;
                        const idxPos = valueId.search(/(\d+)$/);
                        if (valueId.startsWith('mcpm') || valueId.startsWith('ncpm')) {
                            const num = parseInt(valueId.substr(4, 1), 16);
                            valueName = valueId.substr(0, 4) + num;
                        }
                        else if (idxPos >= 0) {
                            valueNumIndex = valueId.substr(idxPos);
                            valueId = valueId.substr(0, idxPos);
                        }
                        // analog value
                        // 1: value name (if empty, use the EP name)
                        // 2: description (if empty or undefined, use the value name)
                        // 3: units (if undefined, use the key name)
                        const infoLookup = {
                            C: 'temperature',
                            '%': 'humidity',
                            m: 'altitude',
                            Pa: 'pressure',
                            ppm: 'quality',
                            psize: 'particle_size',
                            V: 'voltage',
                            A: 'current',
                            Wh: 'energy',
                            W: 'power',
                            Hz: 'frequency',
                            pf: 'power_factor',
                            lx: 'illuminance_lux',
                        };
                        valueName = valueName !== undefined ? valueName : infoLookup[valueId];
                        if (valueName === undefined && valueNumIndex) {
                            valueName = 'val' + valueNumIndex;
                        }
                        if (valueName) {
                            exposeEpOptions['exposed_' + valueName] = true;
                        }
                        valueName = valueName === undefined ? epName : valueName + '_' + epName;
                        if (valueDescription === undefined || valueDescription === '') {
                            if (infoLookup[valueId]) {
                                valueDescription = infoLookup[valueId];
                                valueDescription = valueDescription.replace('_', ' ');
                            }
                            else {
                                valueDescription = 'Sensor value';
                            }
                        }
                        valueDescription = valueDescription.substring(0, 1).toUpperCase() + valueDescription.substring(1);
                        if (valueNumIndex) {
                            valueDescription = valueDescription + ' ' + valueNumIndex;
                        }
                        if ((valueUnit === undefined || valueUnit === '') && infoLookup[valueId]) {
                            valueUnit = valueId;
                        }
                        exposeEpOptions['exposed_analog'] = true;
                        expose.push(e
                            .numeric(valueName, epStateType)
                            .withValueMin(-9999999)
                            .withValueMax(9999999)
                            .withValueStep(1)
                            .withDescription(valueDescription)
                            .withUnit(valueUnit));
                    }
                    const epConfigNext = allEndpointsSorted[i + 1] || '-1';
                    const epIdNext = parseInt(epConfigNext.substr(0, 2), 10);
                    if (epIdNext !== epId) {
                        const endpoint = device.getEndpoint(epId);
                        if (!endpoint) {
                            continue;
                        }
                        ptvoAddStandardExposes(endpoint, expose, exposeEpOptions, exposeDeviceOptions);
                    }
                }
            }
            if (exposeDeviceOptions['expose_action']) {
                expose.push(e.action(['single', 'double', 'triple', 'hold', 'release']));
            }
            if (exposeDeviceOptions['expose_battery']) {
                expose.push(e.battery());
            }
            expose.push(e.linkquality());
            return expose;
        },
        meta: { multiEndpoint: true, tuyaThermostatPreset: legacy.fz /* for subclassed custom converters */ },
        endpoint: (device) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const endpointList = [];
            const deviceConfig = ptvoGetMetaOption(device, 'device_config', '');
            if (deviceConfig === '') {
                if (device != null && device.endpoints) {
                    for (const endpoint of device.endpoints) {
                        const epId = endpoint.ID;
                        const epName = `l${epId}`;
                        endpointList[epName] = epId;
                    }
                }
                else {
                    // fallback code
                    for (let epId = 1; epId <= 8; epId++) {
                        const epName = `l${epId}`;
                        endpointList[epName] = epId;
                    }
                }
            }
            else {
                for (let i = 0; i < deviceConfig.length; i++) {
                    const epConfig = deviceConfig.charCodeAt(i);
                    if (epConfig === 0x20) {
                        continue;
                    }
                    const epId = i + 1;
                    const epName = `l${epId}`;
                    endpointList[epName] = epId;
                }
            }
            endpointList['action'] = 1;
            return endpointList;
        },
        configure: async (device, coordinatorEndpoint) => {
            if (device != null) {
                const controlEp = device.getEndpoint(1);
                if (controlEp != null) {
                    try {
                        let deviceConfig = await controlEp.read('genBasic', [32768]);
                        if (deviceConfig) {
                            deviceConfig = deviceConfig['32768'];
                            ptvoSetMetaOption(device, 'device_config', deviceConfig);
                            device.save();
                        }
                    }
                    catch {
                        /* do nothing */
                    }
                }
                for (const endpoint of device.endpoints) {
                    if (endpoint.supportsInputCluster('haElectricalMeasurement')) {
                        endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', {
                            dcCurrentDivisor: 1000,
                            dcCurrentMultiplier: 1,
                            dcPowerDivisor: 10,
                            dcPowerMultiplier: 1,
                            dcVoltageDivisor: 100,
                            dcVoltageMultiplier: 1,
                            acVoltageDivisor: 100,
                            acVoltageMultiplier: 1,
                            acCurrentDivisor: 1000,
                            acCurrentMultiplier: 1,
                            acPowerDivisor: 10,
                            acPowerMultiplier: 1,
                        });
                    }
                    if (endpoint.supportsInputCluster('seMetering')) {
                        endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000, multiplier: 1 });
                    }
                }
            }
        },
    },
    {
        zigbeeModel: ['DNCKAT_D001'],
        model: 'DNCKATSD001',
        vendor: 'Custom devices (DiY)',
        description: 'DNCKAT single key wired wall dimmable light switch',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['DNCKAT_S001'],
        model: 'DNCKATSW001',
        vendor: 'Custom devices (DiY)',
        description: 'DNCKAT single key wired wall light switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['DNCKAT_S002'],
        model: 'DNCKATSW002',
        vendor: 'Custom devices (DiY)',
        description: 'DNCKAT double key wired wall light switch',
        fromZigbee: [fromZigbee_1.default.DNCKAT_S00X_buttons],
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, right: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'right'] })],
        exposes: [e.action(['release_left', 'hold_left', 'release_right', 'hold_right'])],
    },
    {
        zigbeeModel: ['DNCKAT_S003'],
        model: 'DNCKATSW003',
        vendor: 'Custom devices (DiY)',
        description: 'DNCKAT triple key wired wall light switch',
        fromZigbee: [fromZigbee_1.default.DNCKAT_S00X_buttons],
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, center: 2, right: 3 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'center', 'right'] })],
        exposes: [e.action(['release_left', 'hold_left', 'release_right', 'hold_right', 'release_center', 'hold_center'])],
    },
    {
        zigbeeModel: ['DNCKAT_S004'],
        model: 'DNCKATSW004',
        vendor: 'Custom devices (DiY)',
        description: 'DNCKAT quadruple key wired wall light switch',
        fromZigbee: [fromZigbee_1.default.DNCKAT_S00X_buttons],
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { bottom_left: 1, bottom_right: 2, top_left: 3, top_right: 4 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['bottom_left', 'bottom_right', 'top_left', 'top_right'] }),
        ],
        exposes: [
            e.action([
                'release_bottom_left',
                'hold_bottom_left',
                'release_bottom_right',
                'hold_bottom_right',
                'release_top_left',
                'hold_top_left',
                'release_top_right',
                'hold_top_right',
            ]),
        ],
    },
    {
        zigbeeModel: ['ZigUP'],
        model: 'ZigUP',
        vendor: 'Custom devices (DiY)',
        description: 'CC2530 based ZigBee relais, switch, sensor and router',
        fromZigbee: [fromZigbee_1.default.ZigUP],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.light_color, toZigbee_1.default.ZigUP_lock],
        exposes: [e.switch()],
    },
    {
        zigbeeModel: ['ZWallRemote0'],
        model: 'ZWallRemote0',
        vendor: 'Custom devices (DiY)',
        description: 'Matts Wall Switch Remote',
        fromZigbee: [fromZigbee_1.default.command_toggle],
        toZigbee: [],
        exposes: [e.action(['toggle'])],
    },
    {
        zigbeeModel: ['ZeeFlora'],
        model: 'ZeeFlora',
        vendor: 'Custom devices (DiY)',
        description: 'Flower sensor with rechargeable battery',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.illuminance, fromZigbee_1.default.soil_moisture, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const firstEndpoint = device.getEndpoint(1);
            await reporting.bind(firstEndpoint, coordinatorEndpoint, [
                'genPowerCfg',
                'msTemperatureMeasurement',
                'msIlluminanceMeasurement',
                'msSoilMoisture',
            ]);
            const overrides = { min: 0, max: 3600, change: 0 };
            await reporting.batteryVoltage(firstEndpoint, overrides);
            await reporting.batteryPercentageRemaining(firstEndpoint, overrides);
            await reporting.temperature(firstEndpoint, overrides);
            await reporting.illuminance(firstEndpoint, overrides);
            await reporting.soil_moisture(firstEndpoint, overrides);
        },
        exposes: [e.soil_moisture(), e.battery(), e.illuminance(), e.temperature()],
    },
    {
        zigbeeModel: ['UT-01'],
        model: 'EFR32MG21.Router.1',
        vendor: 'Custom devices (DiY)',
        description: 'EFR32MG21 Zigbee bridge router',
        extend: [(0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
    {
        zigbeeModel: ['UT-02'],
        model: 'EFR32MG21.Router.2',
        vendor: 'Custom devices (DiY)',
        description: 'EFR32MG21 router',
        fromZigbee: [],
        toZigbee: [],
        exposes: [],
    },
    {
        zigbeeModel: ['b-parasite'],
        model: 'b-parasite',
        vendor: 'Custom devices (DiY)',
        description: 'b-parasite open source soil moisture sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.battery, fromZigbee_1.default.soil_moisture, fromZigbee_1.default.illuminance],
        toZigbee: [],
        exposes: [e.temperature(), e.humidity(), e.battery(), e.soil_moisture(), e.illuminance_lux()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(10);
            await reporting.bind(endpoint, coordinatorEndpoint, [
                'genPowerCfg',
                'msTemperatureMeasurement',
                'msRelativeHumidity',
                'msSoilMoisture',
                'msIlluminanceMeasurement',
            ]);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.temperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.soil_moisture(endpoint);
            await reporting.illuminance(endpoint);
        },
    },
    {
        zigbeeModel: ['MULTI-ZIG-SW'],
        model: 'MULTI-ZIG-SW',
        vendor: 'smarthjemmet.dk',
        description: 'Multi switch from Smarthjemmet.dk',
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, fzLocal.multi_zig_sw_switch_buttons, fzLocal.multi_zig_sw_battery, fzLocal.multi_zig_sw_switch_config],
        toZigbee: [tzLocal.multi_zig_sw_switch_type],
        exposes: [
            ...[e.enum('switch_type_1', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_1')],
            ...[e.enum('switch_type_2', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_2')],
            ...[e.enum('switch_type_3', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_3')],
            ...[e.enum('switch_type_4', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_4')],
            e.battery(),
            e.action(['single', 'double', 'triple', 'hold', 'release']),
            e.battery_voltage(),
        ],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { button_1: 2, button_2: 3, button_3: 4, button_4: 5 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genBasic', ['modelId', 'swBuildId', 'powerSource']);
        },
    },
    {
        // https://github.com/devbis/z03mmc/
        zigbeeModel: ['LYWSD03MMC'],
        model: 'LYWSD03MMC',
        vendor: 'Custom devices (DiY)',
        description: 'Xiaomi temperature & humidity sensor with custom firmware',
        extend: [
            (0, modernExtend_1.quirkAddEndpointCluster)({
                endpointID: 1,
                outputClusters: [],
                inputClusters: ['genPowerCfg', 'msTemperatureMeasurement', 'msRelativeHumidity', 'hvacUserInterfaceCfg'],
            }),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.temperature)({ reporting: { min: 10, max: 300, change: 10 } }),
            (0, modernExtend_1.humidity)({ reporting: { min: 10, max: 300, change: 50 } }),
            (0, modernExtend_1.enumLookup)({
                name: 'temperature_display_mode',
                lookup: { celsius: 0, fahrenheit: 1 },
                cluster: 'hvacUserInterfaceCfg',
                attribute: 'tempDisplayMode',
                description: 'The units of the temperature displayed on the device screen.',
            }),
            (0, modernExtend_1.binary)({
                name: 'show_smiley',
                valueOn: ['SHOW', 1],
                valueOff: ['HIDE', 0],
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0010, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
                description: 'Whether to show a smiley on the device screen.',
            }),
            (0, modernExtend_1.binary)({
                name: 'enable_display',
                valueOn: ['ON', 1],
                valueOff: ['OFF', 0],
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0011, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
                description: 'Whether to turn display on/off.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'temperature_calibration',
                unit: '°C',
                cluster: 'msTemperatureMeasurement',
                attribute: { ID: 0x0010, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -100.0,
                valueMax: 100.0,
                valueStep: 0.01,
                scale: 100,
                description: 'The temperature calibration offset is set in 0.01° steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'humidity_calibration',
                unit: '%',
                cluster: 'msRelativeHumidity',
                attribute: { ID: 0x0010, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -100.0,
                valueMax: 100.0,
                valueStep: 0.01,
                scale: 100,
                description: 'The humidity calibration offset is set in 0.01 % steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_min',
                unit: '°C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0102, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -100.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Temperature minimum, in 0.01°C steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_max',
                unit: '°C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0103, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -100.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Temperature maximum, in 0.01°C steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_min',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0104, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                valueMin: 0.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Humidity minimum, in 0.01% steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_max',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0105, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                valueMin: 0.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Humidity maximum, in 0.01% steps.',
            }),
        ],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const bindClusters = ['msTemperatureMeasurement', 'msRelativeHumidity', 'genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, bindClusters);
            await reporting.temperature(endpoint, { min: 10, max: 300, change: 10 });
            await reporting.humidity(endpoint, { min: 10, max: 300, change: 50 });
            await reporting.batteryPercentageRemaining(endpoint);
            try {
                await endpoint.read('hvacThermostat', [0x0010, 0x0011, 0x0102, 0x0103, 0x0104, 0x0105]);
                await endpoint.read('msTemperatureMeasurement', [0x0010]);
                await endpoint.read('msRelativeHumidity', [0x0010]);
            }
            catch {
                /* backward compatibility */
            }
        },
    },
    {
        zigbeeModel: ['MHO-C401N'],
        model: 'MHO-C401N',
        vendor: 'Custom devices (DiY)',
        description: 'Xiaomi temperature & humidity sensor with custom firmware',
        extend: [
            (0, modernExtend_1.quirkAddEndpointCluster)({
                endpointID: 1,
                outputClusters: ['hvacUserInterfaceCfg'],
                inputClusters: ['genPowerCfg', 'msTemperatureMeasurement', 'msRelativeHumidity', 'hvacUserInterfaceCfg'],
            }),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.temperature)({ reporting: { min: 10, max: 300, change: 10 } }),
            (0, modernExtend_1.humidity)({ reporting: { min: 10, max: 300, change: 50 } }),
            // Temperature display and show smile.
            // For details, see: https://github.com/pvvx/ZigbeeTLc/issues/28#issue-2033984519
            (0, modernExtend_1.enumLookup)({
                name: 'temperature_display_mode',
                lookup: { celsius: 0, fahrenheit: 1 },
                cluster: 'hvacUserInterfaceCfg',
                attribute: 'tempDisplayMode',
                description: 'The units of the temperature displayed on the device screen.',
            }),
            (0, modernExtend_1.binary)({
                name: 'show_smile',
                valueOn: ['HIDE', 1],
                valueOff: ['SHOW', 0],
                cluster: 'hvacUserInterfaceCfg',
                attribute: 'programmingVisibility',
                description: 'Whether to show a smile on the device screen.',
            }),
            // Setting offsets for temperature and humidity.
            // For details, see: https://github.com/pvvx/ZigbeeTLc/issues/30
            (0, modernExtend_1.numeric)({
                name: 'temperature_calibration',
                unit: 'C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0100, type: 40 },
                valueMin: -12.7,
                valueMax: 12.7,
                valueStep: 0.1,
                scale: 10,
                description: 'The temperature calibration, in 0.1° steps. Requires v0.1.1.6 or newer.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'humidity_calibration',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0101, type: 40 },
                valueMin: -12.7,
                valueMax: 12.7,
                valueStep: 0.1,
                scale: 10,
                description: 'The humidity offset is set in 0.1 % steps. Requires v0.1.1.6 or newer.',
            }),
            // Comfort parameters.
            // For details, see: https://github.com/pvvx/ZigbeeTLc/issues/28#issuecomment-1855763432
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_min',
                unit: 'C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0102, type: 40 },
                valueMin: -127,
                valueMax: 127,
                description: 'Comfort parameters/Temperature minimum, in 1° steps. Requires v0.1.1.7 or newer.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_max',
                unit: 'C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0103, type: 40 },
                valueMin: -127,
                valueMax: 127,
                description: 'Comfort parameters/Temperature maximum, in 1° steps. Requires v0.1.1.7 or newer.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_min',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0104, type: 32 },
                valueMin: 0,
                valueMax: 100,
                description: 'Comfort parameters/Humidity minimum, in 1% steps. Requires v0.1.1.7 or newer.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_max',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0105, type: 32 },
                valueMin: 0,
                valueMax: 100,
                description: 'Comfort parameters/Humidity maximum, in 1% steps. Requires v0.1.1.7 or newer.',
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['MHO-C401N-z'],
        model: 'MHO-C401N-z',
        vendor: 'Xiaomi',
        description: 'E-Ink temperature & humidity sensor with custom firmware (pvxx/ZigbeeTLc)',
        extend: [
            (0, modernExtend_1.quirkAddEndpointCluster)({
                endpointID: 1,
                outputClusters: [],
                inputClusters: ['genPowerCfg', 'msTemperatureMeasurement', 'msRelativeHumidity', 'hvacUserInterfaceCfg'],
            }),
            (0, modernExtend_1.battery)({ percentage: true }),
            (0, modernExtend_1.temperature)({ reporting: { min: 10, max: 300, change: 10 }, access: 'STATE' }),
            (0, modernExtend_1.humidity)({ reporting: { min: 2, max: 300, change: 50 }, access: 'STATE' }),
            (0, modernExtend_1.enumLookup)({
                name: 'temperature_display_mode',
                lookup: { celsius: 0, fahrenheit: 1 },
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
                description: 'The units of the temperature displayed on the device screen.',
            }),
            (0, modernExtend_1.binary)({
                name: 'smiley',
                valueOn: ['SHOW', 0],
                valueOff: ['HIDE', 1],
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
                description: 'Whether to show a smiley on the device screen.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'temperature_calibration',
                unit: '°C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0100, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -12.7,
                valueMax: 12.7,
                valueStep: 0.01,
                scale: 10,
                description: 'The temperature calibration, in 0.01° steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'humidity_calibration',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0101, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -12.7,
                valueMax: 12.7,
                valueStep: 0.01,
                scale: 10,
                description: 'The humidity offset is set in 0.01 % steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_min',
                unit: '°C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0102, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -127.0,
                valueMax: 127.0,
                scale: 100,
                description: 'Comfort parameters/Temperature minimum, in 1°C steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_temperature_max',
                unit: '°C',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0103, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                valueMin: -127.0,
                valueMax: 127.0,
                scale: 100,
                description: 'Comfort parameters/Temperature maximum, in 1°C steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_min',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0104, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                valueMin: 0.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Humidity minimum, in 1% steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'comfort_humidity_max',
                unit: '%',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0105, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                valueMin: 0.0,
                valueMax: 100.0,
                scale: 100,
                description: 'Comfort parameters/Humidity maximum, in 1% steps.',
            }),
            (0, modernExtend_1.numeric)({
                name: 'measurement_interval',
                unit: 's',
                cluster: 'hvacUserInterfaceCfg',
                attribute: { ID: 0x0107, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                valueMin: 3,
                valueMax: 255,
                description: 'Measurement interval, default 10 seconds.',
            }),
        ],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            const bindClusters = ['msTemperatureMeasurement', 'msRelativeHumidity', 'genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, bindClusters);
            await reporting.temperature(endpoint, { min: 10, max: 300, change: 10 });
            await reporting.humidity(endpoint, { min: 10, max: 300, change: 50 });
            await reporting.batteryPercentageRemaining(endpoint);
            try {
                await endpoint.read('hvacThermostat', [0x0010, 0x0011, 0x0102, 0x0103, 0x0104, 0x0105, 0x0107]);
                await endpoint.read('msTemperatureMeasurement', [0x0010]);
                await endpoint.read('msRelativeHumidity', [0x0010]);
            }
            catch {
                /* backward compatibility */
            }
        },
    },
    {
        zigbeeModel: ['QUAD-ZIG-SW'],
        model: 'QUAD-ZIG-SW',
        vendor: 'smarthjemmet.dk',
        description: 'FUGA compatible switch from Smarthjemmet.dk',
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, fzLocal.multi_zig_sw_switch_buttons, fzLocal.multi_zig_sw_battery, fzLocal.multi_zig_sw_switch_config],
        toZigbee: [tzLocal.multi_zig_sw_switch_type],
        exposes: [
            ...[e.enum('switch_type_1', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_1')],
            ...[e.enum('switch_type_2', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_2')],
            ...[e.enum('switch_type_3', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_3')],
            ...[e.enum('switch_type_4', exposes.access.ALL, Object.keys(switchTypesList)).withEndpoint('button_4')],
            e.battery(),
            e.action(['single', 'double', 'triple', 'hold', 'release']),
            e.battery_voltage(),
        ],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { button_1: 2, button_2: 3, button_3: 4, button_4: 5 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genBasic', ['modelId', 'swBuildId', 'powerSource']);
        },
    },
    {
        zigbeeModel: ['ptvo_counter_2ch'],
        model: 'ptvo_counter_2ch',
        vendor: 'Custom devices (DiY)',
        description: '2 channel counter',
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.battery, fromZigbee_1.default.ptvo_switch_analog_input, fromZigbee_1.default.on_off],
        toZigbee: [toZigbee_1.default.ptvo_switch_trigger, toZigbee_1.default.ptvo_switch_analog_input, toZigbee_1.default.on_off],
        exposes: [
            e.battery(),
            e
                .numeric('l3', ea.ALL)
                .withValueMin(-999999999)
                .withValueMax(999999999)
                .withDescription('Counter 1 value. Write zero or positive value to set a counter value. ' +
                'Write a negative value to set a wakeup interval in minutes'),
            e
                .numeric('l5', ea.ALL)
                .withValueMin(-999999999)
                .withValueMax(999999999)
                .withDescription('Counter 2 value. Write zero or positive value to set a counter value. ' +
                'Write a negative value to set a wakeup interval in minutes'),
            e.switch().withEndpoint('l6'),
            e.battery_voltage(),
        ],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { l3: 3, l5: 5, l6: 6 };
        },
    },
    {
        zigbeeModel: ['alab.switch'],
        model: 'alab.switch',
        vendor: 'Alab',
        description: 'Four channel relay board with four inputs',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, in1: 5, in2: 6, in3: 7, in4: 8 } }),
            (0, modernExtend_1.onOff)({
                powerOnBehavior: false,
                configureReporting: false,
                endpointNames: ['l1', 'l2', 'l3', 'l4'],
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4'] }),
            (0, modernExtend_1.numeric)({
                name: 'input_state',
                valueMin: 0,
                valueMax: 1,
                cluster: 'genAnalogInput',
                attribute: 'presentValue',
                description: 'Input state',
                endpointNames: ['in1', 'in2', 'in3', 'in4'],
            }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=custom_devices_diy.js.map