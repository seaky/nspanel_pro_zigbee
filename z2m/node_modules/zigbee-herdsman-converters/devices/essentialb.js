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
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['EB-E14-P45-RGBW'],
        model: 'EB-E14-P45-RGBW',
        vendor: 'EssentielB',
        description: 'Smart LED bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['EB-E14-FLA-CCT'],
        model: 'EB-E14-FLA-CCT',
        vendor: 'EssentielB',
        description: 'E14 flame CCT light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-E27-A60-CCT-FC'],
        model: 'EB-E27-A60-CCT-FC',
        vendor: 'EssentielB',
        description: 'E27 A60 CCT filament clear light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-E27-A60-CCT'],
        model: 'EB-E27-A60-CCT',
        vendor: 'EssentielB',
        description: 'E27 A60 CCT light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-E27-A60-RGBW'],
        model: 'EB-E27-A60-RGBW',
        vendor: 'EssentielB',
        description: 'E27 A60 RGBW light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['EB-E27-G95-CCT-FV'],
        model: 'EB-E27-G95-CCT-FV',
        vendor: 'EssentielB',
        description: 'Filament vintage globe light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-E27-ST64-CCT-FV'],
        model: 'EB-E27-ST64-CCT-FV',
        vendor: 'EssentielB',
        description: 'Filament vintage edison light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-GU10-MR16-CCT'],
        model: 'EB-GU10-MR16-CCT',
        vendor: 'EssentielB',
        description: 'GU10 MR16 CCT light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['EB-GU10-MR16-RGBW'],
        model: 'EB-GU10-MR16-RGBW',
        vendor: 'EssentielB',
        description: 'GU10 MR16 RGBW light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['EB-SB-1B'],
        model: 'EB-SB-1B',
        vendor: 'EssentielB',
        description: 'Smart button',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_step, fromZigbee_1.default.command_stop, fromZigbee_1.default.command_step_color_temperature],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on',
                'off',
                'color_temperature_step_up',
                'color_temperature_step_down',
                'brightness_step_up',
                'brightness_step_down',
                'brightness_stop',
            ]),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['genBasic', 'genOnOff', 'genPowerCfg', 'lightingColorCtrl', 'genLevelCtrl'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=essentialb.js.map