"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['CCT box'],
        model: 'B07KG5KF5R',
        vendor: 'GMY Smart Bulb',
        description: 'GMY Smart bulb, 470lm, vintage dimmable, 2700-6500k, E27',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=gmy.js.map