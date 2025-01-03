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
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['PSS_00.00.00.15TC'],
        model: 'PSS-23ZBS',
        vendor: 'Climax',
        description: 'Power plug',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['SD8SC_00.00.03.12TC'],
        model: 'SD-8SCZBS',
        vendor: 'Climax',
        description: 'Smoke detector',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.warning],
        exposes: [e.smoke(), e.battery(), e.battery_low(), e.tamper(), e.warning()],
    },
    {
        zigbeeModel: ['WS15_00.00.00.10TC'],
        model: 'WLS-15ZBS',
        vendor: 'Climax',
        description: 'Water leakage sensor',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.water_leak(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['SCM-3_00.00.03.15'],
        model: 'SCM-5ZBS',
        vendor: 'Climax',
        description: 'Roller shutter',
        fromZigbee: [fromZigbee_1.default.cover_position_via_brightness, fromZigbee_1.default.cover_state_via_onoff],
        toZigbee: [toZigbee_1.default.cover_via_brightness],
        exposes: [e.cover_position().setAccess('state', ea.ALL)],
    },
    {
        zigbeeModel: [
            'PSM_00.00.00.35TC',
            'PSMP5_00.00.02.02TC',
            'PSMP5_00.00.05.01TC',
            'PSMP5_00.00.05.10TC',
            'PSMP5_00.00.03.15TC',
            'PSMP5_00.00.03.16TC',
            'PSMP5_00.00.03.19TC',
        ],
        model: 'PSM-29ZBSR',
        vendor: 'Climax',
        description: 'Power plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.ignore_transition],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.instantaneousDemand(endpoint, { min: 10, change: 2 });
        },
        whiteLabel: [{ vendor: 'Blaupunkt', model: 'PSM-S1' }],
        exposes: [e.switch(), e.power(), e.energy()],
    },
    {
        zigbeeModel: ['RS_00.00.02.06TC'],
        model: 'RS-23ZBS',
        vendor: 'Climax',
        description: 'Temperature & humidity sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
            await reporting.temperature(endpoint);
            // configureReporting.humidity(endpoint); not needed and fails
            // https://github.com/Koenkk/zigbee-herdsman-converters/issues/1312
        },
        exposes: [e.temperature(), e.humidity()],
    },
    {
        zigbeeModel: ['SRACBP5_00.00.03.06TC', 'SRAC_00.00.00.16TC', 'SRACBP5_00.00.05.10TC'],
        model: 'SRAC-23B-ZBSR',
        vendor: 'Climax',
        description: 'Smart siren',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_wd, fromZigbee_1.default.ias_enroll, fromZigbee_1.default.ias_siren],
        toZigbee: [toZigbee_1.default.warning_simple, toZigbee_1.default.ias_max_duration, toZigbee_1.default.warning, toZigbee_1.default.squawk],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'ssIasZone', 'ssIasWd']);
            await endpoint.read('ssIasZone', ['zoneState', 'iasCieAddr', 'zoneId']);
            await endpoint.read('ssIasWd', ['maxDuration']);
        },
        exposes: [
            e.battery_low(),
            e.tamper(),
            e.warning(),
            e.squawk(),
            e.numeric('max_duration', ea.ALL).withUnit('s').withValueMin(0).withValueMax(600).withDescription('Duration of Siren'),
            e.binary('alarm', ea.SET, 'START', 'OFF').withDescription('Manual start of siren'),
        ],
    },
    {
        zigbeeModel: ['WS15_00.00.00.14TC'],
        model: 'WS-15ZBS',
        vendor: 'Climax',
        description: 'Water leak sensor',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1],
        toZigbee: [],
        exposes: [e.water_leak(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['CO_00.00.00.15TC', 'CO_00.00.00.22TC'],
        model: 'CO-8ZBS',
        vendor: 'Climax',
        description: 'Smart carbon monoxide sensor',
        fromZigbee: [fromZigbee_1.default.ias_carbon_monoxide_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.carbon_monoxide(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['KP-ACE_00.00.03.12TC', 'KP-ACE_00.00.03.11TC'],
        model: 'KP-23EL-ZBS-ACE',
        vendor: 'Climax',
        description: 'Remote Keypad',
        fromZigbee: [fromZigbee_1.default.ias_keypad, fromZigbee_1.default.battery, fromZigbee_1.default.command_arm, fromZigbee_1.default.command_panic, fromZigbee_1.default.command_emergency],
        toZigbee: [],
        exposes: [e.battery_low(), e.tamper(), e.action(['emergency', 'panic', 'disarm', 'arm_all_zones', 'arm_day_zones'])],
    },
    {
        zigbeeModel: ['PRL_00.00.03.04TC'],
        model: 'PRL-1ZBS-12/24V',
        vendor: 'Climax',
        description: 'Zigbee 12-24V relay controller',
        extend: [(0, modernExtend_1.identify)(), (0, modernExtend_1.onOff)(), (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=climax.js.map