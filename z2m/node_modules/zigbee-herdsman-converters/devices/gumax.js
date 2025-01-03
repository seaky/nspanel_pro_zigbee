"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['LST103'],
        model: 'LST103',
        vendor: 'Gumax',
        description: 'Gumax lighting system',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'], enhancedHue: true } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=gumax.js.map