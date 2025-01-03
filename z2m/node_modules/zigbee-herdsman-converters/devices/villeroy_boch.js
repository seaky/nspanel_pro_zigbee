"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['5991711', '5991713'],
        model: 'C5850000',
        vendor: 'Villeroy & Boch',
        description: 'Subway 3.0 Zigbee home automation kit',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['EC1300'],
        model: 'C0040000',
        vendor: 'Villeroy & Boch',
        description: 'Zigbee home automation kit for mirror',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=villeroy_boch.js.map