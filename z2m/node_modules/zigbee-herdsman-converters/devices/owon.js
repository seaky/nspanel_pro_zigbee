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
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const fzLocal = {
    temperature: {
        ...fromZigbee_1.default.temperature,
        convert: (model, msg, publish, options, meta) => {
            // https://github.com/Koenkk/zigbee2mqtt/issues/15173
            if (msg.data.measuredValue < 32767) {
                return fromZigbee_1.default.temperature.convert(model, msg, publish, options, meta);
            }
        },
    },
    PC321_metering: {
        cluster: 'seMetering',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const factor = 0.001;
            const payload = {};
            if (msg.data.owonL1Energy !== undefined) {
                const value = msg.data['owonL1Energy'];
                payload.energy_l1 = value * factor;
            }
            if (msg.data.owonL2Energy !== undefined) {
                const value = msg.data['owonL2Energy'];
                payload.energy_l2 = value * factor;
            }
            if (msg.data.owonL3Energy !== undefined) {
                const value = msg.data['owonL3Energy'];
                payload.energy_l3 = value * factor;
            }
            if (msg.data.owonL1ReactiveEnergy !== undefined) {
                const value = msg.data['owonL1ReactiveEnergy'];
                payload.reactive_energy_l1 = value * factor;
            }
            if (msg.data.owonL2ReactiveEnergy !== undefined) {
                const value = msg.data['owonL2ReactiveEnergy'];
                payload.reactive_energy_l2 = value * factor;
            }
            if (msg.data.owonL3ReactiveEnergy !== undefined) {
                const value = msg.data['owonL3ReactiveEnergy'];
                payload.reactive_energy_l3 = value / 1000;
            }
            if (msg.data.owonL1PhasePower !== undefined) {
                payload.power_l1 = msg.data['owonL1PhasePower'];
            }
            if (msg.data.owonL2PhasePower !== undefined) {
                payload.power_l2 = msg.data['owonL2PhasePower'];
            }
            if (msg.data.owonL3PhasePower !== undefined) {
                payload.power_l3 = msg.data['owonL3PhasePower'];
            }
            if (msg.data.owonL1PhaseReactivePower !== undefined) {
                payload.reactive_power_l1 = msg.data['owonL1PhaseReactivePower'];
            }
            if (msg.data.owonL2PhaseReactivePower !== undefined) {
                payload.reactive_power_l2 = msg.data['owonL2PhaseReactivePower'];
            }
            if (msg.data.owonL3PhaseReactivePower !== undefined) {
                payload.reactive_power_l3 = msg.data['owonL3PhaseReactivePower'];
            }
            if (msg.data.owonL1PhaseVoltage !== undefined) {
                payload.voltage_l1 = msg.data['owonL1PhaseVoltage'] / 10.0;
            }
            if (msg.data.owonL2PhaseVoltage !== undefined) {
                payload.voltage_l2 = msg.data['owonL2PhaseVoltage'] / 10.0;
            }
            if (msg.data.owonL3PhaseVoltage !== undefined) {
                payload.voltage_l3 = msg.data['owonL3PhaseVoltage'] / 10.0;
            }
            if (msg.data.owonL1PhaseCurrent !== undefined) {
                payload.current_l1 = msg.data['owonL1PhaseCurrent'] * factor;
            }
            if (msg.data.owonL2PhaseCurrent !== undefined) {
                payload.current_l2 = msg.data['owonL2PhaseCurrent'] * factor;
            }
            if (msg.data.owonL3PhaseCurrent !== undefined) {
                payload.current_l3 = msg.data['owonL3PhaseCurrent'] * factor;
            }
            if (msg.data.owonFrequency !== undefined) {
                payload.frequency = msg.data['owonFrequency'];
            }
            // Issue #20719 summation manufacturer attributes are not well parsed
            if (msg.data.owonReactivePowerSum !== undefined || msg.data['8451'] !== undefined) {
                // 0x2103 -> 8451
                const value = msg.data['owonReactiveEnergySum'] || msg.data['8451'];
                payload.power_reactive = value;
            }
            if (msg.data.owonCurrentSum !== undefined || msg.data['12547'] !== undefined) {
                // 0x3103 -> 12547
                const data = msg.data['owonCurrentSum'] || msg.data['12547'] * factor;
                payload.current = data;
            }
            if (msg.data.owonReactiveEnergySum !== undefined || msg.data['16643'] !== undefined) {
                // 0x4103 -> 16643
                const value = msg.data['owonReactiveEnergySum'] || msg.data['16643'];
                payload.reactive_energy = value * factor;
            }
            if (msg.data.owonL1PowerFactor !== undefined) {
                payload.power_factor_l1 = msg.data['owonL1PowerFactor'] / 100;
            }
            if (msg.data.owonL2PowerFactor !== undefined) {
                payload.power_factor_l2 = msg.data['owonL2PowerFactor'] / 100;
            }
            if (msg.data.owonL3PowerFactor !== undefined) {
                payload.power_factor_l3 = msg.data['owonL3PowerFactor'] / 100;
            }
            return payload;
        },
    },
};
const tzLocal = {
    PC321_clearMetering: {
        key: ['clear_metering'],
        convertSet: async (entity, key, value, meta) => {
            await entity.command(0xffe0, 0x00, {}, { disableDefaultResponse: true });
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['WSP402'],
        model: 'WSP402',
        vendor: 'OWON',
        description: 'Smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['WSP403-E'],
        model: 'WSP403',
        vendor: 'OWON',
        whiteLabel: [{ vendor: 'Oz Smart Things', model: 'WSP403' }],
        description: 'Smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }), (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
    {
        zigbeeModel: ['WSP404'],
        model: 'WSP404',
        vendor: 'OWON',
        description: 'Smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['CB432'],
        model: 'CB432',
        vendor: 'OWON',
        description: '32A/63A power circuit breaker',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['PIR313-E', 'PIR313'],
        model: 'PIR313-E',
        vendor: 'OWON',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.occupancy_timeout, fromZigbee_1.default.illuminance],
        toZigbee: [],
        exposes: [e.occupancy(), e.tamper(), e.battery_low(), e.illuminance(), e.illuminance_lux().withUnit('lx'), e.temperature(), e.humidity()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint2 = device.getEndpoint(2);
            const endpoint3 = device.getEndpoint(3);
            if (device.modelID == 'PIR313') {
                await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement']);
                await reporting.bind(endpoint3, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
            }
            else {
                await reporting.bind(endpoint3, coordinatorEndpoint, ['msIlluminanceMeasurement']);
                await reporting.bind(endpoint2, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
            }
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['AC201'],
        model: 'AC201',
        vendor: 'OWON',
        description: 'HVAC controller/IR blaster',
        fromZigbee: [fromZigbee_1.default.fan, fromZigbee_1.default.thermostat],
        toZigbee: [
            toZigbee_1.default.fan_mode,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_occupied_cooling_setpoint,
            toZigbee_1.default.thermostat_ac_louver_position,
            toZigbee_1.default.thermostat_local_temperature,
        ],
        exposes: [
            e
                .climate()
                .withSystemMode(['off', 'heat', 'cool', 'auto', 'dry', 'fan_only'])
                .withSetpoint('occupied_heating_setpoint', 8, 30, 1)
                .withSetpoint('occupied_cooling_setpoint', 8, 30, 1)
                .withAcLouverPosition(['fully_open', 'fully_closed', 'half_open', 'quarter_open', 'three_quarters_open'])
                .withLocalTemperature(),
            e.fan().withModes(['low', 'medium', 'high', 'on', 'auto']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['hvacFanCtrl']);
            await reporting.fanMode(endpoint);
            await reporting.bind(endpoint, coordinatorEndpoint, ['hvacThermostat']);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatTemperature(endpoint, { min: 60, max: 600, change: 0.1 });
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatAcLouverPosition(endpoint);
        },
    },
    {
        zigbeeModel: ['THS317'],
        model: 'THS317',
        vendor: 'OWON',
        description: 'Temperature and humidity sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery(), e.temperature(), e.humidity()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.batteryVoltage(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['THS317-ET'],
        model: 'THS317-ET',
        vendor: 'OWON',
        description: 'Temperature sensor',
        fromZigbee: [fzLocal.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery(), e.temperature()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(3) || device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['PC321'],
        model: 'PC321',
        vendor: 'OWON',
        description: '3-Phase clamp power meter',
        fromZigbee: [fromZigbee_1.default.metering, fzLocal.PC321_metering],
        toZigbee: [tzLocal.PC321_clearMetering],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['seMetering']);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            if (device.powerSource === 'Unknown') {
                device.powerSource = 'Mains (single phase)';
                device.save();
            }
        },
        meta: { publishDuplicateTransaction: true },
        exposes: [
            e.current(),
            e.power(),
            e.power_reactive(),
            e.energy(),
            e.numeric('reactive_energy', ea.STATE).withUnit('kVArh').withDescription('Reactive energy for all phase'),
            e.numeric('voltage_l1', ea.STATE).withUnit('V').withDescription('Phase 1 voltage'),
            e.numeric('voltage_l2', ea.STATE).withUnit('V').withDescription('Phase 2 voltage'),
            e.numeric('voltage_l3', ea.STATE).withUnit('V').withDescription('Phase 3 voltage'),
            e.numeric('current_l1', ea.STATE).withUnit('A').withDescription('Phase 1 current'),
            e.numeric('current_l2', ea.STATE).withUnit('A').withDescription('Phase 2 current'),
            e.numeric('current_l3', ea.STATE).withUnit('A').withDescription('Phase 3 current'),
            e.numeric('energy_l1', ea.STATE).withUnit('kWh').withDescription('Phase 1 energy'),
            e.numeric('energy_l2', ea.STATE).withUnit('kWh').withDescription('Phase 2 energy'),
            e.numeric('energy_l3', ea.STATE).withUnit('kWh').withDescription('Phase 3 energy'),
            e.numeric('reactive_energy_l1', ea.STATE).withUnit('kVArh').withDescription('Phase 1 reactive energy'),
            e.numeric('reactive_energy_l2', ea.STATE).withUnit('kVArh').withDescription('Phase 2 reactive energy'),
            e.numeric('reactive_energy_l3', ea.STATE).withUnit('kVArh').withDescription('Phase 3 reactive energy'),
            e.numeric('power_l1', ea.STATE).withUnit('W').withDescription('Phase 1 power'),
            e.numeric('power_l2', ea.STATE).withUnit('W').withDescription('Phase 2 power'),
            e.numeric('power_l3', ea.STATE).withUnit('W').withDescription('Phase 3 power'),
            e.numeric('reactive_power_l1', ea.STATE).withUnit('VAr').withDescription('Phase 1 reactive power'),
            e.numeric('reactive_power_l2', ea.STATE).withUnit('VAr').withDescription('Phase 2 reactive power'),
            e.numeric('reactive_power_l3', ea.STATE).withUnit('VAr').withDescription('Phase 3 reactive power'),
            e.numeric('power_factor_l1', ea.STATE).withUnit('%').withDescription('Phase 1 power factor'),
            e.numeric('power_factor_l2', ea.STATE).withUnit('%').withDescription('Phase 2 power factor'),
            e.numeric('power_factor_l3', ea.STATE).withUnit('%').withDescription('Phase 3 power factor'),
            e.enum('clear_metering', ea.SET, ['clear']).withDescription('Clear measurement data'),
        ],
    },
    {
        zigbeeModel: ['PCT504', 'PCT504-E'],
        model: 'PCT504',
        vendor: 'OWON',
        description: 'HVAC fan coil',
        fromZigbee: [fromZigbee_1.default.fan, fromZigbee_1.default.thermostat, fromZigbee_1.default.humidity, fromZigbee_1.default.occupancy, legacy.fz.hvac_user_interface],
        toZigbee: [
            toZigbee_1.default.fan_mode,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_unoccupied_heating_setpoint,
            toZigbee_1.default.thermostat_occupied_cooling_setpoint,
            toZigbee_1.default.thermostat_unoccupied_cooling_setpoint,
            toZigbee_1.default.thermostat_min_heat_setpoint_limit,
            toZigbee_1.default.thermostat_max_heat_setpoint_limit,
            toZigbee_1.default.thermostat_min_cool_setpoint_limit,
            toZigbee_1.default.thermostat_max_cool_setpoint_limit,
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.thermostat_programming_operation_mode,
        ],
        exposes: [
            e.humidity(),
            e.occupancy(),
            e
                .climate()
                .withSystemMode(['off', 'heat', 'cool', 'fan_only', 'sleep'])
                .withLocalTemperature()
                .withRunningMode(['off', 'heat', 'cool'])
                .withRunningState(['idle', 'heat', 'cool', 'fan_only'])
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withSetpoint('unoccupied_heating_setpoint', 5, 30, 0.5)
                .withSetpoint('occupied_cooling_setpoint', 7, 35, 0.5)
                .withSetpoint('unoccupied_cooling_setpoint', 7, 35, 0.5),
            e.fan().withModes(['low', 'medium', 'high', 'on', 'auto']),
            e.programming_operation_mode(['setpoint', 'eco']),
            e.keypad_lockout(),
            e.max_heat_setpoint_limit(5, 30, 0.5),
            e.min_heat_setpoint_limit(5, 30, 0.5),
            e.max_cool_setpoint_limit(7, 35, 0.5),
            e.min_cool_setpoint_limit(7, 35, 0.5),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = [
                'genBasic',
                'genIdentify',
                'genGroups',
                'hvacThermostat',
                'hvacUserInterfaceCfg',
                'hvacFanCtrl',
                'msTemperatureMeasurement',
                'msOccupancySensing',
            ];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.fanMode(endpoint);
            await reporting.bind(endpoint, coordinatorEndpoint, ['hvacThermostat']);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatOccupiedCoolingSetpoint(endpoint);
            await reporting.thermostatTemperature(endpoint, { min: 60, max: 600, change: 0.1 });
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatRunningMode(endpoint);
            await reporting.thermostatRunningState(endpoint);
            await reporting.humidity(endpoint, { min: 60, max: 600, change: 1 });
            await reporting.thermostatKeypadLockMode(endpoint);
            await endpoint.read('hvacThermostat', [
                'systemMode',
                'runningMode',
                'runningState',
                'occupiedHeatingSetpoint',
                'unoccupiedHeatingSetpoint',
                'occupiedCoolingSetpoint',
                'unoccupiedCoolingSetpoint',
                'localTemp',
            ]);
            await endpoint.read('msRelativeHumidity', ['measuredValue']);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['msOccupancySensing']);
            await reporting.occupancy(endpoint2, { min: 1, max: 600, change: 1 });
            await endpoint2.read('msOccupancySensing', ['occupancy']);
        },
    },
    {
        zigbeeModel: ['PIR323-PTH'],
        model: 'PIR323-PTH',
        vendor: 'OWON',
        description: 'Multi-sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.occupancy_timeout],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.temperature(), e.humidity()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['SLC603'],
        model: 'SLC603',
        vendor: 'OWON',
        description: 'Zigbee remote dimmer',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.command_toggle, fromZigbee_1.default.command_step, fromZigbee_1.default.command_step_color_temperature],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.battery_low(),
            e.action(['toggle', 'brightness_step_up', 'brightness_step_down', 'color_temperature_step_up', 'color_temperature_step_down']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['PIR313-P'],
        model: 'PIR313-P',
        vendor: 'OWON',
        description: 'Motion sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'battery_low', 'tamper'] })],
    },
    {
        zigbeeModel: ['DWS312'],
        model: 'DWS312',
        vendor: 'OWON',
        description: 'Door/window sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'battery_low', 'tamper'] })],
    },
    {
        zigbeeModel: ['SPM915'],
        model: 'SPM915',
        vendor: 'OWON',
        description: 'Sleeping pad monitor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'battery_low', 'tamper'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=owon.js.map