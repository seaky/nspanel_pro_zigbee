"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const definitions = [
    {
        zigbeeModel: ['Z10'],
        model: 'CGW-Z-0010',
        vendor: 'CEL',
        description: 'Cortet range extender',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        exposes: [],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=cel.js.map