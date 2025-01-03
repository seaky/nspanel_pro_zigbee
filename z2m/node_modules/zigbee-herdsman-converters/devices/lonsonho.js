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
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [
            { modelID: 'TS130F', manufacturerName: '_TZ3000_vd43bbfq' },
            { modelID: 'TS130F', manufacturerName: '_TZ3000_fccpjz5z' },
        ],
        model: 'QS-Zigbee-C01',
        vendor: 'Lonsonho',
        description: 'Curtain/blind motor controller',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.tuya_cover_options],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt, toZigbee_1.default.moes_cover_calibration, toZigbee_1.default.tuya_cover_calibration, toZigbee_1.default.tuya_cover_reversal],
        meta: { coverInverted: true },
        exposes: [
            e.cover_position(),
            e.enum('moving', ea.STATE, ['UP', 'STOP', 'DOWN']),
            e.binary('calibration', ea.ALL, 'ON', 'OFF'),
            e.binary('motor_reversal', ea.ALL, 'ON', 'OFF'),
            e.numeric('calibration_time', ea.ALL).withUnit('s').withValueMin(0).withValueMax(100).withDescription('Calibration time'),
        ],
    },
    {
        fingerprint: [{ modelID: 'TS130F', manufacturerName: '_TZ3000_egq7y6pr' }],
        model: '11830304',
        vendor: 'Lonsonho',
        description: 'Curtain switch',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, tuya.fz.backlight_mode_low_medium_high, fromZigbee_1.default.tuya_cover_options],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt, toZigbee_1.default.tuya_cover_calibration, toZigbee_1.default.tuya_cover_reversal, tuya.tz.backlight_indicator_mode_1],
        meta: { coverInverted: true },
        exposes: [
            e.cover_position(),
            e.enum('moving', ea.STATE, ['UP', 'STOP', 'DOWN']),
            e.binary('calibration', ea.ALL, 'ON', 'OFF'),
            e.binary('motor_reversal', ea.ALL, 'ON', 'OFF'),
            e.enum('backlight_mode', ea.ALL, ['LOW', 'MEDIUM', 'HIGH']),
            e.numeric('calibration_time', ea.STATE).withUnit('s').withDescription('Calibration time'),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS130F', ['_TZ3000_j1xl73iw', '_TZ3000_kmsbwdol', '_TZ3000_esynmmox', '_TZ3000_l6iqph4f', '_TZ3000_xdo0hj1k']),
        model: 'TS130F_dual',
        vendor: 'Lonsonho',
        description: 'Dual curtain/blind module',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.tuya_cover_options],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt, toZigbee_1.default.tuya_cover_calibration, toZigbee_1.default.tuya_cover_reversal],
        meta: { multiEndpoint: true, coverInverted: true },
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        exposes: [
            e.enum('moving', ea.STATE, ['UP', 'STOP', 'DOWN']).withEndpoint('left'),
            e.enum('moving', ea.STATE, ['UP', 'STOP', 'DOWN']).withEndpoint('right'),
            e.numeric('calibration_time', ea.STATE).withUnit('s').withDescription('Calibration time').withEndpoint('left'),
            e.numeric('calibration_time', ea.STATE).withUnit('s').withDescription('Calibration time').withEndpoint('right'),
            e.cover_position().withEndpoint('left'),
            e.binary('calibration', ea.ALL, 'ON', 'OFF').withEndpoint('left'),
            e.binary('motor_reversal', ea.ALL, 'ON', 'OFF').withEndpoint('left'),
            e.cover_position().withEndpoint('right'),
            e.binary('calibration', ea.ALL, 'ON', 'OFF').withEndpoint('right'),
            e.binary('motor_reversal', ea.ALL, 'ON', 'OFF').withEndpoint('right'),
        ],
    },
    {
        fingerprint: [
            { modelID: 'TS0601', manufacturerName: '_TZE200_8vxj8khv' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_7tdtqgwv' },
        ],
        model: 'X711A',
        vendor: 'Lonsonho',
        description: '1 gang switch',
        exposes: [e.switch().setAccess('state', ea.STATE_SET)],
        fromZigbee: [legacy.fz.tuya_switch, fromZigbee_1.default.ignore_time_read],
        toZigbee: [legacy.tz.tuya_switch_state],
    },
    {
        fingerprint: [{ modelID: 'TS0601', manufacturerName: '_TZE200_dhdstcqc' }],
        model: 'X712A',
        vendor: 'Lonsonho',
        description: '2 gang switch',
        exposes: [e.switch().withEndpoint('l1').setAccess('state', ea.STATE_SET), e.switch().withEndpoint('l2').setAccess('state', ea.STATE_SET)],
        fromZigbee: [legacy.fz.tuya_switch, fromZigbee_1.default.ignore_time_read],
        toZigbee: [legacy.tz.tuya_switch_state],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            // Endpoint selection is made in tuya_switch_state
            return { l1: 1, l2: 1 };
        },
    },
    {
        fingerprint: [{ modelID: 'TS0601', manufacturerName: '_TZE200_fqytfymk' }],
        model: 'X713A',
        vendor: 'Lonsonho',
        description: '3 gang switch',
        exposes: [
            e.switch().withEndpoint('l1').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l2').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l3').setAccess('state', ea.STATE_SET),
        ],
        fromZigbee: [legacy.fz.tuya_switch, fromZigbee_1.default.ignore_time_read],
        toZigbee: [legacy.tz.tuya_switch_state],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            // Endpoint selection is made in tuya_switch_state
            return { l1: 1, l2: 1, l3: 1 };
        },
    },
    {
        fingerprint: [{ modelID: 'TS110F', manufacturerName: '_TYZB01_qezuin6k' }],
        model: 'QS-Zigbee-D02-TRIAC-LN',
        vendor: 'Lonsonho',
        description: '1 gang smart dimmer switch module with neutral',
        extend: [tuya.modernExtend.tuyaLight({ minBrightness: 'attribute' })],
    },
    {
        fingerprint: [{ modelID: 'TS110F', manufacturerName: '_TYZB01_v8gtiaed' }],
        model: 'QS-Zigbee-D02-TRIAC-2C-LN',
        vendor: 'Lonsonho',
        description: '2 gang smart dimmer switch module with neutral',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            tuya.modernExtend.tuyaLight({ minBrightness: 'attribute', endpointNames: ['l1', 'l2'] }),
        ],
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            // Don't do: await reporting.onOff(endpoint); https://github.com/Koenkk/zigbee2mqtt/issues/6041
        },
    },
    {
        fingerprint: [{ modelID: 'TS110F', manufacturerName: '_TZ3000_92chsky7' }],
        model: 'QS-Zigbee-D02-TRIAC-2C-L',
        vendor: 'Lonsonho',
        description: '2 gang smart dimmer switch module without neutral',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.light)({ endpointNames: ['l1', 'l2'], configureReporting: true })],
    },
    {
        zigbeeModel: ['Plug_01'],
        model: '4000116784070',
        vendor: 'Lonsonho',
        description: 'Smart plug EU',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['ZB-RGBCW'],
        fingerprint: [
            { modelID: 'ZB-CL01', manufacturerName: 'eWeLight' },
            { modelID: 'ZB-CL01', manufacturerName: 'eWeLink' },
            { modelID: 'ZB-CL02', manufacturerName: 'eWeLight' },
            { modelID: 'ZB-CL01', manufacturerName: 'eWeLi\u0001\u0000\u0010' },
            { modelID: 'Z102LG03-1', manufacturerName: 'eWeLink' },
        ],
        model: 'ZB-RGBCW',
        vendor: 'Lonsonho',
        description: 'Zigbee 3.0 LED-bulb, RGBW LED',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500], startup: false }, color: true, effect: false, powerOnBehavior: false })],
    },
    {
        fingerprint: [
            { modelID: 'TS0003', manufacturerName: '_TYZB01_zsl6z0pw' },
            { modelID: 'TS0003', manufacturerName: '_TYZB01_uqkphoed' },
        ],
        model: 'QS-Zigbee-S04-2C-LN',
        vendor: 'Lonsonho',
        description: '2 gang switch module with neutral wire',
        exposes: [e.switch().withEndpoint('l1'), e.switch().withEndpoint('l2')],
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        toZigbee: [toZigbee_1.default.TYZB01_on_off],
        fromZigbee: [fromZigbee_1.default.on_off],
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        fingerprint: [{ modelID: 'TS0003', manufacturerName: '_TYZB01_ncutbjdi' }],
        model: 'QS-Zigbee-S05-LN',
        vendor: 'Lonsonho',
        description: '1 gang switch module with neutral wire',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false, configureReporting: false })],
        toZigbee: [toZigbee_1.default.TYZB01_on_off],
    },
    {
        fingerprint: [
            { modelID: 'TS130F', manufacturerName: '_TZ3000_zirycpws' },
            { modelID: 'TS130F', manufacturerName: '_TZ3210_ol1uhvza' },
        ],
        model: 'QS-Zigbee-C03',
        vendor: 'Lonsonho',
        description: 'Curtain/blind motor controller',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.tuya_cover_options],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt, toZigbee_1.default.tuya_cover_calibration, toZigbee_1.default.tuya_cover_reversal],
        meta: { coverInverted: true },
        exposes: [
            e.cover_position(),
            e.enum('moving', ea.STATE, ['UP', 'STOP', 'DOWN']),
            e.binary('calibration', ea.ALL, 'ON', 'OFF'),
            e.binary('motor_reversal', ea.ALL, 'ON', 'OFF'),
            e.numeric('calibration_time', ea.STATE).withUnit('s').withDescription('Calibration time'),
        ],
    },
    {
        fingerprint: [{ modelID: 'TS0603', manufacturerName: '_TZE600_wxq8dpha\u0000' }],
        model: 'VM-Zigbee-S02-0-10V',
        vendor: 'Lonsonho',
        description: '2 channel Zigbee 0-10V dimmer module',
        fromZigbee: [tuya.fz.datapoints],
        toZigbee: [tuya.tz.datapoints],
        exposes: [
            tuya.exposes.lightBrightnessWithMinMax().withEndpoint('l1'),
            tuya.exposes.lightBrightnessWithMinMax().withEndpoint('l2'),
            tuya.exposes.countdown().withEndpoint('l1'),
            tuya.exposes.countdown().withEndpoint('l2'),
            tuya.exposes.switchType().withEndpoint('l1'),
            tuya.exposes.switchType().withEndpoint('l2'),
            e.power_on_behavior().withAccess(ea.STATE_SET),
        ],
        endpoint: (device) => {
            return { l1: 1, l2: 1, l3: 1 };
        },
        meta: {
            multiEndpoint: true,
            tuyaDatapoints: [
                [1, 'state_l1', tuya.valueConverter.onOff],
                [2, 'brightness_l1', tuya.valueConverter.scale0_254to0_1000],
                [3, 'min_brightness_l1', tuya.valueConverter.scale0_254to0_1000],
                [4, 'switch_type_l1', tuya.valueConverter.switchType],
                [5, 'max_brightness_l1', tuya.valueConverter.scale0_254to0_1000],
                [6, 'countdown_l1', tuya.valueConverter.raw],
                [7, 'state_l2', tuya.valueConverter.onOff],
                [8, 'brightness_l2', tuya.valueConverter.scale0_254to0_1000],
                [9, 'min_brightness_l2', tuya.valueConverter.scale0_254to0_1000],
                [10, 'switch_type_l2', tuya.valueConverter.switchType],
                [11, 'max_brightness_l2', tuya.valueConverter.scale0_254to0_1000],
                [12, 'countdown_l2', tuya.valueConverter.raw],
                [14, 'power_on_behavior', tuya.valueConverter.powerOnBehaviorEnum],
            ],
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lonsonho.js.map