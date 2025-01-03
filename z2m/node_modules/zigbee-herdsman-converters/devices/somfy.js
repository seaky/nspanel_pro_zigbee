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
        zigbeeModel: ['Sonesse Ultra 30 WF Li-Ion Rolle'],
        model: 'SOMFY-1241752',
        vendor: 'SOMFY',
        description: 'Blinds',
        extend: [(0, modernExtend_1.windowCovering)({ controls: ['lift'] }), (0, modernExtend_1.battery)()],
    },
    {
        zigbeeModel: ['1822647'],
        model: '1822647A',
        vendor: 'SOMFY',
        description: 'Zigbee smart plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.energy()],
        configure: async (device, coordinatorEndpoint) => {
            const ep = device.getEndpoint(12);
            await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering']);
            await reporting.onOff(ep, { min: 1, max: 3600, change: 0 });
            await reporting.readMeteringMultiplierDivisor(ep);
            await reporting.instantaneousDemand(ep);
            await reporting.currentSummDelivered(ep);
            await reporting.currentSummReceived(ep);
        },
    },
    {
        zigbeeModel: ['1811680'],
        model: '1811680',
        vendor: 'SOMFY',
        description: 'Zigbee opening sensor',
        extend: [(0, modernExtend_1.identify)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'generic', zoneAttributes: ['alarm_1', 'battery_low'] }), (0, modernExtend_1.battery)()],
    },
    {
        zigbeeModel: ['1811681'],
        model: '1811681',
        vendor: 'SOMFY',
        description: 'Zigbee motion sensor',
        extend: [(0, modernExtend_1.identify)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'battery_low'] }), (0, modernExtend_1.battery)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=somfy.js.map