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
Object.defineProperty(exports, "__esModule", { value: true });
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const definitions = [
    {
        fingerprint: tuya.fingerprint('TS011F', ['_TZ3000_dd8wwzcy']),
        model: 'MG-AUZG01',
        vendor: 'MakeGood',
        description: 'Double Zigbee power point',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, indicatorMode: true, endpoints: ['l1', 'l2'], electricalMeasurements: true })],
        meta: { multiEndpointSkip: ['power', 'current', 'voltage', 'energy'], multiEndpoint: true },
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.rmsVoltage(endpoint, { change: 5 });
            await reporting.rmsCurrent(endpoint, { change: 50 });
            await reporting.activePower(endpoint, { change: 10 });
            await reporting.currentSummDelivered(endpoint);
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=makegood.js.map