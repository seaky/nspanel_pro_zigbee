"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['LCM-1C09-ZB Light Control'],
        model: 'LCM-1C09-ZB',
        vendor: 'EuControls',
        description: '0-10V Zigbee Dimmer',
        extend: [(0, modernExtend_1.light)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=eucontrols.js.map