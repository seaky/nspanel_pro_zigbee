"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['MWM002'],
        model: 'MWM002',
        vendor: 'Modular',
        description: '0-10V Zigbee Dimmer',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=modular.js.map