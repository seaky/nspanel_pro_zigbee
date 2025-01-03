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
const legrand_1 = require("../lib/legrand");
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: [' Light switch with neutral\u0000\u0000\u0000\u0000\u0000'],
        model: 'K4003C/L4003C/N4003C/NT4003C',
        vendor: 'BTicino',
        description: 'Light switch with neutral',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.identify, fromZigbee_1.default.on_off, fromZigbee_1.default.K4003C_binary_input, legrand_1.fzLegrand.cluster_fc01],
        toZigbee: [toZigbee_1.default.on_off, legrand_1.tzLegrand.led_mode, legrand_1.tzLegrand.identify],
        exposes: [e.switch(), e.action(['identify', 'on', 'off']), legrand_1.eLegrand.identify(), legrand_1.eLegrand.ledInDark(), legrand_1.eLegrand.ledIfOn()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genIdentify', 'genOnOff', 'genBinaryInput']);
        },
    },
    {
        zigbeeModel: [' Dimmer switch with neutral\u0000\u0000\u0000\u0000'],
        model: '4411C/L4411C/N4411C/NT4411C',
        vendor: 'BTicino',
        description: 'Dimmer switch with neutral',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.identify, fromZigbee_1.default.lighting_ballast_configuration, legrand_1.fzLegrand.cluster_fc01],
        toZigbee: [legrand_1.tzLegrand.led_mode, toZigbee_1.default.legrand_device_mode, legrand_1.tzLegrand.identify, toZigbee_1.default.ballast_config],
        exposes: [
            e.numeric('ballast_minimum_level', ea.ALL).withValueMin(1).withValueMax(254).withDescription('Specifies the minimum brightness value'),
            e.numeric('ballast_maximum_level', ea.ALL).withValueMin(1).withValueMax(254).withDescription('Specifies the maximum brightness value'),
            e.binary('device_mode', ea.ALL, 'dimmer_on', 'dimmer_off').withDescription('Allow the device to change brightness'),
            legrand_1.eLegrand.identify(),
            legrand_1.eLegrand.ledInDark(),
            legrand_1.eLegrand.ledIfOn(),
        ],
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['Bticino Din power consumption module '],
        model: 'F20T60A',
        description: 'DIN power consumption module (same as Legrand 412015)',
        vendor: 'BTicino',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'electrical' })],
        fromZigbee: [fromZigbee_1.default.identify, legrand_1.fzLegrand.cluster_fc01, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ignore_genOta],
        toZigbee: [toZigbee_1.default.legrand_device_mode, legrand_1.tzLegrand.identify],
        exposes: [
            e
                .enum('device_mode', ea.ALL, ['switch', 'auto'])
                .withDescription('switch: allow on/off, auto will use wired action via C1/C2 on contactor for example with HC/HP'),
        ],
    },
    {
        zigbeeModel: ['Power socket Bticino Serie LL '],
        model: 'L4531C',
        vendor: 'BTicino',
        description: 'Power socket with power consumption monitoring',
        fromZigbee: [fromZigbee_1.default.identify, fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, legrand_1.fzLegrand.cluster_fc01],
        toZigbee: [toZigbee_1.default.on_off, legrand_1.tzLegrand.led_mode, legrand_1.tzLegrand.identify],
        exposes: [e.switch(), e.action(['identify']), e.power(), e.voltage(), e.current()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genIdentify', 'genOnOff', 'haElectricalMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.activePower(endpoint);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=bticino.js.map