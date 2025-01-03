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
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['SZ-ESW01'],
        model: 'SZ-ESW01',
        vendor: 'Sercomm',
        description: 'Telstra smart plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        exposes: [e.switch(), e.power()],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.instantaneousDemand(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000000, multiplier: 1 });
        },
    },
    {
        zigbeeModel: ['SZ-ESW01-AU'],
        model: 'SZ-ESW01-AU',
        vendor: 'Sercomm',
        description: 'Telstra smart plug',
        exposes: [e.switch(), e.power(), e.energy(), e.current(), e.voltage()],
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.electrical_measurement],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering', 'haElectricalMeasurement']);
            await reporting.onOff(endpoint);
            await reporting.instantaneousDemand(endpoint);
            await reporting.currentSummDelivered(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000000, multiplier: 1 });
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.rmsCurrent(endpoint);
        },
    },
    {
        zigbeeModel: ['SZ-ESW02'],
        model: 'SZ-ESW02',
        vendor: 'Sercomm',
        description: 'Telstra smart plug 2',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        exposes: [e.switch(), e.power()],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.instantaneousDemand(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 1000000, multiplier: 1 });
        },
    },
    {
        zigbeeModel: ['XHS2-SE'],
        model: 'XHS2-SE',
        vendor: 'Sercomm',
        description: 'Magnetic door & window contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['SZ-DWS04', 'SZ-DWS04N_SF'],
        model: 'SZ-DWS04',
        vendor: 'Sercomm',
        description: 'Magnetic door & window contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['SZ-DWS08N', 'SZ-DWS08', 'SZ-DWS08N-CZ3'],
        model: 'SZ-DWS08',
        vendor: 'Sercomm',
        description: 'Magnetic door & window contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['SZ-PIR02_SF', 'SZ-PIR02'],
        model: 'AL-PIR02',
        vendor: 'Sercomm',
        description: 'PIR motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['SZ-PIR04N', 'SZ-PIR04N_EU'],
        model: 'SZ-PIR04N',
        vendor: 'Sercomm',
        description: 'PIR motion & temperature sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.illuminance, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: { min: 2500, max: 3200 } } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msIlluminanceMeasurement', 'msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.illuminance(endpoint);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.occupancy(), e.tamper(), e.illuminance(), e.temperature(), e.battery(), e.battery_voltage()],
    },
    {
        zigbeeModel: ['SZ-WTD03'],
        model: 'SZ-WTD03',
        vendor: 'Sercomm',
        description: 'Water leak detector',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.water_leak(), e.battery_low()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=sercomm.js.map