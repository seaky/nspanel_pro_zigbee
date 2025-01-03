"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['AL8TC13W-AP'],
        model: 'AL8TC13W-AP',
        vendor: 'Alchemy',
        description: 'Downlight with tuneable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['AL8RGB13W-AP'],
        model: 'AL8RGB13W-AP',
        vendor: 'Alchemy',
        description: 'Downlight RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=alchemy.js.map