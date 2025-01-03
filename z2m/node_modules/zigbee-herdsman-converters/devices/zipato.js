"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZHA-ColorLight'],
        model: 'rgbw2.zbee27',
        vendor: 'Zipato',
        description: 'RGBW LED bulb with dimmer',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=zipato.js.map