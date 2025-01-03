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
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['HA-ZM12/24-1K'],
        model: 'HA-ZM12/24-1K',
        vendor: 'Halemeier',
        description: '1-channel smart receiver',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['HA-ZM12/24-mw2'],
        model: 'HA-ZM12/24-mw2',
        vendor: 'Halemeier',
        description: 'MultiWhite 1-channel smart receiver 12V',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['HA-ZGMW2-E'],
        model: 'HA-ZGMW2-E',
        vendor: 'Halemeier',
        description: 'LED driver',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['HA-ZSM-MW2'],
        model: 'HA-ZSM-MW2',
        vendor: 'Halemeier',
        description: 'S-Mitter MultiWhite2 smart remote control',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.command_step, fromZigbee_1.default.command_step_color_temperature, fromZigbee_1.default.command_recall, fromZigbee_1.default.command_off, fromZigbee_1.default.command_on],
        toZigbee: [toZigbee_1.default.battery_percentage_remaining],
        exposes: [
            e.action_group(),
            e.battery().withAccess(ea.STATE_GET),
            e.action([
                'recall_*',
                'on',
                'off',
                'color_temperature_step_up',
                'color_temperature_step_down',
                'brightness_step_up',
                'brightness_step_down',
            ]),
        ],
    },
    {
        zigbeeModel: ['HA-ZBM-MW2'],
        model: 'HA-ZBM-MW2',
        vendor: 'Halemeier',
        description: 'S-Mitter basic MultiWhite² 1-channel sender Zigbee ',
        fromZigbee: [fromZigbee_1.default.command_recall, fromZigbee_1.default.command_off, fromZigbee_1.default.command_on, fromZigbee_1.default.command_step_color_temperature, fromZigbee_1.default.command_step, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.battery_percentage_remaining],
        exposes: [
            e.battery().withAccess(ea.STATE_GET),
            e.action([
                'on',
                'off',
                'recall_1',
                'recall_2',
                'recall_3',
                'recall_4',
                'color_temperature_step_up',
                'color_temperature_step_down',
                'brightness_step_up',
                'brightness_step_down',
            ]),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['HA-ZX1'],
        model: 'HA-ZX1',
        vendor: 'Halemeier',
        description: 'X-Mitter smart remote control',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.identify)()],
        fromZigbee: [fromZigbee_1.default.command_off, fromZigbee_1.default.command_on, fromZigbee_1.default.command_stop, fromZigbee_1.default.command_move],
        exposes: [e.action(['recall_*', 'on', 'off', 'brightness_move_up', 'brightness_move_down'])],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=halemeier.js.map