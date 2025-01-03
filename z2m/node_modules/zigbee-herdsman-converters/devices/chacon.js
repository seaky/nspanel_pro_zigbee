"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZB-ERSM-01'],
        model: 'ZB-ERSM-01',
        vendor: 'Chacon',
        description: 'Roller shutter module',
        extend: [
            (0, modernExtend_1.windowCovering)({ controls: ['lift'], coverInverted: true, coverMode: true }),
            (0, modernExtend_1.commandsWindowCovering)({ commands: ['open', 'close', 'stop'], legacyAction: false }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=chacon.js.map