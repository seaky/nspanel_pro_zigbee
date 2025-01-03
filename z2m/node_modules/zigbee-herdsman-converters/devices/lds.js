"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZBT-RGBWLight-A0000'],
        model: 'ZBT-RGBWLight-A0000',
        vendor: 'LDS',
        description: 'Ynoa smart LED E27',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 555] }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lds.js.map