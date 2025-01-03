"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['020B0B'],
        model: '020B0B',
        vendor: 'Fischer & Honsel',
        description: 'LED Tischleuchte Beta Zig',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
        endpoint: (device) => {
            // https://github.com/Koenkk/zigbee-herdsman-converters/issues/5463
            const endpoint = device.endpoints.find((e) => e.inputClusters.includes(6)).ID;
            return { default: endpoint };
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=seastar_intelligence.js.map