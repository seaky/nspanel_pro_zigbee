"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [{ modelID: 'Dimmer-Switch-ZB3.0', manufacturerName: 'HZC' }],
        model: 'ID-UK21FW09',
        vendor: 'Iolloi',
        description: 'Zigbee LED smart dimmer switch',
        extend: [(0, modernExtend_1.light)({ effect: false, configureReporting: true })],
        whiteLabel: [{ vendor: 'Iolloi', model: 'ID-EU20FW09' }],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=iolloi.js.map