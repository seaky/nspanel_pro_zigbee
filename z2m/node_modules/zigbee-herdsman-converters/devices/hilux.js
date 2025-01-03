"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Hilux DZ8'],
        model: 'DZ8',
        vendor: 'Hilux',
        description: 'Spot 7W',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, powerOnBehavior: false })],
    },
    {
        fingerprint: [{ modelID: 'Dimmer-Switch-ZB3.0', manufacturerName: 'Hilux' }],
        model: 'D160-ZG',
        vendor: 'Hilux',
        description: 'Zigbee LED dimmer smart switch',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=hilux.js.map