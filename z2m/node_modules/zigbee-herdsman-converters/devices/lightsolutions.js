"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['91-947'],
        model: '200403V2-B',
        vendor: 'Light Solutions',
        description: 'Mini dimmer 200W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['91-948'],
        model: '200106V3',
        vendor: 'Light Solutions',
        description: 'Zigbee switch 200W',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['42-032'],
        model: '42-032',
        vendor: 'Light Solutions',
        description: 'LED driver CCT 12V - 30W - CCT',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        fingerprint: [{ modelID: 'Dimmer-Switch-ZB3.0', manufacturerName: 'Light Solutions' }],
        model: '3004482/3137308/3137309',
        vendor: 'Light Solutions',
        description: 'Zigbee dimmer for wire',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lightsolutions.js.map