"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['TQL25-2211'],
        model: 'TQL25-2211',
        vendor: 'Raex',
        description: 'Tubular motor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.windowCovering)({ controls: ['lift'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=raex.js.map