"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['L258'],
        model: 'L258',
        vendor: 'Sowilo DS',
        description: 'Heimdall Pro 5 channel RGBWW controller',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [150, 575] }, color: { modes: ['xy', 'hs'] }, turnsOffAtBrightness1: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=sowilo.js.map