"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        fingerprint: [
            { modelID: 'WSZ 98426061', manufacturerName: 'Nordtronic A/S' },
            { modelID: 'WSZ 98426061', manufacturerName: 'Nordtronic' },
            { modelID: '98426061', manufacturerName: 'Nordtronic A/S' },
            { modelID: '98426061', manufacturerName: 'Nordtronic' },
        ],
        model: '98426061',
        vendor: 'Nordtronic',
        description: 'Remote Control',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.identify)(), (0, modernExtend_1.commandsOnOff)(), (0, modernExtend_1.commandsLevelCtrl)(), (0, modernExtend_1.commandsColorCtrl)()],
    },
    {
        zigbeeModel: ['BoxDIM2 98425031', '98425031', 'BoxDIMZ 98425031'],
        model: '98425031',
        vendor: 'Nordtronic',
        description: 'Box Dimmer 2.0',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['BoxRelay2 98423051', '98423051', 'BoxRelayZ 98423051'],
        model: '98423051',
        vendor: 'Nordtronic',
        description: 'Zigbee switch 400W',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['RotDIM2 98424072', '98424072', 'RotDIMZ 98424072'],
        model: '98424072',
        vendor: 'Nordtronic',
        description: 'Zigbee rotary dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=nordtronic.js.map