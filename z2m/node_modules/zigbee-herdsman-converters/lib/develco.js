"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.develcoModernExtend = void 0;
const zigbee_herdsman_1 = require("zigbee-herdsman");
const exposes_1 = require("./exposes");
const modernExtend_1 = require("./modernExtend");
const manufacturerOptions = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO };
exports.develcoModernExtend = {
    addCustomClusterManuSpecificDevelcoGenBasic: () => (0, modernExtend_1.deviceAddCustomCluster)('genBasic', {
        ID: 0x0000,
        attributes: {
            develcoPrimarySwVersion: { ID: 0x8000, type: zigbee_herdsman_1.Zcl.DataType.OCTET_STR, manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO },
            develcoPrimaryHwVersion: { ID: 0x8020, type: zigbee_herdsman_1.Zcl.DataType.OCTET_STR, manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO },
            develcoLedControl: { ID: 0x8100, type: zigbee_herdsman_1.Zcl.DataType.BITMAP8, manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO },
        },
        commands: {},
        commandsResponse: {},
    }),
    addCustomClusterManuSpecificDevelcoAirQuality: () => (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificDevelcoAirQuality', {
        ID: 0xfc03,
        manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.DEVELCO,
        attributes: {
            measuredValue: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
            minMeasuredValue: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
            maxMeasuredValue: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
            resolution: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
        },
        commands: {},
        commandsResponse: {},
    }),
    readGenBasicPrimaryVersions: () => {
        /*
         * Develco (and there B2C brand Frient) do not use swBuildId
         *  The versions are stored in develcoPrimarySwVersion and develcoPrimaryHwVersion, we read them during configure.
         */
        const configure = [
            async (device, coordinatorEndpoint, definition) => {
                for (const ep of device.endpoints) {
                    if (ep.supportsInputCluster('genBasic')) {
                        try {
                            const data = await ep.read('genBasic', ['develcoPrimarySwVersion', 'develcoPrimaryHwVersion'], manufacturerOptions);
                            if (data.develcoPrimarySwVersion !== undefined) {
                                device.softwareBuildID = data.develcoPrimarySwVersion.join('.');
                            }
                            if (data.develcoPrimaryHwVersion !== undefined) {
                                device.hardwareVersion = data.develcoPrimaryHwVersion.join('.');
                            }
                            device.save();
                        }
                        catch {
                            /* catch timeouts of sleeping devices */
                        }
                        break;
                    }
                }
            },
        ];
        return { configure, isModernExtend: true };
    },
    voc: (args) => (0, modernExtend_1.numeric)({
        name: 'voc',
        cluster: 'manuSpecificDevelcoAirQuality',
        attribute: 'measuredValue',
        reporting: { min: '1_MINUTE', max: '1_HOUR', change: 10 },
        description: 'Measured VOC value',
        // from Sensirion_Gas_Sensors_SGP3x_TVOC_Concept.pdf
        // "The mean molar mass of this mixture is 110 g/mol and hence,
        // 1 ppb TVOC corresponds to 4.5 μg/m3."
        scale: (value, type) => {
            if (type === 'from') {
                return value * 4.5;
            }
            return value;
        },
        unit: 'µg/m³',
        access: 'STATE_GET',
        ...args,
    }),
    airQuality: () => {
        // NOTE: do not setup reporting, this is hanled by the voc() modernExtend
        const clusterName = 'manuSpecificDevelcoAirQuality';
        const attributeName = 'measuredValue';
        const propertyName = 'air_quality';
        const access = exposes_1.access.STATE;
        const expose = exposes_1.presets
            .enum('air_quality', access, ['excellent', 'good', 'moderate', 'poor', 'unhealthy', 'out_of_range', 'unknown'])
            .withDescription('Measured air quality');
        const fromZigbee = [
            {
                cluster: clusterName,
                type: ['attributeReport', 'readResponse'],
                convert: (model, msg, publish, options, meta) => {
                    if (msg.data[attributeName] !== undefined) {
                        const vocPpb = parseFloat(msg.data[attributeName]);
                        // from aqszb-110-technical-manual-air-quality-sensor-04-08-20.pdf page 6, section 2.2 voc
                        // this contains a ppb to level mapping table.
                        let airQuality;
                        if (vocPpb <= 65) {
                            airQuality = 'excellent';
                        }
                        else if (vocPpb <= 220) {
                            airQuality = 'good';
                        }
                        else if (vocPpb <= 660) {
                            airQuality = 'moderate';
                        }
                        else if (vocPpb <= 2200) {
                            airQuality = 'poor';
                        }
                        else if (vocPpb <= 5500) {
                            airQuality = 'unhealthy';
                        }
                        else if (vocPpb > 5500) {
                            airQuality = 'out_of_range';
                        }
                        else {
                            airQuality = 'unknown';
                        }
                        return { [propertyName]: airQuality };
                    }
                },
            },
        ];
        return { exposes: [expose], fromZigbee, isModernExtend: true };
    },
    batteryLowAA: () => {
        /*
         * Per the technical documentation for AQSZB-110:
         * To detect low battery the system can monitor the "BatteryVoltage" by setting up a reporting interval of every 12 hour.
         * When a voltage of 2.5V is measured the battery should be replaced.
         * Low batt LED indication–RED LED will blink twice every 60 second.
         *
         * Similar notes found in other 2x AA powered Develco devices like HMSZB-110 and MOSZB-140
         */
        const clusterName = 'genPowerCfg';
        const attributeName = 'BatteryVoltage';
        const propertyName = 'battery_low';
        const expose = exposes_1.presets.battery_low();
        const fromZigbee = [
            {
                cluster: clusterName,
                type: ['attributeReport', 'readResponse'],
                convert: (model, msg, publish, options, meta) => {
                    if (msg.data[attributeName] !== undefined && msg.data[attributeName] < 255) {
                        const voltage = parseInt(msg.data[attributeName]);
                        return { [propertyName]: voltage <= 25 };
                    }
                },
            },
        ];
        return { exposes: [expose], fromZigbee, isModernExtend: true };
    },
    temperature: (args) => (0, modernExtend_1.temperature)({
        valueIgnore: [0xffff, -0x8000],
        ...args,
    }),
    deviceTemperature: (args) => (0, modernExtend_1.deviceTemperature)({
        reporting: { min: '5_MINUTES', max: '1_HOUR', change: 2 }, // Device temperature reports with 2 degree change
        valueIgnore: [0xffff, -0x8000],
        ...args,
    }),
    currentSummation: (args) => (0, modernExtend_1.numeric)({
        name: 'current_summation',
        cluster: 'seMetering',
        attribute: 'develcoCurrentSummation',
        description: 'Current summation value sent to the display. e.g. 570 = 0,570 kWh',
        access: 'SET',
        valueMin: 0,
        valueMax: 268435455,
        ...args,
    }),
    pulseConfiguration: (args) => (0, modernExtend_1.numeric)({
        name: 'pulse_configuration',
        cluster: 'seMetering',
        attribute: 'develcoPulseConfiguration',
        description: 'Pulses per kwh. Default 1000 imp/kWh. Range 0 to 65535',
        access: 'ALL',
        valueMin: 0,
        valueMax: 65535,
        ...args,
    }),
};
//# sourceMappingURL=develco.js.map