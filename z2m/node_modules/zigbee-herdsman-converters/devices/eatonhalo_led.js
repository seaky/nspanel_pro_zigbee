"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Halo_RL5601'],
        model: 'RL460WHZHA69', // The 4" CAN variant presents as 5/6" zigbeeModel.
        vendor: 'Eaton/Halo LED',
        description: 'Wireless Controlled LED retrofit downlight',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [200, 370] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=eatonhalo_led.js.map