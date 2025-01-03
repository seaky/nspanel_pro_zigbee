"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Bouffalolab'],
        model: 'RMC002',
        vendor: 'Bouffalolab',
        description: 'US plug smart socket',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=bouffalo_lab.js.map