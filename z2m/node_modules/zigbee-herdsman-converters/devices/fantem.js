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
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [
            { modelID: 'TS110F', manufacturerName: '_TZ3210_lfbz816s' },
            { modelID: 'TS110F', manufacturerName: '_TZ3210_ebbfkvoy' },
        ],
        model: 'ZB006-X',
        vendor: 'Fantem',
        description: 'Smart dimmer module',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, legacy.fz.ZB006X_settings],
        toZigbee: [legacy.tz.ZB006X_settings],
        exposes: [
            e.action(['on', 'off', 'brightness_move_down', 'brightness_move_up', 'brightness_stop']),
            e.enum('control_mode', ea.STATE_SET, ['ext_switch', 'remote', 'both']).withDescription('Control mode'),
            e.enum('switch_type', ea.STATE_SET, ['unknown', 'toggle', 'momentary', 'rotary', 'auto_config']).withDescription('External switch type'),
            e.numeric('switch_status', ea.STATE).withDescription('External switch status').withValueMin(-10000).withValueMax(10000),
            e.enum('load_detection_mode', ea.STATE_SET, ['none', 'first_power_on', 'every_power_on']).withDescription('Load detection mode'),
            // If you see load_type 'unknown', pls. check with Tuya gateway and app and update with label from Tuya app.
            e.enum('load_type', ea.STATE, ['unknown', 'resistive_capacitive', 'unknown', 'detecting']).withDescription('Load type'),
            e.enum('load_dimmable', ea.STATE, ['unknown', 'dimmable', 'not_dimmable']).withDescription('Load dimmable'),
            e.enum('power_supply_mode', ea.STATE, ['unknown', 'no_neutral', 'with_neutral']).withDescription('Power supply mode'),
        ],
        meta: { disableActionGroup: true },
        onEvent: tuya.onEventSetLocalTime,
        configure: async (device, coordinatorEndpoint) => {
            // Enables reporting of physical state changes
            // https://github.com/Koenkk/zigbee2mqtt/issues/9057#issuecomment-1007742130
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
        },
    },
    {
        fingerprint: tuya.fingerprint('TS0202', ['_TZ3210_0aqbrnts', '_TZ3210_rxqls8v0', '_TZ3210_zmy9hjay', '_TZ3210_wuhzzfqg', '_TZ3210_ohvnwamm']),
        model: 'ZB003-X',
        vendor: 'Fantem',
        description: '4 in 1 multi sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.illuminance, legacy.fz.ZB003X, fromZigbee_1.default.ZB003X_attr, fromZigbee_1.default.ZB003X_occupancy],
        toZigbee: [legacy.tz.ZB003X],
        whiteLabel: [tuya.whitelabel('EFK', 'is-thpl-zb', '4 in 1 multi sensor', ['_TZ3210_0aqbrnts'])],
        exposes: [
            e.occupancy(),
            e.tamper(),
            e.illuminance_lux(),
            e.illuminance(),
            e.temperature(),
            e.humidity(),
            e.battery(),
            e.battery_voltage(),
            e.numeric('battery2', ea.STATE).withUnit('%').withDescription('Remaining battery 2 in %'),
            e.numeric('illuminance_calibration', ea.STATE_SET).withDescription('Illuminance calibration in lux').withValueMin(-20).withValueMax(20),
            e
                .numeric('temperature_calibration', ea.STATE_SET)
                .withDescription('Temperature calibration (-2.0...2.0)')
                .withValueMin(-2)
                .withValueMax(2)
                .withValueStep(0.1),
            e.numeric('humidity_calibration', ea.STATE_SET).withDescription('Humidity calibration').withValueMin(-15).withValueMax(15),
            e.binary('reporting_enable', ea.STATE_SET, true, false).withDescription('Enable reporting'),
            e
                .numeric('reporting_time', ea.STATE_SET)
                .withDescription('Reporting interval in minutes')
                .withValueMin(0)
                .withValueMax(1440)
                .withValueStep(5),
            e.binary('led_enable', ea.STATE_SET, true, false).withDescription('Enable LED'),
            e.binary('pir_enable', ea.STATE_SET, true, false).withDescription('Enable PIR sensor'),
            e.enum('sensitivity', ea.STATE_SET, ['low', 'medium', 'high']).withDescription('PIR sensor sensitivity'),
            e.enum('keep_time', ea.STATE_SET, ['0', '30', '60', '120', '240', '480']).withDescription('PIR keep time in seconds'),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=fantem.js.map