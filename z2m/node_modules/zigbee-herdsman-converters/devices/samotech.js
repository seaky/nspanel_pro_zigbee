"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['SM308'],
        model: 'SM308',
        vendor: 'Samotech',
        description: 'Zigbee AC in wall switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['SM308-S'],
        model: 'SM308-S',
        vendor: 'Samotech',
        description: 'Zigbee in wall smart switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['SM308-2CH'],
        model: 'SM308-2CH',
        vendor: 'Samotech',
        description: 'Zigbee 2 channel in wall switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] }), (0, modernExtend_1.electricityMeter)()],
        meta: { multiEndpointSkip: ['power', 'energy', 'voltage', 'current'] },
    },
    {
        zigbeeModel: ['SM309-S'],
        model: 'SM309-S',
        vendor: 'Samotech',
        description: 'Zigbee dimmer 400W with power and energy metering',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['SM309'],
        model: 'SM309',
        vendor: 'Samotech',
        description: 'Zigbee dimmer 400W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        // v1 doesn't support electricity measurements
        // https://github.com/Koenkk/zigbee2mqtt/issues/21449
        fingerprint: [{ manufacturerName: 'Samotech', modelID: 'Dimmer-Switch-ZB3.0' }],
        model: 'SM323_v1',
        vendor: 'Samotech',
        description: 'Zigbee retrofit dimmer 250W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['SM323'],
        fingerprint: [{ modelID: 'HK_DIM_A', manufacturerName: 'Samotech' }],
        model: 'SM323_v2',
        vendor: 'Samotech',
        description: 'Zigbee retrofit dimmer 250W',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['SM324'],
        model: 'SM324',
        vendor: 'Samotech',
        description: '220V Zigbee CCT LED dimmer',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [150, 500] }, configureReporting: true })],
    },
    {
        zigbeeModel: ['SM325-ZG'],
        model: 'SM325-ZG',
        vendor: 'Samotech',
        description: 'Zigbee smart pull cord dimmer switch',
        extend: [(0, modernExtend_1.light)({ configureReporting: true, effect: false, powerOnBehavior: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=samotech.js.map