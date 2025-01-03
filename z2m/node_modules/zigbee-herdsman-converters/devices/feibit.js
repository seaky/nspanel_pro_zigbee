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
const philips_1 = require("../lib/philips");
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const definitions = [
    {
        zigbeeModel: ['FZB56+ZSW2FYM1.1'],
        model: 'TZSW22FW-L4',
        vendor: 'Feibit',
        description: 'Smart light switch - 2 gang',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { top: 16, bottom: 17 } }), (0, modernExtend_1.onOff)({ endpointNames: ['top', 'bottom'] })],
    },
    {
        zigbeeModel: ['FB56+ZSW1GKJ2.3'],
        model: 'SKY01-TS1-101',
        vendor: 'Feibit',
        description: 'Smart light switch - 1 gang',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['FNB56-SOS03FB1.5'],
        model: 'SEB01ZB',
        vendor: 'Feibit',
        description: 'SOS button',
        fromZigbee: [fromZigbee_1.default.ias_sos_alarm_2, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.sos(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-BOT06FB2.3', 'FNB56-BOT06FB2.8', 'FB56-BOT02HM1.2', 'FNB56-BOT06FB2.8'],
        model: 'SBM01ZB',
        vendor: 'Feibit',
        description: 'Human body movement sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.batteryAlarmState(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-THM14FB2.4', 'FNB54-THM17ML1.1', 'FB56-THM12HM1.2', 'FNB56-THM14FB2.5'],
        model: 'STH01ZB',
        vendor: 'Feibit',
        description: 'Smart temperature & humidity Sensor',
        fromZigbee: [fromZigbee_1.default.temperature, fromZigbee_1.default.humidity, fromZigbee_1.default.battery],
        toZigbee: [],
        meta: { battery: { voltageToPercentage: { min: 2500, max: 3000 } } },
        exposes: [e.temperature(), e.humidity(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-SMF06FB1.6', 'FNB56-SMF06FB2.0'],
        model: 'SSA01ZB',
        vendor: 'Feibit',
        description: 'Smoke detector',
        fromZigbee: [fromZigbee_1.default.ias_smoke_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.batteryAlarmState(endpoint);
        },
        exposes: [e.smoke(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-COS06FB1.7', 'FNB56-COS06FB2.1'],
        model: 'SCA01ZB',
        vendor: 'Feibit',
        description: 'Smart carbon monoxide sensor',
        fromZigbee: [fromZigbee_1.default.ias_carbon_monoxide_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
            await reporting.batteryAlarmState(endpoint);
        },
        exposes: [e.carbon_monoxide(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-GAS05FB1.4', 'FNB56-GAS05FB1.8'],
        model: 'SGA01ZB',
        vendor: 'Feibit',
        description: 'Combustible gas sensor',
        fromZigbee: [fromZigbee_1.default.ias_gas_alarm_2],
        toZigbee: [],
        exposes: [e.gas()],
    },
    {
        zigbeeModel: ['FNB56-WTS05FB2.0', 'FNB56-WTS05FB2.4'],
        model: 'SWA01ZB',
        vendor: 'Feibit',
        description: 'Water leakage sensor',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.water_leak(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FNB56-DOS07FB2.4', 'FB56-DOS02HM1.2'],
        model: 'SDM01ZB',
        vendor: 'Feibit',
        description: 'Door or window contact switch',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['FB56+SKT14AL2.1', 'FTB56+SKT1BCW1.0'],
        model: 'SFS01ZB',
        vendor: 'Feibit',
        description: 'Power plug',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['FB56+ZSW1HKJ2.2', 'FB56+ZSW1HKJ1.1'],
        model: 'SLS301ZB_2',
        vendor: 'Feibit',
        description: 'Smart light switch - 2 gang',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 16, right: 17 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'right'] })],
    },
    {
        zigbeeModel: ['FB56+ZSW1IKJ2.2', 'FB56+ZSW1IKJ1.1'],
        model: 'SLS301ZB_3',
        vendor: 'Feibit',
        description: 'Smart light switch - 3 gang',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { left: 16, center: 17, right: 18 } }), (0, modernExtend_1.onOff)({ endpointNames: ['left', 'center', 'right'] })],
    },
    {
        zigbeeModel: ['FB56+ZSN08KJ2.2'],
        model: 'SSS401ZB',
        vendor: 'Feibit',
        description: 'Smart 4 key scene wall switch',
        toZigbee: [toZigbee_1.default.on_off],
        fromZigbee: [fromZigbee_1.default.command_recall],
        exposes: [e.action(['recall_*']), e.switch()],
    },
    {
        zigbeeModel: ['FB56+SKT06HM1.1'],
        model: 'TSKT106W-M1',
        vendor: 'Feibit',
        description: 'Portable Smart Socket',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { holes: 16, usb: 17 } }), (0, modernExtend_1.onOff)({ powerOnBehavior: false, endpointNames: ['holes', 'usb'] })],
    },
    {
        zigbeeModel: ['FEB56-ZSN25YS1.3'],
        model: 'SZSN325W-Q',
        vendor: 'Feibit',
        description: 'Three-Gang Scene Switch',
        fromZigbee: [fromZigbee_1.default.command_recall],
        toZigbee: [],
        exposes: [e.action(['recall_*'])],
    },
    {
        zigbeeModel: ['FB56+ZSN08KJ2.6'],
        model: 'TZSN408W-V1',
        vendor: 'Feibit',
        description: 'Four-Gang Scene Switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4 } }), (0, modernExtend_1.commandsOnOff)({ endpointNames: ['1', '2', '3', '4'] })],
    },
    {
        zigbeeModel: ['FNB56-ZRC06FB2.0'],
        model: 'NZRC106W-M2',
        vendor: 'Feibit',
        description: 'Security Remote',
        extend: [],
        fromZigbee: [fromZigbee_1.default.command_arm, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.battery(), e.action(['panic', 'disarm', 'arm_day_zones', 'arm_all_zones'])],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
        },
        onEvent: async (_, data) => {
            if (data.type === 'commandArm' && data.cluster === 'ssIasAce') {
                await data.endpoint.defaultResponse(0, 0, 1281, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
    {
        zigbeeModel: ['FEB56-ZT21AAK1.6'],
        model: 'SZT211_AW-P1',
        vendor: 'Feibit',
        description: 'Curtain Motor',
        extend: [(0, modernExtend_1.windowCovering)({ controls: ['lift', 'tilt'] })],
    },
    {
        zigbeeModel: ['FB56+TMT01ZY1.6'],
        model: 'SSS401ZB-T',
        vendor: 'Feibit',
        description: 'Temperature control panel',
        fromZigbee: [fromZigbee_1.default.thermostat, fromZigbee_1.default.on_off, fromZigbee_1.default.fan],
        toZigbee: [
            toZigbee_1.default.thermostat_local_temperature,
            toZigbee_1.default.thermostat_occupied_heating_setpoint,
            toZigbee_1.default.thermostat_occupied_cooling_setpoint,
            toZigbee_1.default.thermostat_system_mode,
            toZigbee_1.default.on_off,
            toZigbee_1.default.fan_mode,
        ],
        exposes: [
            e
                .climate()
                .withLocalTemperature()
                .withSystemMode(['off', 'auto', 'cool', 'heat', 'fan_only', 'dry'])
                .withFanMode(['off', 'low', 'medium', 'high', 'on', 'auto'])
                .withSetpoint('occupied_heating_setpoint', 5, 30, 0.5)
                .withSetpoint('occupied_cooling_setpoint', 5, 30, 0.5),
            e.switch(),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['hvacThermostat', 'hvacFanCtrl', 'genOnOff']);
            await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
            await reporting.thermostatTemperature(endpoint);
            await reporting.fanMode(endpoint);
            await reporting.onOff(endpoint);
        },
    },
    {
        zigbeeModel: ['FB56+ZSC02KJ1.0'],
        model: 'TZSC302W-V1',
        vendor: 'Feibit',
        description: 'Dimmer Switch',
        extend: [(0, modernExtend_1.light)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['FTB56+SKT22HY1.1'],
        model: 'TSKT222W-H4',
        vendor: 'Feibit',
        description: 'Power Socket with Metering',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['FB56+CUR18SB2.0'],
        model: 'TCUR218W-V1',
        vendor: 'Feibit',
        description: 'Dual Track Curtain Panel',
        extend: [
            (0, modernExtend_1.deviceEndpoints)({ endpoints: { top: 15, bottom: 14 } }),
            (0, modernExtend_1.identify)(),
            (0, modernExtend_1.windowCovering)({ controls: ['lift', 'tilt'], endpointNames: ['top', 'bottom'] }),
        ],
    },
    {
        zigbeeModel: ['FZT56-ZRC09FB1.7'],
        model: 'FMRC209W',
        vendor: 'Feibit',
        description: '2-Button Dimmer Switch',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.identify)(), (0, modernExtend_1.commandsOnOff)(), (0, modernExtend_1.commandsLevelCtrl)()],
    },
    {
        zigbeeModel: ['FZT56-ZCW2LBW1.2'],
        model: 'FZCWF2LW-BW',
        vendor: 'Feibit',
        description: 'Smart LED Retrofit Light',
        extend: [(0, modernExtend_1.identify)(), (0, philips_1.philipsLight)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'], enhancedHue: true } })],
    },
    {
        zigbeeModel: ['FZT56-ZCW2HYH1.3'],
        model: 'FZCWD2HW-YH',
        vendor: 'Feibit',
        description: 'Smart LED Recessed Light',
        extend: [(0, modernExtend_1.identify)(), (0, philips_1.philipsLight)({ colorTemp: { range: [153, 370] }, color: { modes: ['xy', 'hs'], enhancedHue: true } })],
    },
    {
        zigbeeModel: ['FNB56-ZSN21YM1.0'],
        model: 'NZSN421W-Q',
        vendor: 'Feibit',
        description: 'Four-Gang Battery-Powered Scene Switch',
        extend: [(0, modernExtend_1.deviceEndpoints)({ endpoints: { '1': 1, '2': 2, '3': 3, '4': 4 } }), (0, modernExtend_1.battery)(), (0, modernExtend_1.commandsOnOff)({ endpointNames: ['1', '2', '3', '4'] })],
    },
    {
        zigbeeModel: ['FEB56-STK2AYS1.1'],
        model: 'TSKT113W-H4',
        vendor: 'Feibit',
        description: 'In-wall Power plug',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
    {
        zigbeeModel: ['FEB61-SKT1IFB1.2'],
        model: 'SSKT11IW-F1',
        vendor: 'Feibit',
        description: 'Power plug',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=feibit.js.map