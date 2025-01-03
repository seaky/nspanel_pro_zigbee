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
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: [{ modelID: 'TS0101', manufacturerName: '_TZ3210_eymunffl' }],
        model: 'R7060',
        vendor: 'Woox',
        description: 'Smart garden irrigation control',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.ignore_tuya_set_time, fromZigbee_1.default.ignore_basic_report, legacy.fromZigbee.woox_R7060],
        toZigbee: [toZigbee_1.default.on_off],
        onEvent: tuya.onEventSetTime,
        exposes: [e.switch(), e.battery()],
        meta: { disableDefaultResponse: true },
        configure: tuya.configureMagicPacket,
    },
    {
        fingerprint: [{ modelID: 'TS0505A', manufacturerName: '_TZ3000_keabpigv' }],
        model: 'R9077',
        vendor: 'Woox',
        description: 'RGB+CCT LED',
        extend: [tuya.modernExtend.tuyaLight({ colorTemp: { range: undefined }, color: true })],
        meta: { applyRedFix: true },
    },
    {
        fingerprint: [{ modelID: 'TS0201', manufacturerName: '_TZ3000_rusu2vzb' }],
        model: 'R7048',
        vendor: 'Woox',
        description: 'Smart humidity & temperature sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity],
        toZigbee: [],
        exposes: [e.battery(), e.temperature(), e.humidity(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const bindClusters = ['msTemperatureMeasurement', 'msRelativeHumidity', 'genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, bindClusters);
            await reporting.temperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.batteryVoltage(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE200_aycxwiau', '_TZE200_bxdyeaa9', '_TZE200_ft523twt']),
        model: 'R7049',
        vendor: 'Woox',
        description: 'Smart smoke alarm',
        meta: { timeout: 30000, disableDefaultResponse: true },
        fromZigbee: [legacy.fromZigbee.R7049_status, fromZigbee_1.default.ignore_tuya_set_time, fromZigbee_1.default.ignore_time_read],
        toZigbee: [legacy.toZigbee.R7049_silenceSiren, legacy.toZigbee.R7049_testAlarm, legacy.toZigbee.R7049_alarm],
        exposes: [
            e.battery_low(),
            e.binary('smoke', ea.STATE, true, false).withDescription('Smoke alarm status'),
            e.binary('test_alarm', ea.STATE_SET, true, false).withDescription('Test alarm'),
            e.enum('test_alarm_result', ea.STATE, ['checking', 'check_success', 'check_failure', 'others']).withDescription('Test alarm result'),
            e.enum('battery_level', ea.STATE, ['low', 'middle', 'high']).withDescription('Battery level state'),
            e.binary('alarm', ea.STATE_SET, true, false).withDescription('Alarm enable'),
            e.binary('fault_alarm', ea.STATE, true, false).withDescription('Fault alarm status'),
            e.binary('silence_siren', ea.STATE_SET, true, false).withDescription('Silence siren'),
        ],
    },
    {
        fingerprint: [
            { modelID: 'TS0219', manufacturerName: '_TYZB01_ynsiasng' },
            { modelID: 'TS0219', manufacturerName: '_TYZB01_bwsijaty' },
            { modelID: 'TS0219', manufacturerName: '_TYZB01_rs7ff6o7' },
        ],
        model: 'R7051',
        vendor: 'Woox',
        description: 'Smart siren',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ts0216_siren, fromZigbee_1.default.ias_alarm_only_alarm_1, fromZigbee_1.default.power_source],
        toZigbee: [toZigbee_1.default.warning, toZigbee_1.default.ts0216_volume, toZigbee_1.default.ts0216_duration],
        exposes: [
            e.battery(),
            e.battery_voltage(),
            e.warning(),
            e.binary('alarm', ea.STATE, true, false),
            e.binary('ac_connected', ea.STATE, true, false).withDescription('Is the device plugged in'),
            e.numeric('volume', ea.ALL).withValueMin(0).withValueMax(100).withDescription('Volume of siren'),
            e.numeric('duration', ea.ALL).withValueMin(0).withValueMax(3600).withDescription('Duration of siren'),
        ],
        meta: { disableDefaultResponse: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const bindClusters = ['genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, bindClusters);
            await reporting.batteryVoltage(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=woox.js.map