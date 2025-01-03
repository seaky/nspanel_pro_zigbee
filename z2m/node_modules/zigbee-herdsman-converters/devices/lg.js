"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['B1027EB0Z01'],
        model: 'B1027EB0Z01',
        vendor: 'LG Electronics',
        description: 'Smart bulb 1',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['B1027EB0Z02'],
        model: 'B1027EB0Z02',
        vendor: 'LG Electronics',
        description: 'Smart bulb 2',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['B1027EB4Z01'],
        model: 'B1027EB4Z01',
        vendor: 'LG Electronics',
        description: 'Smart bulb 3',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lg.js.map