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
const ea = exposes.access;
const fzLocal = {
    LDSENK08: {
        cluster: 'ssIasZone',
        type: 'commandStatusChangeNotification',
        convert: (model, msg, publish, options, meta) => {
            const zoneStatus = msg.data.zonestatus;
            return {
                contact: !((zoneStatus & 1) > 0),
                vibration: (zoneStatus & (1 << 1)) > 0,
                tamper: (zoneStatus & (1 << 2)) > 0,
                battery_low: (zoneStatus & (1 << 3)) > 0,
            };
        },
    },
};
const tzLocal = {
    LDSENK08_sensitivity: {
        key: ['sensitivity'],
        convertSet: async (entity, key, value, meta) => {
            await entity.write('ssIasZone', { 0x0013: { value, type: 0x20 } });
            return { state: { sensitivity: value } };
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['LDSENK08'],
        model: 'LDSENK08',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN wireless smart door window sensor with vibration',
        fromZigbee: [fzLocal.LDSENK08, fromZigbee_1.default.battery],
        toZigbee: [tzLocal.LDSENK08_sensitivity],
        exposes: [
            e.battery_low(),
            e.contact(),
            e.vibration(),
            e.tamper(),
            e.battery(),
            e.numeric('sensitivity', ea.STATE_SET).withValueMin(0).withValueMax(4).withDescription('Sensitivity of the motion sensor'),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['LDSENK09'],
        model: 'LDSENK09',
        vendor: 'ADEO',
        description: 'Security system key fob',
        fromZigbee: [fromZigbee_1.default.command_arm, fromZigbee_1.default.command_panic],
        toZigbee: [],
        exposes: [e.action(['panic', 'disarm', 'arm_partial_zones', 'arm_all_zones'])],
        onEvent: async (type, data, device) => {
            // Since arm command has a response zigbee-herdsman doesn't send a default response.
            // This causes the remote to repeat the arm command, so send a default response here.
            if (data.type === 'commandArm' && data.cluster === 'ssIasAce') {
                await data.endpoint.defaultResponse(0, 0, 1281, data.meta.zclTransactionSequenceNumber);
            }
        },
    },
    {
        zigbeeModel: ['ZBEK-1'],
        model: 'IA-CDZOTAAA007MA-MAN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 7.2 to 60W LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-2'],
        model: 'IG-CDZOTAAG014RA-MAN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 14W to 100W LED RGBW v2',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-3'],
        model: 'IP-CDZOTAAP005JA-MAN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E14 LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-4'],
        model: 'IM-CDZDGAAA0005KA_MAN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN RGBTW GU10 Bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-5'],
        model: 'IST-CDZFB2AS007NA-MZN-01',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['SIN-4-1-21_EQU'],
        model: 'SIN-4-1-21_EQU',
        vendor: 'ADEO',
        description: 'Multifunction relay switch with metering',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['ZBEK-7'],
        model: 'IST-CDZFB2AS007NA-MZN-02',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED Edison white filament 806 lumen',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-8'],
        model: 'IG-CDZFB2G009RA-MZN-02',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white filament 1055 lumen',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-9'],
        model: 'IA-CDZFB2AA007NA-MZN-02',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-6'],
        model: 'IG-CDZB2AG009RA-MZN-01',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 Led white bulb',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-10'],
        model: 'IC-CDZFB2AC004HA-MZN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E14 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-11'],
        model: 'IM-CDZDGAAG005KA-MZN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN GU-10 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-12'],
        model: 'IA-CDZFB2AA007NA-MZN-01',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-13'],
        model: 'IG-CDZFB2AG010RA-MNZ',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-14'],
        model: 'IC-CDZFB2AC005HA-MZN',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E14 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 454] } })],
    },
    {
        zigbeeModel: ['ZBEK-22'],
        model: 'BD05C-FL-21-G-ENK',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN RGBCCT lamp',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-27'],
        model: '84845506',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Gdansk',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-29'],
        model: '84845509',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Gdansk LED panel',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-28'],
        model: 'PEZ1-042-1020-C1D1',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Gdansk',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-31'],
        model: '84870054',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Extraflat 85',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-32'],
        model: 'ZBEK-32',
        vendor: 'ADEO',
        description: 'ENKI Inspire Extraflat D12',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['ZBEK-34'],
        model: '84870058',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Extraflat 225 ',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['LDSENK01F'],
        model: 'LDSENK01F',
        vendor: 'ADEO',
        description: '10A EU smart plug',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['LDSENK01S'],
        model: 'LDSENK01S',
        vendor: 'ADEO',
        description: '10A EU smart plug',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['LXEK-5', 'ZBEK-26'],
        model: 'HR-C99C-Z-C045',
        vendor: 'ADEO',
        description: 'RGB CTT LEXMAN ENKI remote control',
        fromZigbee: [
            fromZigbee_1.default.battery,
            fromZigbee_1.default.command_on,
            fromZigbee_1.default.command_off,
            fromZigbee_1.default.command_step,
            fromZigbee_1.default.command_stop,
            fromZigbee_1.default.command_step_color_temperature,
            fromZigbee_1.default.command_step_hue,
            fromZigbee_1.default.command_step_saturation,
            fromZigbee_1.default.color_stop_raw,
            fromZigbee_1.default.scenes_recall_scene_65024,
            fromZigbee_1.default.ignore_genOta,
        ],
        toZigbee: [],
        exposes: [
            e.battery(),
            e.action([
                'on',
                'off',
                'scene_1',
                'scene_2',
                'scene_3',
                'scene_4',
                'color_saturation_step_up',
                'color_saturation_step_down',
                'color_stop',
                'color_hue_step_up',
                'color_hue_step_down',
                'color_temperature_step_up',
                'color_temperature_step_down',
                'brightness_step_up',
                'brightness_step_down',
                'brightness_stop',
            ]),
        ],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['genBasic', 'genOnOff', 'genPowerCfg', 'lightingColorCtrl', 'genLevelCtrl'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['LXEK-1'],
        model: '9CZA-A806ST-Q1A',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['LXEK-3'],
        model: '9CZA-P470T-A1A',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E14 LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] }, color: true })],
    },
    {
        zigbeeModel: ['LXEK-4'],
        model: '9CZA-M350ST-Q1A',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN GU-10 LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['LXEK-2'],
        model: '9CZA-G1521-Q1A',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 14W to 100W LED RGBW',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['LDSENK07'],
        model: 'LDSENK07',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN wireless smart outdoor siren',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ias_siren],
        toZigbee: [toZigbee_1.default.warning],
        exposes: [e.warning(), e.battery(), e.battery_low(), e.tamper()],
        extend: [(0, modernExtend_1.quirkCheckinInterval)(0)],
        configure: async (device, coordinatorEndpoint) => {
            await device.getEndpoint(1).unbind('genPollCtrl', coordinatorEndpoint);
        },
    },
    {
        zigbeeModel: ['LXEK-7'],
        model: '9CZA-A806ST-Q1Z',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN E27 LED white',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['LDSENK02F'],
        model: 'LDSENK02F',
        description: '10A/16A EU smart plug',
        vendor: 'ADEO',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['LDSENK10'],
        model: 'LDSENK10',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['LDSENK02S'],
        model: 'LDSENK02S',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN 16A EU smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.electricityMeter)()],
    },
    {
        zigbeeModel: ['SIN-4-1-20_LEX'],
        model: 'SIN-4-1-20_LEX',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN 3680W single output relay',
        extend: [(0, modernExtend_1.onOff)()],
        endpoint: (device) => {
            return { default: 1 };
        },
    },
    {
        zigbeeModel: ['SIN-4-RS-20_LEX'],
        model: 'SIN-4-RS-20_LEX',
        vendor: 'ADEO',
        description: 'Roller shutter controller (Leroy Merlin version)',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg', 'closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
            await reporting.currentPositionTiltPercentage(endpoint);
        },
        exposes: [e.cover_position()],
    },
    {
        zigbeeModel: ['SIN-4-1-22_LEX'],
        model: 'SIN-4-1-22_LEX',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN Access Control',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        zigbeeModel: ['SIN-4-FP-21_EQU'],
        model: 'SIN-4-FP-21_EQU',
        vendor: 'ADEO',
        description: 'Equation pilot wire heating module',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.metering, fromZigbee_1.default.nodon_pilot_wire_mode],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.nodon_pilot_wire_mode],
        exposes: [e.switch(), e.power(), e.energy(), e.pilot_wire_mode()],
        configure: async (device, coordinatorEndpoint) => {
            const ep = device.getEndpoint(1);
            await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering', 'manuSpecificNodOnPilotWire']);
            await reporting.onOff(ep, { min: 1, max: 3600, change: 0 });
            await reporting.readMeteringMultiplierDivisor(ep);
            await reporting.instantaneousDemand(ep);
            await reporting.currentSummDelivered(ep);
            const p = reporting.payload('mode', 0, 120, 0, { min: 1, max: 3600, change: 0 });
            await ep.configureReporting('manuSpecificNodOnPilotWire', p);
        },
    },
    {
        zigbeeModel: ['ZB-Remote-D0001'],
        model: '83633204',
        vendor: 'ADEO',
        description: '1-key remote control',
        fromZigbee: [fromZigbee_1.default.adeo_button_65024, fromZigbee_1.default.battery],
        exposes: [e.action(['single', 'double', 'hold']), e.battery()],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg']);
            await reporting.batteryPercentageRemaining(endpoint);
        },
    },
    {
        zigbeeModel: ['ZB-SMART-PIRTH-V3'],
        model: '83633205',
        vendor: 'ADEO',
        description: 'Smart 4 in 1 sensor',
        extend: [
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.illuminance)(),
            (0, modernExtend_1.temperature)(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
        ],
    },
    {
        zigbeeModel: ['ZB-DoorSensor-D0007'],
        model: 'ZB-DoorSensor-D0007',
        vendor: 'ADEO',
        description: 'ENKI LEXMAN wireless smart door window sensor',
        extend: [(0, modernExtend_1.battery)(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=adeo.js.map