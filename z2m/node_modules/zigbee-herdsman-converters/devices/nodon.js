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
const exposes = __importStar(require("../lib/exposes"));
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const nodonModernExtend = {
    calibrationVerticalRunTimeUp: (args) => (0, modernExtend_1.numeric)({
        name: 'calibration_vertical_run_time_up',
        unit: '10 ms',
        cluster: 'closuresWindowCovering',
        attribute: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        valueMin: 0,
        valueMax: 65535,
        scale: 1,
        access: 'ALL',
        description: 'Manuel calibration: Set vertical run time up of the roller shutter. ' +
            'Do not change it if your roller shutter is already calibrated.',
        zigbeeCommandOptions: { manufacturerCode: 0x128b },
        ...args,
    }),
    calibrationVerticalRunTimeDowm: (args) => (0, modernExtend_1.numeric)({
        name: 'calibration_vertical_run_time_down',
        unit: '10 ms',
        cluster: 'closuresWindowCovering',
        attribute: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        valueMin: 0,
        valueMax: 65535,
        scale: 1,
        access: 'ALL',
        description: 'Manuel calibration: Set vertical run time down of the roller shutter. ' +
            'Do not change it if your roller shutter is already calibrated.',
        zigbeeCommandOptions: { manufacturerCode: 0x128b },
        ...args,
    }),
    calibrationRotationRunTimeUp: (args) => (0, modernExtend_1.numeric)({
        name: 'calibration_rotation_run_time_up',
        unit: 'ms',
        cluster: 'closuresWindowCovering',
        attribute: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        valueMin: 0,
        valueMax: 65535,
        scale: 1,
        access: 'ALL',
        description: 'Manuel calibration: Set rotation run time up of the roller shutter. ' +
            'Do not change it if your roller shutter is already calibrated.',
        zigbeeCommandOptions: { manufacturerCode: 0x128b },
        ...args,
    }),
    calibrationRotationRunTimeDown: (args) => (0, modernExtend_1.numeric)({
        name: 'calibration_rotation_run_time_down',
        unit: 'ms',
        cluster: 'closuresWindowCovering',
        attribute: { ID: 0x0004, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        valueMin: 0,
        valueMax: 65535,
        scale: 1,
        access: 'ALL',
        description: 'Manuel calibration: Set rotation run time down of the roller shutter. ' +
            'Do not change it if your roller shutter is already calibrated.',
        zigbeeCommandOptions: { manufacturerCode: 0x128b },
        ...args,
    }),
    dryContact: (args) => (0, modernExtend_1.enumLookup)({
        name: 'dry_contact',
        lookup: { contact_closed: 0x00, contact_open: 0x01 },
        cluster: 'genBinaryInput',
        attribute: { ID: 0x055, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
        description: 'State of the contact, closed or open.',
        ...args,
    }),
    impulseMode: (args) => (0, modernExtend_1.numeric)({
        name: 'impulse_mode_configuration',
        unit: 'ms',
        cluster: 'genOnOff',
        attribute: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        valueMin: 0,
        valueMax: 10000,
        scale: 1,
        description: 'Set the impulse duration in milliseconds (set value to 0 to deactivate the impulse mode).',
        zigbeeCommandOptions: { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.NODON },
    }),
    switchType: (args) => (0, modernExtend_1.enumLookup)({
        name: 'switch_type',
        lookup: { bistable: 0x00, monostable: 0x01, auto_detect: 0x02 },
        cluster: 'genOnOff',
        attribute: { ID: 0x1001, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
        description: 'Select the switch type wire to the device. ' + 'Available from version > V3.4.0',
        zigbeeCommandOptions: { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.NODON },
        ...args,
    }),
    trvMode: (args) => (0, modernExtend_1.enumLookup)({
        name: 'trv_mode',
        lookup: { auto: 0x00, valve_position_mode: 0x01, manual: 0x02 },
        cluster: 'hvacThermostat',
        attribute: { ID: 0x4000, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
        description: 'Select between direct control of the TRV via the `valve_position_mode` ' +
            'or automatic control of the TRV based on the `current_heating_setpoint`. ' +
            'When switched to manual mode the display shows a value from 0 (valve closed) to 100 (valve fully open) ' +
            'and the buttons on the device are disabled.',
        zigbeeCommandOptions: { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.NXP_SEMICONDUCTORS },
        ...args,
    }),
    valvePosition: (args) => (0, modernExtend_1.numeric)({
        name: 'valve_position',
        cluster: 'hvacThermostat',
        attribute: { ID: 0x4001, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
        description: 'Directly control the radiator valve when `trv_mode` is set to `valve_position_mode`.' +
            'The values range from 0 (valve closed) to 100 (valve fully open) in %.',
        valueMin: 0,
        valueMax: 100,
        valueStep: 1,
        unit: '%',
        scale: 1,
        zigbeeCommandOptions: { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.NXP_SEMICONDUCTORS },
        ...args,
    }),
};
const definitions = [
    {
        zigbeeModel: ['SDC-4-1-00'],
        model: 'SDC-4-1-00',
        vendor: 'NodOn',
        description: 'Dry contact sensor',
        extend: [(0, modernExtend_1.battery)(), nodonModernExtend.dryContact()],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryVoltage(endpoint);
        },
    },
    {
        zigbeeModel: ['SDO-4-1-00'],
        model: 'SDO-4-1-00',
        vendor: 'NodOn',
        description: 'Door & window opening sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.battery()],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryVoltage(endpoint);
        },
    },
    {
        zigbeeModel: ['SIN-4-RS-20'],
        model: 'SIN-4-RS-20',
        vendor: 'NodOn',
        description: 'Roller shutter relay switch',
        extend: [
            (0, modernExtend_1.windowCovering)({ controls: ['tilt', 'lift'], coverMode: true }),
            nodonModernExtend.calibrationVerticalRunTimeUp(),
            nodonModernExtend.calibrationVerticalRunTimeDowm(),
            nodonModernExtend.calibrationRotationRunTimeUp(),
            nodonModernExtend.calibrationRotationRunTimeDown(),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['SIN-4-RS-20_PRO'],
        model: 'SIN-4-RS-20_PRO',
        vendor: 'NodOn',
        description: 'Roller shutter relay switch',
        extend: [
            (0, modernExtend_1.windowCovering)({ controls: ['tilt', 'lift'], coverMode: true }),
            nodonModernExtend.calibrationVerticalRunTimeUp(),
            nodonModernExtend.calibrationVerticalRunTimeDowm(),
            nodonModernExtend.calibrationRotationRunTimeUp(),
            nodonModernExtend.calibrationRotationRunTimeDown(),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['SIN-4-1-20'],
        model: 'SIN-4-1-20',
        vendor: 'NodOn',
        description: 'Multifunction relay switch',
        extend: [(0, modernExtend_1.onOff)({ ota: ota.zigbeeOTA }), nodonModernExtend.impulseMode(), nodonModernExtend.switchType()],
        endpoint: (device) => {
            return { default: 1 };
        },
    },
    {
        zigbeeModel: ['SIN-4-1-20_PRO'],
        model: 'SIN-4-1-20_PRO',
        vendor: 'NodOn',
        description: 'Multifunction relay switch',
        extend: [(0, modernExtend_1.onOff)({ ota: ota.zigbeeOTA }), nodonModernExtend.impulseMode(), nodonModernExtend.switchType()],
        endpoint: (device) => {
            return { default: 1 };
        },
    },
    {
        zigbeeModel: ['SIN-4-1-21'],
        model: 'SIN-4-1-21',
        vendor: 'NodOn',
        description: 'Multifunction relay switch with metering',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior],
        exposes: [e.switch(), e.power(), e.energy(), e.power_on_behavior()],
        extend: [nodonModernExtend.impulseMode(), nodonModernExtend.switchType()],
        configure: async (device, coordinatorEndpoint) => {
            const ep = device.getEndpoint(1);
            await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering']);
            await reporting.onOff(ep, { min: 1, max: 3600, change: 0 });
            await reporting.readMeteringMultiplierDivisor(ep);
            await reporting.instantaneousDemand(ep);
            await reporting.currentSummDelivered(ep);
        },
    },
    {
        zigbeeModel: ['SIN-4-2-20'],
        model: 'SIN-4-2-20',
        vendor: 'NodOn',
        description: 'Lighting relay switch',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] }),
            nodonModernExtend.switchType({ endpointName: 'l1' }),
            nodonModernExtend.switchType({ endpointName: 'l2' }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['SIN-4-2-20_PRO'],
        model: 'SIN-4-2-20_PRO',
        vendor: 'NodOn',
        description: 'Lighting relay switch',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] }),
            nodonModernExtend.switchType({ endpointName: 'l1' }),
            nodonModernExtend.switchType({ endpointName: 'l2' }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['SIN-4-FP-20'],
        model: 'SIN-4-FP-20',
        vendor: 'NodOn',
        description: 'Pilot wire heating module',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.nodon_pilot_wire_mode],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.nodon_pilot_wire_mode],
        exposes: [e.power(), e.energy(), e.pilot_wire_mode()],
        configure: async (device, coordinatorEndpoint) => {
            const ep = device.getEndpoint(1);
            await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering', 'manuSpecificNodOnPilotWire']);
            await reporting.onOff(ep, { min: 1, max: 3600, change: 0 });
            await reporting.readMeteringMultiplierDivisor(ep);
            await reporting.instantaneousDemand(ep);
            await reporting.currentSummDelivered(ep);
            await ep.read('manuSpecificNodOnPilotWire', ['mode']);
        },
    },
    {
        zigbeeModel: ['SIN-4-FP-21'],
        model: 'SIN-4-FP-21',
        vendor: 'NodOn',
        description: 'Pilot wire heating module',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.nodon_pilot_wire_mode],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.nodon_pilot_wire_mode],
        exposes: [e.power(), e.energy(), e.pilot_wire_mode()],
        configure: async (device, coordinatorEndpoint) => {
            const ep = device.getEndpoint(1);
            await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering', 'manuSpecificNodOnPilotWire']);
            await reporting.onOff(ep, { min: 1, max: 3600, change: 0 });
            await reporting.readMeteringMultiplierDivisor(ep);
            await reporting.instantaneousDemand(ep);
            await reporting.currentSummDelivered(ep);
            await ep.read('manuSpecificNodOnPilotWire', ['mode']);
        },
    },
    {
        zigbeeModel: ['STPH-4-1-00'],
        model: 'STPH-4-1-00',
        vendor: 'NodOn',
        description: 'Temperature & humidity sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.temperature)(), (0, modernExtend_1.humidity)()],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['TRV-4-1-00'],
        model: 'TRV-4-1-00',
        vendor: 'NodOn',
        description: 'Thermostatic Radiateur Valve',
        extend: [(0, modernExtend_1.battery)(), nodonModernExtend.trvMode(), nodonModernExtend.valvePosition()],
        fromZigbee: [fromZigbee_1.default.thermostat],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_pi_heating_demand,
            toZigbee_1.default.thermostat_local_temperature_calibration,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_unoccupied_heating_setpoint,
            toZigbee_1.default.thermostat_min_heat_setpoint_limit,
            toZigbee_1.default.thermostat_max_heat_setpoint_limit,
            toZigbee_1.default.thermostat_setpoint_raise_lower,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.eurotronic_error_status,
            toZigbee_1.default.eurotronic_child_lock,
            toZigbee_1.default.eurotronic_mirror_display,
        ],
        exposes: [
            e.child_lock(),
            e
                .climate()
                .withLocalTemperature()
                .withPiHeatingDemand(ea.STATE_GET)
                .withLocalTemperatureCalibration()
                .withSetpoint('occupied_heating_setpoint', 7.5, 28.5, 0.5)
                .withSetpoint('unoccupied_heating_setpoint', 7.5, 28.5, 0.5)
                .withSystemMode(['off', 'auto', 'heat']),
            e
                .binary('mirror_display', ea.ALL, 'ON', 'OFF')
                .withDescription('Mirror display of the thermostat. Useful when it is mounted in a way where the display is presented upside down.'),
        ],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const options = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.NXP_SEMICONDUCTORS };
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg', 'hvacThermostat']);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatUnoccupiedHeatingSetpoint(endpoint);
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x4008, type: 34 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ], options);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=nodon.js.map