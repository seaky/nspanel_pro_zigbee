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
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [
            { modelID: 'TS0601', manufacturerName: '_TZE200_akjefhj5' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_2wg5qrjy' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_81isopgh' },
        ],
        model: 'ZVG1',
        vendor: 'RTX',
        description: 'Zigbee smart water valve',
        onEvent: tuya.onEventSetLocalTime,
        fromZigbee: [legacy.fz.ZVG1, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [
            legacy.tz.tuya_switch_state,
            legacy.tz.ZVG1_weather_delay,
            legacy.tz.ZVG1_timer,
            legacy.tz.ZVG1_cycle_timer,
            legacy.tz.ZVG1_normal_schedule_timer,
        ],
        exposes: [
            e.switch().setAccess('state', ea.STATE_SET),
            e.battery(),
            e.enum('weather_delay', ea.STATE_SET, ['disabled', '24h', '48h', '72h']),
            e.enum('timer_state', ea.STATE, ['disabled', 'active', 'enabled']),
            e.numeric('timer', ea.STATE_SET).withValueMin(0).withValueMax(60).withUnit('min').withDescription('Auto off after specific time'),
            e.numeric('timer_time_left', ea.STATE).withUnit('min').withDescription('Auto off timer time left'),
            e.numeric('last_valve_open_duration', ea.STATE).withUnit('min').withDescription('Time the valve was open when state on'),
            e.numeric('water_consumed', ea.STATE).withUnit('L').withDescription('Liters of water consumed'),
            e
                .text('cycle_timer_1', ea.STATE_SET)
                .withDescription('Format 08:00 / 20:00 / 15 / 60 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '20:00 = end time ' +
                '15 = irrigation duration in minutes ' +
                '60 = pause duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('cycle_timer_2', ea.STATE_SET)
                .withDescription('Format 08:00 / 20:00 / 15 / 60 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '20:00 = end time ' +
                '15 = irrigation duration in minutes ' +
                '60 = pause duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('cycle_timer_3', ea.STATE_SET)
                .withDescription('Format 08:00 / 20:00 / 15 / 60 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '20:00 = end time ' +
                '15 = irrigation duration in minutes ' +
                '60 = pause duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('cycle_timer_4', ea.STATE_SET)
                .withDescription('Format 08:00 / 20:00 / 15 / 60 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '20:00 = end time ' +
                '15 = irrigation duration in minutes ' +
                '60 = pause duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('normal_schedule_timer_1', ea.STATE_SET)
                .withDescription('Format 08:00 / 15 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '15 = duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('normal_schedule_timer_2', ea.STATE_SET)
                .withDescription('Format 08:00 / 15 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '15 = duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('normal_schedule_timer_3', ea.STATE_SET)
                .withDescription('Format 08:00 / 15 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '15 = duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
            e
                .text('normal_schedule_timer_4', ea.STATE_SET)
                .withDescription('Format 08:00 / 15 / MoTuWeThFrSaSu / 1 (' +
                '08:00 = start time ' +
                '15 = duration in minutes ' +
                'MoTu..= active weekdays ' +
                '1 = deactivate timer with 0)'),
        ],
    },
    {
        fingerprint: [{ modelID: 'TS0202', manufacturerName: '_TZ3000_mwd3c2at' }],
        model: 'ZMS4',
        vendor: 'RTX',
        description: 'Zigbee PIR sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1],
        toZigbee: [],
        exposes: [e.battery_low(), e.occupancy()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=rtx.js.map