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
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['SCM_00.00.03.11TC'],
        model: '12031',
        vendor: 'Lupus',
        description: 'Roller shutter',
        fromZigbee: [fromZigbee_1.default.cover_position_via_brightness, fromZigbee_1.default.cover_state_via_onoff],
        toZigbee: [toZigbee_1.default.cover_via_brightness],
        exposes: [e.cover_position().setAccess('state', ea.ALL)],
    },
    {
        zigbeeModel: ['SCM-3-OTA_00.00.03.16TC', 'SCM-6-OTA_00.00.03.17TC', 'SCM-6-OTA_00.00.03.18TC', 'SCM-6-OTA_00.00.03.20TC'],
        model: 'LS12128',
        vendor: 'Lupus',
        description: 'Roller shutter',
        fromZigbee: [fromZigbee_1.default.cover_position_via_brightness, fromZigbee_1.default.cover_state_via_onoff],
        toZigbee: [toZigbee_1.default.cover_via_brightness],
        exposes: [e.cover_position().setAccess('state', ea.ALL)],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['PSMP5_00.00.03.11TC', 'PSMP5_00.00.05.12TC', 'PSMP5_00.00.03.05TC'],
        model: '12050',
        vendor: 'Lupus',
        description: 'LUPUSEC mains socket with power meter',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering],
        exposes: [e.switch(), e.power()],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.instantaneousDemand(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 10, multiplier: 1 });
        },
    },
    {
        zigbeeModel: ['PRS3CH1_00.00.05.10TC', 'PRS3CH1_00.00.05.11TC'],
        model: '12126',
        vendor: 'Lupus',
        description: '1 channel relay',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false, ota: ota.zigbeeOTA })],
    },
    {
        zigbeeModel: ['PRS3CH2_00.00.05.10TC', 'PRS3CH2_00.00.05.11TC', 'PRS3CH2_00.00.05.12TC'],
        model: '12127',
        vendor: 'Lupus',
        description: '2 channel relay',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'], powerOnBehavior: false, ota: ota.zigbeeOTA })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=lupus.js.map