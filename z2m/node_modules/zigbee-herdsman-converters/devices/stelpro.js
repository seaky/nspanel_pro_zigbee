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
const constants = __importStar(require("../lib/constants"));
const exposes = __importStar(require("../lib/exposes"));
const legacy = __importStar(require("../lib/legacy"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const fzLocal = {
    power: {
        cluster: 'hvacThermostat',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data['16392'] !== undefined) {
                return { power: msg.data['16392'] };
            }
        },
    },
    energy: {
        cluster: 'hvacThermostat',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data['16393'] !== undefined) {
                return { energy: parseFloat(msg.data['16393']) / 1000 };
            }
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['HT402'],
        model: 'HT402',
        vendor: 'Stelpro',
        description: 'Hilo thermostat',
        fromZigbee: [fromZigbee_1.default.stelpro_thermostat, fromZigbee_1.default.hvac_user_interface, fzLocal.power, fzLocal.energy],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.stelpro_thermostat_outdoor_temperature,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e.power(),
            e.energy(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['heat'])
                .withRunningState(['idle', 'heat']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = ['genBasic', 'genIdentify', 'genGroups', 'hvacThermostat', 'hvacUserInterfaceCfg', 'msTemperatureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // Has Unknown power source, force it.
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        zigbeeModel: ['ST218'],
        model: 'ST218',
        vendor: 'Stelpro',
        description: 'Ki convector, line-voltage thermostat',
        fromZigbee: [legacy.fz.stelpro_thermostat, legacy.fz.hvac_user_interface],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.stelpro_thermostat_outdoor_temperature,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat'])
                .withPiHeatingDemand(),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = ['genBasic', 'genIdentify', 'genGroups', 'hvacThermostat', 'hvacUserInterfaceCfg', 'msTemperatureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // Those exact parameters (min/max/change) are required for reporting to work with Stelpro Ki
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // cluster 0x0201 attribute 0x401c
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'StelproSystemMode',
                    minimumReportInterval: constants.repInterval.MINUTE,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ]);
        },
    },
    {
        zigbeeModel: ['STZB402+', 'STZB402'],
        model: 'STZB402',
        vendor: 'Stelpro',
        description: 'Ki, line-voltage thermostat',
        fromZigbee: [legacy.fz.stelpro_thermostat, legacy.fz.hvac_user_interface, fromZigbee_1.default.humidity],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.stelpro_thermostat_outdoor_temperature,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e.humidity(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = ['genBasic', 'genIdentify', 'genGroups', 'hvacThermostat', 'hvacUserInterfaceCfg', 'msTemperatureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // Those exact parameters (min/max/change) are required for reporting to work with Stelpro Ki
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // cluster 0x0201 attribute 0x401c
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'StelproSystemMode',
                    minimumReportInterval: constants.repInterval.MINUTE,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ]);
        },
    },
    {
        zigbeeModel: ['MaestroStat'],
        model: 'SMT402',
        vendor: 'Stelpro',
        description: 'Maestro, line-voltage thermostat',
        fromZigbee: [legacy.fz.stelpro_thermostat, legacy.fz.hvac_user_interface, fromZigbee_1.default.humidity],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.stelpro_thermostat_outdoor_temperature,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e.humidity(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = [
                'genBasic',
                'genIdentify',
                'genGroups',
                'hvacThermostat',
                'hvacUserInterfaceCfg',
                'msRelativeHumidity',
                'msTemperatureMeasurement',
            ];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // Those exact parameters (min/max/change) are required for reporting to work with Stelpro Maestro
            await reporting.thermostatTemperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // cluster 0x0201 attribute 0x401c
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'StelproSystemMode',
                    minimumReportInterval: constants.repInterval.MINUTE,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ]);
        },
    },
    {
        zigbeeModel: ['SORB'],
        model: 'SORB',
        vendor: 'Stelpro',
        description: 'ORLÉANS fan heater',
        fromZigbee: [fromZigbee_1.default.stelpro_thermostat, fromZigbee_1.default.hvac_user_interface],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = ['genBasic', 'genIdentify', 'genGroups', 'hvacThermostat', 'hvacUserInterfaceCfg', 'msTemperatureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // Those exact parameters (min/max/change) are required for reporting to work with Stelpro SORB
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // cluster 0x0201 attribute 0x401c
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'StelproSystemMode',
                    minimumReportInterval: constants.repInterval.MINUTE,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ]);
        },
    },
    {
        zigbeeModel: ['SMT402AD'],
        model: 'SMT402AD',
        vendor: 'Stelpro',
        description: 'Maestro, line-voltage thermostat',
        fromZigbee: [legacy.fz.stelpro_thermostat, legacy.fz.hvac_user_interface, fromZigbee_1.default.humidity],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_temperature_display_mode,
            toZigbee_1.default.thermostat_keypad_lockout,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.stelpro_thermostat_outdoor_temperature,
        ],
        exposes: [
            e.local_temperature(),
            e.keypad_lockout(),
            e.humidity(),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(25);
            const binds = [
                'genBasic',
                'genIdentify',
                'genGroups',
                'hvacThermostat',
                'hvacUserInterfaceCfg',
                'msRelativeHumidity',
                'msTemperatureMeasurement',
            ];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // Those exact parameters (min/max/change) are required for reporting to work with Stelpro Maestro
            await reporting.thermostatTemperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatSystemMode(endpoint);
            await reporting.thermostatPIHeatingDemand(endpoint);
            await reporting.thermostatKeypadLockMode(endpoint);
            // cluster 0x0201 attribute 0x401c
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'StelproSystemMode',
                    minimumReportInterval: constants.repInterval.MINUTE,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 1,
                },
            ]);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=stelpro.js.map