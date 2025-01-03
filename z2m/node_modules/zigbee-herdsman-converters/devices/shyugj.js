"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [{ modelID: 'DoorSensor-ZB3.0', manufacturerName: 'Shyugj' }],
        model: 'S901D-ZG',
        vendor: 'Shyugj',
        description: 'Door sensor',
        extend: [
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.iasZoneAlarm)({
                zoneType: 'generic',
                zoneAttributes: ['alarm_1', 'alarm_2', 'tamper', 'battery_low'],
            }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=shyugj.js.map