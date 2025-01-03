"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['iStar DIM Light'],
        model: 'SCCV2401-1',
        vendor: 'iStar',
        description: 'Zigbee 3.0 LED controller, dimmable white 12-36V DC max. 5A',
        extend: [(0, modernExtend_1.light)({ turnsOffAtBrightness1: true })],
    },
    {
        zigbeeModel: ['iStar CCT Light'],
        model: 'SCCV2403-2',
        vendor: 'iStar',
        description: 'Zigbee 3.0 LED controller, dimmable white spectrum',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, turnsOffAtBrightness1: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=istar.js.map