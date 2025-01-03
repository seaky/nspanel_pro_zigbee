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
Object.defineProperty(exports, "__esModule", { value: true });
const exposes = __importStar(require("../lib/exposes"));
const ota = __importStar(require("../lib/ota"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [{ modelID: 'TS0601', manufacturerName: '_TZE204_r7brscr6' }],
        model: 'VNTH-T2',
        vendor: 'TECH',
        description: 'Smart radiator valve',
        ota: ota.zigbeeOTA,
        onEvent: tuya.onEventSetLocalTime,
        fromZigbee: [tuya.fz.datapoints],
        toZigbee: [tuya.tz.datapoints],
        configure: tuya.configureMagicPacket,
        exposes: [
            e.child_lock(),
            e.window_detection(),
            e.window_open(),
            e
                .climate()
                .withSetpoint('current_heating_setpoint', 5, 35, 0.5, ea.STATE_SET)
                .withLocalTemperature(ea.STATE)
                .withSystemMode(['heat', 'auto', 'off'], ea.STATE_SET, 'Mode of this device, in the `heat` mode the TS0601 will remain continuously heating, i.e. it does not regulate ' +
                'to the desired temperature. If you want TRV to properly regulate the temperature you need to use mode `auto` ' +
                'instead setting the desired temperature.')
                .withLocalTemperatureCalibration(-9, 9, 0.5, ea.STATE_SET)
                .withPreset(['manual', 'schedule', 'eco', 'comfort', 'antifrost', 'holiday'])
                .withRunningState(['idle', 'heat'], ea.STATE),
            e.away_mode(),
            e
                .numeric('temperature_sensitivity', ea.STATE_SET)
                .withUnit('°C')
                .withDescription('Temperature sensivity')
                .withValueMin(0.5)
                .withValueMax(5)
                .withValueStep(0.5),
            e.comfort_temperature().withValueStep(0.5),
            e.eco_temperature().withValueStep(0.5),
            e.holiday_temperature().withValueStep(0.5),
            e.min_temperature_limit().withValueMin(5).withValueMax(15).withValueStep(0.5), // min temperature for frost protection
            e
                .binary('frost_protection', ea.STATE_SET, 'ON', 'OFF')
                .withDescription('Indicates if the frost protection mode is enabled')
                .withCategory('config'),
            e.valve_alarm(),
            ...tuya.exposes.scheduleAllDays(ea.STATE_SET, 'HH:MM/C HH:MM/C HH:MM/C HH:MM/C'),
        ],
        meta: {
            tuyaDatapoints: [
                [101, 'system_mode', tuya.valueConverterBasic.lookup({ heat: true, off: false })],
                [101, 'state', tuya.valueConverter.onOff],
                [7, 'child_lock', tuya.valueConverter.lockUnlock],
                [3, 'running_state', tuya.valueConverterBasic.lookup({ heat: tuya.enum(1), idle: tuya.enum(0) })],
                [5, 'local_temperature', tuya.valueConverter.divideBy10],
                [47, 'local_temperature_calibration', tuya.valueConverter.localTempCalibration1],
                [6, 'battery', tuya.valueConverter.raw],
                [4, 'current_heating_setpoint', tuya.valueConverter.divideBy10],
                [102, 'temperature_sensitivity', tuya.valueConverter.divideBy10],
                [104, 'comfort_temperature', tuya.valueConverter.divideBy10],
                [103, 'eco_temperature', tuya.valueConverter.divideBy10],
                [21, 'holiday_temperature', tuya.valueConverter.divideBy10],
                [105, 'min_temperature_limit', tuya.valueConverter.divideBy10],
                [36, 'frost_protection', tuya.valueConverter.onOff],
                [14, 'window_detection', tuya.valueConverter.onOff],
                [15, 'window_open', tuya.valueConverter.onOff],
                [35, 'fault_alarm', tuya.valueConverter.raw], // not sure
                [
                    2,
                    'preset',
                    tuya.valueConverterBasic.lookup({
                        manual: tuya.enum(0), // Hand / "normal"
                        schedule: tuya.enum(1), // Clock / "Auto"
                        eco: tuya.enum(2), // "E" / Moon
                        comfort: tuya.enum(3), // Leaf / Sun
                        antifrost: tuya.enum(4), // Flake
                        holiday: tuya.enum(5), // Palm tree
                    }),
                ],
                [28, 'schedule_monday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(1)],
                [29, 'schedule_tuesday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(2)],
                [30, 'schedule_wednesday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(3)],
                [31, 'schedule_thursday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(4)],
                [32, 'schedule_friday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(5)],
                [33, 'schedule_saturday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(6)],
                [34, 'schedule_sunday', tuya.valueConverter.thermostatScheduleDayMultiDPWithDayNumber(7)],
            ],
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=tech.js.map