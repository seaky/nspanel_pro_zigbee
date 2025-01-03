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
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['3010'],
        model: 'NCZ-3010',
        vendor: 'Nyce',
        description: 'Door hinge sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.battery()],
    },
    {
        zigbeeModel: ['3011'],
        model: 'NCZ-3011-HA',
        vendor: 'Nyce',
        description: 'Door/window sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['3043'],
        model: 'NCZ-3043-HA',
        vendor: 'Nyce',
        description: 'Ceiling motion sensor',
        fromZigbee: [
            fromZigbee_1.default.occupancy,
            fromZigbee_1.default.humidity,
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.ignore_genIdentify,
            fromZigbee_1.default.ignore_poll_ctrl,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ignore_iaszone_report,
            fromZigbee_1.default.ias_occupancy_alarm_2,
        ],
        toZigbee: [],
        exposes: [e.occupancy(), e.humidity(), e.temperature(), e.battery(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['3041'],
        model: 'NCZ-3041-HA',
        vendor: 'Nyce',
        description: 'Wall motion sensor',
        fromZigbee: [
            fromZigbee_1.default.occupancy,
            fromZigbee_1.default.humidity,
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.ignore_genIdentify,
            fromZigbee_1.default.ignore_poll_ctrl,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ignore_iaszone_report,
            fromZigbee_1.default.ias_occupancy_alarm_2,
        ],
        toZigbee: [],
        meta: { battery: { dontDividePercentage: true } },
        exposes: [e.occupancy(), e.humidity(), e.temperature(), e.battery(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['3045'],
        model: 'NCZ-3045-HA',
        vendor: 'Nyce',
        description: 'Curtain motion sensor',
        fromZigbee: [
            fromZigbee_1.default.occupancy,
            fromZigbee_1.default.humidity,
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.ignore_genIdentify,
            fromZigbee_1.default.ignore_poll_ctrl,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ignore_iaszone_report,
            fromZigbee_1.default.ias_occupancy_alarm_2,
        ],
        toZigbee: [],
        meta: { battery: { dontDividePercentage: true } },
        exposes: [e.occupancy(), e.humidity(), e.temperature(), e.battery(), e.battery_low(), e.tamper()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=nyce.js.map