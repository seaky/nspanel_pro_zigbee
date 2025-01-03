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
const zigbee_herdsman_1 = require("zigbee-herdsman");
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const constants = __importStar(require("../lib/constants"));
const exposes = __importStar(require("../lib/exposes"));
const legacy = __importStar(require("../lib/legacy"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['101.301.001649', '101.301.001838', '101.301.001802', '101.301.001738', '101.301.001412', '101.301.001765', '101.301.001814'],
        model: 'MEAZON_BIZY_PLUG',
        vendor: 'Meazon',
        description: 'Bizy plug meter',
        fromZigbee: [fromZigbee_1.default.command_on, legacy.fz.genOnOff_cmdOn, fromZigbee_1.default.command_off, legacy.fz.genOnOff_cmdOff, fromZigbee_1.default.on_off, fromZigbee_1.default.meazon_meter],
        exposes: [e.switch(), e.power(), e.voltage(), e.current(), e.energy()],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(10);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint, { min: 1, max: 0xfffe });
            const options = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.MEAZON_S_A, disableDefaultResponse: false };
            await endpoint.write('seMetering', { 0x1005: { value: 0x063e, type: 25 } }, options);
            await endpoint.configureReporting('seMetering', [
                {
                    reportableChange: 1,
                    attribute: { ID: 0x2000, type: 0x29 },
                    minimumReportInterval: 1,
                    maximumReportInterval: constants.repInterval.MINUTES_5,
                },
            ], options);
        },
    },
    {
        zigbeeModel: ['102.106.000235', '102.106.001111', '102.106.000348', '102.106.000256', '102.106.001242', '102.106.000540'],
        model: 'MEAZON_DINRAIL',
        vendor: 'Meazon',
        description: 'DinRail 1-phase meter',
        fromZigbee: [fromZigbee_1.default.command_on, legacy.fz.genOnOff_cmdOn, fromZigbee_1.default.command_off, legacy.fz.genOnOff_cmdOff, fromZigbee_1.default.on_off, fromZigbee_1.default.meazon_meter],
        exposes: [e.switch(), e.power(), e.voltage(), e.current()],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(10);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'seMetering']);
            await reporting.onOff(endpoint);
            const options = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.MEAZON_S_A, disableDefaultResponse: false };
            await endpoint.write('seMetering', { 0x1005: { value: 0x063e, type: 25 } }, options);
            await reporting.onOff(endpoint);
            await endpoint.configureReporting('seMetering', [
                {
                    attribute: { ID: 0x2000, type: 0x29 },
                    minimumReportInterval: 1,
                    maximumReportInterval: constants.repInterval.MINUTES_5,
                    reportableChange: 1,
                },
            ], options);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=meazon.js.map