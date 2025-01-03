"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['SmartShades3'],
        model: 'SmartShades3',
        vendor: 'SOMA',
        description: 'Smart shades 3',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.windowCovering)({ controls: ['lift', 'tilt'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=soma.js.map