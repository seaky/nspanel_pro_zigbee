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
const definitions = [
    {
        zigbeeModel: ['ADUROLIGHT_CSC'],
        model: '15090054',
        vendor: 'AduroSmart',
        description: 'Remote scene controller',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.command_toggle, fromZigbee_1.default.command_recall],
        toZigbee: [],
        exposes: [e.battery(), e.action(['toggle', 'recall_253', 'recall_254', 'recall_255'])],
    },
    {
        zigbeeModel: ['AD-SmartPlug3001'],
        model: '81848',
        vendor: 'AduroSmart',
        description: 'ERIA smart plug (with power measurements)',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.current(), e.voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.activePower(endpoint);
        },
    },
    {
        zigbeeModel: ['ZLL-ExtendedColo', 'ZLL-ExtendedColor'],
        model: '81809/81813',
        vendor: 'AduroSmart',
        description: 'ERIA colors and white shades smart light bulb A19/BR30',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: { applyRedFix: true } })],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['AD-RGBW3001'],
        model: '81809FBA',
        vendor: 'AduroSmart',
        description: 'ERIA colors and white shades smart light bulb A19/BR30',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] }, color: { modes: ['xy', 'hs'], applyRedFix: true } })],
    },
    {
        zigbeeModel: ['AD-E14RGBW3001'],
        model: '81895',
        vendor: 'AduroSmart',
        description: 'ERIA E14 Candle Color',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] }, color: true })],
    },
    {
        zigbeeModel: ['AD-DimmableLight3001'],
        model: '81810',
        vendor: 'AduroSmart',
        description: 'Zigbee Aduro Eria B22 bulb - warm white',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['Adurolight_NCC'],
        model: '81825',
        vendor: 'AduroSmart',
        description: 'ERIA smart wireless dimming switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, legacy.fz.eria_81825_updown],
        exposes: [e.action(['on', 'off', 'up', 'down'])],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
        },
    },
    {
        zigbeeModel: ['AD-Dimmer'],
        model: '81849',
        vendor: 'AduroSmart',
        description: 'ERIA built-in multi dimmer module 300W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['BDP3001'],
        model: '81855',
        vendor: 'AduroSmart',
        description: 'ERIA smart plug (dimmer)',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['BPU3'],
        model: 'BPU3',
        vendor: 'AduroSmart',
        description: 'ERIA smart plug',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['Extended Color LED Strip V1.0'],
        model: '81863',
        vendor: 'AduroSmart',
        description: 'Eria color LED strip',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] }, color: { modes: ['xy', 'hs'], applyRedFix: true } })],
    },
    {
        zigbeeModel: ['AD-81812', 'AD-ColorTemperature3001'],
        model: '81812/81814',
        vendor: 'AduroSmart',
        description: 'Eria tunable white A19/BR30 smart bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['ONOFFRELAY'],
        model: '81898',
        vendor: 'AduroSmart',
        description: 'AduroSmart on/off relay',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
    {
        fingerprint: [{ modelID: 'Smart Siren', manufacturerName: 'AduroSmart Eria' }],
        model: '81868',
        vendor: 'AduroSmart',
        description: 'Siren',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_wd, fromZigbee_1.default.ias_enroll, fromZigbee_1.default.ias_siren],
        toZigbee: [toZigbee_1.default.warning_simple, toZigbee_1.default.ias_max_duration, toZigbee_1.default.warning],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'ssIasZone', 'ssIasWd']);
            await endpoint.read('ssIasZone', ['zoneState', 'iasCieAddr', 'zoneId']);
            await endpoint.read('ssIasWd', ['maxDuration']);
        },
        exposes: [
            e.tamper(),
            e.warning(),
            e.numeric('max_duration', ea.ALL).withUnit('s').withValueMin(0).withValueMax(600).withDescription('Duration of Siren'),
            e.binary('alarm', ea.SET, 'ON', 'OFF').withDescription('Manual start of siren'),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=adurosmart.js.map