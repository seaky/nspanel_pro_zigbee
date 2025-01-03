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
const logger_1 = require("../lib/logger");
const modernExtend_1 = require("../lib/modernExtend");
const e = exposes.presets;
const NS = 'zhc:ewelink';
const fzLocal = {
    WS01_rain: {
        cluster: 'ssIasZone',
        type: 'commandStatusChangeNotification',
        convert: (model, msg, publish, options, meta) => {
            const zoneStatus = msg.data.zonestatus;
            if (msg.endpoint.ID != 1)
                return;
            return { rain: (zoneStatus & 1) > 0 };
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['CK-BL702-ROUTER-01(7018)'],
        model: 'CK-BL702-ROUTER-01(7018)',
        vendor: 'eWeLink',
        description: 'USB router',
        fromZigbee: [fromZigbee_1.default.linkquality_from_basic],
        toZigbee: [],
        exposes: [],
    },
    {
        zigbeeModel: ['CK-BL702-MSW-01(7010)'],
        model: 'CK-BL702-MSW-01(7010)',
        vendor: 'eWeLink',
        description: 'CMARS Zigbee smart plug',
        extend: [(0, modernExtend_1.onOff)({ skipDuplicateTransaction: true })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['SA-003-Zigbee'],
        model: 'SA-003-Zigbee',
        vendor: 'eWeLink',
        description: 'Zigbee smart plug',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false, skipDuplicateTransaction: true, configureReporting: false })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
        configure: async (device, coordinatorEndpoint) => {
            try {
                await device.getEndpoint(1).bind('genOnOff', coordinatorEndpoint);
            }
            catch {
                // This might fail because there are some repeaters which advertise to support genOnOff but don't support it.
                // https://github.com/Koenkk/zigbee2mqtt/issues/19865
                logger_1.logger.debug('Failed to bind genOnOff for SA-003-Zigbee', NS);
            }
        },
    },
    {
        zigbeeModel: ['SA-030-1'],
        model: 'SA-030-1',
        vendor: 'eWeLink',
        description: 'Zigbee 3.0 smart plug 13A (3120W)(UK version)',
        extend: [(0, modernExtend_1.onOff)({ skipDuplicateTransaction: true })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['SWITCH-ZR02'],
        model: 'SWITCH-ZR02',
        vendor: 'eWeLink',
        description: 'Zigbee smart switch',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false, skipDuplicateTransaction: true })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['SWITCH-ZR03-1'],
        model: 'SWITCH-ZR03-1',
        vendor: 'eWeLink',
        description: 'Zigbee smart switch',
        extend: [(0, modernExtend_1.onOff)({ skipDuplicateTransaction: true })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['ZB-SW01'],
        model: 'ZB-SW01',
        vendor: 'eWeLink',
        description: 'Smart light switch - 1 gang',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false, skipDuplicateTransaction: true, configureReporting: false })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['ZB-SW02', 'E220-KR2N0Z0-HA', 'SWITCH-ZR03-2'],
        model: 'ZB-SW02',
        vendor: 'eWeLink',
        description: 'Smart light switch/2 gang relay',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, right: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'right'], configureReporting: false })],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['ZB-SW03'],
        model: 'ZB-SW03',
        vendor: 'eWeLink',
        description: 'Smart light switch - 3 gang',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 1, center: 2, right: 3 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['left', 'center', 'right'], configureReporting: false }),
        ],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['ZB-SW04'],
        model: 'ZB-SW04',
        vendor: 'eWeLink',
        description: 'Smart light switch - 4 gang',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4'], configureReporting: false }),
        ],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['ZB-SW05'],
        model: 'ZB-SW05',
        vendor: 'eWeLink',
        description: 'Smart light switch - 5 gang',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, l5: 5 } }),
            (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4', 'l5'], configureReporting: false }),
        ],
        onEvent: async (type, data, device) => {
            device.skipDefaultResponse = true;
        },
    },
    {
        zigbeeModel: ['WS01'],
        model: 'WS01',
        vendor: 'eWeLink',
        description: 'Rainfall sensor',
        fromZigbee: [fzLocal.WS01_rain],
        toZigbee: [],
        exposes: [e.rain()],
    },
    {
        zigbeeModel: ['SNZB-05'],
        model: 'SNZB-05',
        vendor: 'eWeLink',
        description: 'Zigbee water sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'water_leak', zoneAttributes: ['alarm_1', 'battery_low'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=ewelink.js.map