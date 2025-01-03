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
const exposes = __importStar(require("../lib/exposes"));
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['ZBT-DIMLight-GLS0800'],
        model: 'ZBT-DIMLight-GLS0800',
        vendor: 'Leedarson',
        description: 'LED E27 warm white',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['ZBT-CCTLight-GLS0904'],
        model: 'ZBT-CCTLight-GLS0904',
        vendor: 'Leedarson',
        description: 'LED E27 tunable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['ZBT-CCTLight-Candle0904'],
        model: 'ZBT-CCTLight-Candle0904',
        vendor: 'Leedarson',
        description: 'LED E14 tunable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['LED_GU10_OWDT'],
        model: 'ZM350STW1TCF',
        vendor: 'Leedarson',
        description: 'LED PAR16 50 GU10 tunable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined, startup: false } })],
    },
    {
        zigbeeModel: ['M350ST-W1R-01', 'A470S-A7R-04'],
        model: 'M350STW1',
        vendor: 'Leedarson',
        description: 'LED PAR16 50 GU10',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['LED_E27_ORD'],
        model: 'A806S-Q1G',
        vendor: 'Leedarson',
        description: 'LED E27 color',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['ZHA-DimmableLight'],
        model: 'A806S-Q1R',
        vendor: 'Leedarson',
        description: 'LED E27 tunable white',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['LED_E27_OWDT'],
        model: 'ZA806SQ1TCF',
        vendor: 'Leedarson',
        description: 'LED E27 tunable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['ZBT-CCTSwitch-D0001'],
        model: '6ARCZABZH',
        vendor: 'Leedarson',
        description: '4-Key Remote Controller',
        fromZigbee: [
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            legacy.fz.CCTSwitch_D0001_on_off,
            fromZigbee_1.default.CCTSwitch_D0001_levelctrl,
            fromZigbee_1.default.CCTSwitch_D0001_lighting,
            fromZigbee_1.default.battery,
        ],
        exposes: [
            e.battery(),
            e.action([
                'colortemp_up_release',
                'colortemp_down_release',
                'on',
                'off',
                'brightness_up',
                'brightness_down',
                'colortemp_up',
                'colortemp_down',
                'colortemp_up_hold',
                'colortemp_down_hold',
            ]),
        ],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['TWGU10Bulb02UK'],
        model: '6xy-M350ST-W1Z',
        vendor: 'Leedarson',
        description: 'PAR16 tunable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        fingerprint: [{ modelID: 'ZHA-PIRSensor', manufacturerName: 'Leedarson' }],
        model: '5AA-SS-ZA-H0',
        vendor: 'Leedarson',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.occupancy, fromZigbee_1.default.illuminance, fromZigbee_1.default.ignore_occupancy_report],
        toZigbee: [],
        exposes: [e.occupancy(), e.illuminance(), e.illuminance_lux()],
    },
    {
        zigbeeModel: ['ZB-SMART-PIRTH-V1'],
        model: '7A-SS-ZABC-H0',
        vendor: 'Leedarson',
        description: '4-in-1-Sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.illuminance, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.ignore_occupancy_report],
        toZigbee: [],
        exposes: [e.battery(), e.occupancy(), e.temperature(), e.illuminance(), e.illuminance_lux(), e.humidity()],
    },
    {
        zigbeeModel: ['ZB-MotionSensor-S0000'],
        model: '8A-SS-BA-H0',
        vendor: 'Leedarson',
        description: 'Motion Sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.ignore_occupancy_report],
        toZigbee: [],
        exposes: [e.battery(), e.occupancy()],
    },
    {
        zigbeeModel: ['LDHD2AZW'],
        model: 'LDHD2AZW',
        vendor: 'Leedarson',
        description: 'Magnetic door & window contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=leedarson.js.map