"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['LEColorLight'],
        model: '900008-WW',
        vendor: 'ilux',
        description: 'Dimmable A60 E27 LED Bulb',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=ilux.js.map