"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['A10'],
        model: 'GD-ZCRGB012',
        vendor: 'GIDERWEL',
        description: 'Smart Zigbee RGB LED strip controller',
        extend: [(0, modernExtend_1.light)({ color: { modes: ['xy', 'hs'] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=giderwel.js.map