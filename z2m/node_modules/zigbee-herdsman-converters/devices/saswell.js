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
        fingerprint: [
            { modelID: 'GbxAXL2\u0000', manufacturerName: '_TYST11_KGbxAXL2' },
            { modelID: 'uhszj9s\u0000', manufacturerName: '_TYST11_zuhszj9s' },
            { modelID: '88teujp\u0000', manufacturerName: '_TYST11_c88teujp' },
            { modelID: 'w7cahqs\u0000', manufacturerName: '_TYST11_yw7cahqs' },
            { modelID: 'w7cahqs', manufacturerName: '_TYST11_yw7cahqs' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_c88teujp' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_yw7cahqs' },
            { modelID: 'aj4jz0i\u0000', manufacturerName: '_TYST11_caj4jz0i' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_azqp6ssj' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_zuhszj9s' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_9gvruqf5' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_zr9c0day' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_0dvm9mva' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_h4cgnbzg' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_gd4rvykv' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_exfrnlow' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_9m4kmbfu' },
            { modelID: 'TS0601', manufacturerName: '_TZE200_3yp57tby' },
        ],
        model: 'SEA801-Zigbee/SEA802-Zigbee',
        vendor: 'Saswell',
        description: 'Thermostatic radiator valve',
        whiteLabel: [
            { vendor: 'HiHome', model: 'WZB-TRVL' },
            { vendor: 'Hama', model: '00176592' },
            { vendor: 'RTX', model: 'ZB-RT1' },
            { vendor: 'SETTI+', model: 'TRV001' },
        ],
        fromZigbee: [legacy.fz.saswell_thermostat, fromZigbee_1.default.ignore_tuya_set_time, fromZigbee_1.default.ignore_basic_report, legacy.fz.tuya_thermostat_weekly_schedule_1],
        toZigbee: [
            legacy.tz.saswell_thermostat_current_heating_setpoint,
            legacy.tz.saswell_thermostat_mode,
            legacy.tz.saswell_thermostat_away,
            legacy.tz.saswell_thermostat_child_lock,
            legacy.tz.saswell_thermostat_window_detection,
            legacy.tz.saswell_thermostat_frost_detection,
            legacy.tz.saswell_thermostat_calibration,
            legacy.tz.saswell_thermostat_anti_scaling,
            legacy.tz.tuya_thermostat_weekly_schedule,
        ],
        // @ts-expect-error ignore
        onEvent: (type, data, device) => !['_TZE200_c88teujp'].includes(device.manufacturerName) && tuya.onEventSetTime(type, data, device),
        meta: {
            thermostat: {
                weeklyScheduleMaxTransitions: 4,
                weeklyScheduleSupportedModes: [1], // bits: 0-heat present, 1-cool present (dec: 1-heat,2-cool,3-heat+cool)
                weeklyScheduleConversion: 'saswell',
            },
        },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
        },
        exposes: [
            e.battery_low(),
            e.window_detection(),
            e.child_lock(),
            e.away_mode(),
            e.binary('heating', ea.STATE, 'ON', 'OFF').withDescription('Device valve is open or closed (heating or not)'),
            e
                .climate()
                .withSetpoint('current_heating_setpoint', 5, 30, 0.5, ea.STATE_SET)
                .withLocalTemperature(ea.STATE)
                .withSystemMode(['off', 'heat', 'auto'], ea.STATE_SET)
                .withRunningState(['idle', 'heat'], ea.STATE)
                // Range is -6 - 6 and step 1: https://github.com/Koenkk/zigbee2mqtt/issues/11777
                .withLocalTemperatureCalibration(-6, 6, 1, ea.STATE_SET),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=saswell.js.map