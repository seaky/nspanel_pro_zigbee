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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefinition = generateDefinition;
const zh = __importStar(require("zigbee-herdsman/dist"));
const logger_1 = require("./logger");
const m = __importStar(require("./modernExtend"));
const philips_1 = require("./philips");
const utils_1 = require("./utils");
const NS = 'zhc:gendef';
// Generator allows to define instances of GeneratedExtend that have typed arguments to extender.
class Generator {
    extend;
    args;
    source;
    lib;
    constructor(args) {
        this.extend = args.extend;
        this.args = args.args;
        this.source = args.source;
        this.lib = args.lib;
    }
    getExtend() {
        return this.extend(this.args);
    }
    getSource() {
        let jsonArgs = JSON.stringify(this.args);
        if (!this.args || jsonArgs === '{}') {
            jsonArgs = '';
        }
        return this.source + '(' + jsonArgs + ')';
    }
}
function generateSource(definition, generatedExtend) {
    const imports = {};
    const importsDeduplication = new Set();
    generatedExtend.forEach((e) => {
        const lib = e.lib ?? 'modernExtend';
        if (!(lib in imports))
            imports[lib] = [];
        const importName = e.getSource().split('(')[0];
        if (!importsDeduplication.has(importName)) {
            importsDeduplication.add(importName);
            imports[lib].push(importName);
        }
    });
    const importsStr = Object.entries(imports)
        .map((e) => `const {${e[1].join(', ')}} = require('zigbee-herdsman-converters/lib/${e[0]}');`)
        .join('\n');
    return `${importsStr}

const definition = {
    zigbeeModel: ['${definition.zigbeeModel}'],
    model: '${definition.model}',
    vendor: '${definition.vendor}',
    description: 'Automatically generated definition',
    extend: [${generatedExtend.map((e) => e.getSource()).join(', ')}],
    meta: ${JSON.stringify(definition.meta || {})},
};

module.exports = definition;`;
}
async function generateDefinition(device) {
    // Map cluster to all endpoints that have this cluster.
    const mapClusters = (endpoint, clusters, clusterMap) => {
        for (const cluster of clusters) {
            if (!clusterMap.has(cluster.name)) {
                clusterMap.set(cluster.name, []);
            }
            const endpointsWithCluster = clusterMap.get(cluster.name);
            endpointsWithCluster.push(endpoint);
        }
    };
    const knownInputClusters = inputExtenders.map((ext) => ext[0]).flat(1);
    const knownOutputClusters = outputExtenders.map((ext) => ext[0]).flat(1);
    const inputClusterMap = new Map();
    const outputClusterMap = new Map();
    for (const endpoint of device.endpoints) {
        // Filter clusters to leave only the ones that we can generate extenders for.
        const inputClusters = endpoint.getInputClusters().filter((c) => knownInputClusters.find((known) => known === c.name));
        const outputClusters = endpoint.getOutputClusters().filter((c) => knownOutputClusters.find((known) => known === c.name));
        mapClusters(endpoint, inputClusters, inputClusterMap);
        mapClusters(endpoint, outputClusters, outputClusterMap);
    }
    // Generate extenders
    const usedExtenders = [];
    const generatedExtend = [];
    const addGenerators = async (clusterName, endpoints, extenders) => {
        const extender = extenders.find((e) => e[0].includes(clusterName));
        if (!extender || usedExtenders.includes(extender)) {
            return;
        }
        usedExtenders.push(extender);
        generatedExtend.push(...(await extender[1](device, endpoints)));
    };
    for (const [cluster, endpoints] of inputClusterMap) {
        await addGenerators(cluster, endpoints, inputExtenders);
    }
    for (const [cluster, endpoints] of outputClusterMap) {
        await addGenerators(cluster, endpoints, outputExtenders);
    }
    const extenders = generatedExtend.map((e) => e.getExtend());
    // Generated definition below will provide this.
    extenders.forEach((extender) => {
        extender.endpoint = undefined;
    });
    // Currently multiEndpoint is enabled if device has more then 1 endpoint.
    // It is possible to better check if device should be considered multiEndpoint
    // based, for example, on generator arguments(i.e. presence of "endpointNames"),
    // but this will be enough for now.
    const endpointsWithoutGreenPower = device.endpoints.filter((e) => e.ID !== 242);
    const multiEndpoint = endpointsWithoutGreenPower.length > 1;
    if (multiEndpoint) {
        const endpoints = {};
        for (const endpoint of endpointsWithoutGreenPower) {
            endpoints[endpoint.ID.toString()] = endpoint.ID;
        }
        // Add to beginning for better visibility.
        generatedExtend.unshift(new Generator({ extend: m.deviceEndpoints, args: { endpoints }, source: 'deviceEndpoints' }));
        extenders.unshift(generatedExtend[0].getExtend());
    }
    const definition = {
        zigbeeModel: [device.modelID],
        model: device.modelID ?? '',
        vendor: device.manufacturerName ?? '',
        description: 'Automatically generated definition',
        extend: extenders,
        generated: true,
    };
    if (multiEndpoint) {
        definition.meta = { multiEndpoint };
    }
    const externalDefinitionSource = generateSource(definition, generatedExtend);
    return { externalDefinitionSource, definition };
}
function stringifyEps(endpoints) {
    return endpoints.map((e) => e.ID.toString());
}
// This function checks if provided array of endpoints contain
// only first device endpoint, which is passed in as `firstEndpoint`.
function onlyFirstDeviceEnpoint(device, endpoints) {
    return endpoints.length === 1 && endpoints[0].ID === device.endpoints[0].ID;
}
// maybeEndpoints returns either `toExtend` if only first device endpoint is provided
// as `endpoints`, or `endpointNames` with `toExtend`.
// This allows to drop unnecessary `endpointNames` argument if it is not needed.
function maybeEndpointArgs(device, endpoints, toExtend) {
    if (onlyFirstDeviceEnpoint(device, endpoints)) {
        return toExtend;
    }
    return { endpointNames: stringifyEps(endpoints), ...toExtend };
}
// If generator will have endpoint argument - generator implementation
// should not provide it if only the first device endpoint is passed in.
// If multiple endpoints provided(maybe including the first device endpoint) -
// they all should be passed as an argument, where possible, to be explicit.
const inputExtenders = [
    [
        ['msTemperatureMeasurement'],
        async (d, eps) => [new Generator({ extend: m.temperature, args: maybeEndpointArgs(d, eps), source: 'temperature' })],
    ],
    [['msPressureMeasurement'], async (d, eps) => [new Generator({ extend: m.pressure, args: maybeEndpointArgs(d, eps), source: 'pressure' })]],
    [['msRelativeHumidity'], async (d, eps) => [new Generator({ extend: m.humidity, args: maybeEndpointArgs(d, eps), source: 'humidity' })]],
    [['msCO2'], async (d, eps) => [new Generator({ extend: m.co2, args: maybeEndpointArgs(d, eps), source: 'co2' })]],
    [['genPowerCfg'], async (d, eps) => [new Generator({ extend: m.battery, source: 'battery' })]],
    [['genOnOff', 'genLevelCtrl', 'lightingColorCtrl'], extenderOnOffLight],
    [['seMetering', 'haElectricalMeasurement'], extenderElectricityMeter],
    [['closuresDoorLock'], extenderLock],
    [
        ['msIlluminanceMeasurement'],
        async (d, eps) => [new Generator({ extend: m.illuminance, args: maybeEndpointArgs(d, eps), source: 'illuminance' })],
    ],
    [['msOccupancySensing'], async (d, eps) => [new Generator({ extend: m.occupancy, source: 'occupancy' })]],
    [
        ['ssIasZone'],
        async (d, eps) => [
            new Generator({
                extend: m.iasZoneAlarm,
                args: {
                    zoneType: 'generic',
                    zoneAttributes: ['alarm_1', 'alarm_2', 'tamper', 'battery_low'],
                },
                source: 'iasZoneAlarm',
            }),
        ],
    ],
    [['ssIasWd'], async (d, eps) => [new Generator({ extend: m.iasWarning, source: 'iasWarning' })]],
    [
        ['genDeviceTempCfg'],
        async (d, eps) => [new Generator({ extend: m.deviceTemperature, args: maybeEndpointArgs(d, eps), source: 'deviceTemperature' })],
    ],
    [['pm25Measurement'], async (d, eps) => [new Generator({ extend: m.pm25, args: maybeEndpointArgs(d, eps), source: 'pm25' })]],
    [['msFlowMeasurement'], async (d, eps) => [new Generator({ extend: m.flow, args: maybeEndpointArgs(d, eps), source: 'flow' })]],
    [['msSoilMoisture'], async (d, eps) => [new Generator({ extend: m.soilMoisture, args: maybeEndpointArgs(d, eps), source: 'soilMoisture' })]],
    [
        ['closuresWindowCovering'],
        async (d, eps) => [new Generator({ extend: m.windowCovering, args: { controls: ['lift', 'tilt'] }, source: 'windowCovering' })],
    ],
    [['genBinaryInput'], extenderBinaryInput],
    [['genBinaryOutput'], extenderBinaryOutput],
];
const outputExtenders = [
    [['genOnOff'], async (d, eps) => [new Generator({ extend: m.commandsOnOff, args: maybeEndpointArgs(d, eps), source: 'commandsOnOff' })]],
    [
        ['genLevelCtrl'],
        async (d, eps) => [new Generator({ extend: m.commandsLevelCtrl, args: maybeEndpointArgs(d, eps), source: 'commandsLevelCtrl' })],
    ],
    [
        ['lightingColorCtrl'],
        async (d, eps) => [new Generator({ extend: m.commandsColorCtrl, args: maybeEndpointArgs(d, eps), source: 'commandsColorCtrl' })],
    ],
    [
        ['closuresWindowCovering'],
        async (d, eps) => [new Generator({ extend: m.commandsWindowCovering, args: maybeEndpointArgs(d, eps), source: 'commandsWindowCovering' })],
    ],
];
async function extenderLock(device, endpoints) {
    // TODO: Support multiple endpoints
    if (endpoints.length > 1) {
        logger_1.logger.warning('extenderLock can accept only one endpoint', NS);
    }
    const endpoint = endpoints[0];
    const pinCodeCount = await (0, utils_1.getClusterAttributeValue)(endpoint, 'closuresDoorLock', 'numOfPinUsersSupported', 50);
    return [new Generator({ extend: m.lock, args: { pinCodeCount }, source: `lock` })];
}
async function extenderOnOffLight(device, endpoints) {
    const generated = [];
    const lightEndpoints = endpoints.filter((e) => e.supportsInputCluster('lightingColorCtrl') || e.supportsInputCluster('genLevelCtrl'));
    const onOffEndpoints = endpoints.filter((e) => lightEndpoints.findIndex((ep) => e.ID === ep.ID) === -1);
    if (onOffEndpoints.length !== 0) {
        let endpointNames = undefined;
        if (!onlyFirstDeviceEnpoint(device, endpoints)) {
            endpointNames = endpoints.map((e) => e.ID.toString());
        }
        generated.push(new Generator({ extend: m.onOff, args: { powerOnBehavior: false, endpointNames }, source: 'onOff' }));
    }
    for (const endpoint of lightEndpoints) {
        // In case read fails, support all features with 31
        let colorCapabilities = 0;
        if (endpoint.supportsInputCluster('lightingColorCtrl')) {
            colorCapabilities = await (0, utils_1.getClusterAttributeValue)(endpoint, 'lightingColorCtrl', 'colorCapabilities', 31);
        }
        const supportsHueSaturation = (colorCapabilities & (1 << 0)) > 0;
        const supportsEnhancedHueSaturation = (colorCapabilities & (1 << 1)) > 0;
        const supportsColorXY = (colorCapabilities & (1 << 3)) > 0;
        const supportsColorTemperature = (colorCapabilities & (1 << 4)) > 0;
        const args = {};
        if (supportsColorTemperature) {
            const minColorTemp = await (0, utils_1.getClusterAttributeValue)(endpoint, 'lightingColorCtrl', 'colorTempPhysicalMin', 150);
            const maxColorTemp = await (0, utils_1.getClusterAttributeValue)(endpoint, 'lightingColorCtrl', 'colorTempPhysicalMax', 500);
            args.colorTemp = { range: [minColorTemp, maxColorTemp] };
        }
        if (supportsColorXY) {
            args.color = true;
            if (supportsHueSaturation || supportsEnhancedHueSaturation) {
                args.color = {};
                if (supportsHueSaturation)
                    args.color.modes = ['xy', 'hs'];
                if (supportsEnhancedHueSaturation)
                    args.color.enhancedHue = true;
            }
        }
        if (endpoint.getDevice().manufacturerID === zh.Zcl.ManufacturerCode.SIGNIFY_NETHERLANDS_B_V) {
            generated.push(new Generator({ extend: philips_1.philipsLight, args, source: `philipsLight`, lib: 'philips' }));
        }
        else {
            generated.push(new Generator({ extend: m.light, args, source: `light` }));
        }
    }
    return generated;
}
async function extenderElectricityMeter(device, endpoints) {
    // TODO: Support multiple endpoints
    if (endpoints.length > 1) {
        logger_1.logger.warning('extenderElectricityMeter can accept only one endpoint', NS);
    }
    const endpoint = endpoints[0];
    const metering = endpoint.supportsInputCluster('seMetering');
    const electricalMeasurements = endpoint.supportsInputCluster('haElectricalMeasurement');
    const args = {};
    if (!metering || !electricalMeasurements) {
        args.cluster = metering ? 'metering' : 'electrical';
    }
    return [new Generator({ extend: m.electricityMeter, args, source: `electricityMeter` })];
}
async function extenderBinaryInput(device, endpoints) {
    const generated = [];
    for (const endpoint of endpoints) {
        const description = `binary_input_${endpoint.ID}`;
        const args = {
            name: await (0, utils_1.getClusterAttributeValue)(endpoint, 'genBinaryInput', 'description', description),
            cluster: 'genBinaryInput',
            attribute: 'presentValue',
            reporting: { attribute: 'presentValue', min: 'MIN', max: 'MAX', change: 1 },
            valueOn: ['ON', 1],
            valueOff: ['OFF', 0],
            description: description,
            access: 'STATE_GET',
            endpointName: `${endpoint.ID}`,
        };
        generated.push(new Generator({ extend: m.binary, args, source: 'binary' }));
    }
    return generated;
}
async function extenderBinaryOutput(device, endpoints) {
    const generated = [];
    for (const endpoint of endpoints) {
        const description = `binary_output_${endpoint.ID}`;
        const args = {
            name: await (0, utils_1.getClusterAttributeValue)(endpoint, 'genBinaryOutput', 'description', description),
            cluster: 'genBinaryOutput',
            attribute: 'presentValue',
            reporting: { attribute: 'presentValue', min: 'MIN', max: 'MAX', change: 1 },
            valueOn: ['ON', 1],
            valueOff: ['OFF', 0],
            description: description,
            access: 'ALL',
            endpointName: `${endpoint.ID}`,
        };
        generated.push(new Generator({ extend: m.binary, args, source: 'binary' }));
    }
    return generated;
}
//# sourceMappingURL=generateDefinition.js.map