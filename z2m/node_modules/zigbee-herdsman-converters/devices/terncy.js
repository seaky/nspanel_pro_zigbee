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
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['TERNCY-WS01-S4'],
        model: 'TERNCY-WS01',
        vendor: 'TERNCY',
        description: 'Smart light switch - 4 gang without neutral wire',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4'] })],
    },
    {
        zigbeeModel: ['DL001'],
        model: 'DL001',
        vendor: 'TERNCY',
        description: 'Two color temperature intelligent downlight',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [156, 476] } })],
    },
    {
        zigbeeModel: ['TERNCY-DC01'],
        model: 'TERNCY-DC01',
        vendor: 'TERNCY',
        description: 'Temperature & contact sensor ',
        fromZigbee: [fromZigbee_1.default.terncy_temperature, fromZigbee_1.default.terncy_contact, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.temperature(), e.contact(), e.battery()],
        meta: { battery: { dontDividePercentage: true } },
    },
    {
        zigbeeModel: ['TERNCY-PP01'],
        model: 'TERNCY-PP01',
        vendor: 'TERNCY',
        description: 'Awareness switch',
        fromZigbee: [fromZigbee_1.default.terncy_temperature, fromZigbee_1.default.occupancy_with_timeout, fromZigbee_1.default.illuminance, fromZigbee_1.default.terncy_raw, legacy.fz.terncy_raw, fromZigbee_1.default.battery],
        exposes: [e.temperature(), e.occupancy(), e.illuminance_lux(), e.illuminance(), e.action(['single', 'double', 'triple', 'quadruple'])],
        toZigbee: [],
        meta: { battery: { dontDividePercentage: true } },
    },
    {
        zigbeeModel: ['TERNCY-SD01'],
        model: 'TERNCY-SD01',
        vendor: 'TERNCY',
        description: 'Knob smart dimmer',
        fromZigbee: [fromZigbee_1.default.terncy_raw, legacy.fz.terncy_raw, legacy.fz.terncy_knob, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        meta: { battery: { dontDividePercentage: true } },
        exposes: [e.battery(), e.action(['single', 'double', 'triple', 'quadruple', 'rotate']), e.text('direction', ea.STATE)],
    },
    {
        zigbeeModel: ['TERNCY-LS01'],
        model: 'TERNCY-LS01',
        vendor: 'TERNCY',
        description: 'Smart light socket',
        exposes: [e.switch(), e.action(['single'])],
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.terncy_raw, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['CL001'],
        model: 'CL001',
        vendor: 'TERNCY',
        description: 'Beevon ceiling light',
        ota: ota.zigbeeOTA,
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [50, 500] }, powerOnBehavior: false, effect: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=terncy.js.map