"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Socket Switch'],
        model: 'ZCC-3500',
        vendor: 'KlikAanKlikUit',
        description: 'Zigbee socket switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        fingerprint: [{ modelID: 'Built-in Switch', manufacturerName: 'KlikAanKlikUit' }],
        model: 'ZCM-1800',
        vendor: 'KlikAanKlikUit',
        description: 'Zigbee switch module',
        extend: [(0, modernExtend_1.onOff)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=klikaanklikuit.js.map