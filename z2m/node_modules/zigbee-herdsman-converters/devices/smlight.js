"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['SLZB-06M', 'SLZB-06'],
        model: 'SLZB-06M',
        vendor: 'SMLIGHT',
        description: 'Router',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        exposes: [],
        extend: [(0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
        whiteLabel: [{ vendor: 'SMLIGHT', model: 'SLZB-06', description: 'Router', fingerprint: [{ modelID: 'SLZB-06' }] }],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=smlight.js.map