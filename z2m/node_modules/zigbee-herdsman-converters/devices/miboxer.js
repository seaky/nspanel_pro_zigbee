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
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const definitions = [
    {
        fingerprint: [{ modelID: 'TS0504B', manufacturerName: '_TZ3210_ttkgurpb' }],
        model: 'FUT038Z',
        description: 'RGBW LED controller',
        vendor: 'MiBoxer',
        extend: [tuya.modernExtend.tuyaLight({ colorTemp: { range: [153, 500] }, color: true })],
    },
    {
        fingerprint: tuya.fingerprint('TS1002', ['_TZ3000_xwh1e22x', '_TZ3000_zwszqdpy']),
        model: 'FUT089Z',
        vendor: 'MiBoxer',
        description: 'RGB+CCT Remote',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_move_to_level,
            fromZigbee_1.default.command_move_to_color_temp,
            fromZigbee_1.default.command_move_to_hue_and_saturation,
        ],
        toZigbee: [],
        whiteLabel: [tuya.whitelabel('Ledron', 'YK-16', 'RGB+CCT Remote', ['_TZ3000_zwszqdpy'])],
        exposes: [
            e.battery(),
            e.battery_voltage(),
            e.action(['on', 'off', 'brightness_move_to_level', 'color_temperature_move', 'move_to_hue_and_saturation']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            await endpoint.command('genGroups', 'miboxerSetZones', {
                zones: [
                    { zoneNum: 1, groupId: 101 },
                    { zoneNum: 2, groupId: 102 },
                    { zoneNum: 3, groupId: 103 },
                    { zoneNum: 4, groupId: 104 },
                    { zoneNum: 5, groupId: 105 },
                    { zoneNum: 6, groupId: 106 },
                    { zoneNum: 7, groupId: 107 },
                    { zoneNum: 8, groupId: 108 },
                ],
            });
            await endpoint.command('genBasic', 'tuyaSetup', {}, { disableDefaultResponse: true });
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=miboxer.js.map