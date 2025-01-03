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
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const local = {
    fz: {
        switch_operation_mode: {
            cluster: 'manuSpecificNiko1',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.switchOperationMode !== undefined) {
                    const operationModeMap = { 0x02: 'control_relay', 0x01: 'decoupled', 0x00: 'unknown' };
                    state['operation_mode'] = utils.getFromLookup(msg.data.switchOperationMode, operationModeMap);
                }
                return state;
            },
        },
        switch_action: {
            cluster: 'manuSpecificNiko2',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.switchAction !== undefined) {
                    // NOTE: a single press = two separate values reported, 16 followed by 64
                    //       a hold/release cycle = three separate values, 16, 32, and 48
                    const actionMap = model.model == '552-721X1'
                        ? {
                            16: null,
                            64: 'single',
                            32: 'hold',
                            48: 'release',
                            256: null,
                            1024: 'single_ext',
                            512: 'hold_ext',
                            768: 'release_ext',
                        }
                        : {
                            16: null,
                            64: 'single_left',
                            32: 'hold_left',
                            48: 'release_left',
                            256: null,
                            1024: 'single_left_ext',
                            512: 'hold_left_ext',
                            768: 'release_left_ext',
                            4096: null,
                            16384: 'single_right',
                            8192: 'hold_right',
                            12288: 'release_right',
                            65536: null,
                            262144: 'single_right_ext',
                            131072: 'hold_right_ext',
                            196608: 'release_right_ext',
                        };
                    state['action'] = actionMap[msg.data.switchAction];
                }
                return state;
            },
        },
        switch_status_led: {
            cluster: 'manuSpecificNiko1',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.outletLedState !== undefined) {
                    state['led_enable'] = msg.data['outletLedState'] == 1;
                }
                if (msg.data.outletLedColor !== undefined) {
                    state['led_state'] = msg.data['outletLedColor'] == 255 ? 'ON' : 'OFF';
                }
                return state;
            },
        },
        outlet: {
            cluster: 'manuSpecificNiko1',
            type: ['attributeReport', 'readResponse'],
            convert: (model, msg, publish, options, meta) => {
                const state = {};
                if (msg.data.outletChildLock !== undefined) {
                    state['child_lock'] = msg.data['outletChildLock'] == 0 ? 'LOCK' : 'UNLOCK';
                }
                if (msg.data.outletLedState !== undefined) {
                    state['led_enable'] = msg.data['outletLedState'] == 1;
                }
                return state;
            },
        },
    },
    tz: {
        switch_operation_mode: {
            key: ['operation_mode'],
            convertSet: async (entity, key, value, meta) => {
                // WARN: while we can technically write 0x00 to the operationMode attribute
                //       this seems to brick the device and it will need to be rejoined
                utils.assertEndpoint(entity);
                const operationModeLookup = { control_relay: 0x02, decoupled: 0x01 };
                // @ts-expect-error ignore
                if (operationModeLookup[value] === undefined) {
                    throw new Error(`operation_mode was called with an invalid value (${value})`);
                }
                else {
                    await utils.enforceEndpoint(entity, key, meta).write('manuSpecificNiko1', 
                    // @ts-expect-error ignore
                    { switchOperationMode: operationModeLookup[value] });
                    // @ts-expect-error ignore
                    return { state: { operation_mode: value.toLowerCase() } };
                }
            },
            convertGet: async (entity, key, meta) => {
                utils.assertEndpoint(entity);
                await utils.enforceEndpoint(entity, key, meta).read('manuSpecificNiko1', ['switchOperationMode']);
            },
        },
        switch_led_enable: {
            key: ['led_enable'],
            convertSet: async (entity, key, value, meta) => {
                await entity.write('manuSpecificNiko1', { outletLedState: value ? 1 : 0 });
                await entity.read('manuSpecificNiko1', ['outletLedColor']);
                return { state: { led_enable: value ? true : false } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificNiko1', ['outletLedState']);
            },
        },
        switch_led_state: {
            key: ['led_state'],
            convertSet: async (entity, key, value, meta) => {
                utils.assertString(value, key);
                await entity.write('manuSpecificNiko1', { outletLedColor: value.toLowerCase() === 'off' ? 0 : 255 });
                return { state: { led_state: value.toLowerCase() === 'off' ? 'OFF' : 'ON' } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificNiko1', ['outletLedColor']);
            },
        },
        outlet_child_lock: {
            key: ['child_lock'],
            convertSet: async (entity, key, value, meta) => {
                utils.assertString(value, key);
                await entity.write('manuSpecificNiko1', { outletChildLock: value.toLowerCase() === 'lock' ? 0 : 1 });
                return { state: { child_lock: value.toLowerCase() === 'lock' ? 'LOCK' : 'UNLOCK' } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificNiko1', ['outletChildLock']);
            },
        },
        outlet_led_enable: {
            key: ['led_enable'],
            convertSet: async (entity, key, value, meta) => {
                await entity.write('manuSpecificNiko1', { outletLedState: value ? 1 : 0 });
                return { state: { led_enable: value ? true : false } };
            },
            convertGet: async (entity, key, meta) => {
                await entity.read('manuSpecificNiko1', ['outletLedState']);
            },
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['Connected socket outlet'],
        model: '170-33505/170-34605',
        vendor: 'Niko',
        description: 'Connected socket outlet',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, local.fz.outlet],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.electrical_measurement_power, toZigbee_1.default.currentsummdelivered, local.tz.outlet_child_lock, local.tz.outlet_led_enable],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            // NOTE: we read them individually, acFrequency* is not supported
            //       so we cannot use readEletricalMeasurementMultiplierDivisors
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.activePower(endpoint, { min: 5, max: 3600, change: 1000 });
            await endpoint.read('haElectricalMeasurement', ['acCurrentDivisor', 'acPowerMultiplier', 'acPowerDivisor']);
            await reporting.rmsCurrent(endpoint, { min: 5, max: 3600, change: 100 });
            await endpoint.read('haElectricalMeasurement', ['acVoltageMultiplier', 'acVoltageDivisor', 'acCurrentMultiplier']);
            await reporting.rmsVoltage(endpoint, { min: 5, max: 3600, change: 100 });
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint, { min: 60, change: 1 });
            await endpoint.read('manuSpecificNiko1', ['outletChildLock']);
            await endpoint.read('manuSpecificNiko1', ['outletLedState']);
        },
        exposes: [
            e.switch(),
            e.power().withAccess(ea.STATE_GET),
            e.current(),
            e.voltage(),
            e.energy().withAccess(ea.STATE_GET),
            e.binary('child_lock', ea.ALL, 'LOCK', 'UNLOCK').withDescription('Enables/disables physical input on the device'),
            e.binary('led_enable', ea.ALL, true, false).withDescription('Enable LED'),
        ],
    },
    {
        zigbeeModel: ['Smart plug Zigbee SE'],
        model: '552-80698',
        vendor: 'Niko',
        description: 'Smart plug with side earthing pin',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior, toZigbee_1.default.electrical_measurement_power, toZigbee_1.default.currentsummdelivered],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            // only activePower seems to be support, although compliance document states otherwise
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.activePower(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint, { min: 60, change: 1 });
        },
        exposes: [
            e.switch(),
            e.power().withAccess(ea.STATE_GET),
            e.energy().withAccess(ea.STATE_GET),
            e.enum('power_on_behavior', ea.ALL, ['off', 'previous', 'on']).withDescription('Controls the behaviour when the device is powered on'),
        ],
    },
    {
        zigbeeModel: ['Smart plug Zigbee PE'],
        model: '552-80699',
        vendor: 'Niko',
        description: 'Smart plug with earthing pin',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior, toZigbee_1.default.electrical_measurement_power, toZigbee_1.default.currentsummdelivered],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            // only activePower seems to be support, although compliance document states otherwise
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.activePower(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint, { min: 60, change: 1 });
        },
        exposes: [
            e.switch(),
            e.power().withAccess(ea.STATE_GET),
            e.energy().withAccess(ea.STATE_GET),
            e.enum('power_on_behavior', ea.ALL, ['off', 'previous', 'on']).withDescription('Controls the behaviour when the device is powered on'),
        ],
    },
    {
        zigbeeModel: ['Connectable motion sensor,Zigbee'],
        model: '552-80401',
        vendor: 'Niko',
        description: 'Wireless motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const bindClusters = ['genPowerCfg'];
            await reporting.bind(endpoint, coordinatorEndpoint, bindClusters);
            await reporting.batteryVoltage(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.battery()],
    },
    {
        zigbeeModel: ['Single connectable switch,10A'],
        model: '552-721X1',
        vendor: 'Niko',
        description: 'Single connectable switch',
        fromZigbee: [fromZigbee_1.default.on_off, local.fz.switch_operation_mode, local.fz.switch_action, local.fz.switch_status_led],
        toZigbee: [toZigbee_1.default.on_off, local.tz.switch_operation_mode, local.tz.switch_led_enable, local.tz.switch_led_state],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(endpoint);
            await endpoint.read('manuSpecificNiko1', ['switchOperationMode', 'outletLedState', 'outletLedColor']);
        },
        exposes: [
            e.switch(),
            e.action(['single', 'hold', 'release', 'single_ext', 'hold_ext', 'release_ext']),
            e.enum('operation_mode', ea.ALL, ['control_relay', 'decoupled']),
            e.binary('led_enable', ea.ALL, true, false).withDescription('Enable LED'),
            e.binary('led_state', ea.ALL, 'ON', 'OFF').withDescription('LED State'),
        ],
    },
    {
        zigbeeModel: ['Double connectable switch,10A'],
        model: '552-721X2',
        vendor: 'Niko',
        description: 'Double connectable switch',
        fromZigbee: [fromZigbee_1.default.on_off, local.fz.switch_operation_mode, local.fz.switch_action, local.fz.switch_status_led],
        toZigbee: [toZigbee_1.default.on_off, local.tz.switch_operation_mode, local.tz.switch_led_enable, local.tz.switch_led_state],
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        meta: { multiEndpointEnforce: { operation_mode: 1 }, multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            const ep1 = device.getEndpoint(1);
            const ep2 = device.getEndpoint(2);
            await reporting.bind(ep1, coordinatorEndpoint, ['genOnOff']);
            await reporting.bind(ep2, coordinatorEndpoint, ['genOnOff']);
            await reporting.onOff(ep1);
            await reporting.onOff(ep2);
            await ep1.read('manuSpecificNiko1', ['switchOperationMode', 'outletLedState', 'outletLedColor']);
            await ep2.read('manuSpecificNiko1', ['switchOperationMode', 'outletLedState', 'outletLedColor']);
        },
        exposes: [
            e.switch().withEndpoint('l1'),
            e.switch().withEndpoint('l2'),
            e.action([
                'single_left',
                'hold_left',
                'release_left',
                'single_left_ext',
                'hold_left_ext',
                'release_left_ext',
                'single_right',
                'hold_right',
                'release_right',
                'single_right_ext',
                'hold_right_ext',
                'release_right_ext',
            ]),
            e.enum('operation_mode', ea.ALL, ['control_relay', 'decoupled']),
            e.binary('led_enable', ea.ALL, true, false).withEndpoint('l1').withDescription('Enable LED'),
            e.binary('led_enable', ea.ALL, true, false).withEndpoint('l2').withDescription('Enable LED'),
            e.binary('led_state', ea.ALL, 'ON', 'OFF').withEndpoint('l1').withDescription('LED State'),
            e.binary('led_state', ea.ALL, 'ON', 'OFF').withEndpoint('l2').withDescription('LED State'),
        ],
    },
    {
        zigbeeModel: ['Connectable dimmer,3-200W,2-wire'],
        model: '552-72201',
        vendor: 'Niko',
        description: 'Connectable dimmer',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.brightness, fromZigbee_1.default.level_config, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [toZigbee_1.default.light_onoff_brightness, toZigbee_1.default.level_config],
        exposes: [e.light_brightness().withLevelConfig()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            await reporting.onOff(endpoint);
            await reporting.brightness(endpoint);
        },
    },
    {
        zigbeeModel: ['Connectable motor control,3A'],
        model: '552-72301',
        vendor: 'Niko',
        description: 'Connectable motor control',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        meta: { coverInverted: true },
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
        },
        exposes: [e.cover_position()],
    },
    {
        zigbeeModel: ['Battery switch, 1 button'],
        model: '552-720X1',
        vendor: 'Niko',
        description: 'Battery switch with 1 button',
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.identify, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genGroups', 'genOnOff', 'genLevelCtrl']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
        exposes: [e.action(['on', 'off', 'brightness_move_up', 'brightness_move_down', 'brightness_stop']), e.battery()],
    },
    {
        zigbeeModel: ['Battery switch, 2 button'],
        model: '552-720X2',
        vendor: 'Niko',
        description: 'Battery switch with 2 buttons',
        meta: { multiEndpoint: true },
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.identify, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [],
        endpoint: (device) => {
            return { left: 1, right: 2 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const ep1 = device.getEndpoint(1);
            await reporting.bind(ep1, coordinatorEndpoint, ['genGroups', 'genOnOff', 'genLevelCtrl']);
            await reporting.batteryPercentageRemaining(ep1);
            const ep2 = device.getEndpoint(2);
            await reporting.bind(ep2, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
        },
        exposes: [
            e.action([
                'on_left',
                'off_left',
                'on_right',
                'off_right',
                'brightness_move_up_left',
                'brightness_move_up_right',
                'brightness_move_down_left',
                'brightness_move_down_right',
                'brightness_stop_left',
                'brightness_stop_right',
            ]),
            e.battery(),
        ],
    },
    {
        zigbeeModel: ['Battery switch, 4 button'],
        model: '552-720X4',
        vendor: 'Niko',
        description: 'Battery switch with 4 buttons',
        meta: { multiEndpoint: true },
        fromZigbee: [fromZigbee_1.default.command_on, fromZigbee_1.default.command_off, fromZigbee_1.default.identify, fromZigbee_1.default.battery, fromZigbee_1.default.command_move, fromZigbee_1.default.command_stop],
        toZigbee: [],
        endpoint: (device) => {
            return { top_left: 1, bottom_left: 2, top_right: 3, bottom_right: 4 };
        },
        configure: async (device, coordinatorEndpoint) => {
            const ep1 = device.getEndpoint(1);
            await reporting.bind(ep1, coordinatorEndpoint, ['genGroups', 'genOnOff', 'genLevelCtrl']);
            await reporting.batteryPercentageRemaining(ep1);
            const ep2 = device.getEndpoint(2);
            await reporting.bind(ep2, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            const ep3 = device.getEndpoint(3);
            await reporting.bind(ep3, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            const ep4 = device.getEndpoint(4);
            await reporting.bind(ep4, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
        },
        exposes: [
            e.action([
                'on_top_left',
                'off_top_left',
                'on_bottom_left',
                'off_bottom_left',
                'on_top_right',
                'off_top_right',
                'on_bottom_right',
                'off_bottom_right',
                'brightness_move_up_top_left',
                'brightness_move_up_bottom_left',
                'brightness_move_up_top_right',
                'brightness_move_up_bottom_right',
                'brightness_move_down_top_left',
                'brightness_move_down_bottom_left',
                'brightness_move_down_top_right',
                'brightness_move_down_bottom_right',
                'brightness_stop_top_left',
                'brightness_stop_bottom_left',
                'brightness_stop_top_right',
                'brightness_stop_bottom_right',
            ]),
            e.battery(),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=niko.js.map