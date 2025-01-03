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
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        fingerprint: [{ modelID: 'SmokeSensor-EM', manufacturerName: 'Trust' }],
        model: 'ZSDR-850',
        vendor: 'Trust',
        description: 'Smoke detector',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.smoke(), e.battery_low(), e.battery()],
    },
    {
        zigbeeModel: ['WATER_TPV14'],
        model: 'ZWLD-100',
        vendor: 'Trust',
        description: 'Water leakage detector',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.water_leak(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: [
            '\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
            'ZLL-NonColorController',
        ],
        model: 'ZYCT-202',
        vendor: 'Trust',
        description: 'Remote control',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off_with_effect, legacy.fz.ZYCT202_stop, legacy.fz.ZYCT202_up_down],
        exposes: [e.action(['on', 'off', 'stop', 'brightness_stop', 'brightness_move_up', 'brightness_move_down']), e.action_group()],
        toZigbee: [],
        // Device does not support battery: https://github.com/Koenkk/zigbee2mqtt/issues/5928
    },
    {
        zigbeeModel: ['ZLL-DimmableLigh'],
        model: 'ZLED-2709',
        vendor: 'Trust',
        description: 'Smart Dimmable LED Bulb',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        fingerprint: [
            // https://github.com/Koenkk/zigbee2mqtt/issues/8027#issuecomment-904783277
            {
                modelID: 'ZLL-ColorTempera',
                manufacturerName: 'Trust International B.V.\u0000',
                applicationVersion: 1,
                endpoints: [
                    {
                        ID: 1,
                        profileID: 49246,
                        deviceID: 544,
                        inputClusters: [0, 4, 3, 6, 8, 5, 768, 65535, 65535, 25],
                        outputClusters: [0, 4, 3, 6, 8, 5, 768, 25],
                    },
                    { ID: 2, profileID: 49246, deviceID: 4096, inputClusters: [4096], outputClusters: [4096] },
                ],
            },
        ],
        zigbeeModel: ['ZLL-ColorTempera', 'ZLL-ColorTemperature'],
        model: 'ZLED-TUNE9',
        vendor: 'Trust',
        description: 'Smart tunable LED bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        fingerprint: [
            // https://github.com/Koenkk/zigbee2mqtt/issues/8027#issuecomment-904783277
            {
                modelID: 'ZLL-ExtendedColo',
                manufacturerName: 'Trust International B.V.\u0000',
                applicationVersion: 1,
                endpoints: [
                    { ID: 1, profileID: 49246, deviceID: 4096, inputClusters: [4096], outputClusters: [4096] },
                    {
                        ID: 2,
                        profileID: 49246,
                        deviceID: 528,
                        inputClusters: [0, 4, 3, 6, 8, 5, 768, 65535, 25],
                        outputClusters: [0, 4, 3, 6, 8, 5, 768, 25],
                    },
                ],
            },
        ],
        model: 'ZLED-RGB9',
        vendor: 'Trust',
        description: 'Smart RGB LED bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] }, color: true, powerOnBehavior: false })],
        endpoint: (device) => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['VMS_ADUROLIGHT'],
        model: 'ZPIR-8000',
        vendor: 'Trust',
        description: 'Motion Sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_2, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['CSW_ADUROLIGHT'],
        model: 'ZCTS-808',
        vendor: 'Trust',
        description: 'Wireless contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['Built-in Dimmer'],
        model: 'ZCM-300',
        vendor: 'Trust',
        description: 'Zigbee smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=trust.js.map