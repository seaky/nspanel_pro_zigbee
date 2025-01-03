"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['ZP1-EN'],
        model: 'ZP1-EN',
        vendor: 'IMOU',
        description: 'Zigbee ZP1 PIR motion sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'], alarmTimeout: true })],
    },
    {
        zigbeeModel: ['ZR1-EN'],
        model: 'ZR1-EN',
        vendor: 'IMOU',
        description: 'Zigbee ZR1 siren',
        extend: [
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.forceDeviceType)({ type: 'EndDevice' }),
            (0, modernExtend_1.iasWarning)(),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'alarm', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
        ],
        meta: { disableDefaultResponse: true },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=imou.js.map