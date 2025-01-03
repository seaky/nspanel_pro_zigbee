"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['35938'],
        model: 'ZB3102',
        vendor: 'Jasco Products',
        description: 'Zigbee plug-in smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['43132'],
        model: '43132',
        vendor: 'Jasco',
        description: 'Zigbee smart outlet',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['43095'],
        model: '43095',
        vendor: 'Jasco Products',
        description: 'Zigbee smart plug-in switch with energy metering',
        fromZigbee: [fromZigbee_1.default.command_on_state, fromZigbee_1.default.command_off_state],
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=jasco.js.map