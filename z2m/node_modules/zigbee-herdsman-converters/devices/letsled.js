"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [{ modelID: 'RGBW Down Light', manufacturerName: 'Letsleds China' }],
        model: 'HLC929-Z-RGBW-4C-IA-OTA-3.0',
        vendor: 'Letsleds',
        description: 'RGBW down light (color temp is inverted)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=letsled.js.map