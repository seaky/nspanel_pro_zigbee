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
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [
            { modelID: 'TS011F', manufacturerName: '_TZ3000_air9m6af' },
            { modelID: 'TS011F', manufacturerName: '_TZ3000_9djocypn' },
            { modelID: 'TS011F', manufacturerName: '_TZ3000_bppxj3sf' },
        ],
        zigbeeModel: ['JZ-ZB-005', 'E220-KR5N0Z0-HA', 'E220-KR5N0Z0-HA'],
        model: 'WP33-EU/WP34-EU',
        vendor: 'LELLKI',
        description: 'Multiprise with 4 AC outlets and 2 USB super charging ports (16A)',
        toZigbee: [tuya.tz.power_on_behavior_2],
        fromZigbee: [tuya.fz.power_on_behavior_2],
        exposes: [e.power_on_behavior()],
        configure: tuya.configureMagicPacket,
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, l5: 5 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4', 'l5'], powerOnBehavior: false }),
        ],
    },
    {
        zigbeeModel: ['JZ-ZB-001'],
        model: 'JZ-ZB-001',
        description: 'Smart plug (without power monitoring)',
        vendor: 'LELLKI',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true })],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['JZ-ZB-003'],
        model: 'JZ-ZB-003',
        vendor: 'LELLKI',
        description: '3 gang switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3'] })],
    },
    {
        zigbeeModel: ['JZ-ZB-002'],
        model: 'JZ-ZB-002',
        vendor: 'LELLKI',
        description: '2 gang touch switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] })],
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3000_twqctvna' }],
        model: 'CM001',
        vendor: 'LELLKI',
        description: 'Circuit switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3000_z6fgd73r' }],
        model: 'XF-EU-S100-1-M',
        description: 'Touch switch 1 gang (with power monitoring)',
        vendor: 'LELLKI',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true })],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
        options: [exposes.options.measurement_poll_interval()],
        onEvent: (type, data, device, options) => tuya.onEventMeasurementPoll(type, data, device, options),
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3000_0yxeawjt' }],
        model: 'WK34-EU',
        description: 'Power socket EU (with power monitoring)',
        vendor: 'LELLKI',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true })],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
        options: [exposes.options.measurement_poll_interval()],
        onEvent: (type, data, device, options) => tuya.onEventMeasurementPoll(type, data, device, options),
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3000_c7nc9w3c' }],
        model: 'WP30-EU',
        description: 'Power cord 4 sockets EU (with power monitoring)',
        vendor: 'LELLKI',
        fromZigbee: [fromZigbee_1.default.on_off_force_multiendpoint, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.ignore_basic_report, tuya.fz.power_outage_memory],
        toZigbee: [toZigbee_1.default.on_off, tuya.tz.power_on_behavior_1],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            for (const ep of [1, 2, 3]) {
                await reporting.bind(device.getEndpoint(ep), coordinatorEndpoint, ['genOnOff']);
                await reporting.onOff(device.getEndpoint(ep));
            }
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
        options: [exposes.options.measurement_poll_interval()],
        exposes: [
            e.switch().withEndpoint('l1'),
            e.switch().withEndpoint('l2'),
            e.switch().withEndpoint('l3'),
            e.power(),
            e.current(),
            e.voltage(),
            e.energy(),
            e.enum('power_outage_memory', ea.ALL, ['on', 'off', 'restore']).withDescription('Recover state after power outage'),
        ],
        endpoint: (device) => {
            return { l1: 1, l2: 2, l3: 3 };
        },
        onEvent: (type, data, device, options) => tuya.onEventMeasurementPoll(type, data, device, options),
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lellki.js.map