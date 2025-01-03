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
const exposes = __importStar(require("../lib/exposes"));
const modernExtend_1 = require("../lib/modernExtend");
const ota = __importStar(require("../lib/ota"));
const reporting = __importStar(require("../lib/reporting"));
const e = exposes.presets;
const fzLocal = {
    thirdreality_acceleration: {
        cluster: '65521',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const payload = {};
            if (msg.data['1'])
                payload.x_axis = msg.data['1'];
            if (msg.data['2'])
                payload.y_axis = msg.data['2'];
            if (msg.data['3'])
                payload.z_axis = msg.data['3'];
            return payload;
        },
    },
    thirdreality_private_motion_sensor: {
        cluster: 'r3Specialcluster',
        type: 'attributeReport',
        convert: (model, msg, publish, options, meta) => {
            const zoneStatus = msg.data[2];
            return { occupancy: (zoneStatus & 1) > 0 };
        },
    },
};
const definitions = [
    {
        zigbeeModel: ['3RSS009Z'],
        model: '3RSS009Z',
        vendor: 'Third Reality',
        description: 'Smart switch Gen3',
        ota: ota.zigbeeOTA,
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.ignore_transition],
        exposes: [e.switch(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rSwitchGen3SpecialCluster', {
                ID: 0xff02,
                manufacturerCode: 0x1233,
                attributes: {
                    backOn: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    backOff: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['3RSS008Z'],
        model: '3RSS008Z',
        vendor: 'Third Reality',
        description: 'RealitySwitch Plus',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.ignore_transition],
        meta: { battery: { voltageToPercentage: '3V_2100' } },
        exposes: [e.switch(), e.battery(), e.battery_voltage()],
    },
    {
        zigbeeModel: ['3RSS007Z'],
        model: '3RSS007Z',
        vendor: 'Third Reality',
        description: 'Smart light switch',
        extend: [(0, modernExtend_1.onOff)()],
        meta: { disableDefaultResponse: true },
    },
    {
        zigbeeModel: ['3RSL011Z'],
        model: '3RSL011Z',
        vendor: 'Third Reality',
        description: 'Smart light A19',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['3RSL012Z'],
        model: '3RSL012Z',
        vendor: 'Third Reality',
        description: 'Smart light BR30',
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: undefined } })],
    },
    {
        zigbeeModel: ['3RWS18BZ'],
        model: '3RWS18BZ',
        vendor: 'Third Reality',
        description: 'Water sensor',
        fromZigbee: [fromZigbee_1.default.ias_water_leak_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('r3Specialcluster', {
                ID: 0xff01,
                manufacturerCode: 0x1233,
                attributes: {
                    siren_on_off: { ID: 0x0010, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    siren_mintues: { ID: 0x0011, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        exposes: [e.water_leak(), e.battery_low(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['3RMS16BZ'],
        model: '3RMS16BZ',
        vendor: 'Third Reality',
        description: 'Wireless motion sensor',
        fromZigbee: [fromZigbee_1.default.ias_occupancy_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.occupancy(), e.battery_low(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rMotionSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1233,
                attributes: {
                    coolDownTime: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['3RDS17BZ'],
        model: '3RDS17BZ',
        vendor: 'Third Reality',
        description: 'Door sensor',
        fromZigbee: [fromZigbee_1.default.ias_contact_alarm_1, fromZigbee_1.default.battery],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.contact(), e.battery_low(), e.battery(), e.battery_voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rDoorSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1233,
                attributes: {
                    delayOpenAttrId: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['3RDTS01056Z'],
        model: '3RDTS01056Z',
        vendor: 'Third Reality',
        description: 'Garage door tilt sensor',
        extend: [
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'battery_low'] }),
            (0, modernExtend_1.deviceAddCustomCluster)('3rGarageDoorSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1407,
                attributes: {
                    delayOpenAttrId: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    zclCabrationAttrId: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RSP019BZ'],
        model: '3RSP019BZ',
        vendor: 'Third Reality',
        description: 'Zigbee / BLE smart plug',
        extend: [
            (0, modernExtend_1.onOff)(),
            (0, modernExtend_1.deviceAddCustomCluster)('3rPlugGen1SpecialCluster', {
                ID: 0xff03,
                manufacturerCode: 0x1233,
                attributes: {
                    onToOffDelay: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    offToOnDelay: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RSB015BZ'],
        model: '3RSB015BZ',
        vendor: 'Third Reality',
        description: 'Roller shade',
        fromZigbee: [fromZigbee_1.default.cover_position_tilt, fromZigbee_1.default.battery],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        meta: { battery: { dontDividePercentage: false } },
        ota: ota.zigbeeOTA,
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genPowerCfg', 'closuresWindowCovering']);
            await reporting.currentPositionLiftPercentage(endpoint);
            try {
                await reporting.batteryPercentageRemaining(endpoint);
            }
            catch {
                /* Fails for some*/
            }
        },
        exposes: [e.cover_position(), e.battery()],
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rRollerShadeSpecialCluster', {
                ID: 0xfff1,
                manufacturerCode: 0x1233,
                attributes: {
                    infraredOff: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['TRZB3'],
        model: 'TRZB3',
        vendor: 'Third Reality',
        description: 'Roller blind motor',
        extend: [(0, modernExtend_1.battery)()],
        fromZigbee: [fromZigbee_1.default.cover_position_tilt],
        toZigbee: [toZigbee_1.default.cover_state, toZigbee_1.default.cover_position_tilt],
        exposes: [e.cover_position()],
    },
    {
        zigbeeModel: ['3RSB22BZ'],
        model: '3RSB22BZ',
        vendor: 'Third Reality',
        description: 'Smart button',
        fromZigbee: [fromZigbee_1.default.battery, fromZigbee_1.default.itcmdr_clicks],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.battery(), e.battery_low(), e.battery_voltage(), e.action(['single', 'double', 'long'])],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
    },
    {
        zigbeeModel: ['3RTHS24BZ'],
        model: '3RTHS24BZ',
        vendor: 'Third Reality',
        description: 'Temperature and humidity sensor',
        extend: [
            (0, modernExtend_1.temperature)(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.deviceAddCustomCluster)('3rSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1233,
                attributes: {
                    celsiusDegreeCalibration: { ID: 0x0031, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    humidityCalibration: { ID: 0x0032, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    fahrenheitDegreeCalibration: { ID: 0x0033, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RSM0147Z'],
        model: '3RSM0147Z',
        vendor: 'Third Reality',
        description: 'Soil sensor',
        extend: [
            (0, modernExtend_1.temperature)(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.deviceAddCustomCluster)('3rSoilSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1407,
                attributes: {
                    celsiusDegreeCalibration: { ID: 0x0031, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    humidityCalibration: { ID: 0x0032, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    fahrenheitDegreeCalibration: { ID: 0x0033, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RTHS0224Z'],
        model: '3RTHS0224Z',
        vendor: 'Third Reality',
        description: 'Temperature and humidity sensor lite',
        extend: [
            (0, modernExtend_1.temperature)(),
            (0, modernExtend_1.humidity)(),
            (0, modernExtend_1.battery)(),
            (0, modernExtend_1.deviceAddCustomCluster)('3rSpecialCluster', {
                ID: 0xff01,
                manufacturerCode: 0x1407,
                attributes: {
                    celsiusDegreeCalibration: { ID: 0x0031, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    humidityCalibration: { ID: 0x0032, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                    fahrenheitDegreeCalibration: { ID: 0x0033, type: zigbee_herdsman_1.Zcl.DataType.INT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RWK0148Z'],
        model: '3RWK0148Z',
        vendor: 'Third Reality',
        description: 'Smart watering kit',
        extend: [
            (0, modernExtend_1.battery)({ percentage: true, voltage: true, lowStatus: true, percentageReporting: true }),
            (0, modernExtend_1.onOff)({ powerOnBehavior: false }),
            (0, modernExtend_1.deviceAddCustomCluster)('3rWateringSpecialCluster', {
                ID: 0xfff2,
                manufacturerCode: 0x1407,
                attributes: {
                    wateringTimes: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    intervalDay: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        ota: ota.zigbeeOTA,
    },
    {
        zigbeeModel: ['3RSP02028BZ'],
        model: '3RSP02028BZ',
        vendor: 'Third Reality',
        description: 'Zigbee / BLE smart plug with power',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior],
        ota: ota.zigbeeOTA,
        exposes: [e.switch(), e.power_on_behavior(), e.ac_frequency(), e.power(), e.power_factor(), e.energy(), e.current(), e.voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.onOff(endpoint);
            await reporting.activePower(endpoint, { change: 10 });
            await reporting.rmsCurrent(endpoint, { change: 50 });
            await reporting.rmsVoltage(endpoint, { change: 5 });
            await reporting.readMeteringMultiplierDivisor(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 3600000, multiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', {
                acVoltageMultiplier: 1,
                acVoltageDivisor: 10,
                acCurrentMultiplier: 1,
                acCurrentDivisor: 1000,
                acPowerMultiplier: 1,
                acPowerDivisor: 10,
            });
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rPlugGen2SpecialCluster', {
                ID: 0xff03,
                manufacturerCode: 0x1233,
                attributes: {
                    resetSummationDelivered: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    onToOffDelay: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    offToOnDelay: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['3RVS01031Z'],
        model: '3RVS01031Z',
        vendor: 'Third Reality',
        description: 'Zigbee vibration sensor',
        fromZigbee: [fromZigbee_1.default.ias_vibration_alarm_1, fromZigbee_1.default.battery, fzLocal.thirdreality_acceleration],
        toZigbee: [],
        ota: ota.zigbeeOTA,
        exposes: [e.vibration(), e.battery_low(), e.battery(), e.battery_voltage(), e.x_axis(), e.y_axis(), e.z_axis()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await endpoint.read('genPowerCfg', ['batteryPercentageRemaining']);
            device.powerSource = 'Battery';
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rVirationSpecialcluster', {
                ID: 0xfff1,
                manufacturerCode: 0x1233,
                attributes: {
                    coolDownTime: { ID: 0x0004, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    xAxis: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    yAxis: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    zAxis: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
    {
        zigbeeModel: ['3RSNL02043Z'],
        model: '3RSNL02043Z',
        vendor: 'Third Reality',
        description: 'Zigbee multi-function night light',
        ota: ota.zigbeeOTA,
        extend: [
            (0, modernExtend_1.light)({ color: true }),
            (0, modernExtend_1.deviceAddCustomCluster)('r3Specialcluster', {
                ID: 0xfc00,
                manufacturerCode: 0x130d,
                attributes: {
                    coldDownTime: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    localRoutinTime: { ID: 0x0004, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    luxThreshold: { ID: 0x0005, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
        fromZigbee: [fzLocal.thirdreality_private_motion_sensor, fromZigbee_1.default.illuminance, fromZigbee_1.default.ias_occupancy_alarm_1_report],
        exposes: [e.occupancy(), e.illuminance(), e.illuminance_lux().withUnit('lx')],
        configure: async (device, coordinatorEndpoint) => {
            device.powerSource = 'Mains (single phase)';
            device.save();
        },
    },
    {
        zigbeeModel: ['3RCB01057Z'],
        model: '3RCB01057Z',
        vendor: 'Third Reality',
        description: 'Zigbee color lights',
        ota: ota.zigbeeOTA,
        extend: [(0, modernExtend_1.light)({ colorTemp: { range: [154, 500] }, color: { modes: ['xy', 'hs'] } })],
    },
    {
        zigbeeModel: ['3RSPE01044BZ'],
        model: '3RSPE01044BZ',
        vendor: 'Third Reality',
        description: 'Zigbee / BLE smart plug with power',
        fromZigbee: [fromZigbee_1.default.on_off, fromZigbee_1.default.electrical_measurement, fromZigbee_1.default.metering, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.on_off, toZigbee_1.default.power_on_behavior],
        ota: ota.zigbeeOTA,
        exposes: [e.switch(), e.power_on_behavior(), e.ac_frequency(), e.power(), e.power_factor(), e.energy(), e.current(), e.voltage()],
        configure: async (device, coordinatorEndpoint) => {
            const endpoint = device.getEndpoint(1);
            await reporting.bind(endpoint, coordinatorEndpoint, ['genOnOff', 'haElectricalMeasurement', 'seMetering']);
            await endpoint.read('haElectricalMeasurement', ['acPowerMultiplier', 'acPowerDivisor']);
            await reporting.onOff(endpoint);
            await reporting.activePower(endpoint, { change: 10 });
            await reporting.rmsCurrent(endpoint, { change: 50 });
            await reporting.rmsVoltage(endpoint, { change: 5 });
            await reporting.readMeteringMultiplierDivisor(endpoint);
            endpoint.saveClusterAttributeKeyValue('seMetering', { divisor: 3600000, multiplier: 1 });
            endpoint.saveClusterAttributeKeyValue('haElectricalMeasurement', {
                acVoltageMultiplier: 1,
                acVoltageDivisor: 10,
                acCurrentMultiplier: 1,
                acCurrentDivisor: 1000,
                acPowerMultiplier: 1,
                acPowerDivisor: 10,
            });
            device.save();
        },
        extend: [
            (0, modernExtend_1.deviceAddCustomCluster)('3rPlugE2Specialcluster', {
                ID: 0xff03,
                manufacturerCode: 0x1233,
                attributes: {
                    resetSummationDelivered: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    onToOffDelay: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                    offToOnDelay: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=third_reality.js.map