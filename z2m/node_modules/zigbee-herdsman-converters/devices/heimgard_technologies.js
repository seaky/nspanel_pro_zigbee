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
const definitions = [
    {
        zigbeeModel: ['HC-SLM-1'],
        model: 'HC-SLM-1',
        vendor: 'Heimgard Technologies',
        description: 'Wattle door lock pro',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.lock_operation_event,
            fromZigbee_1.default.lock_programming_event,
            fromZigbee_1.default.lock,
            fromZigbee_1.default.lock_pin_code_response,
            fromZigbee_1.default.lock_user_status_response,
        ],
        toZigbee: [toZigbee_1.default.identify, toZigbee_1.default.lock, toZigbee_1.default.lock_sound_volume, toZigbee_1.default.lock_auto_relock_time, toZigbee_1.default.pincode_lock, toZigbee_1.default.lock_userstatus],
        meta: { pinCodeCount: 39 },
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresDoorLock', 'genPowerCfg']);
            await reporting.lockState(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            await endpoint.read('closuresDoorLock', ['lockState', 'soundVolume']);
        },
        exposes: [
            e.lock(),
            e.battery(),
            e.sound_volume(),
            e.auto_relock_time().withValueMin(0).withValueMax(3600),
            e.lock_action_user(),
            e.lock_action_source_name(),
            e.pincode(),
        ],
    },
    {
        zigbeeModel: ['HT-SLM-2'],
        model: 'HT-SLM-2',
        vendor: 'Heimgard Technologies',
        description: 'Doorlock with fingerprint',
        fromZigbee: [fromZigbee_1.default.lock, fromZigbee_1.default.battery, fromZigbee_1.default.lock_pin_code_response, fromZigbee_1.default.lock_user_status_response],
        toZigbee: [toZigbee_1.default.lock, toZigbee_1.default.lock_sound_volume, toZigbee_1.default.identify, toZigbee_1.default.pincode_lock, toZigbee_1.default.lock_userstatus],
        meta: { pinCodeCount: 39 },
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresDoorLock', 'genPowerCfg']);
            await reporting.lockState(endpoint);
            await reporting.batteryPercentageRemaining(endpoint);
            await endpoint.read('closuresDoorLock', ['lockState', 'soundVolume']);
        },
        exposes: [e.lock(), e.pincode(), e.battery(), e.sound_volume()],
    },
    {
        zigbeeModel: ['HC-IWDIM-1'],
        model: 'HC-IWDIM-1',
        vendor: 'Heimgard Technologies',
        description: 'Dimmer',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.brightness, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.light_brightness_move, toZigbee_1.default.light_onoff_brightness],
        ota: ota.zigbeeOTA,
        exposes: [e.light_brightness(), e.power(), e.current(), e.voltage(), e.energy()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl', 'haElectricalMeasurement', 'seMetering']);
            await reporting.rmsVoltage(endpoint, { change: 2 });
            await reporting.rmsCurrent(endpoint, { change: 5 });
            await reporting.activePower(endpoint, { change: 2 });
            await reporting.currentSummDelivered(endpoint, { change: 2 });
            await reporting.onOff(endpoint);
            await endpoint.read('haElectricalMeasurement', ['acVoltageMultiplier', 'acVoltageDivisor']);
            await endpoint.read('haElectricalMeasurement', ['acCurrentMultiplier', 'acCurrentDivisor']);
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await endpoint.read('seMetering', ['unitOfMeasure', 'multiplier', 'divisor']);
            device.save();
        },
    },
    {
        zigbeeModel: ['HT-MOT-2'],
        model: 'HT-MOT-2',
        vendor: 'Heimgard Technologies',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.ias_occupancy_alarm_1_report, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.identify],
        exposes: [e.battery(), e.tamper(), e.occupancy()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
    },
    {
        zigbeeModel: ['HC-IWSWI-1'],
        model: 'HC-IWSWI-1',
        vendor: 'Heimgard Technologies',
        description: 'In wall light switch',
        fromZigbee: [fromZigbee_1.default.on_off],
        toZigbee: [toZigbee_1.default.identify, toZigbee_1.default.on_off],
        exposes: [e.switch()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint);
        },
    },
    {
        zigbeeModel: ['HT-SMO-2'],
        model: 'HT-SMO-2',
        vendor: 'Heimgard Technologies',
        description: 'Smoke detector',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.smoke(), e.battery_low(), e.battery()],
    },
    {
        zigbeeModel: ['HT-DWM-2'],
        model: 'HT-DWM-2',
        vendor: 'Heimgard Technologies',
        description: 'Door sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['HT-INS-2'],
        model: 'HT-INS-2',
        vendor: 'Heimgard Technologies',
        description: 'Indoor siren',
        toZigbee: [toZigbee_1.default.warning],
        meta: { disableDefaultResponse: true },
        extend: [(0, modernExtend_1.battery)()],
        exposes: [e.warning()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=heimgard_technologies.js.map