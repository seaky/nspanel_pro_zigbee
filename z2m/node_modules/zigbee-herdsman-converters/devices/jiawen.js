"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['FB56-ZCW08KU1.1', 'FB56-ZCW08KU1.0'],
        model: 'K2RGBW01',
        vendor: 'JIAWEN',
        description: 'Wireless Bulb E27 9W RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['FB56-ZBW02KU1.5'],
        model: 'JW-A04-CT',
        vendor: 'JIAWEN',
        description: 'LED strip light controller',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=jiawen.js.map