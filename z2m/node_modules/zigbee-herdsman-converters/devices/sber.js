"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const tuya_1 = require("../lib/tuya");
const { tuyaMagicPacket, tuyaOnOffActionLegacy } = tuya_1.modernExtend;
const definitions = [
    {
        fingerprint: [{ modelID: 'SM0202', manufacturerName: '_TYZB01_2jzbhomb' }],
        model: 'SBDV-00029',
        vendor: 'Sber',
        description: 'Smart motion sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'], alarmTimeout: true }),
            (0, modernExtend_1.battery)({ voltage: true, voltageReporting: true }),
        ],
    },
    {
        fingerprint: [{ modelID: 'TS0203', manufacturerName: '_TYZB01_epni2jgy' }],
        model: 'SBDV-00030',
        vendor: 'Sber',
        description: 'Smart opening sensor',
        extend: [
            (0, modernExtend_1.ignoreClusterReport)({ cluster: 'genBasic' }),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ voltage: true, voltageReporting: true }),
        ],
    },
    {
        fingerprint: [{ modelID: 'TS0041A', manufacturerName: '_TYZB01_ub7urdza' }],
        model: 'SBDV-00032',
        vendor: 'Sber',
        description: 'Smart button',
        extend: [
            tuyaMagicPacket(),
            tuyaOnOffActionLegacy({ actions: ['single', 'double', 'hold'] }),
            (0, modernExtend_1.battery)({ percentageReporting: false }),
            /*
             * reporting.batteryPercentageRemaining removed as it was causing devices to fall of the network
             * every 1 hour, with light flashing when it happened, extremely short battery life, 2 presses for
             * action to register: https://github.com/Koenkk/zigbee2mqtt/issues/8072
             * Initially wrapped in a try catch: https://github.com/Koenkk/zigbee2mqtt/issues/6313
             */
        ],
    },
    {
        fingerprint: [{ modelID: 'TS0201', manufacturerName: '_TZ3000_zfirri2d' }],
        model: 'SBDV-00079',
        vendor: 'Sber',
        description: 'Smart temperature and humidity sensor',
        extend: [(0, modernExtend_1.temperature)(), (0, modernExtend_1.humidity)(), (0, modernExtend_1.battery)({ voltage: true, voltageReporting: true })],
    },
    {
        fingerprint: [{ modelID: 'TS0207', manufacturerName: '_TZ3000_c8bqthpo' }],
        model: 'SBDV-00154',
        vendor: 'Sber',
        description: 'Smart water leak sensor',
        extend: [
            (0, modernExtend_1.ignoreClusterReport)({ cluster: 'genBasic' }),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'water_leak', zoneAttributes: ['alarm_1', 'battery_low'] }),
            (0, modernExtend_1.battery)(),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=sber.js.map