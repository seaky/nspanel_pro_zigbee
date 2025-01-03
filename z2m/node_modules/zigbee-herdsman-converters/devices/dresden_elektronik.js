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
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const definitions = [
    {
        zigbeeModel: ['FLS-PP3'],
        model: 'Mega23M12',
        vendor: 'Dresden Elektronik',
        description: 'ZigBee Light Link wireless electronic ballast',
        ota: ota.zigbeeOTA,
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { rgb: 10, white: 11 } }),
            (0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true, endpointNames: ['rgb', 'white'] }),
        ],
    },
    {
        zigbeeModel: ['FLS-CT'],
        model: 'XVV-Mega23M12',
        vendor: 'Dresden Elektronik',
        description: 'ZigBee Light Link wireless electronic ballast color temperature',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['Kobold'],
        model: 'BN-600110',
        vendor: 'Dresden Elektronik',
        description: 'Zigbee 3.0 dimm actuator',
        extend: [(0, modernExtend_1.light)()],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['Hive'],
        model: 'Hive',
        vendor: 'Phoscon',
        description: 'Battery powered smart LED light',
        ota: ota.zigbeeOTA,
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true }), (0, modernExtend_1.battery)()],
    },
    {
        zigbeeModel: ['FLS-A lp (1-10V)'],
        model: 'BN-600078',
        vendor: 'Dresden Elektronik',
        description: 'Zigbee controller for 1-10V/PWM',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 11, l2: 12, l3: 13, l4: 14 } }), (0, modernExtend_1.light)({ endpointNames: ['l1', 'l2', 'l3', 'l4'] })],
        meta: { disableDefaultResponse: true },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=dresden_elektronik.js.map