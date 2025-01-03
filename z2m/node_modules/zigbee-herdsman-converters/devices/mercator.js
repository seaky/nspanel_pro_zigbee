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
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const definitions = [
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3210_yvxjawlt' }],
        model: 'SPP04G',
        vendor: 'Mercator Ikuü',
        description: 'Quad power point',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true, endpoints: ['left', 'right'] })],
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['current', 'voltage', 'power', 'energy'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
    },
    {
        fingerprint: [{ modelID: 'TS0202', manufacturerName: '_TYZB01_qjqgmqxr' }],
        model: 'SMA02P',
        vendor: 'Mercator Ikuü',
        description: 'Motion detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_occupancy_alarm_1_report],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            try {
                await reporting.batteryPercentageRemaining(endpoint);
            }
            catch {
                /* Fails for some https://github.com/Koenkk/zigbee2mqtt/issues/13708*/
            }
        },
    },
    {
        fingerprint: [{ modelID: 'TS0201', manufacturerName: '_TZ3000_82ptnsd4' }],
        model: 'SMA03P',
        vendor: 'Mercator Ikuü',
        description: 'Environmental sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity],
        toZigbee: [],
        exposes: [e.battery(), e.temperature(), e.humidity(), e.battery_voltage()],
        configure: tuya.configureMagicPacket,
    },
    {
        fingerprint: [{ modelID: 'TS0203', manufacturerName: '_TZ3000_wbrlnkm9' }],
        model: 'SMA04P',
        vendor: 'Mercator Ikuü',
        description: 'Contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ias_contact_alarm_1_report],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            try {
                const endpoint = device.getEndpoint(1);
                await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
                await reporting.batteryPercentageRemaining(endpoint);
                await reporting.batteryVoltage(endpoint);
            }
            catch {
                /* Fails for some*/
            }
        },
    },
    {
        fingerprint: [{ modelID: 'TS0502B', manufacturerName: '_TZ3000_6dwfra5l' }],
        model: 'SMCL01-ZB',
        vendor: 'Mercator Ikuü',
        description: 'Ikon ceiling light',
        extend: [tuya.modernExtend.tuyaLight({ colorTemp: { range: [153, 500] } })],
    },
    {
        fingerprint: [{ modelID: 'TS0505B', manufacturerName: '_TZ3000_xr5m6kfg' }],
        model: 'SMD4109W-RGB-ZB',
        vendor: 'Mercator Ikuü',
        description: '92mm Walter downlight RGB + CCT',
        extend: [tuya.modernExtend.tuyaLight({ colorTemp: { range: [153, 500] }, color: true })],
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3210_raqjcxo5' }],
        model: 'SPP02G',
        vendor: 'Mercator Ikuü',
        description: 'Double power point',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true, endpoints: ['left', 'right'] })],
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['current', 'voltage', 'power', 'energy'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genBasic', 'genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint1);
            await reporting.rmsVoltage(endpoint1, { change: 5 });
            await reporting.rmsCurrent(endpoint1, { change: 50 });
            await reporting.activePower(endpoint1, { change: 1 });
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint2);
            endpoint1.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint1.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3210_7jnk7l3k' }],
        model: 'SPP02GIP',
        vendor: 'Mercator Ikuü',
        description: 'Double power point IP54',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true, endpoints: ['left', 'right'] })],
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['current', 'voltage', 'power', 'energy'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genBasic', 'genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint1);
            await reporting.rmsVoltage(endpoint1, { change: 5 });
            await reporting.rmsCurrent(endpoint1, { change: 50 });
            await reporting.activePower(endpoint1, { change: 1 });
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint2);
            endpoint1.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint1.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
    },
    {
        fingerprint: [{ modelID: 'TS0013', manufacturerName: '_TZ3000_khtlvdfc' }],
        model: 'SSW03G',
        vendor: 'Mercator Ikuü',
        description: 'Triple switch',
        extend: [tuya.modernExtend.tuyaOnOff({ backlightModeLowMediumHigh: true, endpoints: ['left', 'center', 'right'] })],
        endpoint: (device) => {
            return { left: 1, center: 2, right: 3 };
        },
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            for (const ID of [1, 2, 3]) {
                const endpoint = device.getEndpoint(ID);
                await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            }
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        fingerprint: [
            { modelID: 'TS0501', manufacturerName: '_TZ3210_lzqq3u4r' },
            { modelID: 'TS0501', manufacturerName: '_TZ3210_4whigl8i' },
        ],
        model: 'SSWF01G',
        vendor: 'Mercator Ikuü',
        description: 'AC fan controller',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.fan],
        toZigbee: [toZigbee_1.default.fan_mode, toZigbee_1.default.on_off],
        exposes: [e.switch(), e.fan().withModes(['off', 'low', 'medium', 'high', 'on'])],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic', 'genOta', 'genTime', 'genGroups', 'genScenes']);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genIdentify', 'manuSpecificTuya', 'hvacFanCtrl']);
            await reporting.onOff(endpoint);
            await reporting.fanMode(endpoint);
            // Device ships with {fanModeSequence: 1} which restricts physical speed
            // button to low/high. Set to 0 to allow low/med/high from physical press.
            await endpoint.write('hvacFanCtrl', { fanModeSequence: 0 });
        },
    },
    {
        fingerprint: [{ modelID: 'TS011F', manufacturerName: '_TZ3210_pfbzs1an' }],
        model: 'SPPUSB02',
        vendor: 'Mercator Ikuü',
        description: 'Double power point with USB',
        extend: [tuya.modernExtend.tuyaOnOff({ powerOutageMemory: true, electricalMeasurements: true, endpoints: ['left', 'right'] })],
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        // The configure method below is needed to make the device reports on/off state changes
        // when the device is controlled manually through the button on it.
        meta: { multiEndpoint: true, multiEndpointSkip: ['current', 'voltage', 'power', 'energy'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genBasic', 'genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.rmsVoltage(endpoint1, { change: 5 });
            await reporting.rmsCurrent(endpoint1, { change: 50 });
            await reporting.activePower(endpoint1, { change: 1 });
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint2);
            endpoint1.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint1.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=mercator.js.map