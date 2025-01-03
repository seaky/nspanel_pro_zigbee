"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Z601', 'Z602', 'Z603', 'Z604'],
        model: 'Z6',
        vendor: 'Atsmart',
        description: '3 gang smart wall switch (no neutral wire)',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, center: 2, right: 3 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'center', 'right'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=atsmart.js.map