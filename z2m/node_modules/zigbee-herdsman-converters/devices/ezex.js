"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['E220-KR3N0Z0-HA'],
        model: 'ECW-100-A03',
        vendor: 'eZEX',
        description: 'Zigbee switch 3 gang',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { top: 1, center: 2, bottom: 3 } }), (0, modernExtend_1.onOff)({ endpointNames: ['top', 'center', 'bottom'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=ezex.js.map