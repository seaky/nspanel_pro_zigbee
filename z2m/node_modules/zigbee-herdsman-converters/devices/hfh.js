"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['On-Air Combi CTW,303-0136'],
        model: '303-0136',
        vendor: 'HFH Solutions',
        description: 'LED controller',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [155, 495] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=hfh.js.map