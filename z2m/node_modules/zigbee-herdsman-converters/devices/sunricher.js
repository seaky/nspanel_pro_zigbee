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
const logger_1 = require("../lib/logger");
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const globalStore = __importStar(require("../lib/store"));
const utils = __importStar(require("../lib/utils"));
const NS = 'zhc:sunricher';
const e = exposes.presets;
const ea = exposes.access;
const sunricherManufacturerCode = 0x1224;
function sunricherExternalSwitchType() {
    const attribute = 0x8803;
    const data_type = 0x20;
    const value_map = {
        0: 'push_button',
        1: 'normal_on_off',
        2: 'three_way',
    };
    const value_lookup = {
        push_button: 0,
        normal_on_off: 1,
        three_way: 2,
    };
    const fromZigbee = [
        {
            cluster: 'genBasic',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                if (Object.prototype.hasOwnProperty.call(msg.data, attribute)) {
                    const value = msg.data[attribute];
                    return {
                        external_switch_type: value_map[value] || 'unknown',
                        external_switch_type_numeric: value,
                    };
                }
                return undefined;
            },
        },
    ];
    const toZigbee = [
        {
            key: ['external_switch_type'],
            convertSet: async (entity, key, value, meta) => {
                const numericValue = value_lookup[value] ?? parseInt(value, 10);
                await entity.write('genBasic', { [attribute]: { value: numericValue, type: data_type } }, { manufacturerCode: sunricherManufacturerCode });
                return { state: { external_switch_type: value } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('genBasic', [attribute], { manufacturerCode: sunricherManufacturerCode });
            },
        },
    ];
    const exposes = [
        e.enum('external_switch_type', ea.ALL, ['push_button', 'normal_on_off', 'three_way']).withLabel('External switch type'),
    ];
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            const endpoint = device.getEndpoint(1);
            try {
                await endpoint.read('genBasic', [attribute], { manufacturerCode: sunricherManufacturerCode });
            }
            catch (error) {
                console.warn(`Failed to read external switch type attribute: ${error}`);
            }
        },
    ];
    return {
        fromZigbee,
        toZigbee,
        exposes,
        configure,
        isModernExtend: true,
    };
}
function sunricherMinimumPWM() {
    const attribute = 0x7809;
    const data_type = 0x20;
    const fromZigbee = [
        {
            cluster: 'genBasic',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                if (Object.prototype.hasOwnProperty.call(msg.data, attribute)) {
                    console.log(`from `, msg.data[attribute]);
                    const value = Math.round(msg.data[attribute] / 5.1);
                    return {
                        minimum_pwm: value,
                    };
                }
                return undefined;
            },
        },
    ];
    const toZigbee = [
        {
            key: ['minimum_pwm'],
            convertSet: async (entity, key, value, meta) => {
                console.log(`to `, value);
                const numValue = typeof value === 'string' ? parseInt(value) : value;
                const zgValue = Math.round(numValue * 5.1);
                await entity.write('genBasic', { [attribute]: { value: zgValue, type: data_type } }, { manufacturerCode: sunricherManufacturerCode });
                return { state: { minimum_pwm: numValue } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('genBasic', [attribute], { manufacturerCode: sunricherManufacturerCode });
            },
        },
    ];
    const exposes = [
        e
            .numeric('minimum_pwm', ea.ALL)
            .withLabel('Minimum PWM')
            .withDescription('Power off the device and wait for 3 seconds before reconnecting to apply the settings.')
            .withValueMin(0)
            .withValueMax(50)
            .withUnit('%')
            .withValueStep(1),
    ];
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            const endpoint = device.getEndpoint(1);
            try {
                await endpoint.read('genBasic', [attribute], { manufacturerCode: sunricherManufacturerCode });
            }
            catch (error) {
                console.warn(`Failed to read external switch type attribute: ${error}`);
            }
        },
    ];
    return {
        fromZigbee,
        toZigbee,
        exposes,
        configure,
        isModernExtend: true,
    };
}
const fzLocal = {
    sunricher_SRZGP2801K45C: {
        cluster: 'greenPower',
        type: ['commandNotification', 'commandCommissioningNotification'],
        convert: (model, msg, publish, options, meta) => {
            const commandID = msg.data.commandID;
            if (utils.hasAlreadyProcessedMessage(msg, model, msg.data.frameCounter, `${msg.device.ieeeAddr}_${commandID}`))
                return;
            if (commandID === 224)
                return;
            const lookup = {
                0x21: 'press_on',
                0x20: 'press_off',
                0x37: 'press_high',
                0x38: 'press_low',
                0x35: 'hold_high',
                0x36: 'hold_low',
                0x34: 'high_low_release',
                0x63: 'cw_ww_release',
                0x62: 'cw_dec_ww_inc',
                0x64: 'ww_inc_cw_dec',
                0x41: 'r_g_b',
                0x42: 'b_g_r',
                0x40: 'rgb_release',
            };
            return { action: utils.getFromLookup(commandID, lookup) };
        },
    },
    sunricher_SRZG9002KR12Pro: {
        cluster: 0xff03,
        type: ['raw'],
        convert: (model, msg, publish, options, meta) => {
            const bytes = [...msg.data];
            const messageType = bytes[3];
            let action = 'unknown';
            if (messageType === 0x01) {
                const pressTypeMask = bytes[6];
                const pressTypeLookup = {
                    0x01: 'short_press',
                    0x02: 'double_press',
                    0x03: 'hold',
                    0x04: 'hold_released',
                };
                action = pressTypeLookup[pressTypeMask] || 'unknown';
                const buttonMask = (bytes[4] << 8) | bytes[5];
                const specialButtonMap = {
                    9: 'knob',
                    11: 'k9',
                    12: 'k10',
                    15: 'k11',
                    16: 'k12',
                };
                const actionButtons = [];
                for (let i = 0; i < 16; i++) {
                    if ((buttonMask >> i) & 1) {
                        const button = i + 1;
                        actionButtons.push(specialButtonMap[button] ?? `k${button}`);
                    }
                }
                return { action, action_buttons: actionButtons };
            }
            else if (messageType === 0x03) {
                const directionMask = bytes[4];
                const actionSpeed = bytes[6];
                const directionMap = {
                    0x01: 'clockwise',
                    0x02: 'anti_clockwise',
                };
                const direction = directionMap[directionMask] || 'unknown';
                action = `${direction}_rotation`;
                return { action, action_speed: actionSpeed };
            }
            return { action };
        },
    },
    sunricher_SRZG2836D5Pro: {
        cluster: 0xff03,
        type: ['raw'],
        convert: (model, msg, publish, options, meta) => {
            const bytes = [...msg.data];
            const messageType = bytes[3];
            let action = 'unknown';
            if (messageType === 0x01) {
                const pressTypeMask = bytes[6];
                const pressTypeLookup = {
                    0x01: 'short_press',
                    0x02: 'double_press',
                    0x03: 'hold',
                    0x04: 'hold_released',
                };
                action = pressTypeLookup[pressTypeMask] || 'unknown';
                const buttonMask = bytes[5];
                const specialButtonLookup = {
                    0x01: 'top_left',
                    0x02: 'top_right',
                    0x03: 'bottom_left',
                    0x04: 'bottom_right',
                    0x05: 'center',
                };
                const actionButtons = [];
                for (let i = 0; i < 5; i++) {
                    if ((buttonMask >> i) & 1) {
                        const button = i + 1;
                        actionButtons.push(specialButtonLookup[button] || `unknown_${button}`);
                    }
                }
                return { action, action_buttons: actionButtons };
            }
            else if (messageType === 0x03) {
                const directionMask = bytes[4];
                const actionSpeed = bytes[6];
                const isStop = bytes[5] === 0x02;
                const directionMap = {
                    0x01: 'clockwise',
                    0x02: 'anti_clockwise',
                };
                const direction = isStop ? 'stop' : directionMap[directionMask] || 'unknown';
                action = `${direction}_rotation`;
                return { action, action_speed: actionSpeed };
            }
            return { action };
        },
    },
};
async function syncTime(endpoint) {
    try {
        const time = Math.round((new Date().getTime() - constants.OneJanuary2000) / 1000 + new Date().getTimezoneOffset() * -1 * 60);
        const values = { time: time };
        await endpoint.write('genTime', values);
    }
    catch {
        /* Do nothing*/
    }
}
const definitions = [
    {
        zigbeeModel: ['HK-ZRC-K5&RS-E'],
        model: 'SR-ZG2836D5-Pro',
        vendor: 'Sunricher',
        description: 'Zigbee smart remote',
        extend: [(0, modernExtend_1.battery)()],
        fromZigbee: [fzLocal.sunricher_SRZG2836D5Pro],
        exposes: [
            e.action(['short_press', 'double_press', 'hold', 'hold_released', 'clockwise_rotation', 'anti_clockwise_rotation', 'stop_rotation']),
        ],
    },
    {
        zigbeeModel: ['HK-ZRC-K12&RS-E'],
        model: 'SR-ZG9002KR12-Pro',
        vendor: 'Sunricher',
        description: 'Zigbee smart wall panel remote',
        extend: [(0, modernExtend_1.battery)()],
        fromZigbee: [fzLocal.sunricher_SRZG9002KR12Pro],
        exposes: [e.action(['short_press', 'double_press', 'hold', 'hold_released', 'clockwise_rotation', 'anti_clockwise_rotation'])],
    },
    {
        zigbeeModel: ['ZV9380A', 'ZG9380A'],
        model: 'SR-ZG9042MP',
        vendor: 'Sunricher',
        description: 'Zigbee three phase power meter',
        extend: [(0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['HK-SL-DIM-AU-K-A'],
        model: 'SR-ZG2835PAC-AU',
        vendor: 'Sunricher',
        description: 'Zigbee push button smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), sunricherExternalSwitchType(), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['HK-SL-DIM-CLN'],
        model: 'SR-ZG9101SAC-HP-CLN',
        vendor: 'Sunricher',
        description: 'Zigbee micro smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), sunricherExternalSwitchType(), sunricherMinimumPWM()],
    },
    {
        zigbeeModel: ['HK-SENSOR-CT-MINI'],
        model: 'SR-ZG9011A-DS',
        vendor: 'Sunricher',
        description: 'Door/window sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'battery_low'] })],
    },
    {
        zigbeeModel: ['ZG2858A'],
        model: 'ZG2858A',
        vendor: 'Sunricher',
        description: 'Zigbee handheld remote RGBCCT 3 channels',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3 } }),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.commandsOnOff)(),
            (0, modernExtend_1.commandsLevelCtrl)(),
            (0, modernExtend_1.commandsColorCtrl)(),
            (0, modernExtend_1.commandsScenes)(),
        ],
    },
    {
        zigbeeModel: ['HK-SL-DIM-US-A'],
        model: 'HK-SL-DIM-US-A',
        vendor: 'Sunricher',
        description: 'Keypad smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['HK-SENSOR-4IN1-A'],
        model: 'HK-SENSOR-4IN1-A',
        vendor: 'Sunricher',
        description: '4IN1 Sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.identify)(), (0, modernExtend_1.occupancy)(), (0, modernExtend_1.temperature)(), (0, modernExtend_1.humidity)(), (0, modernExtend_1.illuminance)()],
    },
    {
        zigbeeModel: ['SR-ZG9023A-EU'],
        model: 'SR-ZG9023A-EU',
        vendor: 'Sunricher',
        description: '4 ports switch with 2 usb ports (no metering)',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2, l3: 3, l4: 4, l5: 5 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2', 'l3', 'l4', 'l5'] })],
    },
    {
        zigbeeModel: ['ON/OFF(2CH)'],
        model: 'UP-SA-9127D',
        vendor: 'Sunricher',
        description: 'LED-Trading 2 channel AC switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { l1: 1, l2: 2 } }), (0, modernExtend_1.onOff)({ endpointNames: ['l1', 'l2'] })],
    },
    {
        fingerprint: [{ modelID: 'ON/OFF(2CH)', softwareBuildID: '2.9.2_r54' }],
        model: 'SR-ZG9101SAC-HP-SWITCH-2CH',
        vendor: 'Sunricher',
        description: 'Zigbee 2 channel switch',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior, fromZigbee_1.default.ignore_genOta],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior],
        exposes: [
            e.switch().withEndpoint('l1'),
            e.switch().withEndpoint('l2'),
            e.power(),
            e.current(),
            e.voltage(),
            e.energy(),
            e.power_on_behavior(['off', 'on', 'previous']),
        ],
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['power', 'energy', 'voltage', 'current'] },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint1 = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint1, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint1);
            await reporting.onOff(endpoint2);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint1);
            await reporting.activePower(endpoint1);
            await reporting.rmsCurrent(endpoint1, { min: 10, change: 10 });
            await reporting.rmsVoltage(endpoint1, { min: 10 });
            await reporting.readMeteringMultiplierDivisor(endpoint1);
            await reporting.currentSummDelivered(endpoint1);
        },
    },
    {
        zigbeeModel: ['HK-ZD-CCT-A'],
        model: 'HK-ZD-CCT-A',
        vendor: 'Sunricher',
        description: '50W Zigbee CCT LED driver (constant current)',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [160, 450] } })],
    },
    {
        zigbeeModel: ['ZGRC-KEY-004'],
        model: 'SR-ZG9001K2-DIM',
        vendor: 'Sunricher',
        description: 'Zigbee wall remote control for single color, 1 zone',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery(), e.action(['on', 'off', 'brightness_move_up', 'brightness_move_down', 'brightness_move_stop'])],
    },
    {
        zigbeeModel: ['ZGRC-KEY-007'],
        model: 'SR-ZG9001K2-DIM2',
        vendor: 'Sunricher',
        description: 'Zigbee 2 button wall switch',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'stop_1',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_stop_1',
                'on_2',
                'off_2',
                'stop_2',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_stop_2',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
    },
    {
        zigbeeModel: ['ZGRC-KEY-009'],
        model: '50208693',
        vendor: 'Sunricher',
        description: 'Zigbee wall remote control for RGBW, 1 zone with 2 scenes',
        fromZigbee: [
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_recall,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_move_to_color,
            fromZigbee_1.default.command_move_to_color_temp,
        ],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on',
                'off',
                'brightness_move_up',
                'brightness_move_down',
                'brightness_move_stop',
                'brightness_step_up',
                'brightness_step_down',
                'recall_1',
                'recall_2',
            ]),
        ],
    },
    {
        zigbeeModel: ['ZGRC-KEY-012'],
        model: 'SR-ZG9001K12-DIM-Z5',
        vendor: 'Sunricher',
        description: '5 zone remote and dimmer',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on_1',
                'off_1',
                'brightness_move_up_1',
                'brightness_move_down_1',
                'brightness_stop_1',
                'on_2',
                'off_2',
                'brightness_move_up_2',
                'brightness_move_down_2',
                'brightness_stop_2',
                'on_3',
                'off_3',
                'brightness_move_up_3',
                'brightness_move_down_3',
                'brightness_stop_3',
                'on_4',
                'off_4',
                'brightness_move_up_4',
                'brightness_move_down_4',
                'brightness_stop_4',
                'on_5',
                'off_5',
                'brightness_move_up_5',
                'brightness_move_down_5',
                'brightness_stop_5',
            ]),
        ],
        meta: { multiEndpoint: true, battery: { dontDividePercentage: true } },
        configure: async (device, coordinatorEndpoint) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(5), coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['ZGRC-KEY-013'],
        model: 'SR-ZG9001K12-DIM-Z4',
        vendor: 'Sunricher',
        description: '4 zone remote and dimmer',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_move,
            legacy.fz.ZGRC013_brightness_onoff,
            legacy.fz.ZGRC013_brightness,
            fromZigbee_1.default.command_stop,
            legacy.fz.ZGRC013_brightness_stop,
            fromZigbee_1.default.command_on,
            legacy.fz.ZGRC013_cmdOn,
            fromZigbee_1.default.command_off,
            legacy.fz.ZGRC013_cmdOff,
            fromZigbee_1.default.command_recall,
        ],
        exposes: [e.battery(), e.action(['brightness_move_up', 'brightness_move_down', 'brightness_stop', 'on', 'off', 'recall_*'])],
        toZigbee: [],
        whiteLabel: [{ vendor: 'RGB Genie', model: 'ZGRC-KEY-013' }],
        meta: { multiEndpoint: true, battery: { dontDividePercentage: true } },
        configure: async (device, coordinatorEndpoint) => {
            await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genOnOff', 'genScenes']);
            await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genOnOff']);
        },
    },
    {
        zigbeeModel: ['ZGRC-TEUR-005'],
        model: 'SR-ZG9001T4-DIM-EU',
        vendor: 'Sunricher',
        description: 'Zigbee wireless touch dimmer switch',
        fromZigbee: [fromZigbee_1.default.command_recall, fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_step, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        exposes: [
            e.action([
                'recall_*',
                'on',
                'off',
                'brightness_stop',
                'brightness_move_down',
                'brightness_move_up',
                'brightness_step_down',
                'brightness_step_up',
            ]),
        ],
        toZigbee: [],
    },
    {
        zigbeeModel: ['CCT Lighting'],
        model: 'ZG192910-4',
        vendor: 'Sunricher',
        description: 'Zigbee LED-controller',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['ZG9101SAC-HP'],
        model: 'ZG9101SAC-HP',
        vendor: 'Sunricher',
        description: 'ZigBee AC phase-cut dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['ON/OFF -M', 'ON/OFF', 'ZIGBEE-SWITCH'],
        model: 'ZG9101SAC-HP-Switch',
        vendor: 'Sunricher',
        description: 'Zigbee AC in wall switch',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false }), sunricherExternalSwitchType()],
    },
    {
        zigbeeModel: ['Micro Smart Dimmer', 'SM311', 'HK-SL-RDIM-A', 'HK-SL-DIM-EU-A'],
        model: 'ZG2835RAC',
        vendor: 'Sunricher',
        description: 'ZigBee knob smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)()],
        whiteLabel: [
            { vendor: 'YPHIX', model: '50208695' },
            { vendor: 'Samotech', model: 'SM311' },
        ],
    },
    {
        zigbeeModel: ['HK-SL-DIM-AU-R-A'],
        model: 'HK-SL-DIM-AU-R-A',
        vendor: 'Sunricher',
        description: 'ZigBee knob smart dimmer',
        extend: [(0, modernExtend_1.identify)(), (0, modernExtend_1.electricityMeter)(), (0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['ZG2835'],
        model: 'ZG2835',
        vendor: 'Sunricher',
        description: 'ZigBee knob smart dimmer',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.command_move_to_level],
        exposes: [e.action(['on', 'off', 'brightness_move_to_level'])],
        toZigbee: [],
    },
    {
        zigbeeModel: ['HK-SL-DIM-A'],
        model: 'SR-ZG9040A/ZG9041A-D',
        vendor: 'Sunricher',
        description: 'Zigbee micro smart dimmer',
        extend: [(0, modernExtend_1.light)({ configureReporting: true }), (0, modernExtend_1.electricityMeter)(), sunricherExternalSwitchType(), sunricherMinimumPWM()],
    },
    {
        zigbeeModel: ['HK-ZD-DIM-A'],
        model: 'SRP-ZG9105-CC',
        vendor: 'Sunricher',
        description: 'Constant Current Zigbee LED dimmable driver',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['HK-DIM'],
        model: '50208702',
        vendor: 'Sunricher',
        description: 'LED dimmable driver',
        extend: [(0, modernExtend_1.light)()],
        whiteLabel: [{ vendor: 'Yphix', model: '50208702' }],
    },
    {
        zigbeeModel: ['SR-ZG9040A-S'],
        model: 'SR-ZG9040A-S',
        vendor: 'Sunricher',
        description: 'ZigBee AC phase-cut dimmer single-line',
        extend: [(0, modernExtend_1.light)({ configureReporting: true })],
    },
    {
        zigbeeModel: ['Micro Smart OnOff', 'HK-SL-RELAY-A'],
        model: 'SR-ZG9100A-S',
        vendor: 'Sunricher',
        description: 'Zigbee AC in wall switch single-line',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['ZG2819S-CCT'],
        model: 'ZG2819S-CCT',
        vendor: 'Sunricher',
        description: 'Zigbee handheld remote CCT 4 channels',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_move_to_color,
            fromZigbee_1.default.command_move_to_color_temp,
            fromZigbee_1.default.command_move_hue,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_recall,
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_toggle,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_move,
            fromZigbee_1.default.command_color_loop_set,
            fromZigbee_1.default.command_ehanced_move_to_hue_and_saturation,
        ],
        exposes: [
            e.battery(),
            e.action([
                'color_move',
                'color_temperature_move',
                'hue_move',
                'brightness_step_up',
                'brightness_step_down',
                'recall_*',
                'on',
                'off',
                'toggle',
                'brightness_stop',
                'brightness_move_up',
                'brightness_move_down',
                'color_loop_set',
                'enhanced_move_to_hue_and_saturation',
                'hue_stop',
            ]),
        ],
        toZigbee: [],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return { ep1: 1, ep2: 2, ep3: 3, ep4: 4 };
        },
    },
    {
        zigbeeModel: ['HK-ZCC-A'],
        model: 'SR-ZG9080A',
        vendor: 'Sunricher',
        description: 'Curtain motor controller',
        meta: { coverInverted: true },
        fromZigbee: [fromZigbee_1.default.cover_position_tilt],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        exposes: [e.cover_position()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
        },
    },
    {
        fingerprint: [
            { modelID: 'GreenPower_2', ieeeAddr: /^0x00000000010.....$/ },
            { modelID: 'GreenPower_2', ieeeAddr: /^0x0000000001b.....$/ },
        ],
        model: 'SR-ZGP2801K2-DIM',
        vendor: 'Sunricher',
        description: 'Pushbutton transmitter module',
        fromZigbee: [fromZigbee_1.default.sunricher_switch2801K2],
        toZigbee: [],
        exposes: [e.action(['press_on', 'press_off', 'hold_on', 'hold_off', 'release'])],
    },
    {
        fingerprint: [
            { modelID: 'GreenPower_2', ieeeAddr: /^0x000000005d5.....$/ },
            { modelID: 'GreenPower_2', ieeeAddr: /^0x0000000057e.....$/ },
            { modelID: 'GreenPower_2', ieeeAddr: /^0x000000001fa.....$/ },
            { modelID: 'GreenPower_2', ieeeAddr: /^0x0000000034b.....$/ },
            { modelID: 'GreenPower_2', ieeeAddr: /^0x00000000f12.....$/ },
        ],
        model: 'SR-ZGP2801K4-DIM',
        vendor: 'Sunricher',
        description: 'Pushbutton transmitter module',
        fromZigbee: [fromZigbee_1.default.sunricher_switch2801K4],
        toZigbee: [],
        exposes: [e.action(['press_on', 'press_off', 'press_high', 'press_low', 'hold_high', 'hold_low', 'release'])],
    },
    {
        fingerprint: [{ modelID: 'GreenPower_2', ieeeAddr: /^0x00000000aaf.....$/ }],
        model: 'SR-ZGP2801K-5C',
        vendor: 'Sunricher',
        description: 'Pushbutton transmitter module',
        fromZigbee: [fzLocal.sunricher_SRZGP2801K45C],
        toZigbee: [],
        exposes: [
            e.action([
                'press_on',
                'press_off',
                'press_high',
                'press_low',
                'hold_high',
                'hold_low',
                'high_low_release',
                'cw_ww_release',
                'cw_dec_ww_inc',
                'ww_inc_cw_dec',
                'r_g_b',
                'b_g_r',
                'rgb_release',
            ]),
        ],
    },
    {
        zigbeeModel: ['ZG9092', 'HK-LN-HEATER-A'],
        model: 'SR-ZG9092A',
        vendor: 'Sunricher',
        description: 'Touch thermostat',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.namron_thermostat, fromZigbee_1.default.metering, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.namron_hvac_user_interface],
        toZigbee: [
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_unoccupied_heating_setpoint,
            toZigbee_1.default.thermostat_occupancy,
            toZigbee_1.default.thermostat_local_temperature_calibration,
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_outdoor_temperature,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.thermostat_control_sequence_of_operation,
            toZigbee_1.default.thermostat_running_state,
            toZigbee_1.default.namron_thermostat,
            toZigbee_1.default.namron_thermostat_child_lock,
        ],
        exposes: [
            e.numeric('outdoor_temperature', ea.STATE_GET).withUnit('°C').withDescription('Current temperature measured from the floor sensor'),
            e
                .climate()
                .withSetpoint('occupied_heating_setpoint', 0, 40, 0.1)
                .withSetpoint('unoccupied_heating_setpoint', 0, 40, 0.1)
                .withLocalTemperature()
                .withLocalTemperatureCalibration(-3, 3, 0.1)
                .withSystemMode(['off', 'auto', 'heat'])
                .withRunningState(['idle', 'heat']),
            e.binary('away_mode', ea.ALL, 'ON', 'OFF').withDescription('Enable/disable away mode'),
            e.binary('child_lock', ea.ALL, 'UNLOCK', 'LOCK').withDescription('Enables/disables physical input on the device'),
            e.power(),
            e.current(),
            e.voltage(),
            e.energy(),
            e.enum('lcd_brightness', ea.ALL, ['low', 'mid', 'high']).withDescription('OLED brightness when operating the buttons.  Default: Medium.'),
            e.enum('button_vibration_level', ea.ALL, ['off', 'low', 'high']).withDescription('Key beep volume and vibration level.  Default: Low.'),
            e
                .enum('floor_sensor_type', ea.ALL, ['10k', '15k', '50k', '100k', '12k'])
                .withDescription('Type of the external floor sensor.  Default: NTC 10K/25.'),
            e.enum('sensor', ea.ALL, ['air', 'floor', 'both']).withDescription('The sensor used for heat control.  Default: Room Sensor.'),
            e.enum('powerup_status', ea.ALL, ['default', 'last_status']).withDescription('The mode after a power reset.  Default: Previous Mode.'),
            e
                .numeric('floor_sensor_calibration', ea.ALL)
                .withUnit('°C')
                .withValueMin(-3)
                .withValueMax(3)
                .withValueStep(0.1)
                .withDescription('The tempearatue calibration for the external floor sensor, between -3 and 3 in 0.1°C.  Default: 0.'),
            e
                .numeric('dry_time', ea.ALL)
                .withUnit('min')
                .withValueMin(5)
                .withValueMax(100)
                .withDescription('The duration of Dry Mode, between 5 and 100 minutes.  Default: 5.'),
            e.enum('mode_after_dry', ea.ALL, ['off', 'manual', 'auto', 'away']).withDescription('The mode after Dry Mode.  Default: Auto.'),
            e.enum('temperature_display', ea.ALL, ['room', 'floor']).withDescription('The temperature on the display.  Default: Room Temperature.'),
            e
                .numeric('window_open_check', ea.ALL)
                .withUnit('°C')
                .withValueMin(0)
                .withValueMax(8)
                .withValueStep(0.5)
                .withDescription('The threshold to detect window open, between 0.0 and 8.0 in 0.5 °C.  Default: 0 (disabled).'),
            e
                .numeric('hysterersis', ea.ALL)
                .withUnit('°C')
                .withValueMin(0.5)
                .withValueMax(2)
                .withValueStep(0.1)
                .withDescription('Hysteresis setting, between 0.5 and 2 in 0.1 °C.  Default: 0.5.'),
            e.enum('display_auto_off_enabled', ea.ALL, ['disabled', 'enabled']),
            e
                .numeric('alarm_airtemp_overvalue', ea.ALL)
                .withUnit('°C')
                .withValueMin(20)
                .withValueMax(60)
                .withDescription('Room temperature alarm threshold, between 20 and 60 in °C.  0 means disabled.  Default: 45.'),
        ],
        onEvent: async (type, data, device, options) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'time'));
                globalStore.clearValue(device, 'time');
            }
            else if (!globalStore.hasValue(device, 'time')) {
                const endpoint = device.getEndpoint(1);
                const hours24 = 1000 * 60 * 60 * 24;
                // Device does not ask for the time with binding, therefore we write the time every 24 hours
                const interval = setInterval(async () => await syncTime(endpoint), hours24);
                globalStore.putValue(device, 'time', interval);
            }
        },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = [
                'genBasic',
                'genIdentify',
                'hvacThermostat',
                'seMetering',
                'haElectricalMeasurement',
                'genAlarms',
                'msOccupancySensing',
                'genTime',
                'hvacUserInterfaceCfg',
            ];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            // standard ZCL attributes
            await reporting.thermostatTemperature(endpoint);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatUnoccupiedHeatingSetpoint(endpoint);
            try {
                await reporting.thermostatKeypadLockMode(endpoint);
            }
            catch {
                // Fails for some
                // https://github.com/Koenkk/zigbee2mqtt/issues/15025
                logger_1.logger.debug(`Failed to setup keypadLockout reporting`, NS);
            }
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: 'occupancy',
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ]);
            await endpoint.read('haElectricalMeasurement', ['acVoltageMultiplier', 'acVoltageDivisor', 'acCurrentMultiplier']);
            await endpoint.read('haElectricalMeasurement', ['acCurrentDivisor']);
            await endpoint.read('seMetering', ['multiplier', 'divisor']);
            await reporting.activePower(endpoint, { min: 30, change: 10 }); // Min report change 10W
            await reporting.rmsCurrent(endpoint, { min: 30, change: 50 }); // Min report change 0.05A
            await reporting.rmsVoltage(endpoint, { min: 30, change: 20 }); // Min report change 2V
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
            // Custom attributes
            const options = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.SHENZHEN_SUNRICHER_TECHNOLOGY_LTD };
            // OperateDisplayLcdBrightnesss
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1000, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // ButtonVibrationLevel
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1001, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // FloorSensorType
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1002, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // ControlType
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1003, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // PowerUpStatus
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1004, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // FloorSensorCalibration
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1005, type: 0x28 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 0,
                },
            ], options);
            // DryTime
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1006, type: 0x20 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 0,
                },
            ], options);
            // ModeAfterDry
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1007, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // TemperatureDisplay
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1008, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // WindowOpenCheck
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x1009, type: 0x20 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 0,
                },
            ], options);
            // Hysterersis
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x100a, type: 0x20 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 0,
                },
            ], options);
            // DisplayAutoOffEnable
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x100b, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // AlarmAirTempOverValue
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x2001, type: 0x20 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: 0,
                },
            ], options);
            // Away Mode Set
            await endpoint.configureReporting('hvacThermostat', [
                {
                    attribute: { ID: 0x2002, type: 0x30 },
                    minimumReportInterval: 0,
                    maximumReportInterval: constants.repInterval.HOUR,
                    reportableChange: null,
                },
            ], options);
            // Device does not asks for the time with binding, we need to write time during configure
            await syncTime(endpoint);
            // Trigger initial read
            await endpoint.read('hvacThermostat', ['systemMode', 'runningState', 'occupiedHeatingSetpoint']);
            await endpoint.read('hvacThermostat', [0x1000, 0x1001, 0x1002, 0x1003], options);
            await endpoint.read('hvacThermostat', [0x1004, 0x1005, 0x1006, 0x1007], options);
            await endpoint.read('hvacThermostat', [0x1008, 0x1009, 0x100a, 0x100b], options);
            await endpoint.read('hvacThermostat', [0x2001, 0x2002], options);
        },
    },
    {
        fingerprint: [
            { modelID: 'TERNCY-DC01', manufacturerName: 'Sunricher' },
            { modelID: 'HK-SENSOR-CT-A', manufacturerName: 'Sunricher' },
        ],
        model: 'SR-ZG9010A',
        vendor: 'Sunricher',
        description: 'Door windows sensor',
        fromZigbee: [fromZigbee_1.default.U02I007C01_contact, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.contact(), e.battery()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=sunricher.js.map