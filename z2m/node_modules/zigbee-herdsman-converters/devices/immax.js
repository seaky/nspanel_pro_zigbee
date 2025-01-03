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
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const tuya = __importStar(require("../lib/tuya"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        fingerprint: tuya.fingerprint('TS011F', ['_TZ3000_jak16dll']),
        model: '07752L',
        description: 'NEO smart internal double socket',
        vendor: 'Immax',
        extend: [
            tuya.modernExtend.tuyaOnOff({
                electricalMeasurements: true,
                powerOutageMemory: true,
                indicatorMode: true,
                childLock: true,
                endpoints: ['l1', 'l2'],
            }),
        ],
        configure: async (device, coordinatorEndpoint) => {
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.rmsVoltage(endpoint, { change: 5 });
            await reporting.rmsCurrent(endpoint, { change: 50 });
            await reporting.activePower(endpoint, { change: 10 });
            await reporting.currentSummDelivered(endpoint);
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', { acCurrentDivisor: 1000, acCurrentMultiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 100, multiplier: 1 });
            device.save();
        },
        endpoint: (device) => {
            return { l1: 1, l2: 2 };
        },
        meta: { multiEndpoint: true, multiEndpointSkip: ['power', 'current', 'voltage', 'energy'] },
    },
    {
        zigbeeModel: ['Motion-Sensor-ZB3.0'],
        model: '07043M',
        vendor: 'Immax',
        description: 'Motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery()],
    },
    {
        zigbeeModel: ['ZBT-CCTfilament-D0000'],
        model: '07089L',
        vendor: 'Immax',
        description: 'NEO SMART LED E27 5W',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['E27-filament-Dim-ZB3.0'],
        model: '07088L',
        vendor: 'Immax',
        description: 'Neo SMART LED filament E27 6.3W warm white, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['IM-Z3.0-DIM'],
        model: '07001L/07005B',
        vendor: 'Immax',
        description: 'Neo SMART LED E14 5W warm white, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)()],
    },
    {
        zigbeeModel: ['IM-Z3.0-RGBW'],
        model: '07004D/07005L',
        vendor: 'Immax',
        description: 'Neo SMART LED E27/E14 color, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['IM-Z3.0-RGBCCT'],
        model: '07008L',
        vendor: 'Immax',
        description: 'Neo SMART LED strip RGB + CCT, color, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        fingerprint: [{ modelID: 'TS0505B', manufacturerName: '_TZ3210_pwauw3g2' }],
        model: '07743L',
        vendor: 'Immax',
        description: 'Neo Smart LED E27 11W RGB + CCT, color, dimmable, Zigbee 3.0',
        extend: [tuya.modernExtend.tuyaLight({ colorTemp: { range: [153, 500] }, color: true })],
    },
    {
        fingerprint: [{ modelID: 'TS0502C', manufacturerName: '_TZ3210_6pwpez2j' }],
        model: 'TS0502C',
        vendor: 'Immax',
        description: 'Neo FINO Smart pendant light black 80cm CCT 60W, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 500] } })],
    },
    {
        zigbeeModel: ['Keyfob-ZB3.0'],
        model: '07046L',
        vendor: 'Immax',
        description: '4-Touch single click buttons',
        fromZigbee: [legacy.fz.immax_07046L_arm, fromZigbee_1.default.command_panic],
        exposes: [e.action(['disarm', 'arm_stay', 'arm_away', 'panic'])],
        toZigbee: [],
    },
    {
        zigbeeModel: ['DoorWindow-Sensor-ZB3.0'],
        model: '07045L',
        vendor: 'Immax',
        description: 'Magnetic contact sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1],
        toZigbee: [],
        exposes: [e.contact(), e.battery_low(), e.tamper()],
    },
    {
        zigbeeModel: ['Plug-230V-ZB3.0'],
        model: '07048L',
        vendor: 'Immax',
        description: 'NEO SMART plug',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering],
        toZigbee: [toZigbee_1.default.on_off],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await reporting.onOff(endpoint);
            await reporting.readEletricalMeasurementMultiplierDivisors(endpoint);
            await reporting.readMeteringMultiplierDivisor(endpoint);
            await reporting.currentSummDelivered(endpoint);
            await reporting.activePower(endpoint, { change: 5 });
        },
        exposes: [e.switch(), e.power(), e.energy()],
    },
    {
        zigbeeModel: ['losfena'],
        fingerprint: [{ modelID: 'TS0601', manufacturerName: '_TZE200_wlosfena' }],
        model: '07703L',
        vendor: 'Immax',
        description: 'Radiator valve',
        fromZigbee: [legacy.fz.tuya_thermostat_weekly_schedule_1, legacy.fz.etop_thermostat, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.ignore_tuya_set_time],
        toZigbee: [
            legacy.tz.etop_thermostat_system_mode,
            legacy.tz.etop_thermostat_away_mode,
            legacy.tz.tuya_thermostat_child_lock,
            legacy.tz.tuya_thermostat_current_heating_setpoint,
            legacy.tz.tuya_thermostat_weekly_schedule,
        ],
        onEvent: tuya.onEventSetTime,
        meta: {
            timeout: 20000, // TRV wakes up every 10sec
            thermostat: {
                weeklyScheduleMaxTransitions: 4,
                weeklyScheduleSupportedModes: [1], // bits: 0-heat present, 1-cool present (dec: 1-heat,2-cool,3-heat+cool)
                weeklyScheduleFirstDayDpId: 101,
            },
        },
        exposes: [
            e.battery_low(),
            e.child_lock(),
            e.away_mode(),
            e
                .climate()
                .withSetpoint('current_heating_setpoint', 5, 35, 0.5, ea.STATE_SET)
                .withLocalTemperature(ea.STATE)
                .withSystemMode(['off', 'heat', 'auto'], ea.STATE_SET)
                .withRunningState(['idle', 'heat'], ea.STATE),
        ],
    },
    {
        zigbeeModel: ['Bulb-RGB+CCT-ZB3.0'],
        model: '07115L',
        vendor: 'Immax',
        description: 'Neo SMART LED E27 9W RGB + CCT, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined }, color: true })],
    },
    {
        zigbeeModel: ['4in1-Sensor-ZB3.0'],
        model: '07047L',
        vendor: 'Immax',
        description: 'Intelligent motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery, fromZigbee_1.default.temperature, fromZigbee_1.default.illuminance, fromZigbee_1.default.humidity, fromZigbee_1.default.ignore_iaszone_report],
        toZigbee: [],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            const binds = ['msTemperatureMeasurement', 'msRelativeHumidity', 'msIlluminanceMeasurement'];
            await reporting.bind(endpoint, coordinatorEndpoint, binds);
            await reporting.temperature(endpoint);
            await reporting.humidity(endpoint);
            await reporting.illuminance(endpoint);
        },
        exposes: [e.occupancy(), e.battery_low(), e.tamper(), e.battery(), e.temperature(), e.illuminance(), e.illuminance_lux(), e.humidity()],
    },
    {
        zigbeeModel: ['ColorTemperature'],
        fingerprint: [{ modelID: '07073L', manufacturerName: 'Seastar Intelligence' }],
        model: '07073L',
        vendor: 'Immax',
        description: 'Neo CANTO/HIPODROMO SMART, color temp, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        zigbeeModel: ['IM-Z3.0-CCT'],
        model: '07042L',
        vendor: 'Immax',
        description: 'Neo RECUADRO SMART, color temp, dimmable, Zigbee 3.0',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [153, 370] } })],
    },
    {
        fingerprint: tuya.fingerprint('TS0202', ['_TZ3210_jijr1sss', '_TZ3210_m3mxv66l']),
        model: '07502L',
        vendor: 'Immax',
        description: '4 in 1 multi sensor',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.ignore_basic_report, fromZigbee_1.default.illuminance, legacy.fz.ZB003X, fromZigbee_1.default.ZB003X_attr, fromZigbee_1.default.ZB003X_occupancy],
        toZigbee: [legacy.tz.ZB003X],
        exposes: [
            e.occupancy(),
            e.tamper(),
            e.battery(),
            e.illuminance(),
            e.illuminance_lux().withUnit('lx'),
            e.temperature(),
            e.humidity(),
            e.numeric('reporting_time', ea.STATE_SET).withDescription('Reporting interval in minutes').withValueMin(0).withValueMax(1440),
            e.numeric('temperature_calibration', ea.STATE_SET).withDescription('Temperature calibration').withValueMin(-20).withValueMax(20),
            e.numeric('humidity_calibration', ea.STATE_SET).withDescription('Humidity calibration').withValueMin(-50).withValueMax(50),
            e.numeric('illuminance_calibration', ea.STATE_SET).withDescription('Illuminance calibration').withValueMin(-10000).withValueMax(10000),
            e.binary('pir_enable', ea.STATE_SET, true, false).withDescription('Enable PIR sensor'),
            e.binary('led_enable', ea.STATE_SET, true, false).withDescription('Enabled LED'),
            e.binary('reporting_enable', ea.STATE_SET, true, false).withDescription('Enabled reporting'),
            e.enum('sensitivity', ea.STATE_SET, ['low', 'medium', 'high']).withDescription('PIR sensor sensitivity'),
            e.enum('keep_time', ea.STATE_SET, ['0', '30', '60', '120', '240']).withDescription('PIR keep time in seconds'),
        ],
    },
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE200_n9clpsht', '_TZE200_nyvavzbj', '_TZE200_moycceze']),
        model: '07505L',
        vendor: 'Immax',
        description: 'Neo smart keypad',
        fromZigbee: [tuya.fz.datapoints],
        toZigbee: [],
        exposes: [e.action(['disarm', 'arm_home', 'arm_away', 'sos']), e.tamper()],
        meta: {
            tuyaDatapoints: [
                [24, 'tamper', tuya.valueConverter.trueFalse1],
                [26, 'action', tuya.valueConverter.static('disarm')],
                [27, 'action', tuya.valueConverter.static('arm_away')],
                [28, 'action', tuya.valueConverter.static('arm_home')],
                [29, 'action', tuya.valueConverter.static('sos')],
            ],
        },
    },
    {
        fingerprint: [{ modelID: 'TS004F', manufacturerName: '_TZ3000_krwtzhfd' }],
        model: '07767L',
        vendor: 'Immax',
        description: 'NEO Smart outdoor button',
        exposes: [e.battery(), e.action(['single', 'double', 'hold'])],
        fromZigbee: [fromZigbee_1.default.battery, tuya.fz.on_off_action],
        toZigbee: [],
        configure: tuya.configureMagicPacket,
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=immax.js.map