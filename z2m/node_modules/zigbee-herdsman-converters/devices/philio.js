"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['PAT04A-v1.1.5'],
        model: 'PAT04-A',
        vendor: 'Philio',
        description: 'Water leak detector',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'water_leak', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }), (0, modernExtend_1.battery)()],
        whiteLabel: [{ vendor: 'Evology', model: 'PAT04-A' }],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=philio.js.map