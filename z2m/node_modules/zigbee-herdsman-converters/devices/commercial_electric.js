"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Zigbee CCT Downlight'],
        model: '53170161',
        vendor: 'Commercial Electric',
        description: 'Matte White Recessed Retrofit Smart Led Downlight - 4 Inch',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } }), (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=commercial_electric.js.map