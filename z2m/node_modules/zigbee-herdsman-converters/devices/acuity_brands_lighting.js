"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ABL-LIGHT-Z-001'],
        model: 'WF4C_WF6C',
        vendor: 'Acuity Brands Lighting (ABL)',
        description: 'Juno 4" and 6" LED smart wafer downlight',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [200, 370], startup: false } })],
    },
    {
        zigbeeModel: ['ABL-LIGHT-Z-201'],
        model: 'RB56SC',
        vendor: 'Acuity Brands Lighting (ABL)',
        description: 'Juno Retrobasics 4" and 6" LED smart downlight',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [200, 370], startup: false }, color: true })],
    },
    {
        zigbeeModel: ['ABL-LIGHT-Z-202'],
        model: 'RB56AC',
        vendor: 'Acuity Brands Lighting (ABL)',
        description: 'Juno Retrobasics 4" and 6" LED smart adjustable downlight',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [200, 370], startup: false }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=acuity_brands_lighting.js.map