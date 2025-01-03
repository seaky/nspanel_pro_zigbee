"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZB-CL01'],
        model: 'ZB-CL01',
        vendor: 'KURVIA',
        description: 'GU10 GRBWC built from AliExpress',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [250, 454] }, color: { applyRedFix: true, enhancedHue: false } })],
        toZigbee: [toZigbee_1.default.on_off],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=kurvia.js.map