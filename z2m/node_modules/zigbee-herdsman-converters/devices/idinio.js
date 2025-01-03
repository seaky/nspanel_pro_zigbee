"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [{ modelID: 'Dimmer-Switch-ZB3.0', manufacturerName: 'idinio' }],
        model: '0140302',
        vendor: 'Idinio',
        description: 'Zigbee LED foot dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=idinio.js.map