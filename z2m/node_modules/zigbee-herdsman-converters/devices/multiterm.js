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
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const endpoints = {
    silent_mode: 8,
    heating_cooling: 9,
    electric_valve: 10,
};
const states = {
    silent_mode: ['inactive', 'active'],
    heating_cooling: ['heating', 'cooling'],
    electric_valve: ['off', 'on'],
};
const fzLocal = {
    binary_output: {
        cluster: 'genBinaryOutput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            return { state: msg.data.presentValue == 1 ? msg.data.activeText : msg.data.inactiveText };
        },
    },
};
const tzLocal = {
    fan_mode: {
        ...toZigbee_1.default.fan_mode,
        convertSet: async (entity, key, value, meta) => {
            if (String(value).toLowerCase() === 'on')
                value = 'high';
            return await toZigbee_1.default.fan_mode.convertSet(entity, key, value, meta);
        },
    },
    binary_output: {
        key: Object.keys(endpoints),
        convertSet: async (entity, key, value, meta) => {
            const ep = meta.device.getEndpoint(utils.getFromLookup(key, endpoints));
            const currentStates = utils.getFromLookup(key, states);
            const newState = currentStates.indexOf(String(value));
            const payload = { 0x0055: { value: newState, type: 0x10 } };
            await ep.write('genBinaryOutput', payload);
            const state = { state: {} };
            const normalizedKey = key.replace('/', '_').replace(' ', '_').toLowerCase();
            state.state = { [normalizedKey]: value };
            return state;
        },
        convertGet: async (entity, key, meta) => {
            const ep = meta.device.getEndpoint(utils.getFromLookup(key, endpoints));
            await ep.read('genBinaryOutput', ['presentValue', 'activeText', 'inactiveText', 'description']);
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['ZC0101'],
        model: 'ZC0101',
        vendor: 'MultiTerm',
        description: 'ZeeFan fan coil unit controller',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { '8': 8, '9': 9, '10': 10 } })],
        meta: { multiEndpoint: true },
        fromZigbee: [fromZigbee_1.default.fan, fzLocal.binary_output],
        toZigbee: [tzLocal.fan_mode, tzLocal.binary_output],
        exposes: [
            e.fan().withModes(['off', 'low', 'medium', 'high', 'on']).withLabel('Fan Control'),
            e.enum('silent_mode', ea.ALL, states.silent_mode).withLabel('Silent mode').withCategory('config'),
            e.enum('heating_cooling', ea.ALL, states.heating_cooling).withLabel('Heating/Cooling').withCategory('config'),
            e.enum('electric_valve', ea.ALL, states.electric_valve).withLabel('Electric Valve').withCategory('config'),
        ],
        configure: async (device, coordinatorEndpoint, logger) => {
            const fanEp = device.getEndpoint(endpoints.silent_mode);
            const hcEp = device.getEndpoint(endpoints.heating_cooling);
            const evEp = device.getEndpoint(endpoints.electric_valve);
            await reporting.bind(fanEp, coordinatorEndpoint, ['genBinaryOutput']);
            await reporting.bind(fanEp, coordinatorEndpoint, ['hvacFanCtrl']);
            await reporting.bind(hcEp, coordinatorEndpoint, ['genBinaryOutput']);
            await reporting.bind(evEp, coordinatorEndpoint, ['genBinaryOutput']);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=multiterm.js.map