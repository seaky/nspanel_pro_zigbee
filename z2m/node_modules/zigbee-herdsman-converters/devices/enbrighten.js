"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['43076'],
        model: '43076',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['43078'],
        model: '43078',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart switch',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['43080'],
        model: '43080',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['43113'],
        model: '43113',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['43102'],
        model: '43102',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall outlet',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['43100'],
        model: '43100',
        vendor: 'Enbrighten',
        description: 'Plug-in Zigbee outdoor smart switch',
        extend: [(0, modernExtend_1.onOff)()],
        fromZigbee: [fromZigbee_1.default.command_on_state, fromZigbee_1.default.command_off_state],
    },
    {
        zigbeeModel: ['43082'],
        model: '43082',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true, effect: false, powerOnBehavior: false }), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['43084'],
        model: '43084',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['43090'],
        model: '43090',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['43094'],
        model: '43094',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart switch ZB4102',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['43096'],
        model: '43096',
        vendor: 'Enbrighten',
        description: 'Zigbee plug-in smart dimmer with dual controlled outlets',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['43109'],
        model: '43109',
        vendor: 'Enbrighten',
        description: 'Zigbee in-wall smart switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=enbrighten.js.map