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
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['wall pir'],
        model: 'PRZ01',
        vendor: 'J.XUAN',
        description: 'Human body movement sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1_with_timeout, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.battery()],
    },
    {
        zigbeeModel: ['door sensor'],
        model: 'DSZ01',
        vendor: 'J.XUAN',
        description: 'Door or window contact switch',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low()],
    },
    {
        zigbeeModel: ['JD-SWITCH\u000002'],
        model: 'WSZ01',
        vendor: 'J.XUAN',
        description: 'Wireless switch',
        fromZigbee: [fromZigbee_1.default.WSZ01_on_off_action, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.action(['release', 'single', 'double', 'hold']), e.battery()],
    },
    {
        zigbeeModel: ['00090bdc'],
        model: 'SPZ01',
        vendor: 'J.XUAN',
        description: 'plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering],
        exposes: [e.switch(), e.power(), e.power_outage_memory().withAccess(ea.STATE_SET)],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.SPZ01_power_outage_memory],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement']);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=jxuan.js.map