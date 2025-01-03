"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['SZ1000'],
        model: 'ZB250',
        vendor: 'Micro Matic Norge AS',
        description: 'Zigbee dimmer for LED',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=micromatic.js.map