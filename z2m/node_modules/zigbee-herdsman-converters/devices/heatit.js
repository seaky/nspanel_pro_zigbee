"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [{ type: 'Router', manufacturerName: 'Heatit Controls AB', modelID: 'Dimmer-Switch-ZB3.0' }],
        model: '1444420',
        vendor: 'Heatit',
        description: 'Zig Dim 250W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true, powerOnBehavior: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=heatit.js.map