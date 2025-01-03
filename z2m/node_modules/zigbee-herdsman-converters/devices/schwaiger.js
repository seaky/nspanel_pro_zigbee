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
        zigbeeModel: ['SPW35Z-D0'],
        model: 'ZHS-15',
        vendor: 'Schwaiger',
        description: 'Power socket on/off with power consumption monitoring',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.activePower(endpoint);
        },
        exposes: [e.switch(), e.power(), e.current(), e.voltage()],
    },
    {
        zigbeeModel: ['ZBT-RGBWLight-GLS0844', 'HAL300'],
        model: 'HAL300',
        vendor: 'Schwaiger',
        description: 'Tint LED bulb E27 806 lumen, dimmable, color, white 1800-6500K',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['ZBT-DIMLight-Candle0800'],
        model: 'HAL600',
        vendor: 'Schwaiger',
        description: 'LED candle bulb E14 470 lumen, dimmable, color, white 2700K',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        fingerprint: [{ modelID: 'ZBT-CCTLight-GU100904', manufacturerName: 'LDS' }],
        model: 'HAL500',
        vendor: 'Schwaiger',
        description: 'LED bulb GU10 350 lumen, dimmable, color, white 2700-6500K',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['ZBT-DIMLight-GU100800'],
        model: 'HAL400',
        vendor: 'Schwaiger',
        description: 'LED Schwaiger HAL400 GU10 dimmable, warm white',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['ZBT-RGBWLight-C4700114'],
        model: 'HAL800',
        vendor: 'Schwaiger',
        description: 'LED candle bulb E14 470 lumen, dimmable, color, white 1800-6500K',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 555] }, color: true })],
    },
    {
        zigbeeModel: ['ZBT-RGBWLight-GU100114'],
        model: 'HAL550',
        vendor: 'Schwaiger',
        description: 'Smart light bulb LED RGB dimmable GU10',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 555] }, color: { modes: ['xy', 'hs'], enhancedHue: true } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=schwaiger.js.map