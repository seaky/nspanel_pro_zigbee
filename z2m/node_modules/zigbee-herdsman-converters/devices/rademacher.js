"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['RDM-35104001'],
        model: '35104001',
        vendor: 'Rademacher',
        description: 'addZ white + colour',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 555] }, color: true })],
    },
    {
        zigbeeModel: ['RDM-35144001'],
        model: '35144001',
        vendor: 'Rademacher',
        description: 'addZ white + colour',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 555] }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=rademacher.js.map