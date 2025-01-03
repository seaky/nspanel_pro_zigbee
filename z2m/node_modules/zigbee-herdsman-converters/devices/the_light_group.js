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
        zigbeeModel: ['S24019'],
        model: 'S24019',
        vendor: 'The Light Group',
        description: 'SLC SmartOne led dimmer',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.brightness, fromZigbee_1.default.metering, fromZigbee_1.default.electrical_measurement],
        toZigbee: [toZigbee_1.default.light_onoff_brightness, toZigbee_1.default.level_config],
        exposes: [e.light_brightness().withLevelConfig()],
        configure: async (device, coordinatorEndpoint) => {
            // Endpoint 1
            const endpoint1 = device.getEndpoint(1);
            const binds1 = ['genOnOff', 'genLevelCtrl', 'haElectricalMeasurement', 'seMetering'];
            await reporting.bind(endpoint1, coordinatorEndpoint, binds1);
            await reporting.onOff(endpoint1);
            await reporting.brightness(endpoint1);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint1);
            await reporting.activePower(endpoint1, { min: 5, max: 3600, change: 1000 });
            await reporting.rmsCurrent(endpoint1, { min: 5, max: 3600, change: 100 });
            await reporting.rmsVoltage(endpoint1, { min: 5, max: 3600, change: 100 });
            // read switch state
            await endpoint1.read('genOnOff', ['onOff']);
        },
    },
    {
        zigbeeModel: ['S57003'],
        model: 'S57003',
        vendor: 'The Light Group',
        description: 'SLC SmartOne Zigbee wall remote 4-channels',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        exposes: [
            e.battery(),
            e.action([
                'on_l1',
                'off_l1',
                'brightness_move_up_l1',
                'brightness_move_down_l1',
                'brightness_stop_l1',
                'on_l2',
                'off_l2',
                'brightness_move_up_l2',
                'brightness_move_down_l2',
                'brightness_stop_l2',
                'on_l3',
                'off_l3',
                'brightness_move_up_l3',
                'brightness_move_down_l3',
                'brightness_stop_l3',
                'on_l4',
                'off_l4',
                'brightness_move_up_l4',
                'brightness_move_down_l4',
                'brightness_stop_l4',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { l1: 1, l2: 2, l3: 3, l4: 4 };
        },
    },
    {
        zigbeeModel: ['S24013'],
        model: 'S24013',
        vendor: 'The Light Group',
        description: 'SLC SmartOne AC dimmer mini 200W Zigbee LN',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['S32053'],
        model: 'S32053',
        vendor: 'The Light Group',
        description: 'SLC SmartOne CV led dimmable driver',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['S32055'],
        model: 'S32055',
        vendor: 'The Light Group',
        description: 'SLC SmartOne TW led dimmable driver 24V/75W',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=the_light_group.js.map