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
        zigbeeModel: ['ESMLFzm_w6_Dimm'],
        model: '12226',
        vendor: 'AwoX',
        description: 'Dimmable filament lamp',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['TLSR82xx'],
        model: '33951/33948',
        vendor: 'AwoX',
        description: 'LED white',
        extend: [(0, modernExtend_1.light)()],
        whiteLabel: [{ vendor: 'EGLO', model: '12229' }],
    },
    {
        zigbeeModel: ['ERCU_Zm'],
        fingerprint: [
            {
                type: 'EndDevice',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                powerSource: 'Battery',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 2048, inputClusters: [0, 3, 4, 4096], outputClusters: [0, 3, 4, 5, 6, 8, 768, 4096] },
                    { ID: 3, profileID: 4751, deviceID: 2048, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
        ],
        model: '33952',
        vendor: 'AwoX',
        description: 'Remote controller',
        fromZigbee: [
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.awox_colors,
            fromZigbee_1.default.awox_refresh,
            fromZigbee_1.default.awox_refreshColored,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_recall,
            fromZigbee_1.default.command_step_color_temperature,
        ],
        toZigbee: [],
        exposes: [
            e.action([
                'on',
                'off',
                'red',
                'refresh',
                'refresh_colored',
                'blue',
                'yellow',
                'green',
                'brightness_step_up',
                'brightness_step_down',
                'brightness_move_up',
                'brightness_move_down',
                'brightness_stop',
                'recall_1',
                'color_temperature_step_up',
                'color_temperature_step_down',
            ]),
        ],
    },
    {
        fingerprint: [
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 269, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599, 10], outputClusters: [6] },
                    { ID: 3, profileID: 4751, deviceID: 269, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 269, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599, 10], outputClusters: [6] },
                    { ID: 3, profileID: 4751, deviceID: 269, inputClusters: [65360, 65361, 4], outputClusters: [65360, 65361] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 258, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096], outputClusters: [6, 25] },
                    { ID: 3, profileID: 49152, deviceID: 258, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 269, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599], outputClusters: [6] },
                    { ID: 3, profileID: 4751, deviceID: 269, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 269, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599], outputClusters: [6] },
                    { ID: 3, profileID: 4751, deviceID: 269, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
        ],
        model: '33943/33944/33946',
        vendor: 'AwoX',
        description: 'LED RGB & brightness',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        fingerprint: [
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 268, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599], outputClusters: [6] },
                    { ID: 3, profileID: 4751, deviceID: 268, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 268, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599], outputClusters: [6] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                    { ID: 3, profileID: 4751, deviceID: 268, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 268, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599, 10], outputClusters: [6] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                    { ID: 3, profileID: 4751, deviceID: 268, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 268, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096, 64599, 10], outputClusters: [6] },
                    { ID: 242, profileID: 41440, deviceID: 97, inputClusters: [], outputClusters: [33] },
                    { ID: 3, profileID: 4751, deviceID: 268, inputClusters: [65360, 65361, 4], outputClusters: [65360, 65361] },
                ],
            },
        ],
        model: '33957',
        vendor: 'AwoX',
        description: 'LED light with color temperature',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
        whiteLabel: [{ vendor: 'EGLO', model: '12239' }],
    },
    {
        zigbeeModel: ['EGLO_ZM_TW'],
        fingerprint: [
            {
                type: 'Router',
                manufacturerName: 'AwoX',
                modelID: 'TLSR82xx',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 268, inputClusters: [0, 3, 4, 5, 6, 8, 768, 4096], outputClusters: [6, 25] },
                    { ID: 3, profileID: 49152, deviceID: 268, inputClusters: [65360, 65361], outputClusters: [65360, 65361] },
                ],
            },
        ],
        model: '33955',
        vendor: 'AwoX',
        description: 'LED light with color temperature',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
        whiteLabel: [
            { vendor: 'EGLO', model: '900316' },
            { vendor: 'EGLO', model: '900317' },
            { vendor: 'EGLO', model: '900053' },
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=awox.js.map