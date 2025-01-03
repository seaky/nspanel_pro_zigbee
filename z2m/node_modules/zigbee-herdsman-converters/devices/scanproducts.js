"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['12501'],
        model: '12501',
        vendor: 'Scan Products',
        description: 'Zigbee push dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['12502'],
        model: '12502',
        vendor: 'Scan Products',
        description: 'Zigbee 3.0 switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=scanproducts.js.map