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
const ea = exposes.access;
const e = exposes.presets;
const fzLocal = {
    DTB2011014: {
        cluster: 'genOnOff',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            return {
                key_1: msg.data['41361'] === 1 ? 'ON' : 'OFF',
                key_2: msg.data['41362'] === 1 ? 'ON' : 'OFF',
                key_3: msg.data['41363'] === 1 ? 'ON' : 'OFF',
                key_4: msg.data['41364'] === 1 ? 'ON' : 'OFF',
            };
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['DTB190502A1'],
        model: 'DTB190502A1',
        vendor: 'databyte.ch',
        description: 'CC2530 based IO Board',
        fromZigbee: [fromZigbee_1.default.DTB190502A1],
        toZigbee: [toZigbee_1.default.DTB190502A1_LED],
        exposes: [e.binary('led_state', ea.STATE, 'ON', 'OFF'), e.enum('key_state', ea.STATE, ['KEY_SYS', 'KEY_UP', 'KEY_DOWN', 'KEY_NONE'])],
    },
    {
        zigbeeModel: ['DTB-ED2004-012'],
        model: 'ED2004-012',
        vendor: 'databyte.ch',
        description: 'Panda 1 - wall switch',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['DTB-ED2011-014'],
        model: 'Touch4',
        vendor: 'databyte.ch',
        description: 'Wall touchsensor with 4 keys',
        fromZigbee: [fzLocal.DTB2011014, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.linkquality(),
            e.binary('key_1', ea.STATE, 'ON', 'OFF'),
            e.binary('key_2', ea.STATE, 'ON', 'OFF'),
            e.binary('key_3', ea.STATE, 'ON', 'OFF'),
            e.binary('key_4', ea.STATE, 'ON', 'OFF'),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=databyte.js.map