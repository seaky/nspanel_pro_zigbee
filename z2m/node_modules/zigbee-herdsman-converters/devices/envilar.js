"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const modernExtend_1 = require("../lib/modernExtend");
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['ZG_LED_DRIVER42CC'],
        model: 'ZG_LED_DRIVER42CC',
        vendor: 'Envilar',
        description: 'Zigbee LED driver',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['ZG50CC-CCT-DRIVER', 'HK-CCT'],
        model: 'ZG50CC-CCT-DRIVER',
        vendor: 'Envilar',
        description: 'Zigbee CCT LED driver',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['ZGR904-S'],
        model: 'ZGR904-S',
        vendor: 'Envilar',
        description: 'Touchlink remote',
        meta: { battery: { dontDividePercentage: true } },
        fromZigbee: [fromZigbee_1.default.command_recall, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery(), e.action(['recall_1', 'recall_2', 'on', 'off', 'brightness_stop', 'brightness_move_up', 'brightness_move_down'])],
    },
    {
        zigbeeModel: ['ZG102-BOX-UNIDIM'],
        model: 'ZG102-BOX-UNIDIM',
        vendor: 'Envilar',
        description: 'ZigBee AC phase-cut dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['ZG302-BOX-RELAY'],
        model: 'ZG302-BOX-RELAY',
        vendor: 'Envilar',
        description: 'Zigbee AC in wall switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['2CH-ZG-BOX-RELAY'],
        model: '2CH-ZG-BOX-RELAY',
        vendor: 'Envilar',
        description: '2 channel box relay',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] })],
    },
    {
        zigbeeModel: ['7853'],
        model: '1CH-HP-RELAY-7853',
        vendor: 'Envilar',
        description: '1 channel high power box relay',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: true }), (0, modernExtend_1.identify)(), (0, modernExtend_1.electricityMeter)()],
        whiteLabel: [{ vendor: 'Sunricher', model: 'SR-ZG9101SAC-HP-SWITCH-B' }],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=envilar.js.map