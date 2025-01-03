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
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['1116-S'],
        model: 'IL06_1',
        vendor: 'Iris',
        description: 'Contact and temperature sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
            device.powerSource = 'Battery';
            device.save();
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['3210-L'],
        model: '3210-L',
        vendor: 'Iris',
        description: 'Smart plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement']);
            // 3210-L doesn't support reading 'acVoltageMultiplier' or 'acVoltageDivisor'
            await endpoint.read('haElectricalMeasurement', ['acCurrentMultiplier', 'acCurrentDivisor']);
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.onOff(endpoint);
            await reporting.rmsVoltage(endpoint, { change: 2 }); // Voltage reports in V
            await reporting.rmsCurrent(endpoint, { change: 10 }); // Current reports in mA
            await reporting.activePower(endpoint); // Power reports in 0.1W
        },
        exposes: [e.switch(), e.power(), e.current(), e.voltage()],
    },
    {
        zigbeeModel: ['3326-L'],
        model: '3326-L',
        vendor: 'Iris',
        description: 'Motion and temperature sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_2, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['3320-L'],
        model: '3320-L',
        vendor: 'Iris',
        description: 'Contact and temperature sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['3450-L', '3450-L2', '3450-Geu'],
        model: '3450-L',
        vendor: 'Iris',
        description: 'Smart fob',
        fromZigbee: [fromZigbee_1.default.command_on_presence, fromZigbee_1.default.command_off, fromZigbee_1.default.battery, fromZigbee_1.default.checkin_presence],
        toZigbee: [],
        exposes: [e.action(['on_1', 'off_1', 'on_2', 'off_2', 'on_3', 'off_3', 'on_4', 'off_4']), e.battery(), e.presence()],
        meta: { battery: { voltageToPercentage: '3V_2100' }, multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genOnOff', 'genPowerCfg', 'genPollCtrl']);
            await reporting.batteryVoltage(endpoint1);
            const interval = 100 - 10; // 100 seconds is default timeout so set interval to 10 seconds before
            await endpoint1.write('genPollCtrl', { checkinInterval: interval * 4 });
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            const endpoint3 = device.getEndpoint(3);
            await reporting.bind(endpoint3, coordinatorEndpoint, ['genOnOff']);
            const endpoint4 = device.getEndpoint(4);
            await reporting.bind(endpoint4, coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['3460-L'],
        model: '3460-L',
        vendor: 'Iris',
        description: 'Smart button',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.battery, fromZigbee_1.default.temperature],
        toZigbee: [],
        exposes: [e.battery(), e.temperature(), e.action(['on', 'off'])],
        meta: { battery: { voltageToPercentage: '3V_1500_2800' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genPowerCfg', 'msTemperatureMeasurement']);
            await reporting.batteryVoltage(endpoint);
            await reporting.temperature(endpoint);
        },
    },
    {
        zigbeeModel: ['1117-S'],
        model: 'iL07_1',
        vendor: 'Iris',
        description: 'Motion Sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_2, fromZigbee_1.default.temperature, fromZigbee_1.default.humidity],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.temperature(), e.humidity()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'msRelativeHumidity']);
            await reporting.temperature(endpoint);
            await reporting.humidity(endpoint);
        },
    },
    {
        zigbeeModel: ['HT8-ZB'],
        model: '27087-03',
        vendor: 'Iris',
        description: 'Hose faucet water timer',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_time_read],
        toZigbee: [toZigbee_1.default.on_off],
        meta: { battery: { voltageToPercentage: { min: 2500, max: 3000 } } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genPowerCfg']);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.switch(), e.battery()],
    },
    {
        zigbeeModel: ['1113-S'],
        model: 'iL03_1',
        vendor: 'Iris',
        description: 'Smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' })],
    },
    {
        zigbeeModel: ['3315-L'],
        model: '3315-L',
        vendor: 'Iris',
        description: 'Water sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.battery],
        exposes: [e.temperature(), e.water_leak(), e.battery_low(), e.tamper(), e.battery()],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: { min: 2500, max: 3000 } } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=iris.js.map