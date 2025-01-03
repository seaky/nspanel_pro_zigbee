"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Dimmer_us'],
        model: 'B07CVL9SZF',
        vendor: 'Quotra',
        description: 'Dimmer',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['QV-RGBCCT'],
        model: 'B07JHL6DRV',
        vendor: 'Quotra',
        description: 'RGB WW LED strip',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [150, 500] }, color: true, powerOnBehavior: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=quotra.js.map