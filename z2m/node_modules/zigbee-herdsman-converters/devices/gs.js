"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['BRHM8E27W70-I1'],
        model: 'BRHM8E27W70-I1',
        vendor: 'GS',
        description: 'Smart color light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true }), (0, modernExtend_1.identify)()],
    },
    {
        zigbeeModel: ['BDHM8E27W70-I1'],
        model: 'BDHM8E27W70-I1',
        vendor: 'GS',
        description: 'Smart light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } }), (0, modernExtend_1.identify)()],
    },
    {
        zigbeeModel: ['SGMHM-I1'],
        model: 'SGMHM-I1',
        vendor: 'GS',
        description: 'Methane gas sensor',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'gas', zoneAttributes: ['alarm_2'] })],
    },
    {
        zigbeeModel: ['SGPHM-I1'],
        model: 'SGPHM-I1',
        vendor: 'GS',
        description: 'Propane gas sensor',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'gas', zoneAttributes: ['alarm_2'] })],
    },
    {
        zigbeeModel: ['SKHMP30-I1'],
        model: 'SKHMP30-I1',
        vendor: 'GS',
        description: 'Smart socket',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false }), (0, modernExtend_1.electricityMeter)(), (0, modernExtend_1.identify)()],
    },
    {
        zigbeeModel: ['SMHM-I1'],
        model: 'SMHM-I1',
        vendor: 'GS',
        description: 'Motion sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ voltageToPercentage: { min: 2500, max: 3000 }, voltage: true }),
        ],
    },
    {
        zigbeeModel: ['SOHM-I1'],
        model: 'SOHM-I1',
        vendor: 'GS',
        description: 'Open and close sensor',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }), (0, modernExtend_1.battery)({ voltage: true })],
    },
    {
        zigbeeModel: ['SRHMP-I1'],
        model: 'SRHMP-I1',
        vendor: 'GS',
        description: 'Siren',
        meta: { disableDefaultResponse: true },
        extend: [(0, modernExtend_1.ignoreClusterReport)({ cluster: 'genBasic' }), (0, modernExtend_1.iasWarning)(), (0, modernExtend_1.battery)()],
    },
    {
        zigbeeModel: ['SSHM-I1'],
        model: 'SSHM-I1',
        vendor: 'GS',
        description: 'Smoke detector',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'smoke', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }), (0, modernExtend_1.battery)()],
    },
    {
        zigbeeModel: ['STHM-I1H'],
        model: 'STHM-I1H',
        vendor: 'GS',
        description: 'Temperature and humidity sensor',
        extend: [(0, modernExtend_1.temperature)(), (0, modernExtend_1.humidity)(), (0, modernExtend_1.battery)({ voltageToPercentage: { min: 2500, max: 3000 }, voltage: true })],
    },
    {
        zigbeeModel: ['SWHM-I1'],
        model: 'SWHM-I1',
        vendor: 'GS',
        description: 'Water leakage sensor',
        extend: [(0, modernExtend_1.iasZoneAlarm)({ zoneType: 'water_leak', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }), (0, modernExtend_1.battery)({ voltage: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=gs.js.map