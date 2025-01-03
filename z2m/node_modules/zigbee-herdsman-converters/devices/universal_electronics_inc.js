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
const globalStore = __importStar(require("../lib/store"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['URC4470BC0-X-R'],
        model: 'XHS1-UE',
        vendor: 'Universal Electronics Inc',
        description: 'Wireless digital pet resistant PIR detector',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['URC4460BC0-X-R'],
        model: 'XHS2-UE',
        vendor: 'Universal Electronics Inc',
        description: 'Magnetic door & window contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.temperature, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['msTemperatureMeasurement', 'genPowerCfg']);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.temperature(), e.battery()],
    },
    {
        zigbeeModel: ['URC4450BC0-X-R'],
        model: 'XHK1-UE',
        vendor: 'Universal Electronics Inc',
        description: 'Xfinity security keypad',
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        fromZigbee: [
            fromZigbee_1.default.command_arm_with_transaction,
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ias_occupancy_alarm_1,
            fromZigbee_1.default.identify,
            fromZigbee_1.default.ias_contact_alarm_1,
            fromZigbee_1.default.ias_ace_occupancy_with_timeout,
        ],
        toZigbee: [toZigbee_1.default.arm_mode],
        exposes: [
            e.battery(),
            e.battery_voltage(),
            e.occupancy(),
            e.battery_low(),
            e.tamper(),
            e.presence(),
            e.contact(),
            e.temperature(),
            e.numeric('action_code', ea.STATE).withDescription('Pin code introduced.'),
            e.numeric('action_transaction', ea.STATE).withDescription('Last action transaction number.'),
            e.text('action_zone', ea.STATE).withDescription('Alarm zone. Default value 0'),
            e.action(['disarm', 'arm_day_zones', 'identify', 'arm_night_zones', 'arm_all_zones', 'exit_delay', 'emergency']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const clusters = ['msTemperatureMeasurement', 'genPowerCfg', 'ssIasZone', 'ssIasAce', 'genBasic', 'genIdentify'];
            await reporting.bind(endpoint, coordinatorEndpoint, clusters);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        onEvent: async (type, data, device) => {
            if (type === 'message' &&
                data.type === 'commandGetPanelStatus' &&
                data.cluster === 'ssIasAce' &&
                globalStore.hasValue(device.getEndpoint(1), 'panelStatus')) {
                const payload = {
                    panelstatus: globalStore.getValue(device.getEndpoint(1), 'panelStatus'),
                    secondsremain: 0x00,
                    audiblenotif: 0x00,
                    alarmstatus: 0x00,
                };
                await device.getEndpoint(1).commandResponse('ssIasAce', 'getPanelStatusRsp', payload, {}, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
    {
        zigbeeModel: ['H34450BA00-00007'],
        model: 'UEHK2AZ0',
        vendor: 'Universal Electronics Inc',
        description: 'Xfinity security keypad',
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        fromZigbee: [
            fromZigbee_1.default.command_arm_with_transaction,
            fromZigbee_1.default.temperature,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.ias_occupancy_alarm_1,
            fromZigbee_1.default.identify,
            fromZigbee_1.default.ias_contact_alarm_1,
            fromZigbee_1.default.ias_ace_occupancy_with_timeout,
        ],
        toZigbee: [toZigbee_1.default.arm_mode],
        exposes: [
            e.battery(),
            e.battery_voltage(),
            e.occupancy(),
            e.battery_low(),
            e.tamper(),
            e.presence(),
            e.contact(),
            e.temperature(),
            e.numeric('action_code', ea.STATE).withDescription('Pin code introduced.'),
            e.numeric('action_transaction', ea.STATE).withDescription('Last action transaction number.'),
            e.text('action_zone', ea.STATE).withDescription('Alarm zone. Default value 0'),
            e.action(['disarm', 'arm_day_zones', 'identify', 'arm_night_zones', 'arm_all_zones', 'exit_delay', 'emergency']),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const clusters = ['msTemperatureMeasurement', 'genPowerCfg', 'ssIasZone', 'ssIasAce', 'genBasic', 'genIdentify'];
            await reporting.bind(endpoint, coordinatorEndpoint, clusters);
            await reporting.temperature(endpoint);
            await reporting.batteryVoltage(endpoint);
        },
        onEvent: async (type, data, device) => {
            if (type === 'message' &&
                data.type === 'commandGetPanelStatus' &&
                data.cluster === 'ssIasAce' &&
                globalStore.hasValue(device.getEndpoint(1), 'panelStatus')) {
                const payload = {
                    panelstatus: globalStore.getValue(device.getEndpoint(1), 'panelStatus'),
                    secondsremain: 0x00,
                    audiblenotif: 0x00,
                    alarmstatus: 0x00,
                };
                await device.getEndpoint(1).commandResponse('ssIasAce', 'getPanelStatusRsp', payload, {}, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=universal_electronics_inc.js.map