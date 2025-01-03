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
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['ROB_200-004-1'],
        model: 'ROB_200-004-1',
        vendor: 'ROBB',
        description: 'ZigBee AC phase-cut dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['ROB_200-060-0'],
        model: 'ROB_200-060-0',
        vendor: 'ROBB',
        description: 'Zigbee LED driver',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] }, color: true })],
    },
    {
        zigbeeModel: ['ROB_200-061-0'],
        model: 'ROB_200-061-0',
        vendor: 'ROBB',
        description: '50W Zigbee CCT LED driver (constant current)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['ROB_200-029-0'],
        model: 'ROB_200-029-0',
        vendor: 'ROBB',
        description: 'Zigbee curtain motor controller',
        meta: { coverInverted: true },
        fromZigbee: [fromZigbee_1.default.cover_position_tilt],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
        },
        exposes: [e.cover_position()],
    },
    {
        zigbeeModel: ['ROB_200-070-0'],
        model: 'ROB_200-070-0',
        vendor: 'ROBB',
        description: 'Battery powered PIR presence, temperature, humidity and light sensors',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 } }),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.occupancy)(),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'generic', zoneAttributes: ['alarm_1', 'alarm_2', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.temperature)({ endpointNames: ['3'] }),
            (0, modernExtend_1.humidity)({ endpointNames: ['4'] }),
            (0, modernExtend_1.illuminance)({ endpointNames: ['5'] }),
        ],
    },
    {
        zigbeeModel: ['ROB_200-050-0'],
        model: 'ROB_200-050-0',
        vendor: 'ROBB',
        description: '4 port switch with 2 usb ports (no metering)',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, l5: 5 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4', 'l5'] })],
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG9023A(EU)' }],
    },
    {
        zigbeeModel: ['ROB_200-006-0'],
        model: 'ROB_200-006-0',
        vendor: 'ROBB',
        description: 'ZigBee LED dimmer',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['ROB_200-004-0'],
        model: 'ROB_200-004-0',
        vendor: 'ROBB',
        description: 'ZigBee AC phase-cut dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['ROB_200-011-0'],
        model: 'ROB_200-011-0',
        vendor: 'ROBB',
        description: 'ZigBee AC phase-cut dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)({ current: { divisor: 1000 }, voltage: { divisor: 10 }, power: { divisor: 10 } })],
    },
    {
        zigbeeModel: ['ROB_200-003-0'],
        model: 'ROB_200-003-0',
        vendor: 'ROBB',
        description: 'Zigbee AC in wall switch (push switch)',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['ROB_200-003-1'],
        model: 'ROB_200-003-1',
        vendor: 'ROBB',
        description: 'Zigbee AC in wall switch (normal switch)',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['ROB_200-030-0'],
        model: 'ROB_200-030-0',
        vendor: 'ROBB',
        description: 'Zigbee AC in wall switch 400W (2-wire)',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['ROB_200-014-0'],
        model: 'ROB_200-014-0',
        vendor: 'ROBB',
        description: 'ZigBee AC phase-cut rotary dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
        whiteLabel: [
            { vendor: 'YPHIX', model: '50208695' },
            { vendor: 'Samotech', model: 'SM311' },
        ],
    },
    {
        zigbeeModel: ['ZG2833K8_EU05', 'ROB_200-007-0'],
        model: 'ROB_200-007-0',
        vendor: 'ROBB',
        description: 'Zigbee 8 button wall switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_genOta],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_stop_1',
                'on_2',
                'off_2',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_stop_2',
                'on_3',
                'off_3',
                'brightness_move_up_3',
                'brightness_move_down_3',
                'brightness_stop_3',
                'on_4',
                'off_4',
                'brightness_move_up_4',
                'brightness_move_down_4',
                'brightness_stop_4',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG9001K8-DIM' }],
    },
    {
        zigbeeModel: ['ROB_200-024-0'],
        model: 'ROB_200-024-0',
        vendor: 'ROBB',
        description: 'Zigbee 3.0 4 channel remote control',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_recall],
        exposes: [e.battery(), e.action(['brightness_move_up', 'brightness_move_down', 'brightness_stop', 'on', 'off', 'recall_*'])],
        toZigbee: [],
        whiteLabel: [{ vendor: 'RGB Genie', model: 'ZGRC-KEY-013' }],
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff', 'genScenes']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['ROB_200-025-0'],
        model: 'ROB_200-025-0',
        vendor: 'ROBB',
        description: 'Zigbee 8 button wall switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_genOta],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_stop_1',
                'on_2',
                'off_2',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_stop_2',
                'on_3',
                'off_3',
                'brightness_move_up_3',
                'brightness_move_down_3',
                'brightness_stop_3',
                'on_4',
                'off_4',
                'brightness_move_up_4',
                'brightness_move_down_4',
                'brightness_stop_4',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
    },
    {
        zigbeeModel: ['ZG2833K4_EU06', 'ROB_200-008', 'ROB_200-008-0'],
        model: 'ROB_200-008-0',
        vendor: 'ROBB',
        description: 'Zigbee 4 button wall switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'stop_1',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_stop_1',
                'on_2',
                'off_2',
                'stop_2',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_stop_2',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG9001K4-DIM2' }],
    },
    {
        zigbeeModel: ['ROB_200-009-0'],
        model: 'ROB_200-009-0',
        vendor: 'ROBB',
        description: 'Zigbee 2 button wall switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        exposes: [e.battery(), e.action(['on_1', 'off_1', 'stop_1', 'brightness_move_up_1', 'brightness_move_down_1', 'brightness_stop_1'])],
        toZigbee: [],
        meta: { multiEndpoint: true },
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG9001K2-DIM' }],
    },
    {
        zigbeeModel: ['Motor Controller', 'ROB_200-010-0'],
        model: 'ROB_200-010-0',
        vendor: 'ROBB',
        description: 'Zigbee curtain motor controller',
        meta: { coverInverted: true },
        fromZigbee: [fromZigbee_1.default.cover_position_tilt],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
        },
        exposes: [e.cover_position()],
    },
    {
        zigbeeModel: ['ROB_200-018-0'],
        model: 'ROB_200-018-0',
        vendor: 'ROBB',
        description: 'ZigBee knob smart dimmer',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move_to_level, fromZigbee_1.default.command_move_to_color_temp, fromZigbee_1.default.battery, fromZigbee_1.default.command_move_to_color],
        exposes: [e.battery(), e.action(['on', 'off', 'brightness_move_to_level', 'color_temperature_move', 'color_move'])],
        toZigbee: [],
        meta: { multiEndpoint: true, battery: { dontDividePercentage: true } },
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG2835' }],
    },
    {
        zigbeeModel: ['ROB_200-017-0', 'HK-PLUG-A'],
        model: 'ROB_200-017-0',
        vendor: 'ROBB',
        description: 'Zigbee smart plug',
        fromZigbee: [fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.on_off, fromZigbee_1.default.ignore_genLevelCtrl_report, fromZigbee_1.default.metering, fromZigbee_1.default.temperature],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering', 'msTemperatureMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.activePower(endpoint);
            await reporting.temperature(endpoint);
            await reporting.currentSummDelivered(endpoint);
        },
        exposes: [e.power(), e.current(), e.voltage(), e.switch(), e.energy(), e.temperature()],
    },
    {
        zigbeeModel: ['ROB_200-017-1'],
        model: 'ROB_200-017-1',
        vendor: 'ROBB',
        description: 'Zigbee smart plug',
        fromZigbee: [fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.on_off, fromZigbee_1.default.ignore_genLevelCtrl_report, fromZigbee_1.default.metering, fromZigbee_1.default.temperature],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering', 'msTemperatureMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.activePower(endpoint);
            await reporting.temperature(endpoint);
            await reporting.currentSummDelivered(endpoint);
        },
        exposes: [e.power(), e.current(), e.voltage(), e.switch(), e.energy(), e.temperature()],
    },
    {
        zigbeeModel: ['ROB_200-016-0'],
        model: 'ROB_200-016-0',
        vendor: 'ROBB',
        description: 'RGB CCT DIM 3 in 1 Zigbee Remote',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_move_to_color,
            fromZigbee_1.default.command_move_to_color_temp,
            fromZigbee_1.default.command_move_hue,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_recall,
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_toggle,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_color_loop_set,
            fromZigbee_1.default.command_ehanced_move_to_hue_and_saturation,
        ],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'color_move',
                'color_temperature_move',
                'hue_move',
                'brightness_step_up',
                'brightness_step_down',
                'recall_*',
                'on',
                'off',
                'toggle',
                'brightness_stop',
                'brightness_move_up',
                'brightness_move_down',
                'color_loop_set',
                'enhanced_move_to_hue_and_saturation',
                'hue_stop',
            ]),
        ],
    },
    {
        zigbeeModel: ['ROB_200-026-0'],
        model: 'ROB_200-026-0',
        vendor: 'ROBB',
        description: '2-gang in-wall switch',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior, toZigbee_1.default.electrical_measurement_power],
        exposes: [e.switch().withEndpoint('l1'), e.switch().withEndpoint('l2'), e.energy()],
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['power', 'energy'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint2);
            await endpoint1.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['haElectricalMeasurement', 'seMetering']);
            await reporting.activePower(endpoint1);
            await reporting.readMeteringMultiplierDivisor(endpoint1);
            await reporting.currentSummDelivered(endpoint1, { min: 60, change: 1 });
        },
    },
    {
        zigbeeModel: ['ROB_200-035-0'],
        model: 'ROB_200-035-0',
        vendor: 'ROBB',
        description: '1 channel switch with power monitoring',
        fromZigbee: [fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.on_off, fromZigbee_1.default.ignore_genLevelCtrl_report, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.current(), e.voltage(), e.energy()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.activePower(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.currentSummDelivered(endpoint);
        },
    },
    {
        zigbeeModel: ['ROB_200-063-0'],
        model: 'ROB_200-063-0',
        vendor: 'ROBB',
        description: 'Zigbee 0-10V PWM dimmer',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=robb.js.map