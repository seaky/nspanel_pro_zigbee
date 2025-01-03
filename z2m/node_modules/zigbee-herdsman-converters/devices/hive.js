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
const globalStore = __importStar(require("../lib/store"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['FWGU10Bulb02UK'],
        model: 'FWGU10Bulb02UK',
        vendor: 'Hive',
        description: 'GU10 warm white',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['MOT003'],
        model: 'MOT003',
        vendor: 'Hive',
        description: 'Motion sensor',
        fromZigbee: [
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.ignore_iaszone_statuschange,
            fromZigbee_1.default.ignore_iaszone_attreport,
        ],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(6);
            const binds = ['msTemperatureMeasurement', 'genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.temperature(endpoint);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.temperature(), e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['DWS003'],
        model: 'DWS003',
        vendor: 'Hive',
        description: 'Contact sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(6);
            const binds = ['msTemperatureMeasurement', 'genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.temperature(endpoint);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.temperature(), e.contact(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FWBulb01'],
        model: 'HALIGHTDIMWWE27',
        vendor: 'Hive',
        description: 'Active smart bulb white LED (E27)',
        extend: [(0, modernExtend_1.light)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['FWCLBulb01UK'],
        model: 'HALIGHTDIMWWE14',
        vendor: 'Hive',
        description: 'Active smart bulb white LED (E14)',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['FWBulb02UK'],
        model: 'HALIGHTDIMWWB22',
        vendor: 'Hive',
        description: 'Active smart bulb white LED (B22)',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['TWBulb02UK'],
        model: 'HV-GSCXZB229B',
        vendor: 'Hive',
        description: 'Active light, warm to cool white (E27 & B22)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['TWCLBulb01UK'],
        model: 'HV-CE14CXZB6',
        vendor: 'Hive',
        description: 'Active light, warm to cool white (E14)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['SLP2', 'SLP2b', 'SLP2c'],
        model: '1613V',
        vendor: 'Hive',
        description: 'Active plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.instantaneousDemand(endpoint);
            await reporting.currentSummDelivered(endpoint);
        },
        exposes: [e.switch(), e.power(), e.energy()],
    },
    {
        zigbeeModel: ['TWBulb01US'],
        model: 'HV-GSCXZB269',
        vendor: 'Hive',
        description: 'Active light cool to warm white (E26) ',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['TWBulb01UK'],
        model: 'HV-GSCXZB279_HV-GSCXZB229_HV-GSCXZB229K',
        vendor: 'Hive',
        description: 'Active light, warm to cool white (E27 & B22)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['TWGU10Bulb01UK'],
        model: 'HV-GUCXZB5',
        vendor: 'Hive',
        description: 'Active light, warm to cool white (GU10)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['KEYPAD001'],
        model: 'KEYPAD001',
        vendor: 'Hive',
        description: 'Alarm security keypad',
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        fromZigbee: [
            fromZigbee_1.default.command_arm_with_transaction,
            fromZigbee_1.default.command_panic,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ias_occupancy_alarm_1,
            fromZigbee_1.default.identify,
            fromZigbee_1.default.ias_contact_alarm_1,
            fromZigbee_1.default.ias_ace_occupancy_with_timeout,
        ],
        toZigbee: [toZigbee_1.default.arm_mode],
        exposes: [
            e.battery(),
            e.battery_voltage(),
            e.battery_low(),
            e.occupancy(),
            e.tamper(),
            e.contact(),
            e.numeric('action_code', ea.STATE).withDescription('Pin code introduced.'),
            e.numeric('action_transaction', ea.STATE).withDescription('Last action transaction number.'),
            e.text('action_zone', ea.STATE).withDescription('Alarm zone. Default value 23'),
            e.action(['panic', 'disarm', 'arm_day_zones', 'arm_all_zones', 'exit_delay', 'entry_delay']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const clusters = ['genPowerCfg', 'ssIasZone', 'ssIasAce', 'genIdentify'];
            await reporting.bind(endpoint, coordinatorEndpoint, clusters);
            await reporting.batteryVoltage(endpoint);
        },
        onEvent: async (type, data, device) => {
            if (data.type === 'commandGetPanelStatus' && data.cluster === 'ssIasAce') {
                const payload = {
                    panelstatus: globalStore.getValue(data.endpoint, 'panelStatus'),
                    secondsremain: 0x00,
                    audiblenotif: 0x00,
                    alarmstatus: 0x00,
                };
                await data.endpoint.commandResponse('ssIasAce', 'getPanelStatusRsp', payload, {}, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
    {
        zigbeeModel: ['SLR1'],
        model: 'SLR1',
        vendor: 'Hive',
        description: 'Heating thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display'),
        ],
        meta: { disableDefaultResponse: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(5);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatRunningState(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatTemperatureSetpointHold(endpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(endpoint);
        },
    },
    {
        zigbeeModel: ['SLR1b'],
        model: 'SLR1b',
        vendor: 'Hive',
        description: 'Heating thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display'),
        ],
        meta: { disableDefaultResponse: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(5);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatRunningState(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatTemperatureSetpointHold(endpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(endpoint);
        },
    },
    {
        zigbeeModel: ['SLR1c'],
        model: 'SLR1c',
        vendor: 'Hive',
        description: 'Heating thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display'),
        ],
        meta: { disableDefaultResponse: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(5);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatRunningState(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatTemperatureSetpointHold(endpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(endpoint);
        },
    },
    {
        zigbeeModel: ['SLR1d'],
        model: 'SLR1d',
        vendor: 'Hive',
        description: 'Single channel receiver',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display'),
        ],
    },
    {
        zigbeeModel: ['SLR2'],
        model: 'SLR2',
        vendor: 'Hive',
        description: 'Dual channel heating and hot water receiver',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        endpoint: (device) => {
            return { heat: 5, water: 6 };
        },
        meta: { disableDefaultResponse: true, multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const heatEndpoint = device.getEndpoint(5);
            const waterEndpoint = device.getEndpoint(6);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(heatEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(heatEndpoint);
            await reporting.thermostatRunningState(heatEndpoint);
            await reporting.thermostatSystemMode(heatEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHold(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(heatEndpoint);
            await reporting.bind(waterEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(waterEndpoint);
            await reporting.thermostatRunningState(waterEndpoint);
            await reporting.thermostatSystemMode(waterEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHold(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(waterEndpoint);
        },
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('heat'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('heat'),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 22, 22, 1)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat', 'emergency_heating'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('water'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('water'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('water'),
        ],
    },
    {
        zigbeeModel: ['SLR2b'],
        model: 'SLR2b',
        vendor: 'Hive',
        description: 'Dual channel heating and hot water thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        endpoint: (device) => {
            return { heat: 5, water: 6 };
        },
        meta: { disableDefaultResponse: true, multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const heatEndpoint = device.getEndpoint(5);
            const waterEndpoint = device.getEndpoint(6);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(heatEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(heatEndpoint);
            await reporting.thermostatRunningState(heatEndpoint);
            await reporting.thermostatSystemMode(heatEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHold(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(heatEndpoint);
            await reporting.bind(waterEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(waterEndpoint);
            await reporting.thermostatRunningState(waterEndpoint);
            await reporting.thermostatSystemMode(waterEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHold(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(waterEndpoint);
        },
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('heat'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('heat'),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 22, 22, 1)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat', 'emergency_heating'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('water'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('water'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('water'),
        ],
    },
    {
        zigbeeModel: ['SLR2c'],
        model: 'SLR2c',
        vendor: 'Hive',
        description: 'Dual channel heating and hot water thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.thermostat_weekly_schedule],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_weekly_schedule,
            toZigbee_1.default.thermostat_clear_weekly_schedule,
            toZigbee_1.default.thermostat_temperature_setpoint_hold,
            toZigbee_1.default.thermostat_temperature_setpoint_hold_duration,
        ],
        endpoint: (device) => {
            return { heat: 5, water: 6 };
        },
        meta: { disableDefaultResponse: true, multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const heatEndpoint = device.getEndpoint(5);
            const waterEndpoint = device.getEndpoint(6);
            const binds = ['genBasic', 'genIdentify', 'genAlarms', 'genTime', 'hvacThermostat'];
            await reporting.bind(heatEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(heatEndpoint);
            await reporting.thermostatRunningState(heatEndpoint);
            await reporting.thermostatSystemMode(heatEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHold(heatEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(heatEndpoint);
            await reporting.bind(waterEndpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(waterEndpoint);
            await reporting.thermostatRunningState(waterEndpoint);
            await reporting.thermostatSystemMode(waterEndpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHold(waterEndpoint);
            await reporting.thermostatTemperatureSetpointHoldDuration(waterEndpoint);
        },
        exposes: [
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 32, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('heat'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('heat'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('heat'),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 22, 22, 1)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat', 'emergency_heating'])
                .withRunningState(['idle', 'heat'])
                .withEndpoint('water'),
            e
                .binary('temperature_setpoint_hold', ea.ALL, true, false)
                .withDescription('Prevent changes. `false` = run normally. `true` = prevent from making changes.' +
                ' Must be set to `false` when system_mode = off or `true` for heat')
                .withEndpoint('water'),
            e
                .numeric('temperature_setpoint_hold_duration', ea.ALL)
                .withValueMin(0)
                .withValueMax(65535)
                .withDescription('Period in minutes for which the setpoint hold will be active. 65535 = attribute not' +
                ' used. 0 to 360 to match the remote display')
                .withEndpoint('water'),
        ],
    },
    {
        zigbeeModel: ['WPT1'],
        model: 'WPT1',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['SLT2'],
        model: 'SLT2',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryVoltage(endpoint);
        },
    },
    {
        zigbeeModel: ['SLT3'],
        model: 'SLT3',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['SLT3B'],
        model: 'SLT3B',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['SLT3C'],
        model: 'SLT3C',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['SLT3d'],
        model: 'SLT3d',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['SLB2'],
        model: 'SLB2',
        vendor: 'Hive',
        description: 'Signal booster',
        toZigbee: [],
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            else if (!globalStore.hasValue(device, 'interval')) {
                const interval = setInterval(async () => {
                    try {
                        await device.endpoints[0].read('genBasic', ['zclVersion']);
                    }
                    catch {
                        // Do nothing
                    }
                }, 1000 * 60 * 30); // Every 30 minutes
                globalStore.putValue(device, 'interval', interval);
            }
        },
        exposes: [],
    },
    {
        zigbeeModel: ['SLT6'],
        model: 'SLT6',
        vendor: 'Hive',
        description: 'Heating thermostat remote control',
        fromZigbee: [fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(9);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=hive.js.map