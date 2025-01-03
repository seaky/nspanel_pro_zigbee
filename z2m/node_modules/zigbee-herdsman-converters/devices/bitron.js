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
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const manufacturerOptions = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.ASTREL_GROUP_SRL };
const bitron = {
    fz: {
        thermostat_hysteresis: {
            cluster: 'hvacThermostat',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const result = {};
                if (msg.data.fourNoksHysteresisHigh !== undefined) {
                    if (result.hysteresis === undefined)
                        result.hysteresis = {};
                    result.hysteresis.high = msg.data.fourNoksHysteresisHigh;
                }
                if (msg.data.fourNoksHysteresisLow !== undefined) {
                    if (result.hysteresis === undefined)
                        result.hysteresis = {};
                    result.hysteresis.low = msg.data.fourNoksHysteresisLow;
                }
                return result;
            },
        },
    },
    tz: {
        thermostat_hysteresis: {
            key: ['hysteresis', 'hysteresis'],
            convertSet: async (entity, key, value, meta) => {
                const result = { state: { hysteresis: {} } };
                if (value.high !== undefined) {
                    await entity.write('hvacThermostat', { fourNoksHysteresisHigh: value.high }, manufacturerOptions);
                    result.state.hysteresis.high = value.high;
                }
                if (value.low !== undefined) {
                    await entity.write('hvacThermostat', { fourNoksHysteresisLow: value.low }, manufacturerOptions);
                    result.state.hysteresis.low = value.low;
                }
                return result;
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('hvacThermostat', ['fourNoksHysteresisHigh', 'fourNoksHysteresisLow'], manufacturerOptions);
            },
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['AV2010/14', '902010/14'],
        model: 'AV2010/14',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Curtain motion detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low()],
    },
    {
        zigbeeModel: ['AV2010/16', '902010/16'],
        model: 'AV2010/16',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wall-mount relay with dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['AV2010/18', '902010/18'],
        model: 'AV2010/18',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wall-mount relay',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['AV2010/21A', '902010/21A'],
        model: 'AV2010/21A',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Compact magnetic contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['AV2010/21B', '902010/21B'],
        model: 'AV2010/21B',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Magnetic contact sensor with additional input for wired sensors',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['AV2010/21C', '902010/21C'],
        model: 'AV2010/21C',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Ultra-flat magnetic contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low()],
    },
    {
        zigbeeModel: ['AV2010/22', '902010/22', 'IR_00.00.03.12TC'],
        model: 'AV2010/22',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Professional motion detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper()],
        whiteLabel: [{ vendor: 'ClimaxTechnology', model: 'IR-9ZBS-SL' }],
    },
    {
        zigbeeModel: ['AV2010/22A', '902010/22A'],
        model: 'AV2010/22A',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Design motion detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low()],
    },
    {
        zigbeeModel: ['AV2010/22B', '902010/22B'],
        model: 'AV2010/22B',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Outdoor motion detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['AV2010/23', '902010/23'],
        model: 'AV2010/23',
        vendor: 'SMaBiT (Bitron Video)',
        description: '4 button Zigbee remote control',
        fromZigbee: [fromZigbee_1.default.ias_no_alarm, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_step, fromZigbee_1.default.command_recall],
        toZigbee: [],
        exposes: [e.action(['on', 'off', 'brightness_step_up', 'brightness_step_down', 'recall_*']), e.battery_low()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg', 'genBasic', 'genOnOff', 'genLevelCtrl']);
        },
    },
    {
        zigbeeModel: ['AV2010/24', '902010/24'],
        model: 'AV2010/24',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Optical smoke detector (hardware version v1)',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1],
        toZigbee: [toZigbee_1.default.warning],
        exposes: [e.smoke(), e.battery_low(), e.tamper(), e.warning()],
    },
    {
        zigbeeModel: ['AV2010/24A', '902010/24A'],
        model: 'AV2010/24A',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Optical smoke detector (hardware version v2)',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1],
        toZigbee: [toZigbee_1.default.warning],
        exposes: [e.smoke(), e.battery_low(), e.tamper(), e.warning()],
    },
    {
        zigbeeModel: ['AV2010/25', '902010/25'],
        model: 'AV2010/25',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wireless socket with metering',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.energy()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.instantaneousDemand(endpoint);
            await reporting.currentSummDelivered(endpoint);
            try {
                await reporting.currentSummReceived(endpoint);
            }
            catch {
                /* fails for some: https://github.com/Koenkk/zigbee2mqtt/issues/13258 */
            }
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 10000, multiplier: 1 });
        },
    },
    {
        zigbeeModel: ['AV2010/26', '902010/26'],
        model: 'AV2010/26',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wireless socket with dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['AV2010/28', '902010/28'],
        model: 'AV2010/28',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wireless socket',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['AV2010/29', '902010/29'],
        model: 'AV2010/29',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Outdoor siren',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.warning],
        exposes: [e.battery_low(), e.tamper(), e.warning()],
    },
    {
        zigbeeModel: ['AV2010/29A', '902010/29A'],
        model: 'AV2010/29A',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Outdoor siren',
        fromZigbee: [fromZigbee_1.default.ias_siren],
        toZigbee: [toZigbee_1.default.warning, toZigbee_1.default.squawk],
        exposes: [e.warning(), e.squawk(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['AV2010/32', '902010/32'],
        model: 'AV2010/32',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wireless wall thermostat with relay',
        fromZigbee: [legacy.fz.thermostat_att_report, fromZigbee_1.default.battery, fromZigbee_1.default.hvac_user_interface, bitron.fz.thermostat_hysteresis],
        toZigbee: [
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_occupied_cooling_setpoint,
            toZigbee_1.default.thermostat_local_temperature_calibration,
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.battery_voltage,
            bitron.tz.thermostat_hysteresis,
        ],
        exposes: (device, options) => {
            const dynExposes = [];
            let ctrlSeqeOfOper = device?.getEndpoint(1).getClusterAttributeValue('hvacThermostat', 'ctrlSeqeOfOper') ?? null;
            const modes = [];
            if (typeof ctrlSeqeOfOper === 'string')
                ctrlSeqeOfOper = parseInt(ctrlSeqeOfOper) ?? null;
            // NOTE: ctrlSeqeOfOper defaults to 2 for this device (according to the manual)
            if (ctrlSeqeOfOper === null || isNaN(ctrlSeqeOfOper))
                ctrlSeqeOfOper = 2;
            // NOTE: set cool and/or heat support based on ctrlSeqeOfOper (see lib/constants -> thermostatControlSequenceOfOperations)
            // WARN: a restart of zigbee2mqtt is required after changing ctrlSeqeOfOper for expose data to be re-calculated
            if (ctrlSeqeOfOper >= 2) {
                modes.push('heat');
            }
            if (ctrlSeqeOfOper < 2 || ctrlSeqeOfOper > 3) {
                modes.push('cool');
            }
            const hysteresisExposes = e
                .composite('hysteresis', 'hysteresis', ea.ALL)
                .withFeature(e.numeric('low', ea.SET))
                .withFeature(e.numeric('high', ea.SET))
                .withDescription('Set thermostat hysteresis low and high trigger values. (1 = 0.01ºC)');
            dynExposes.push(e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 7, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off'].concat(modes))
                .withRunningState(['idle'].concat(modes))
                .withLocalTemperatureCalibration()
                .withControlSequenceOfOperation(['heating_only', 'cooling_only'], ea.ALL));
            dynExposes.push(e.keypad_lockout());
            dynExposes.push(hysteresisExposes);
            dynExposes.push(e.battery().withAccess(ea.STATE_GET));
            dynExposes.push(e.battery_low());
            dynExposes.push(e.linkquality());
            return dynExposes;
        },
        meta: { battery: { voltageToPercentage: { min: 2500, max: 3000 } } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['genBasic', 'genPowerCfg', 'genIdentify', 'genPollCtrl', 'hvacThermostat', 'hvacUserInterfaceCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatOccupiedCoolingSetpoint(endpoint);
            await reporting.thermostatRunningState(endpoint);
            await reporting.batteryAlarmState(endpoint);
            await reporting.batteryVoltage(endpoint);
            await endpoint.read('hvacThermostat', ['ctrlSeqeOfOper', 'localTemperatureCalibration']);
            await endpoint.read('hvacThermostat', ['fourNoksHysteresisHigh', 'fourNoksHysteresisLow'], manufacturerOptions);
        },
    },
    {
        zigbeeModel: ['AV2010/33', '902010/33'],
        model: 'AV2010/33',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Vibration sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_2],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low()],
    },
    {
        zigbeeModel: ['AV2010/34', '902010/34'],
        model: 'AV2010/34',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Wall switch with 4 buttons',
        fromZigbee: [fromZigbee_1.default.command_recall],
        toZigbee: [],
        exposes: [e.action(['recall_*'])],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genScenes']);
        },
    },
    {
        zigbeeModel: ['AV2010/37', '902010/37'],
        model: 'AV2010/37',
        vendor: 'SMaBiT (Bitron Video)',
        description: 'Water detector with siren',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1],
        toZigbee: [],
        exposes: [e.water_leak(), e.battery_low()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=bitron.js.map