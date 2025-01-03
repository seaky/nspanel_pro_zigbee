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
const zigbeeHerdsman = __importStar(require("zigbee-herdsman/dist"));
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const reporting = __importStar(require("../lib/reporting"));
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const manufacturerOptions = { manufacturerCode: zigbeeHerdsman.Zcl.ManufacturerCode.PLUGWISE_B_V };
const plugwisePushForce = {
    0: 'standard',
    0x60000: 'high',
    0x70000: 'very_high',
};
const plugwiseRadioStrength = {
    0: 'normal',
    1: 'high',
};
const fzLocal = {
    plugwise_radiator_valve: {
        cluster: 'hvacThermostat',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = fromZigbee_1.default.thermostat.convert(model, msg, publish, options, meta);
            // Reports pIHeatingDemand between 0 and 100 already
            if (typeof msg.data['pIHeatingDemand'] == 'number') {
                result.pi_heating_demand = utils.precisionRound(msg.data['pIHeatingDemand'], 0);
            }
            if (typeof msg.data[0x4003] == 'number') {
                result.current_heating_setpoint = utils.precisionRound(msg.data[0x4003], 2) / 100;
            }
            if (typeof msg.data[0x4008] == 'number') {
                result.plugwise_t_diff = msg.data[0x4008];
            }
            if (typeof msg.data[0x4002] == 'number') {
                result.error_status = msg.data[0x4002];
            }
            if (typeof msg.data[0x4001] == 'number') {
                result.valve_position = msg.data[0x4001];
            }
            return result;
        },
    },
};
const tzLocal = {
    plugwise_calibrate_valve: {
        key: ['calibrate_valve'],
        convertSet: async (entity, key, value, meta) => {
            await entity.command('hvacThermostat', 'plugwiseCalibrateValve', {}, { srcEndpoint: 11, disableDefaultResponse: true });
            return { state: { calibrate_valve: value } };
        },
    },
    plugwise_valve_position: {
        key: ['plugwise_valve_position', 'valve_position'],
        convertSet: async (entity, key, value, meta) => {
            const payload = { 0x4001: { value, type: 0x20 } };
            await entity.write('hvacThermostat', payload, manufacturerOptions);
            // Tom does not automatically send back updated value so ask for it
            await entity.read('hvacThermostat', [0x4001], manufacturerOptions);
        },
        convertGet: async (entity, key, meta) => {
            await entity.read('hvacThermostat', [0x4001], manufacturerOptions);
        },
    },
    plugwise_push_force: {
        key: ['plugwise_push_force', 'force'],
        convertSet: async (entity, key, value, meta) => {
            const val = utils.getKey(plugwisePushForce, value, value, Number);
            const payload = { 0x4012: { value: val, type: 0x23 } };
            await entity.write('hvacThermostat', payload, manufacturerOptions);
        },
        convertGet: async (entity, key, meta) => {
            await entity.read('hvacThermostat', [0x4012], manufacturerOptions);
        },
    },
    plugwise_radio_strength: {
        key: ['plugwise_radio_strength', 'radio_strength'],
        convertSet: async (entity, key, value, meta) => {
            const val = utils.getKey(plugwiseRadioStrength, value, value, Number);
            const payload = { 0x4014: { value: val, type: 0x10 } };
            await entity.write('hvacThermostat', payload, manufacturerOptions);
        },
        convertGet: async (entity, key, meta) => {
            await entity.read('hvacThermostat', [0x4014], manufacturerOptions);
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['160-01'],
        model: '160-01',
        vendor: 'Plugwise',
        description: 'Plug power socket on/off with power consumption monitoring',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.instantaneousDemand(endpoint);
        },
        exposes: [e.switch(), e.power(), e.energy()],
    },
    {
        zigbeeModel: ['106-03'],
        model: '106-03',
        vendor: 'Plugwise',
        description: 'Tom thermostatic radiator valve',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.battery, fzLocal.plugwise_radiator_valve],
        // sytem_mode and occupied_heating_setpoint is not supported: https://github.com/Koenkk/zigbee2mqtt.io/pull/1666
        toZigbee: [
            toZigbee_1.default.thermostat_pi_heating_demand,
            tzLocal.plugwise_valve_position,
            tzLocal.plugwise_push_force,
            tzLocal.plugwise_radio_strength,
            tzLocal.plugwise_calibrate_valve,
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'genPowerCfg', 'hvacThermostat']);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
        },
        exposes: [
            e.battery(),
            e
                .numeric('pi_heating_demand', ea.STATE_GET)
                .withValueMin(0)
                .withValueMax(100)
                .withUnit('%')
                .withDescription('Position of the valve (= demanded heat) where 0% is fully closed and 100% is fully open'),
            e.numeric('local_temperature', ea.STATE).withUnit('°C').withDescription('Current temperature measured on the device'),
            e
                .numeric('valve_position', ea.ALL)
                .withValueMin(0)
                .withValueMax(100)
                .withDescription('Directly control the radiator valve. The values range from 0 (valve closed) to 100 (valve fully open)'),
            e
                .enum('force', ea.ALL, ['standard', 'high', 'very_high'])
                .withDescription('How hard the motor pushes the valve. The closer to the boiler, the higher the force needed'),
            e.enum('radio_strength', ea.ALL, ['normal', 'high']).withDescription('Transmits with higher power when range is not sufficient'),
            e.binary('calibrate_valve', ea.STATE_SET, 'calibrate', 'idle').withDescription('Calibrates valve on next wakeup'),
        ],
    },
    {
        zigbeeModel: ['158-01'],
        model: '158-01',
        vendor: 'Plugwise',
        description: 'Lisa zone thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.thermostat_system_mode, toZigbee_1.default.thermostat_occupied_heating_setpoint],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'genPowerCfg', 'hvacThermostat']);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.thermostatTemperature(endpoint);
        },
        exposes: [
            e.battery(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5, ea.ALL)
                .withLocalTemperature(ea.STATE)
                .withSystemMode(['off', 'auto'], ea.ALL),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=plugwise.js.map