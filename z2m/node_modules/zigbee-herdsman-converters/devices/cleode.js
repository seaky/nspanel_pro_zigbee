"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZPLUG'],
        model: 'ZPLUG_Boost',
        vendor: 'CLEODE',
        description: 'ZPlug boost',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=cleode.js.map