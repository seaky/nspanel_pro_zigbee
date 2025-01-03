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
        fingerprint: tuya.fingerprint('TS0726', ['_TZ3000_kt6xxa4o']),
        model: 'QAT42Z3',
        vendor: 'QA',
        description: '3 channel scene switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2', 'l3'], powerOnBehavior2: true, backlightModeOffOn: true }),
            (0, modernExtend_1.actionEnumLookup)({
                cluster: 'genOnOff',
                commands: ['commandTuyaAction'],
                attribute: 'value',
                actionLookup: { button: 0 },
                buttonLookup: {
                    '1_up': 4,
                    '1_down': 1,
                    '2_up': 5,
                    '2_down': 2,
                    '3_up': 6,
                    '3_down': 3,
                },
            }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0726', ['_TZ3000_wopf2sox']),
        model: 'QAT42Z1',
        vendor: 'QA',
        description: '1 channel scene switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1'], powerOnBehavior2: true, backlightModeOffOn: true }),
            (0, modernExtend_1.actionEnumLookup)({
                cluster: 'genOnOff',
                commands: ['commandTuyaAction'],
                attribute: 'value',
                actionLookup: { button: 0 },
                buttonLookup: {
                    '1_up': 4,
                    '1_down': 1,
                    '2_up': 5,
                    '2_down': 2,
                    '3_up': 6,
                    '3_down': 3,
                },
            }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0726', ['_TZ3000_ssup6h68']),
        model: 'QAT42Z2',
        vendor: 'QA',
        description: '2 channel scene switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2'], powerOnBehavior2: true, backlightModeOffOn: true }),
            (0, modernExtend_1.actionEnumLookup)({
                cluster: 'genOnOff',
                commands: ['commandTuyaAction'],
                attribute: 'value',
                actionLookup: { button: 0 },
                buttonLookup: {
                    '1_up': 4,
                    '1_down': 1,
                    '2_up': 5,
                    '2_down': 2,
                    '3_up': 6,
                    '3_down': 3,
                },
            }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS000F', ['_TZ3210_a2erlvb8']),
        model: 'QARZ1DC',
        vendor: 'QA',
        description: '1 channel switch',
        extend: [tuya.modernExtend.tuyaMagicPacket(), (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1 } }), tuya.modernExtend.tuyaOnOff({ endpoints: ['l1'] })],
    },
    {
        fingerprint: tuya.fingerprint('TS0001', ['_TZ3000_gtdswg8k']),
        model: 'QARZDC1LR',
        vendor: 'QA',
        description: '1 channel long range switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1'], switchType: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0002', ['_TZ3000_rfjctviq', '_TZ3210_pdnwpnz5']),
        model: 'QARZ2LR',
        vendor: 'QA',
        description: '2 channel long range switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2'], switchType: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0003', ['_TZ3000_zeuulson']),
        model: 'QARZ3LR',
        vendor: 'QA',
        description: '3 channel long range switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2', 'l3'], switchType: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0004', ['_TZ3000_wwtnshol']),
        model: 'QARZ4LR',
        vendor: 'QA',
        description: '4 channel long range switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2', 'l3', 'l4'], switchType: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0001', ['_TZ3000_dov0a3p1']),
        model: 'QAT42Z1H',
        vendor: 'QA',
        description: '1 channel wall switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1'], backlightModeOffOn: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0002', ['_TZ3000_gkesadus']),
        model: 'QAT42Z2H',
        vendor: 'QA',
        description: '2 channel wall switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['l1', 'l2'], backlightModeOffOn: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0003', ['_TZ3000_pmsxmttq', '_TZ3000_0q5fjqgw']),
        model: 'QAT42Z3H',
        vendor: 'QA',
        description: '3 channel wall switch',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, center: 2, right: 3 } }),
            tuya.modernExtend.tuyaOnOff({ endpoints: ['left', 'center', 'right'], backlightModeOffOn: true }),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE204_4cl0dzt4']),
        model: 'QAT44Z6H',
        vendor: 'QA',
        description: '6 channel wall switch',
        exposes: [
            e.switch().withEndpoint('l1').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l2').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l3').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l4').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l5').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l6').setAccess('state', ea.STATE_SET),
        ],
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, legacy.fz.tuya_switch],
        toZigbee: [legacy.tz.tuya_switch_state],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { l1: 1, l2: 1, l3: 1, l4: 1, l5: 1, l6: 1 };
        },
        configure: async (device, coordinatorEndpoint, logger) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(5), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(6), coordinatorEndpoint, ['genOnOff']);
            // Reports itself as battery which is not correct: https://github.com/Koenkk/zigbee2mqtt/issues/6190
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE204_kyzjsjo3']),
        model: 'QAT44Z4H',
        vendor: 'QA',
        description: '4 channel wall switch',
        exposes: [
            e.switch().withEndpoint('l1').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l2').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l3').setAccess('state', ea.STATE_SET),
            e.switch().withEndpoint('l4').setAccess('state', ea.STATE_SET),
        ],
        fromZigbee: [fromZigbee_1.default.ignore_basic_report, legacy.fz.tuya_switch],
        toZigbee: [legacy.tz.tuya_switch_state],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { l1: 1, l2: 1, l3: 1, l4: 1 };
        },
        configure: async (device, coordinatorEndpoint, logger) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genOnOff']);
            // Reports itself as battery which is not correct: https://github.com/Koenkk/zigbee2mqtt/issues/6190
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        fingerprint: tuya.fingerprint('TS110E', ['_TZ3210_hzdhb62z', '_TZ3210_v5yquxma']),
        model: 'QADZ1',
        vendor: 'QA',
        description: 'Dimmer 1 channel',
        extend: [(0, modernExtend_1.light)({ powerOnBehavior: false, configureReporting: true, effect: false })],
        fromZigbee: [tuya.fz.power_on_behavior_1, fromZigbee_1.default.TS110E_switch_type, fromZigbee_1.default.TS110E, fromZigbee_1.default.on_off],
        toZigbee: [toZigbee_1.default.TS110E_light_onoff_brightness, tuya.tz.power_on_behavior_1, toZigbee_1.default.TS110E_options],
        exposes: [e.power_on_behavior(), tuya.exposes.switchType()],
        configure: tuya.configureMagicPacket,
    },
    {
        fingerprint: tuya.fingerprint('TS110E', ['_TZ3210_tkkb1ym8']),
        model: 'QADZ2',
        vendor: 'QA',
        description: 'Dimmer 2 channel',
        extend: [
            tuya.modernExtend.tuyaMagicPacket(),
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }),
            (0, modernExtend_1.light)({ endpointNames: ['l1', 'l2'], powerOnBehavior: false, configureReporting: true, effect: false }),
        ],
        fromZigbee: [tuya.fz.power_on_behavior_1, fromZigbee_1.default.TS110E_switch_type, fromZigbee_1.default.TS110E, fromZigbee_1.default.on_off],
        toZigbee: [toZigbee_1.default.TS110E_light_onoff_brightness, tuya.tz.power_on_behavior_1, toZigbee_1.default.TS110E_options],
        exposes: [e.power_on_behavior(), tuya.exposes.switchType()],
        configure: tuya.configureMagicPacket,
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=qa.js.map