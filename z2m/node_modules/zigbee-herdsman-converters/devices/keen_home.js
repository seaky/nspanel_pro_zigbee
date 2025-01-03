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
const lumi = __importStar(require("../lib/lumi"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['RS-THP-MP-1.0'],
        model: 'RS-THP-MP-1.0',
        vendor: 'Keen Home',
        description: 'Temperature Sensor',
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        // lumi.fromZigbee.lumi_temperature looks like a mistake, probably just fz.temperature
        fromZigbee: [fromZigbee_1.default.battery, lumi.fromZigbee.lumi_temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.keen_home_smart_vent_pressure],
        toZigbee: [],
        exposes: [e.battery(), e.temperature(), e.humidity(), e.pressure(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: [
            'SV01-410-MP-1.0',
            'SV01-410-MP-1.1',
            'SV01-410-MP-1.4',
            'SV01-410-MP-1.5',
            'SV01-412-MP-1.0',
            'SV01-412-MP-1.1',
            'SV01-412-MP-1.3',
            'SV01-412-MP-1.4',
            'SV01-610-MP-1.0',
            'SV01-610-MP-1.1',
            'SV01-612-MP-1.0',
            'SV01-612-MP-1.1',
            'SV01-612-MP-1.2',
            'SV01-610-MP-1.4',
            'SV01-612-MP-1.4',
            'SV01-612-EP-1.4',
        ],
        model: 'SV01',
        vendor: 'Keen Home',
        description: 'Smart vent',
        fromZigbee: [fromZigbee_1.default.cover_position_via_brightness, fromZigbee_1.default.temperature, fromZigbee_1.default.battery, fromZigbee_1.default.keen_home_smart_vent_pressure, fromZigbee_1.default.ignore_onoff_report],
        toZigbee: [toZigbee_1.default.cover_via_brightness],
        meta: { battery: { dontDividePercentage: true } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['genLevelCtrl', 'genPowerCfg', 'msTemperatureMeasurement', 'msPressureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.temperature(endpoint);
            await reporting.pressure(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.cover_position().setAccess('state', ea.ALL), e.temperature(), e.battery(), e.pressure()],
    },
    {
        zigbeeModel: [
            'SV02-410-MP-1.3',
            'SV02-412-MP-1.3',
            'SV02-610-MP-1.0',
            'SV02-610-MP-1.3',
            'SV02-612-MP-1.2',
            'SV02-612-MP-1.3',
            'SV02-410-MP-1.0',
            'SV02-410-MP-1.2',
            'SV02-412-MP-1.2',
        ],
        model: 'SV02',
        vendor: 'Keen Home',
        description: 'Smart vent',
        fromZigbee: [fromZigbee_1.default.cover_position_via_brightness, fromZigbee_1.default.temperature, fromZigbee_1.default.battery, fromZigbee_1.default.keen_home_smart_vent_pressure, fromZigbee_1.default.ignore_onoff_report],
        toZigbee: [toZigbee_1.default.cover_via_brightness],
        meta: { battery: { dontDividePercentage: true } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['genLevelCtrl', 'genPowerCfg', 'msTemperatureMeasurement', 'msPressureMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.temperature(endpoint);
            await reporting.pressure(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.cover_position().setAccess('state', ea.ALL), e.temperature(), e.battery(), e.pressure()],
    },
    {
        zigbeeModel: ['GW01-001-MP-1.0'],
        model: 'GW01',
        description: 'Signal repeater',
        vendor: 'Keen Home',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const payload = [{ attribute: 'modelId', minimumReportInterval: 3600, maximumReportInterval: 14400, reportableChange: 1 }];
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
            await endpoint.configureReporting('genBasic', payload);
            device.powerSource = 'Mains (single phase)';
        },
        exposes: [],
    },
    {
        zigbeeModel: ['GW02-001-MP-1.0'],
        model: 'GW02',
        description: 'Signal repeater',
        vendor: 'Keen Home',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const payload = [{ attribute: 'modelId', minimumReportInterval: 3600, maximumReportInterval: 14400, reportableChange: 1 }];
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
            await endpoint.configureReporting('genBasic', payload);
            device.powerSource = 'Mains (single phase)';
        },
        exposes: [],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=keen_home.js.map