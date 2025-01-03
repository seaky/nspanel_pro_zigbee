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
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [{ modelID: 'TS0201', manufacturerName: '_TZ3000_lbtpiody' }],
        model: 'E5',
        vendor: 'Nous',
        description: 'Temperature & humidity',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.temperature(), e.humidity(), e.battery()],
    },
    {
        fingerprint: [
            { modelID: 'TS0601', manufacturerName: '_TZE200_lve3dvpy' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_c7emyjom' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_locansqn' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_qrztc3ev' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_snloy4rw' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_eanjj2pa' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_ydrdfkim' },
        ],
        model: 'SZ-T04',
        vendor: 'Nous',
        whiteLabel: [tuya.whitelabel('Tuya', 'TH01Z', 'Temperature and humidity sensor with clock', ['_TZE200_locansqn'])],
        description: 'Temperature and humidity sensor with clock',
        fromZigbee: [legacy.fz.nous_lcd_temperature_humidity_sensor, fromZigbee_1.default.ignore_tuya_set_time],
        toZigbee: [legacy.tz.nous_lcd_temperature_humidity_sensor],
        onEvent: tuya.onEventSetLocalTime,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
        },
        exposes: [
            e.temperature(),
            e.humidity(),
            e.battery(),
            e
                .numeric('temperature_report_interval', ea.STATE_SET)
                .withUnit('min')
                .withValueMin(5)
                .withValueMax(120)
                .withValueStep(5)
                .withDescription('Temperature Report interval'),
            e
                .numeric('humidity_report_interval', ea.STATE_SET)
                .withUnit('min')
                .withValueMin(5)
                .withValueMax(120)
                .withValueStep(5)
                .withDescription('Humidity Report interval'),
            e.enum('temperature_unit_convert', ea.STATE_SET, ['celsius', 'fahrenheit']).withDescription('Current display unit'),
            e.enum('temperature_alarm', ea.STATE, ['canceled', 'lower_alarm', 'upper_alarm']).withDescription('Temperature alarm status'),
            e.numeric('max_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60).withDescription('Alarm temperature max'),
            e.numeric('min_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60).withDescription('Alarm temperature min'),
            e
                .numeric('temperature_sensitivity', ea.STATE_SET)
                .withUnit('°C')
                .withValueMin(0.1)
                .withValueMax(50)
                .withValueStep(0.1)
                .withDescription('Temperature sensitivity'),
            e.enum('humidity_alarm', ea.STATE, ['canceled', 'lower_alarm', 'upper_alarm']).withDescription('Humidity alarm status'),
            e.numeric('max_humidity', ea.STATE_SET).withUnit('%').withValueMin(0).withValueMax(100).withDescription('Alarm humidity max'),
            e.numeric('min_humidity', ea.STATE_SET).withUnit('%').withValueMin(0).withValueMax(100).withDescription('Alarm humidity min'),
            e
                .numeric('humidity_sensitivity', ea.STATE_SET)
                .withUnit('%')
                .withValueMin(1)
                .withValueMax(100)
                .withValueStep(1)
                .withDescription('Humidity sensitivity'),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE284_wtikaxzs', '_TZE200_nnrfa68v', '_TZE200_zppcgbdj']),
        model: 'E6',
        vendor: 'Nous',
        description: 'Temperature & humidity LCD sensor',
        fromZigbee: [legacy.fz.nous_lcd_temperature_humidity_sensor, fromZigbee_1.default.ignore_tuya_set_time],
        toZigbee: [legacy.tz.nous_lcd_temperature_humidity_sensor],
        onEvent: tuya.onEventSetLocalTime,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
        },
        exposes: [
            e.temperature(),
            e.humidity(),
            e.battery(),
            e.battery_low(),
            e.enum('temperature_unit_convert', ea.STATE_SET, ['celsius', 'fahrenheit']).withDescription('Current display unit'),
            e.enum('temperature_alarm', ea.STATE, ['canceled', 'lower_alarm', 'upper_alarm']).withDescription('Temperature alarm status'),
            e.numeric('max_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60).withDescription('Alarm temperature max'),
            e.numeric('min_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60).withDescription('Alarm temperature min'),
            e
                .numeric('temperature_sensitivity', ea.STATE_SET)
                .withUnit('°C')
                .withValueMin(0.1)
                .withValueMax(50)
                .withValueStep(0.1)
                .withDescription('Temperature sensitivity'),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=nous.js.map