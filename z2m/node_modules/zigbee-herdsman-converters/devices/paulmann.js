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
        zigbeeModel: ['501.37'],
        model: '501.37',
        vendor: 'Paulmann',
        description: 'Smart switch 4 buttons white',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'on_2',
                'off_2',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_move_stop_1',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_move_stop_2',
            ]),
        ],
        meta: { multiEndpoint: true },
    },
    {
        zigbeeModel: ['501.34'],
        model: '501.34',
        vendor: 'Paulmann',
        description: 'Smart switch 4 buttons white',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'on_2',
                'off_2',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_move_stop_1',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_move_stop_2',
            ]),
        ],
        meta: { multiEndpoint: true },
    },
    {
        zigbeeModel: ['H036-0500'],
        model: '968.93',
        vendor: 'Paulmann',
        description: 'URail rail adapter smart home Zigbee on/off/dimm',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        fingerprint: [{ modelID: 'RGBW', manufacturerName: 'Paulmann Licht GmbH' }],
        model: '948.47/29165',
        vendor: 'Paulmann',
        description: 'RGBW light',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['H036-0007'],
        model: '929.66',
        vendor: 'Paulmann',
        description: 'Smart home Zigbee LED module coin 1x2.5W RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['Switch Controller'],
        model: '50043',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee Cephei Switch Controller',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['50131'],
        model: '501.31',
        vendor: 'Paulmann',
        description: 'Smart plug for Euro- and Schuko-sockets',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['Dimmablelight'],
        model: '50044/50045',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee Dimmer or LED-stripe',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['500.47'],
        model: '500.47',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee MaxLED RGBW controller max. 72W 24V DC',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: { modes: ['xy', 'hs'], applyRedFix: true } })],
    },
    {
        zigbeeModel: ['RGBW light', '500.49', 'RGBW_light'],
        model: '50049/500.63',
        vendor: 'Paulmann',
        description: 'Smart Home Zigbee YourLED RGB Controller max. 60W / Smart Home Zigbee LED Reflektor 3,5W GU10 RGBW dimmbar',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: { modes: ['xy', 'hs'], applyRedFix: true } })],
    },
    {
        zigbeeModel: ['RGBCW_LIGHT'],
        model: '4137',
        vendor: 'Paulmann',
        description: 'Smart Home Zigbee LED bulb 9,3W Matt E27 RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        fingerprint: [{ modelID: 'RGBW Controller', manufacturerName: 'Paulmann Licht' }],
        model: '94191',
        vendor: 'Paulmann',
        description: 'Plug & shine LED strip',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        fingerprint: [
            { modelID: 'CCT Light', manufacturerName: 'Paulmann lamp' },
            { modelID: 'CCT', manufacturerName: 'Paulmann Licht GmbH' },
        ],
        zigbeeModel: ['CCT light', 'CCT_light', 'CCT light '],
        model: '50064',
        vendor: 'Paulmann',
        description: 'SmartHome led spot',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['H036-0006'],
        model: '929.63',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee LED-Modul Coin 1x6W Tunable White',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['500.46'],
        model: '500.46',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee MaxLED tunable white controller max. 144W / 24V DC',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['H036-0005'],
        model: '929.60',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee LED-Modul Coin 1x6W White',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['371000001'],
        model: '371000001',
        vendor: 'Paulmann',
        description: 'SmartHome led spot tuneable white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        fingerprint: [{ modelID: 'RGBW', manufacturerName: 'Paulmann Licht' }],
        zigbeeModel: ['371000002'],
        model: '371000002',
        vendor: 'Paulmann',
        description: 'Amaris LED panels',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['371050043'],
        model: '371050043',
        vendor: 'Paulmann',
        description: 'Solar LED house number light',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['371232040'],
        model: '371232040',
        vendor: 'Paulmann',
        description: 'LED panels',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 350] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['500.44'],
        model: '500.44',
        vendor: 'Paulmann',
        description: 'URail power supply',
        extend: [(0, modernExtend_1.light)({ color: { applyRedFix: true } })],
    },
    {
        zigbeeModel: ['500.45'],
        model: '500.45',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee Pendulum Light Aptare',
        extend: [(0, modernExtend_1.light)({ color: { applyRedFix: true } })],
    },
    {
        zigbeeModel: ['500.48'],
        model: '500.48',
        vendor: 'Paulmann',
        description: 'SmartHome Zigbee YourLED dim/switch controller max. 60 W',
        extend: [(0, modernExtend_1.light)({ color: { applyRedFix: true } })],
    },
    {
        fingerprint: [{ manufacturerName: 'Paulmann Licht GmbH', modelID: 'Dimmable' }],
        zigbeeModel: ['H036-0001'],
        model: '93999',
        vendor: 'Paulmann',
        description: 'Plug Shine Zigbee controller',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['RemoteControl', '50067'],
        model: '500.67',
        vendor: 'Paulmann',
        description: 'RGB remote control',
        fromZigbee: [
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_toggle,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_move_to_color_temp,
            fromZigbee_1.default.command_move_to_color,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_color_loop_set,
            fromZigbee_1.default.command_ehanced_move_to_hue_and_saturation,
            fromZigbee_1.default.tint_scene,
        ],
        toZigbee: [],
        exposes: [
            e.action([
                'on',
                'off',
                'toggle',
                'brightness_step_up',
                'brightness_step_down',
                'color_temperature_move',
                'color_move',
                'brightness_stop',
                'brightness_move_down',
                'brightness_move_up',
                'color_loop_set',
                'enhanced_move_to_hue_and_saturation',
                'scene_*',
            ]),
        ],
    },
    {
        zigbeeModel: ['501.40'],
        model: '501.40',
        vendor: 'Paulmann',
        description: 'RGB remote control',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4 } }),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.commandsOnOff)(),
            (0, modernExtend_1.commandsLevelCtrl)(),
            (0, modernExtend_1.commandsColorCtrl)(),
            (0, modernExtend_1.commandsScenes)(),
        ],
    },
    {
        fingerprint: [{ modelID: 'RGB', manufacturerName: 'Paulmann Licht GmbH' }],
        model: '150257',
        vendor: 'Paulmann',
        description: 'SimpLED SmartHome dimmable RGB LED-stripe',
        extend: [(0, modernExtend_1.light)({ color: true })],
    },
    {
        fingerprint: [
            { modelID: 'Dimmable Light', manufacturerName: 'Paulmann lamp' },
            { modelID: 'Dimmable Light ', manufacturerName: 'Paulmann lamp ' },
        ],
        model: '501.22',
        vendor: 'Paulmann',
        description: 'White E27 LED bulb, dimmable',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['RGBWW'],
        model: '291.52',
        vendor: 'Paulmann',
        description: 'Smart Home Zigbee LED bulb 4,9W Matt E14 RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] }, color: { modes: ['xy', 'hs'] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=paulmann.js.map