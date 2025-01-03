"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['A11'],
        model: 'ZC05M',
        vendor: 'GIDEALED',
        description: 'Smart Zigbee RGB LED strip controller',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=gidealed.js.map