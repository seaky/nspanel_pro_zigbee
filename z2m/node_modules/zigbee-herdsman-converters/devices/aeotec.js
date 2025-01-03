"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['WG001-Z01'],
        model: 'WG001',
        vendor: 'Aeotec',
        description: 'Range extender Zi',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        exposes: [],
    },
    {
        zigbeeModel: ['ZGA002'],
        model: 'ZGA002',
        vendor: 'Aeotec',
        description: 'Pico switch with power meter',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3 }, multiEndpointSkip: ['state', 'voltage', 'power', 'current', 'energy'] }),
            (0, modernExtend_1.deviceTemperature)(),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.onOff)({ powerOnBehavior: false }),
            (0, modernExtend_1.electricityMeter)(),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['2', '3'] }),
            (0, modernExtend_1.commandsLevelCtrl)({ endpointNames: ['2', '3'] }),
        ],
    },
    {
        zigbeeModel: ['ZGA003'],
        model: 'ZGA003',
        vendor: 'Aeotec',
        description: 'Pico switch duo with power meter',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4 } }),
            (0, modernExtend_1.deviceTemperature)(),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.onOff)({ powerOnBehavior: false, endpointNames: ['1', '2'] }),
            (0, modernExtend_1.electricityMeter)({ endpointNames: ['1', '2'] }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['3', '4'] }),
            (0, modernExtend_1.commandsLevelCtrl)({ endpointNames: ['3', '4'] }),
        ],
    },
    {
        zigbeeModel: ['ZGA004'],
        model: 'ZGA004',
        vendor: 'Aeotec',
        description: 'Pico shutter',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 } }),
            (0, modernExtend_1.deviceTemperature)(),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.windowCovering)({ controls: ['lift', 'tilt'] }),
            (0, modernExtend_1.commandsWindowCovering)({ legacyAction: false, endpointNames: ['3'] }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['4', '5'] }),
            (0, modernExtend_1.commandsLevelCtrl)({ endpointNames: ['4', '5'] }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=aeotec.js.map