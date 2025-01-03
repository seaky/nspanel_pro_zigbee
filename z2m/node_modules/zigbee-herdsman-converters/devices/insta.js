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
const legacy = __importStar(require("../lib/legacy"));
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: [' Remote'],
        model: 'InstaRemote',
        vendor: 'Insta',
        description: 'ZigBee Light Link wall/handheld transmitter',
        whiteLabel: [
            { vendor: 'Gira', model: '2430-100' },
            { vendor: 'Gira', model: '2435-10' },
            { vendor: 'Jung', model: 'ZLLCD5004M' },
            { vendor: 'Jung', model: 'ZLLLS5004M' },
            { vendor: 'Jung', model: 'ZLLA5004M' },
            { vendor: 'Jung', model: 'ZLLHS4' },
        ],
        fromZigbee: [
            legacy.fz.insta_scene_click,
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off_with_effect,
            legacy.fz.insta_down_hold,
            legacy.fz.insta_up_hold,
            legacy.fz.insta_stop,
        ],
        exposes: [e.action(['select_0', 'select_1', 'select_2', 'select_3', 'select_4', 'select_5', 'on', 'off', 'down', 'up', 'stop'])],
        toZigbee: [],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['NEXENTRO Blinds Actuator', 'Generic UP Device'],
        model: '57008000',
        vendor: 'Insta',
        description: 'Blinds actor with lift/tilt calibration & with with inputs for wall switches',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.command_cover_open, fromZigbee_1.default.command_cover_close, fromZigbee_1.default.command_cover_stop],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        exposes: [e.cover_position_tilt()],
        endpoint: (device) => {
            return { default: 6 };
        },
        configure: async (device, coordinatorEndpoint) => {
            await utils.sleep(10000); // https://github.com/Koenkk/zigbee-herdsman-converters/issues/2493
            await reporting.bind(device.getEndpoint(6), coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.bind(device.getEndpoint(7), coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(device.getEndpoint(6));
            await reporting.currentPositionTiltPercentage(device.getEndpoint(6));
            // Has Unknown power source, force it here.
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
        ota: ota.zigbeeOTA,
    },
    {
        fingerprint: [
            // It seems several Insta devices use the same ModelID with a different endpoint configuration
            // This is the single "Switching Actuator Mini"
            {
                manufacturerName: 'Insta GmbH',
                modelID: 'Generic UP Device',
                endpoints: [
                    { ID: 1, profileID: 260, deviceID: 256, inputClusters: [0, 3, 4, 5, 6, 4096], outputClusters: [25] },
                    { ID: 4, profileID: 260, deviceID: 261, inputClusters: [0, 3], outputClusters: [3, 4, 5, 6, 8, 25, 768] },
                    { ID: 242, profileID: 41440, deviceID: 97 },
                ],
            },
        ],
        zigbeeModel: ['NEXENTRO Switching Actuator', '57005000'],
        model: '57005000',
        vendor: 'Insta',
        description: 'Switching Actuator Mini with input for wall switch',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch()],
        // The configure method below is needed to make the device reports on/off state changes
        // when the device is controlled manually through the button on it.
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint);
            // Has Unknown power source, force it here.
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        fingerprint: [
            // It seems several Insta devices use the same ModelID with a different endpoint configuration
            // This is the "Pushbutton Interface 2-gang"
            {
                manufacturerName: 'Insta GmbH',
                modelID: 'Generic UP Device',
                endpoints: [
                    { ID: 4, profileID: 260, deviceID: 261, inputClusters: [0, 3], outputClusters: [3, 4, 5, 6, 8, 25, 768] },
                    { ID: 5, profileID: 260, deviceID: 261, inputClusters: [0, 3], outputClusters: [3, 4, 5, 6, 8, 25, 768] },
                    { ID: 7, profileID: 260, deviceID: 515, inputClusters: [0, 3], outputClusters: [3, 4, 25, 258] },
                    { ID: 242, profileID: 41440, deviceID: 97 },
                ],
            },
        ],
        zigbeeModel: ['NEXENTRO Pushbutton Interface', '57004000'],
        model: '57004000',
        vendor: 'Insta',
        description: 'Pushbutton Interface 2-gang 230V',
        fromZigbee: [
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_toggle,
            fromZigbee_1.default.command_recall,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_cover_open,
            fromZigbee_1.default.command_cover_close,
            fromZigbee_1.default.command_cover_stop,
        ],
        toZigbee: [],
        exposes: [
            e.action([
                'on_e1',
                'off_e1',
                'toggle_e1',
                'recall_*_e1',
                'brightness_stop_e1',
                'brightness_move_*_e1',
                'on_e2',
                'off_e2',
                'toggle_e2',
                'recall_*_e2',
                'brightness_stop_e2',
                'brightness_move_*_e2',
                'close_cover',
                'open_cover',
                'stop_cover',
            ]),
        ],
        configure: async (device, coordinatorEndpoint) => {
            // Has Unknown power source, force it here.
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return {
                e1: 4,
                e2: 5,
                cover: 7,
            };
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=insta.js.map