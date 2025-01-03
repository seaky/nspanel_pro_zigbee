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
const constants = __importStar(require("../lib/constants"));
const develco_1 = require("../lib/develco");
const exposes = __importStar(require("../lib/exposes"));
const logger_1 = require("../lib/logger");
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const globalStore = __importStar(require("../lib/store"));
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const NS = 'zhc:develco';
// develco specific cosntants
const manufacturerOptions = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO };
/* MOSZB-1xx - ledControl - bitmap8 - r/w
 * 0x00 Disable LED when movement is detected.
 * 0x01 Enables periodic fault flashes. These flashes are used to indicate e.g. low battery level.
 * 0x02 Enables green application defined LED. This is e.g. used to indicate motion detection.
 * Default value 0xFF ( seems to be fault + motion)
 */
const develcoLedControlMap = {
    0x00: 'off',
    0x01: 'fault_only',
    0x02: 'motion_only',
    0xff: 'both',
};
// develco specific converters
const develco = {
    fz: {
        // Some Develco devices report strange values sometimes
        // https://github.com/Koenkk/zigbee2mqtt/issues/13329
        electrical_measurement: {
            ...fromZigbee_1.default.electrical_measurement,
            convert: (model, msg, publish, options, meta) => {
                if (msg.data.rmsVoltage !== 0xffff && msg.data.rmsCurrent !== 0xffff && msg.data.activePower !== -0x8000) {
                    return fromZigbee_1.default.electrical_measurement.convert(model, msg, publish, options, meta);
                }
            },
        },
        total_power: {
            cluster: 'haElectricalMeasurement',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.totalActivePower !== undefined && msg.data['totalActivePower'] !== -0x80000000) {
                    result[utils.postfixWithEndpointName('power', msg, model, meta)] = msg.data['totalActivePower'];
                }
                if (msg.data.totalReactivePower !== undefined && msg.data['totalReactivePower'] !== -0x80000000) {
                    result[utils.postfixWithEndpointName('power_reactive', msg, model, meta)] = msg.data['totalReactivePower'];
                }
                return result;
            },
        },
        metering: {
            ...fromZigbee_1.default.metering,
            convert: (model, msg, publish, options, meta) => {
                if (msg.data.instantaneousDemand !== -0x800000 && msg.data.currentSummDelivered?.[1] !== 0) {
                    return fromZigbee_1.default.metering.convert(model, msg, publish, options, meta);
                }
            },
        },
        pulse_configuration: {
            cluster: 'seMetering',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.develcoPulseConfiguration !== undefined) {
                    result[utils.postfixWithEndpointName('pulse_configuration', msg, model, meta)] = msg.data['develcoPulseConfiguration'];
                }
                return result;
            },
        },
        interface_mode: {
            cluster: 'seMetering',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.develcoInterfaceMode !== undefined) {
                    result[utils.postfixWithEndpointName('interface_mode', msg, model, meta)] =
                        constants.develcoInterfaceMode[msg.data['develcoInterfaceMode']] !== undefined
                            ? constants.develcoInterfaceMode[msg.data['develcoInterfaceMode']]
                            : msg.data['develcoInterfaceMode'];
                }
                if (msg.data.status !== undefined) {
                    result['battery_low'] = (msg.data.status & 2) > 0;
                    result['check_meter'] = (msg.data.status & 1) > 0;
                }
                return result;
            },
        },
        fault_status: {
            cluster: 'genBinaryInput',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.reliability !== undefined) {
                    const lookup = { 0: 'no_fault_detected', 7: 'unreliable_other', 8: 'process_error' };
                    result.reliability = utils.getFromLookup(msg.data['reliability'], lookup);
                }
                if (msg.data.statusFlags !== undefined) {
                    result.fault = msg.data['statusFlags'] === 1;
                }
                return result;
            },
        },
        led_control: {
            cluster: 'genBasic',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.develcoLedControl !== undefined) {
                    state['led_control'] = utils.getFromLookup(msg.data['develcoLedControl'], develcoLedControlMap);
                }
                return state;
            },
        },
        ias_occupancy_timeout: {
            cluster: 'ssIasZone',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.develcoAlarmOffDelay !== undefined) {
                    state['occupancy_timeout'] = msg.data['develcoAlarmOffDelay'];
                }
                return state;
            },
        },
        input: {
            cluster: 'genBinaryInput',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.presentValue !== undefined) {
                    const value = msg.data['presentValue'];
                    result[utils.postfixWithEndpointName('input', msg, model, meta)] = value == 1;
                }
                return result;
            },
        },
    },
    tz: {
        pulse_configuration: {
            key: ['pulse_configuration'],
            convertSet: async (entity, key, value, meta) => {
                await entity.write('seMetering', { develcoPulseConfiguration: value }, manufacturerOptions);
                return { readAfterWriteTime: 200, state: { pulse_configuration: value } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('seMetering', ['develcoPulseConfiguration'], manufacturerOptions);
            },
        },
        interface_mode: {
            key: ['interface_mode'],
            convertSet: async (entity, key, value, meta) => {
                const payload = { develcoInterfaceMode: utils.getKey(constants.develcoInterfaceMode, value, undefined, Number) };
                await entity.write('seMetering', payload, manufacturerOptions);
                return { readAfterWriteTime: 200, state: { interface_mode: value } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('seMetering', ['develcoInterfaceMode'], manufacturerOptions);
            },
        },
        current_summation: {
            key: ['current_summation'],
            convertSet: async (entity, key, value, meta) => {
                await entity.write('seMetering', { develcoCurrentSummation: value }, manufacturerOptions);
                return { state: { current_summation: value } };
            },
        },
        led_control: {
            key: ['led_control'],
            convertSet: async (entity, key, value, meta) => {
                const ledControl = utils.getKey(develcoLedControlMap, value, value, Number);
                await entity.write('genBasic', { develcoLedControl: ledControl }, manufacturerOptions);
                return { state: { led_control: value } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('genBasic', ['develcoLedControl'], manufacturerOptions);
            },
        },
        ias_occupancy_timeout: {
            key: ['occupancy_timeout'],
            convertSet: async (entity, key, value, meta) => {
                let timeoutValue = utils.toNumber(value, 'occupancy_timeout');
                if (timeoutValue < 5) {
                    logger_1.logger.warning(`Minimum occupancy_timeout is 5, using 5 instead of ${timeoutValue}!`, NS);
                    timeoutValue = 5;
                }
                await entity.write('ssIasZone', { develcoAlarmOffDelay: timeoutValue }, manufacturerOptions);
                return { state: { occupancy_timeout: timeoutValue } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('ssIasZone', ['develcoAlarmOffDelay'], manufacturerOptions);
            },
        },
        input: {
            key: ['input'],
            convertGet: async (entity, key, meta) => {
                await entity.read('genBinaryInput', ['presentValue']);
            },
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['SPLZB-131'],
        model: 'SPLZB-131',
        vendor: 'Develco',
        description: 'Power plug',
        toZigbee: [toZigbee_1.default.on_off],
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.deviceTemperature(),
            (0, modernExtend_1.electricityMeter)({ acFrequency: true, fzMetering: develco.fz.metering, fzElectricalMeasurement: develco.fz.electrical_measurement }),
            (0, modernExtend_1.onOff)(),
        ],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['SPLZB-132'],
        model: 'SPLZB-132',
        vendor: 'Develco',
        description: 'Power plug',
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.deviceTemperature(),
            (0, modernExtend_1.electricityMeter)({ acFrequency: true, fzMetering: develco.fz.metering, fzElectricalMeasurement: develco.fz.electrical_measurement }),
            (0, modernExtend_1.onOff)(),
        ],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['SPLZB-134'],
        model: 'SPLZB-134',
        vendor: 'Develco',
        description: 'Power plug (type G)',
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.deviceTemperature(),
            (0, modernExtend_1.electricityMeter)({ acFrequency: true, fzMetering: develco.fz.metering, fzElectricalMeasurement: develco.fz.electrical_measurement }),
            (0, modernExtend_1.onOff)(),
        ],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['SPLZB-137'],
        model: 'SPLZB-137',
        vendor: 'Develco',
        description: 'Power plug',
        fromZigbee: [fromZigbee_1.default.on_off, develco.fz.electrical_measurement, develco.fz.metering],
        toZigbee: [toZigbee_1.default.on_off],
        ota: ota.zigbeeOTA,
        exposes: [e.switch(), e.power(), e.current(), e.voltage(), e.energy(), e.ac_frequency()],
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint, true);
            await reporting.activePower(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
            await reporting.acFrequency(endpoint);
        },
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['SMRZB-143'],
        model: 'SMRZB-143',
        vendor: 'Develco',
        description: 'Smart cable',
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.deviceTemperature(),
            (0, modernExtend_1.electricityMeter)({ acFrequency: true, fzMetering: develco.fz.metering, fzElectricalMeasurement: develco.fz.electrical_measurement }),
            (0, modernExtend_1.onOff)(),
        ],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['EMIZB-132'],
        model: 'EMIZB-132',
        vendor: 'Develco',
        description: 'Wattle AMS HAN power-meter sensor',
        fromZigbee: [develco.fz.metering, develco.fz.electrical_measurement, develco.fz.total_power],
        toZigbee: [toZigbee_1.default.EMIZB_132_mode],
        ota: ota.zigbeeOTA,
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['haElectricalMeasurement', 'seMetering']);
            try {
                // Some don't support these attributes
                // https://github.com/Koenkk/zigbee-herdsman-converters/issues/974#issuecomment-621465038
                await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
                await reporting.rmsVoltage(endpoint);
                await reporting.rmsCurrent(endpoint);
                await endpoint.configureReporting('haElectricalMeasurement', [{ attribute: 'totalActivePower', minimumReportInterval: 5, maximumReportInterval: 3600, reportableChange: 1 }], manufacturerOptions);
                await endpoint.configureReporting('haElectricalMeasurement', [{ attribute: 'totalReactivePower', minimumReportInterval: 5, maximumReportInterval: 3600, reportableChange: 1 }], manufacturerOptions);
            }
            catch {
                /* empty */
            }
            await reporting.readMeteringMultiplierDivisor(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000, multiplier: 1 });
            await reporting.currentSummDelivered(endpoint);
            await reporting.currentSummReceived(endpoint);
        },
        exposes: [
            e.numeric('power', ea.STATE).withUnit('W').withDescription('Total active power'),
            e.numeric('power_reactive', ea.STATE).withUnit('VAr').withDescription('Total reactive power'),
            e.energy(),
            e.current(),
            e.voltage(),
            e.current_phase_b(),
            e.voltage_phase_b(),
            e.current_phase_c(),
            e.voltage_phase_c(),
        ],
        onEvent: async (type, data, device) => {
            if (type === 'message' && data.type === 'attributeReport' && data.cluster === 'seMetering' && data.data['divisor']) {
                // Device sends wrong divisor (512) while it should be fixed to 1000
                // https://github.com/Koenkk/zigbee-herdsman-converters/issues/3066
                data.endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000, multiplier: 1 });
            }
        },
    },
    {
        zigbeeModel: ['SMSZB-120', 'GWA1512_SmokeSensor'],
        model: 'SMSZB-120',
        vendor: 'Develco',
        description: 'Smoke detector with siren',
        whiteLabel: [
            { vendor: 'Frient', model: '94430', description: 'Smart Intelligent Smoke Alarm' },
            { vendor: 'Cavius', model: '2103', description: 'RF SMOKE ALARM, 5 YEAR 65MM' },
        ],
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1_develco, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_enroll, fromZigbee_1.default.ias_wd, develco.fz.fault_status],
        toZigbee: [toZigbee_1.default.warning, toZigbee_1.default.ias_max_duration, toZigbee_1.default.warning_simple],
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(), // TODO: ep 38
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(35);
            // Device supports only 4 binds (otherwise you get TABLE_FULL error)
            // https://github.com/Koenkk/zigbee2mqtt/issues/23684
            if (endpoint.binds.some((b) => b.cluster.name === 'genPollCtrl')) {
                await endpoint.unbind('genPollCtrl', coordinatorEndpoint);
            }
            await reporting.bind(endpoint, coordinatorEndpoint, ['ssIasZone', 'ssIasWd', 'genBinaryInput']);
            await endpoint.read('ssIasZone', ['iasCieAddr', 'zoneState', 'zoneId']);
            await endpoint.read('genBinaryInput', ['reliability', 'statusFlags']);
            await endpoint.read('ssIasWd', ['maxDuration']);
        },
        endpoint: (device) => {
            return { default: 35 };
        },
        exposes: [
            e.smoke(),
            e.battery_low(),
            e.test(),
            e.numeric('max_duration', ea.ALL).withUnit('s').withValueMin(0).withValueMax(600).withDescription('Duration of Siren'),
            e.binary('alarm', ea.SET, 'START', 'OFF').withDescription('Manual Start of Siren'),
            e
                .enum('reliability', ea.STATE, ['no_fault_detected', 'unreliable_other', 'process_error'])
                .withDescription('Indicates reason if any fault'),
            e.binary('fault', ea.STATE, true, false).withDescription('Indicates whether the device are in fault state'),
        ],
    },
    {
        zigbeeModel: ['SPLZB-141'],
        model: 'SPLZB-141',
        vendor: 'Develco',
        description: 'Power plug',
        fromZigbee: [fromZigbee_1.default.on_off, develco.fz.electrical_measurement, develco.fz.metering],
        toZigbee: [toZigbee_1.default.on_off],
        ota: ota.zigbeeOTA,
        exposes: [e.switch(), e.power(), e.current(), e.voltage(), e.energy(), e.ac_frequency()],
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.activePower(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
            await reporting.acFrequency(endpoint);
        },
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['HESZB-120'],
        model: 'HESZB-120',
        vendor: 'Develco',
        description: 'Fire detector with siren',
        whiteLabel: [{ vendor: 'Frient', model: '94431', description: 'Smart Intelligent Heat Alarm' }],
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1_develco, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_enroll, fromZigbee_1.default.ias_wd, develco.fz.fault_status],
        toZigbee: [toZigbee_1.default.warning, toZigbee_1.default.ias_max_duration, toZigbee_1.default.warning_simple],
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(), // TODO: ep 38
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(35);
            // Device supports only 4 binds (otherwise you get TABLE_FULL error)
            // https://github.com/Koenkk/zigbee2mqtt/issues/23684
            if (endpoint.binds.some((b) => b.cluster.name === 'genPollCtrl')) {
                await endpoint.unbind('genPollCtrl', coordinatorEndpoint);
            }
            await reporting.bind(endpoint, coordinatorEndpoint, ['ssIasZone', 'ssIasWd', 'genBinaryInput']);
            await endpoint.read('ssIasZone', ['iasCieAddr', 'zoneState', 'zoneId']);
            await endpoint.read('genBinaryInput', ['reliability', 'statusFlags']);
            await endpoint.read('ssIasWd', ['maxDuration']);
        },
        endpoint: (device) => {
            return { default: 35 };
        },
        exposes: [
            e.smoke(),
            e.battery_low(),
            e.test(),
            e.numeric('max_duration', ea.ALL).withUnit('s').withValueMin(0).withValueMax(600).withDescription('Duration of Siren'),
            e.binary('alarm', ea.SET, 'START', 'OFF').withDescription('Manual Start of Siren'),
            e
                .enum('reliability', ea.STATE, ['no_fault_detected', 'unreliable_other', 'process_error'])
                .withDescription('Indicates reason if any fault'),
            e.binary('fault', ea.STATE, true, false).withDescription('Indicates whether the device are in fault state'),
        ],
    },
    {
        zigbeeModel: ['WISZB-120'],
        model: 'WISZB-120',
        vendor: 'Develco',
        description: 'Window sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper()],
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(), // TODO: ep 38
            (0, modernExtend_1.battery)({
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: true,
            }),
        ],
    },
    {
        zigbeeModel: ['WISZB-121'],
        model: 'WISZB-121',
        vendor: 'Develco',
        description: 'Window sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper()],
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
    },
    {
        zigbeeModel: ['WISZB-137'],
        model: 'WISZB-137',
        vendor: 'Develco',
        description: 'Vibration sensor',
        fromZigbee: [fromZigbee_1.default.ias_vibration_alarm_1],
        toZigbee: [],
        exposes: [e.battery_low(), e.vibration(), e.tamper()],
        endpoint: (device) => {
            return { default: 38 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: '3V_2100',
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
    },
    {
        zigbeeModel: ['WISZB-138', 'GWA1513_WindowSensor'],
        model: 'WISZB-138',
        vendor: 'Develco',
        description: 'Window sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low()],
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
    },
    {
        zigbeeModel: ['MOSZB-130'],
        model: 'MOSZB-130',
        vendor: 'Develco',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['MOSZB-140', 'GWA1511_MotionSensor'],
        model: 'MOSZB-140',
        vendor: 'Develco',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, develco.fz.led_control, develco.fz.ias_occupancy_timeout],
        toZigbee: [develco.tz.led_control, develco.tz.ias_occupancy_timeout],
        exposes: (device, options) => {
            const dynExposes = [];
            dynExposes.push(e.occupancy());
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 3) {
                dynExposes.push(e.numeric('occupancy_timeout', ea.ALL).withUnit('s').withValueMin(5).withValueMax(65535));
            }
            dynExposes.push(e.tamper());
            dynExposes.push(e.battery_low());
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 4) {
                dynExposes.push(e.enum('led_control', ea.ALL, ['off', 'fault_only', 'motion_only', 'both']).withDescription('Control LED indicator usage.'));
            }
            dynExposes.push(e.linkquality());
            return dynExposes;
        },
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(), // TODO: ep 38
            (0, modernExtend_1.illuminance)(), // TODO: ep 39
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            // zigbee2mqtt#14277 some features are not available on older firmwares
            // modernExtend's readGenBasicPrimaryVersions is called before this one, should be fine
            const endpoint35 = device.getEndpoint(35);
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 3) {
                await endpoint35.read('ssIasZone', ['develcoAlarmOffDelay'], manufacturerOptions);
            }
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 4) {
                await endpoint35.read('genBasic', ['develcoLedControl'], manufacturerOptions);
            }
        },
    },
    {
        zigbeeModel: ['MOSZB-141'],
        model: 'MOSZB-141',
        vendor: 'Develco',
        description: 'Motion sensor',
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'battery_low'] }),
        ],
    },
    {
        whiteLabel: [{ vendor: 'Frient', model: 'MOSZB-153', description: 'Motion Sensor 2 Pet' }],
        zigbeeModel: ['MOSZB-153'],
        model: 'MOSZB-153',
        vendor: 'Develco',
        description: 'Motion sensor 2 pet',
        fromZigbee: [develco.fz.led_control, develco.fz.ias_occupancy_timeout],
        toZigbee: [develco.tz.led_control, develco.tz.ias_occupancy_timeout],
        exposes: (device, options) => {
            const dynExposes = [];
            if (Number(device?.softwareBuildID?.split('.')[0]) >= 2) {
                dynExposes.push(e.numeric('occupancy_timeout', ea.ALL).withUnit('s').withValueMin(5).withValueMax(65535));
                dynExposes.push(e.enum('led_control', ea.ALL, ['off', 'fault_only', 'motion_only', 'both']).withDescription('Control LED indicator usage.'));
            }
            dynExposes.push(e.linkquality());
            return dynExposes;
        },
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.illuminance)({ reporting: { min: 60, max: 3600, change: 500 } }),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1'] }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            if (device && device.softwareBuildID && Number(device.softwareBuildID.split('.')[0]) >= 2) {
                const endpoint35 = device.getEndpoint(35);
                await endpoint35.read('ssIasZone', ['develcoAlarmOffDelay'], manufacturerOptions);
                await endpoint35.read('genBasic', ['develcoLedControl'], manufacturerOptions);
            }
        },
    },
    {
        whiteLabel: [{ vendor: 'Frient', model: 'HMSZB-120', description: 'Temperature & humidity sensor', fingerprint: [{ modelID: 'HMSZB-120' }] }],
        zigbeeModel: ['HMSZB-110', 'HMSZB-120'],
        model: 'HMSZB-110',
        vendor: 'Develco',
        description: 'Temperature & humidity sensor',
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 38 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3200 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
            develco_1.develcoModernExtend.batteryLowAA(),
        ],
    },
    {
        zigbeeModel: ['ZHEMI101'],
        model: 'ZHEMI101',
        vendor: 'Develco',
        description: 'Energy meter',
        fromZigbee: [develco.fz.metering, develco.fz.pulse_configuration, develco.fz.interface_mode],
        toZigbee: [develco.tz.pulse_configuration, develco.tz.interface_mode, develco.tz.current_summation],
        endpoint: (device) => {
            return { default: 2 };
        },
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['seMetering']);
            await reporting.instantaneousDemand(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
        },
        exposes: [
            e.power(),
            e.energy(),
            e.battery_low(),
            e
                .numeric('pulse_configuration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Pulses per kwh. Default 1000 imp/kWh. Range 0 to 65535'),
            e
                .enum('interface_mode', ea.ALL, ['electricity', 'gas', 'water', 'kamstrup-kmp', 'linky', 'IEC62056-21', 'DSMR-2.3', 'DSMR-4.0'])
                .withDescription('Operating mode/probe'),
            e
                .numeric('current_summation', ea.SET)
                .withDescription('Current summation value sent to the display. e.g. 570 = 0,570 kWh')
                .withValueMin(0)
                .withValueMax(268435455),
            e.binary('check_meter', ea.STATE, true, false).withDescription('Is true if communication problem with meter is experienced'),
        ],
    },
    {
        zigbeeModel: ['SMRZB-332'],
        model: 'SMRZB-332',
        vendor: 'Develco',
        description: 'Smart relay DIN',
        fromZigbee: [fromZigbee_1.default.on_off, develco.fz.metering],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.power(), e.energy(), e.switch()],
        endpoint: (device) => {
            return { default: 2 };
        },
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['seMetering']);
            await reporting.instantaneousDemand(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
        },
    },
    {
        zigbeeModel: ['FLSZB-110'],
        model: 'FLSZB-110',
        vendor: 'Develco',
        description: 'Flood alarm device ',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.battery_low(), e.tamper(), e.water_leak()],
        endpoint: (device) => {
            return { default: 35 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(), // TODO: ep 38
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2800, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
    },
    {
        zigbeeModel: ['AQSZB-110'],
        model: 'AQSZB-110',
        vendor: 'Develco',
        description: 'Air quality sensor',
        ota: ota.zigbeeOTA,
        endpoint: (device) => {
            return { default: 38 };
        },
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoAirQuality(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.voc(),
            develco_1.develcoModernExtend.airQuality(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
            develco_1.develcoModernExtend.batteryLowAA(),
        ],
    },
    {
        zigbeeModel: ['SIRZB-110', 'SIRZB-111'],
        model: 'SIRZB-110',
        vendor: 'Develco',
        description: 'Customizable siren',
        fromZigbee: [fromZigbee_1.default.ias_enroll, fromZigbee_1.default.ias_wd, fromZigbee_1.default.ias_siren],
        toZigbee: [toZigbee_1.default.warning, toZigbee_1.default.warning_simple, toZigbee_1.default.ias_max_duration, toZigbee_1.default.squawk],
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.temperature(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2500, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(43);
            await reporting.bind(endpoint, coordinatorEndpoint, ['ssIasZone', 'ssIasWd', 'genBasic']);
            await endpoint.read('ssIasZone', ['iasCieAddr', 'zoneState', 'zoneId']);
            await endpoint.read('ssIasWd', ['maxDuration']);
            const endpoint2 = device.getEndpoint(1);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
        },
        endpoint: (device) => {
            return { default: 43 };
        },
        whiteLabel: [{ model: 'SIRZB-111', vendor: 'Develco', description: 'Customizable siren', fingerprint: [{ modelID: 'SIRZB-111' }] }],
        exposes: [
            e.battery_low(),
            e.test(),
            e.warning(),
            e.squawk(),
            e.numeric('max_duration', ea.ALL).withUnit('s').withValueMin(0).withValueMax(900).withDescription('Max duration of the siren'),
            e.binary('alarm', ea.SET, 'START', 'OFF').withDescription('Manual start of the siren'),
        ],
    },
    {
        zigbeeModel: ['KEPZB-110'],
        model: 'KEYZB-110',
        vendor: 'Develco',
        description: 'Keypad',
        whiteLabel: [{ vendor: 'Frient', model: 'KEPZB-110' }],
        fromZigbee: [
            fromZigbee_1.default.command_arm_with_transaction,
            fromZigbee_1.default.command_emergency,
            fromZigbee_1.default.ias_no_alarm,
            fromZigbee_1.default.ignore_iaszone_attreport,
            fromZigbee_1.default.ignore_iasace_commandgetpanelstatus,
        ],
        toZigbee: [toZigbee_1.default.arm_mode],
        exposes: [
            e.battery_low(),
            e.tamper(),
            e.text('action_code', ea.STATE).withDescription('Pin code introduced.'),
            e.numeric('action_transaction', ea.STATE).withDescription('Last action transaction number.'),
            e.text('action_zone', ea.STATE).withDescription('Alarm zone. Default value 23'),
            e.action(['disarm', 'arm_day_zones', 'arm_night_zones', 'arm_all_zones', 'exit_delay', 'emergency']),
        ],
        ota: ota.zigbeeOTA,
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 3000, max: 4200 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(44);
            const clusters = ['ssIasZone', 'ssIasAce', 'genIdentify'];
            await reporting.bind(endpoint, coordinatorEndpoint, clusters);
        },
        endpoint: (device) => {
            return { default: 44 };
        },
        onEvent: async (type, data, device) => {
            if (type === 'message' &&
                data.type === 'commandGetPanelStatus' &&
                data.cluster === 'ssIasAce' &&
                globalStore.hasValue(device.getEndpoint(44), 'panelStatus')) {
                const payload = {
                    panelstatus: globalStore.getValue(device.getEndpoint(44), 'panelStatus'),
                    secondsremain: 0x00,
                    audiblenotif: 0x00,
                    alarmstatus: 0x00,
                };
                await data.endpoint.commandResponse('ssIasAce', 'getPanelStatusRsp', payload, {}, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
    {
        zigbeeModel: ['IOMZB-110'],
        model: 'IOMZB-110',
        vendor: 'Develco',
        description: 'IO module',
        fromZigbee: [fromZigbee_1.default.on_off, develco.fz.input],
        toZigbee: [toZigbee_1.default.on_off, develco.tz.input],
        meta: { multiEndpoint: true },
        exposes: [
            e.binary('input', ea.STATE_GET, true, false).withEndpoint('l1').withDescription('State of input 1'),
            e.binary('input', ea.STATE_GET, true, false).withEndpoint('l2').withDescription('State of input 2'),
            e.binary('input', ea.STATE_GET, true, false).withEndpoint('l3').withDescription('State of input 3'),
            e.binary('input', ea.STATE_GET, true, false).withEndpoint('l4').withDescription('State of input 4'),
            e.switch().withEndpoint('l11'),
            e.switch().withEndpoint('l12'),
        ],
        extend: [develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(), develco_1.develcoModernExtend.readGenBasicPrimaryVersions()],
        configure: async (device, coordinatorEndpoint) => {
            const ep2 = device.getEndpoint(112);
            await reporting.bind(ep2, coordinatorEndpoint, ['genBinaryInput', 'genBasic']);
            await reporting.presentValue(ep2, { min: 0 });
            const ep3 = device.getEndpoint(113);
            await reporting.bind(ep3, coordinatorEndpoint, ['genBinaryInput']);
            await reporting.presentValue(ep3, { min: 0 });
            const ep4 = device.getEndpoint(114);
            await reporting.bind(ep4, coordinatorEndpoint, ['genBinaryInput']);
            await reporting.presentValue(ep4, { min: 0 });
            const ep5 = device.getEndpoint(115);
            await reporting.bind(ep5, coordinatorEndpoint, ['genBinaryInput']);
            await reporting.presentValue(ep5, { min: 0 });
            const ep6 = device.getEndpoint(116);
            await reporting.bind(ep6, coordinatorEndpoint, ['genOnOff', 'genBinaryInput']);
            await reporting.onOff(ep6);
            const ep7 = device.getEndpoint(117);
            await reporting.bind(ep7, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(ep7);
        },
        endpoint: (device) => {
            return { l1: 112, l2: 113, l3: 114, l4: 115, l11: 116, l12: 117 };
        },
    },
    {
        zigbeeModel: ['SBTZB-110'],
        model: 'SBTZB-110',
        vendor: 'Develco',
        description: 'Smart button',
        fromZigbee: [fromZigbee_1.default.ewelink_action],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.action(['single'])],
        extend: [
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            (0, modernExtend_1.battery)({
                voltageToPercentage: { min: 2200, max: 3000 },
                percentage: true,
                voltage: true,
                lowStatus: false,
                voltageReporting: true,
                percentageReporting: false,
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(32);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genIdentify']);
        },
        endpoint: (device) => {
            return { default: 32 };
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=develco.js.map