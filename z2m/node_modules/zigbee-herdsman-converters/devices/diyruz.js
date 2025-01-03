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
const constants = __importStar(require("../lib/constants"));
const exposes = __importStar(require("../lib/exposes"));
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['DIYRuZ_R4_5'],
        model: 'DIYRuZ_R4_5',
        vendor: 'DIYRuZ',
        description: 'DiY 4 Relays + 4 switches + 1 buzzer',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { bottom_left: 1, bottom_right: 2, top_left: 3, top_right: 4, center: 5 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['bottom_left', 'bottom_right', 'top_left', 'top_right', 'center'] }),
        ],
    },
    {
        zigbeeModel: ['DIYRuZ_KEYPAD20'],
        model: 'DIYRuZ_KEYPAD20',
        vendor: 'DIYRuZ',
        description: 'DiY 20 button keypad',
        fromZigbee: [fromZigbee_1.default.keypad20states, fromZigbee_1.default.keypad20_battery],
        toZigbee: [],
        exposes: [e.battery()],
        endpoint: (device) => {
            return {
                btn_1: 1,
                btn_2: 2,
                btn_3: 3,
                btn_4: 4,
                btn_5: 5,
                btn_6: 6,
                btn_7: 7,
                btn_8: 8,
                btn_9: 9,
                btn_10: 10,
                btn_11: 11,
                btn_12: 12,
                btn_13: 13,
                btn_14: 14,
                btn_15: 15,
                btn_16: 16,
                btn_17: 17,
                btn_18: 18,
                btn_19: 19,
                btn_20: 20,
            };
        },
    },
    {
        zigbeeModel: ['DIYRuZ_magnet'],
        model: 'DIYRuZ_magnet',
        vendor: 'DIYRuZ',
        description: 'DIYRuZ contact sensor',
        fromZigbee: [fromZigbee_1.default.keypad20_battery, fromZigbee_1.default.diyruz_contact],
        exposes: [e.battery(), e.contact()],
        toZigbee: [],
    },
    {
        zigbeeModel: ['DIYRuZ_rspm'],
        model: 'DIYRuZ_rspm',
        vendor: 'DIYRuZ',
        description: 'DIYRuZ relay switch power meter',
        fromZigbee: [fromZigbee_1.default.diyruz_rspm],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.current(), e.cpu_temperature(), e.action(['hold', 'release'])],
        endpoint: (device) => {
            return { default: 8 };
        },
    },
    {
        zigbeeModel: ['DIYRuZ_FreePad', 'FreePadLeTV8'],
        model: 'DIYRuZ_FreePad',
        vendor: 'DIYRuZ',
        description: 'DiY 8/12/20 button keypad',
        fromZigbee: [fromZigbee_1.default.diyruz_freepad_clicks, fromZigbee_1.default.diyruz_freepad_config, fromZigbee_1.default.battery],
        exposes: [e.battery(), e.action(['*_single', '*_double', '*_triple', '*_quadruple', '*_release', '*_hold'])].concat(((enpoinsCount) => {
            const features = [];
            for (let i = 1; i <= enpoinsCount; i++) {
                const epName = `button_${i}`;
                features.push(e.enum('switch_type', ea.ALL, ['toggle', 'momentary', 'multifunction']).withEndpoint(epName));
                features.push(e.enum('switch_actions', ea.ALL, ['on', 'off', 'toggle']).withEndpoint(epName));
            }
            return features;
        })(20)),
        toZigbee: [toZigbee_1.default.diyruz_freepad_on_off_config],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            if (device.applicationVersion < 3) {
                // Legacy PM2 firmwares
                const payload = [
                    {
                        attribute: 'batteryPercentageRemaining',
                        minimumReportInterval: 0,
                        maximumReportInterval: 3600,
                        reportableChange: 0,
                    },
                    {
                        attribute: 'batteryVoltage',
                        minimumReportInterval: 0,
                        maximumReportInterval: 3600,
                        reportableChange: 0,
                    },
                ];
                await endpoint.configureReporting('genPowerCfg', payload);
            }
            device.endpoints.forEach(async (ep) => {
                if (ep.outputClusters.includes(18)) {
                    await reporting.bind(ep, coordinatorEndpoint, ['genMultistateInput']);
                }
            });
        },
        endpoint: (device) => {
            return {
                button_1: 1,
                button_2: 2,
                button_3: 3,
                button_4: 4,
                button_5: 5,
                button_6: 6,
                button_7: 7,
                button_8: 8,
                button_9: 9,
                button_10: 10,
                button_11: 11,
                button_12: 12,
                button_13: 13,
                button_14: 14,
                button_15: 15,
                button_16: 16,
                button_17: 17,
                button_18: 18,
                button_19: 19,
                button_20: 20,
            };
        },
    },
    {
        zigbeeModel: ['FreePad_LeTV_8'],
        model: 'FreePad_LeTV_8',
        vendor: 'DIYRuZ',
        description: 'LeTV 8key FreePad mod',
        fromZigbee: [fromZigbee_1.default.diyruz_freepad_clicks, fromZigbee_1.default.diyruz_freepad_config, fromZigbee_1.default.battery],
        exposes: [e.battery(), e.action(['*_single', '*_double', '*_triple', '*_quadruple', '*_release'])].concat(((enpoinsCount) => {
            const features = [];
            for (let i = 1; i <= enpoinsCount; i++) {
                const epName = `button_${i}`;
                features.push(e.enum('switch_type', ea.ALL, ['toggle', 'momentary', 'multifunction']).withEndpoint(epName));
                features.push(e.enum('switch_actions', ea.ALL, ['on', 'off', 'toggle']).withEndpoint(epName));
            }
            return features;
        })(8)),
        toZigbee: [toZigbee_1.default.diyruz_freepad_on_off_config],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            if (device.applicationVersion < 3) {
                // Legacy PM2 firmwares
                const payload = [
                    {
                        attribute: 'batteryPercentageRemaining',
                        minimumReportInterval: 0,
                        maximumReportInterval: 3600,
                        reportableChange: 0,
                    },
                    {
                        attribute: 'batteryVoltage',
                        minimumReportInterval: 0,
                        maximumReportInterval: 3600,
                        reportableChange: 0,
                    },
                ];
                await endpoint.configureReporting('genPowerCfg', payload);
            }
            device.endpoints.forEach(async (ep) => {
                if (ep.outputClusters.includes(18)) {
                    await reporting.bind(ep, coordinatorEndpoint, ['genMultistateInput']);
                }
            });
        },
        endpoint: (device) => {
            return { button_1: 1, button_2: 2, button_3: 3, button_4: 4, button_5: 5, button_6: 6, button_7: 7, button_8: 8 };
        },
    },
    {
        zigbeeModel: ['DIYRuZ_Geiger'],
        model: 'DIYRuZ_Geiger',
        vendor: 'DIYRuZ',
        description: 'DiY Geiger counter',
        fromZigbee: [fromZigbee_1.default.diyruz_geiger, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.diyruz_geiger_config],
        exposes: [
            e.action(['on', 'off']),
            e.numeric('radioactive_events_per_minute', ea.STATE).withUnit('rpm').withDescription('Current count radioactive pulses per minute'),
            e.numeric('radiation_dose_per_hour', ea.STATE).withUnit('μR/h').withDescription('Current radiation level'),
            e.binary('led_feedback', ea.ALL, 'ON', 'OFF').withDescription('Enable LED feedback'),
            e.binary('buzzer_feedback', ea.ALL, 'ON', 'OFF').withDescription('Enable buzzer feedback'),
            e.numeric('alert_threshold', ea.ALL).withUnit('μR/h').withDescription('Critical radiation level').withValueMin(0).withValueMax(10000),
            e.enum('sensors_type', ea.ALL, ['СБМ-20/СТС-5/BOI-33', 'СБМ-19/СТС-6', 'Others']).withDescription('Type of installed tubes'),
            e.numeric('sensors_count', ea.ALL).withDescription('Count of installed tubes').withValueMin(0).withValueMax(50),
            e.numeric('sensitivity', ea.ALL).withDescription('This is applicable if tubes type is set to other').withValueMin(0).withValueMax(100),
        ],
        toZigbee: [toZigbee_1.default.diyruz_geiger_config],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msIlluminanceMeasurement', 'genOnOff']);
            const payload = [
                {
                    attribute: { ID: 0xf001, type: 0x21 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.MINUTE,
                    reportableChange: 0,
                },
                {
                    attribute: { ID: 0xf002, type: 0x23 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.MINUTE,
                    reportableChange: 0,
                },
            ];
            await endpoint.configureReporting('msIlluminanceMeasurement', payload);
        },
    },
    {
        zigbeeModel: ['DIYRuZ_R8_8'],
        model: 'DIYRuZ_R8_8',
        vendor: 'DIYRuZ',
        description: 'DiY 8 Relays + 8 switches',
        fromZigbee: [fromZigbee_1.default.ptvo_multistate_action, legacy.fz.ptvo_switch_buttons, fromZigbee_1.default.ignore_basic_report],
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, l5: 5, l6: 6, l7: 7, l8: 8 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'] }),
        ],
    },
    {
        zigbeeModel: ['DIYRuZ_RT'],
        model: 'DIYRuZ_RT',
        vendor: 'DIYRuZ',
        description: 'DiY CC2530 Zigbee 3.0 firmware',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.temperature],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.temperature()],
    },
    {
        zigbeeModel: ['DIYRuZ_Flower'],
        model: 'DIYRuZ_Flower',
        vendor: 'DIYRuZ',
        description: 'Flower sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.illuminance, fromZigbee_1.default.soil_moisture, fromZigbee_1.default.pressure, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { multiEndpoint: true, multiEndpointSkip: ['humidity'] },
        endpoint: (device) => {
            return { bme: 1, ds: 2 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const firstEndpoint = device.getEndpoint(1);
            const secondEndpoint = device.getEndpoint(2);
            await reporting.bind(firstEndpoint, coordinatorEndpoint, [
                'genPowerCfg',
                'msTemperatureMeasurement',
                'msRelativeHumidity',
                'msPressureMeasurement',
                'msIlluminanceMeasurement',
                'msSoilMoisture',
            ]);
            await reporting.bind(secondEndpoint, coordinatorEndpoint, ['msTemperatureMeasurement']);
            const overrides = { min: 0, max: 3600, change: 0 };
            await reporting.batteryVoltage(firstEndpoint, overrides);
            await reporting.batteryPercentageRemaining(firstEndpoint, overrides);
            await reporting.temperature(firstEndpoint, overrides);
            await reporting.humidity(firstEndpoint, overrides);
            await reporting.pressureExtended(firstEndpoint, overrides);
            await reporting.illuminance(firstEndpoint, overrides);
            await reporting.soil_moisture(firstEndpoint, overrides);
            await reporting.temperature(secondEndpoint, overrides);
            await firstEndpoint.read('msPressureMeasurement', ['scale']);
        },
        exposes: [
            e.soil_moisture(),
            e.battery(),
            e.illuminance(),
            e.humidity(),
            e.pressure(),
            e.temperature().withEndpoint('ds'),
            e.temperature().withEndpoint('bme'),
        ],
    },
    {
        zigbeeModel: ['DIYRuZ_AirSense'],
        model: 'DIYRuZ_AirSense',
        vendor: 'DIYRuZ',
        description: 'Air quality sensor',
        fromZigbee: [
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.humidity,
            fromZigbee_1.default.co2,
            fromZigbee_1.default.pressure,
            fromZigbee_1.default.diyruz_airsense_config_co2,
            fromZigbee_1.default.diyruz_airsense_config_temp,
            fromZigbee_1.default.diyruz_airsense_config_pres,
            fromZigbee_1.default.diyruz_airsense_config_hum,
        ],
        toZigbee: [toZigbee_1.default.diyruz_airsense_config],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const clusters = ['msTemperatureMeasurement', 'msRelativeHumidity', 'msPressureMeasurement', 'msCO2'];
            await reporting.bind(endpoint, coordinatorEndpoint, clusters);
            for (const cluster of clusters) {
                await endpoint.configureReporting(cluster, [
                    { attribute: 'measuredValue', minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 },
                ]);
            }
            await endpoint.read('msPressureMeasurement', ['scale']);
        },
        exposes: [
            e.co2(),
            e.temperature(),
            e.humidity(),
            e.pressure(),
            e.binary('led_feedback', ea.ALL, 'ON', 'OFF').withDescription('Enable LEDs feedback'),
            e.binary('enable_abc', ea.ALL, 'ON', 'OFF').withDescription('Enable ABC (Automatic Baseline Correction)'),
            e.numeric('threshold1', ea.ALL).withUnit('ppm').withDescription('Warning (LED2) CO2 level').withValueMin(0).withValueMax(50000),
            e.numeric('threshold2', ea.ALL).withUnit('ppm').withDescription('Critical (LED3) CO2 level').withValueMin(0).withValueMax(50000),
            e.numeric('temperature_offset', ea.ALL).withUnit('°C').withDescription('Adjust temperature').withValueMin(-20).withValueMax(20),
            e.numeric('humidity_offset', ea.ALL).withUnit('%').withDescription('Adjust humidity').withValueMin(-50).withValueMax(50),
            e.numeric('pressure_offset', ea.ALL).withUnit('hPa').withDescription('Adjust pressure').withValueMin(-1000).withValueMax(1000),
        ],
    },
    {
        zigbeeModel: ['DIY_Zintercom'],
        model: 'DIYRuZ_Zintercom',
        vendor: 'DIYRuZ',
        description: 'Matrix intercom auto opener',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.diyruz_zintercom_config],
        toZigbee: [toZigbee_1.default.diyruz_zintercom_config],
        configure: async (device, coordinatorEndpoint) => {
            const firstEndpoint = device.getEndpoint(1);
            await reporting.bind(firstEndpoint, coordinatorEndpoint, ['closuresDoorLock', 'genPowerCfg']);
            const payload1 = [
                { attribute: 'batteryPercentageRemaining', minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 },
                { attribute: 'batteryVoltage', minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 },
            ];
            await firstEndpoint.configureReporting('genPowerCfg', payload1);
            const payload2 = [{ attribute: { ID: 0x0050, type: 0x30 }, minimumReportInterval: 0, maximumReportInterval: 3600, reportableChange: 0 }];
            await firstEndpoint.configureReporting('closuresDoorLock', payload2);
        },
        exposes: [
            e.enum('state', ea.STATE, ['idle', 'ring', 'talk', 'open', 'drop']).withDescription('Current state'),
            e.enum('mode', ea.ALL, ['never', 'once', 'always', 'drop']).withDescription('Select open mode'),
            e.binary('sound', ea.ALL, 'ON', 'OFF').withProperty('sound').withDescription('Enable or disable sound'),
            e.numeric('time_ring', ea.ALL).withUnit('sec').withDescription('Time to ring before answer').withValueMin(0).withValueMax(600),
            e.numeric('time_talk', ea.ALL).withUnit('sec').withDescription('Time to hold before open').withValueMin(0).withValueMax(600),
            e.numeric('time_open', ea.ALL).withUnit('sec').withDescription('Time to open before end').withValueMin(0).withValueMax(600),
            e.numeric('time_bell', ea.ALL).withUnit('sec').withDescription('Time after last bell to finish ring').withValueMin(0).withValueMax(600),
            e.numeric('time_report', ea.ALL).withUnit('min').withDescription('Reporting interval').withValueMin(0).withValueMax(1440),
            e.battery(),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=diyruz.js.map