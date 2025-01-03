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
const modernExtend_1 = require("../lib/modernExtend");
const globalStore = __importStar(require("../lib/store"));
const e = exposes.presets;
function airQuality() {
    const exposes = [e.temperature(), e.humidity(), e.voc().withUnit('ppb'), e.eco2()];
    const fromZigbee = [
        {
            cluster: 'msTemperatureMeasurement',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const temperature = parseFloat(msg.data['measuredValue']) / 100.0;
                const humidity = parseFloat(msg.data['minMeasuredValue']) / 100.0;
                const eco2 = parseFloat(msg.data['maxMeasuredValue']);
                const voc = parseFloat(msg.data['tolerance']);
                return { temperature, humidity, eco2, voc };
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
function electricityMeterPoll() {
    const configure = [
        (0, modernExtend_1.setupConfigureForBinding)('haElectricalMeasurement', 'input'),
        (0, modernExtend_1.setupConfigureForReading)('haElectricalMeasurement', [
            'acVoltageMultiplier',
            'acVoltageDivisor',
            'acCurrentMultiplier',
            'acCurrentDivisor',
            'acPowerMultiplier',
            'acPowerDivisor',
        ]),
        (0, modernExtend_1.setupConfigureForReading)('seMetering', ['multiplier', 'divisor']),
        (0, modernExtend_1.setupConfigureForReporting)('seMetering', 'currentSummDelivered', { min: '5_SECONDS', max: '1_HOUR', change: 257 }, exposes.access.STATE_GET),
    ];
    const onEvent = async (type, data, device) => {
        // This device doesn't support reporting correctly.
        // https://github.com/Koenkk/zigbee-herdsman-converters/pull/1270
        const endpoint = device.getEndpoint(1);
        if (type === 'stop') {
            clearInterval(globalStore.getValue(device, 'interval'));
            globalStore.clearValue(device, 'interval');
        }
        else if (!globalStore.hasValue(device, 'interval')) {
            const interval = setInterval(async () => {
                try {
                    await endpoint.read('haElectricalMeasurement', ['rmsVoltage', 'rmsCurrent', 'activePower']);
                    await endpoint.read('seMetering', ['currentSummDelivered', 'multiplier', 'divisor']);
                }
                catch {
                    // Do nothing
                }
            }, 10 * 1000); // Every 10 seconds
            globalStore.putValue(device, 'interval', interval);
        }
    };
    return { configure, onEvent, isModernExtend: true };
}
const definitions = [
    {
        zigbeeModel: ['Leak_Sensor'],
        model: 'MCLH-07',
        vendor: 'LifeControl',
        description: 'Water leakage sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'water_leak', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ dontDividePercentage: true, percentageReporting: false }),
        ],
    },
    {
        zigbeeModel: ['Door_Sensor'],
        model: 'MCLH-04',
        vendor: 'LifeControl',
        description: 'Open and close sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ dontDividePercentage: true, percentageReporting: false }),
        ],
    },
    {
        zigbeeModel: ['vivi ZLight'],
        model: 'MCLH-02',
        vendor: 'LifeControl',
        description: 'Smart light bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [167, 333] }, color: true })],
    },
    {
        zigbeeModel: ['RICI01'],
        model: 'MCLH-03',
        vendor: 'LifeControl',
        description: 'Smart socket',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false }), (0, modernExtend_1.electricityMeter)({ configureReporting: false }), electricityMeterPoll()],
    },
    {
        zigbeeModel: ['Motion_Sensor'],
        model: 'MCLH-05',
        vendor: 'LifeControl',
        description: 'Motion sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ dontDividePercentage: true, percentageReporting: false }),
        ],
    },
    {
        zigbeeModel: ['VOC_Sensor'],
        model: 'MCLH-08',
        vendor: 'LifeControl',
        description: 'Air quality sensor',
        extend: [airQuality(), (0, modernExtend_1.battery)({ dontDividePercentage: true, percentageReporting: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lifecontrol.js.map