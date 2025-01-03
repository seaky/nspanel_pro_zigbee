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
const fzLocal = {
    nimly_pro_lock_actions: {
        cluster: 'closuresDoorLock',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            const attributes = {};
            // Handle attribute 257
            if (msg.data['257'] !== undefined) {
                const buffer = Buffer.from(msg.data['257']);
                let pincode = '';
                for (const byte of buffer) {
                    pincode += byte.toString(16);
                }
                attributes.last_used_pin_code = pincode;
            }
            // Handle attribute 256
            if (msg.data['256'] !== undefined) {
                const hex = msg.data['256'].toString(16).padStart(8, '0');
                const firstOctet = String(hex.substring(0, 2));
                const lookup = {
                    '00': 'zigbee',
                    '02': 'keypad',
                    '03': 'fingerprintsensor',
                    '04': 'rfid',
                    '0a': 'self',
                };
                result.last_action_source = lookup[firstOctet] || 'unknown';
                const secondOctet = hex.substring(2, 4);
                const thirdOctet = hex.substring(4, 8);
                result.last_action_user = parseInt(thirdOctet, 16);
                if (secondOctet == '01') {
                    attributes.last_lock_user = result.last_action_user;
                    attributes.last_lock_source = result.last_action_source;
                }
                else if (secondOctet == '02') {
                    attributes.last_unlock_user = result.last_action_user;
                    attributes.last_unlock_source = result.last_action_source;
                }
            }
            // Return result if not empty
            if (Object.keys(attributes).length > 0) {
                return attributes;
            }
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['easyCodeTouch_v1', 'EasyCodeTouch', 'EasyFingerTouch'],
        model: 'easyCodeTouch_v1',
        vendor: 'Onesti Products AS',
        description: 'Zigbee module for EasyAccess code touch series',
        fromZigbee: [
            fzLocal.nimly_pro_lock_actions,
            fromZigbee_1.default.lock,
            fromZigbee_1.default.lock_operation_event,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.lock_programming_event,
            fromZigbee_1.default.easycodetouch_action,
        ],
        toZigbee: [toZigbee_1.default.lock, toZigbee_1.default.easycode_auto_relock, toZigbee_1.default.lock_sound_volume, toZigbee_1.default.pincode_lock],
        meta: { pinCodeCount: 1000 },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(11);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresDoorLock', 'genPowerCfg']);
            await reporting.lockState(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            await endpoint.read('closuresDoorLock', ['lockState', 'soundVolume']);
            device.powerSource = 'Battery';
            device.save();
        },
        exposes: [
            e.lock(),
            e.battery(),
            e.sound_volume(),
            e
                .enum('last_unlock_source', ea.STATE, ['zigbee', 'keypad', 'fingerprintsensor', 'rfid', 'self', 'unknown'])
                .withDescription('Last unlock source'),
            e.text('last_unlock_user', ea.STATE).withDescription('Last unlock user').withDescription('Last unlock user'),
            e
                .enum('last_lock_source', ea.STATE, ['zigbee', 'keypad', 'fingerprintsensor', 'rfid', 'self', 'unknown'])
                .withDescription('Last lock source'),
            e.text('last_lock_user', ea.STATE).withDescription('Last lock user'),
            e.text('last_used_pin_code', ea.STATE).withDescription('Last used pin code'),
            e.binary('auto_relock', ea.STATE_SET, true, false).withDescription('Auto relock after 7 seconds.'),
            e.pincode(),
        ],
    },
    {
        zigbeeModel: ['NimlyPRO', 'NimlyCode', 'NimlyTouch', 'NimlyIn'],
        model: 'Nimly',
        vendor: 'Onesti Products AS',
        description: 'Zigbee module for Nimly Doorlock series',
        fromZigbee: [
            fzLocal.nimly_pro_lock_actions,
            fromZigbee_1.default.lock,
            fromZigbee_1.default.lock_operation_event,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.lock_programming_event,
            fromZigbee_1.default.easycodetouch_action,
        ],
        toZigbee: [toZigbee_1.default.lock, toZigbee_1.default.easycode_auto_relock, toZigbee_1.default.lock_sound_volume, toZigbee_1.default.pincode_lock],
        meta: { pinCodeCount: 1000, battery: { dontDividePercentage: true } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(11);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresDoorLock', 'genPowerCfg']);
            await reporting.lockState(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            await endpoint.read('closuresDoorLock', ['lockState', 'soundVolume']);
            device.powerSource = 'Battery';
            device.save();
        },
        exposes: [
            e.lock(),
            e.battery(),
            e.sound_volume(),
            e
                .enum('last_unlock_source', ea.STATE, ['zigbee', 'keypad', 'fingerprintsensor', 'rfid', 'self', 'unknown'])
                .withDescription('Last unlock source'),
            e.text('last_unlock_user', ea.STATE).withDescription('Last unlock user').withDescription('Last unlock user'),
            e
                .enum('last_lock_source', ea.STATE, ['zigbee', 'keypad', 'fingerprintsensor', 'rfid', 'self', 'unknown'])
                .withDescription('Last lock source'),
            e.text('last_lock_user', ea.STATE).withDescription('Last lock user'),
            e.text('last_used_pin_code', ea.STATE).withDescription('Last used pin code'),
            e.binary('auto_relock', ea.STATE_SET, true, false).withDescription('Auto relock after 7 seconds.'),
            e.pincode(),
        ],
    },
    {
        zigbeeModel: ['S4RX-110'],
        model: 'S4RX-110',
        vendor: 'Onesti Products AS',
        description: 'Relax smart plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.device_temperature, fromZigbee_1.default.identify],
        toZigbee: [toZigbee_1.default.on_off],
        exposes: [e.switch(), e.power(), e.current(), e.voltage(), e.energy(), e.device_temperature()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, [
                'genIdentify',
                'genOnOff',
                'genDeviceTempCfg',
                'haElectricalMeasurement',
                'seMetering',
            ]);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.activePower(endpoint);
            await reporting.rmsCurrent(endpoint);
            await reporting.rmsVoltage(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
            await reporting.deviceTemperature(endpoint);
        },
        endpoint: (device) => {
            return { default: 2 };
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=onesti.js.map