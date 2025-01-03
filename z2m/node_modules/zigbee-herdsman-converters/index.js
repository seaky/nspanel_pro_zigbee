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
exports.setLogger = exports.definitions = exports.getConfigureKey = exports.ota = exports.fromZigbee = exports.toZigbee = void 0;
exports.postProcessConvertedFromZigbeeMessage = postProcessConvertedFromZigbeeMessage;
exports.addDefinition = addDefinition;
exports.findByDevice = findByDevice;
exports.findDefinition = findDefinition;
exports.generateExternalDefinitionSource = generateExternalDefinitionSource;
exports.findByModel = findByModel;
exports.onEvent = onEvent;
const assert_1 = __importDefault(require("assert"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const fromZigbee_1 = __importDefault(require("./converters/fromZigbee"));
exports.fromZigbee = fromZigbee_1.default;
const toZigbee_1 = __importDefault(require("./converters/toZigbee"));
exports.toZigbee = toZigbee_1.default;
const devices_1 = __importDefault(require("./devices"));
const configureKey = __importStar(require("./lib/configureKey"));
const exposesLib = __importStar(require("./lib/exposes"));
const exposes_1 = require("./lib/exposes");
const generateDefinition_1 = require("./lib/generateDefinition");
const logger = __importStar(require("./lib/logger"));
const ota = __importStar(require("./lib/ota"));
exports.ota = ota;
const utils = __importStar(require("./lib/utils"));
const NS = 'zhc';
exports.getConfigureKey = configureKey.getConfigureKey;
// key: zigbeeModel, value: array of definitions (most of the times 1)
const lookup = new Map();
exports.definitions = [];
function arrayEquals(as, bs) {
    if (as.length !== bs.length)
        return false;
    for (const a of as)
        if (!bs.includes(a))
            return false;
    return true;
}
function addToLookup(zigbeeModel, definition) {
    zigbeeModel = zigbeeModel ? zigbeeModel.toLowerCase() : null;
    if (!lookup.has(zigbeeModel)) {
        lookup.set(zigbeeModel, []);
    }
    if (!lookup.get(zigbeeModel).includes(definition)) {
        lookup.get(zigbeeModel).splice(0, 0, definition);
    }
}
function getFromLookup(zigbeeModel) {
    zigbeeModel = zigbeeModel ? zigbeeModel.toLowerCase() : null;
    if (lookup.has(zigbeeModel)) {
        return lookup.get(zigbeeModel);
    }
    zigbeeModel = zigbeeModel ? zigbeeModel.replace(/\0(.|\n)*$/g, '').trim() : null;
    return lookup.get(zigbeeModel);
}
const converterRequiredFields = {
    model: 'String',
    vendor: 'String',
    description: 'String',
    fromZigbee: 'Array',
    toZigbee: 'Array',
};
function validateDefinition(definition) {
    for (const [field, expectedType] of Object.entries(converterRequiredFields)) {
        // @ts-expect-error ignore
        assert_1.default.notStrictEqual(null, definition[field], `Converter field ${field} is null`);
        // @ts-expect-error ignore
        assert_1.default.notStrictEqual(undefined, definition[field], `Converter field ${field} is undefined`);
        // @ts-expect-error ignore
        const msg = `Converter field ${field} expected type doenst match to ${definition[field]}`;
        // @ts-expect-error ignore
        assert_1.default.strictEqual(definition[field].constructor.name, expectedType, msg);
    }
    assert_1.default.ok(Array.isArray(definition.exposes) || typeof definition.exposes === 'function', 'Exposes incorrect');
}
function processExtensions(definition) {
    if ('extend' in definition) {
        if (!Array.isArray(definition.extend)) {
            assert_1.default.fail(`'${definition.model}' has legacy extend which is not supported anymore`);
        }
        // Modern extend, merges properties, e.g. when both extend and definition has toZigbee, toZigbee will be combined
        let { 
        // eslint-disable-next-line prefer-const
        extend, toZigbee, fromZigbee, 
        // eslint-disable-next-line prefer-const
        exposes: definitionExposes, meta, endpoint, ota, 
        // eslint-disable-next-line prefer-const
        configure: definitionConfigure, 
        // eslint-disable-next-line prefer-const
        onEvent: definitionOnEvent, 
        // eslint-disable-next-line prefer-const
        ...definitionWithoutExtend } = definition;
        // Exposes can be an Expose[] or DefinitionExposesFunction. In case it's only Expose[] we return an array
        // Otherwise return a DefinitionExposesFunction.
        const allExposesIsExposeOnly = (allExposes) => {
            return !allExposes.find((e) => typeof e === 'function');
        };
        let allExposes = [];
        if (definitionExposes) {
            if (typeof definitionExposes === 'function') {
                allExposes.push(definitionExposes);
            }
            else {
                allExposes.push(...definitionExposes);
            }
        }
        toZigbee = [...(toZigbee ?? [])];
        fromZigbee = [...(fromZigbee ?? [])];
        const configures = definitionConfigure ? [definitionConfigure] : [];
        const onEvents = definitionOnEvent ? [definitionOnEvent] : [];
        for (const ext of extend) {
            if (!ext.isModernExtend) {
                assert_1.default.fail(`'${definition.model}' has legacy extend in modern extend`);
            }
            if (ext.toZigbee)
                toZigbee.push(...ext.toZigbee);
            if (ext.fromZigbee)
                fromZigbee.push(...ext.fromZigbee);
            if (ext.exposes)
                allExposes.push(...ext.exposes);
            if (ext.meta)
                meta = { ...ext.meta, ...meta };
            // Filter `undefined` configures, e.g. returned by setupConfigureForReporting.
            if (ext.configure)
                configures.push(...ext.configure.filter((c) => c));
            if (ext.onEvent)
                onEvents.push(ext.onEvent);
            if (ext.ota) {
                if (ota && ext.ota !== ota) {
                    assert_1.default.fail(`'${definition.model}' has multiple 'ota', this is not allowed`);
                }
                ota = ext.ota;
            }
            if (ext.endpoint) {
                if (endpoint) {
                    assert_1.default.fail(`'${definition.model}' has multiple 'endpoint', this is not allowed`);
                }
                endpoint = ext.endpoint;
            }
        }
        // Filtering out action exposes to combine them one
        const actionExposes = allExposes.filter((e) => typeof e !== 'function' && e.name === 'action');
        allExposes = allExposes.filter((e) => e.name !== 'action');
        if (actionExposes.length > 0) {
            const actions = [];
            for (const expose of actionExposes) {
                if (expose instanceof exposes_1.Enum) {
                    for (const action of expose.values) {
                        actions.push(action.toString());
                    }
                }
            }
            const uniqueActions = actions.filter((value, index, array) => array.indexOf(value) === index);
            allExposes.push(exposesLib.presets.action(uniqueActions));
        }
        let configure = null;
        if (configures.length !== 0) {
            configure = async (device, coordinatorEndpoint, configureDefinition) => {
                for (const func of configures) {
                    await func(device, coordinatorEndpoint, configureDefinition);
                }
            };
        }
        let onEvent = null;
        if (onEvents.length !== 0) {
            onEvent = async (type, data, device, settings, state) => {
                for (const func of onEvents) {
                    await func(type, data, device, settings, state);
                }
            };
        }
        // In case there is a function in allExposes, return a function, otherwise just an array.
        let exposes;
        if (allExposesIsExposeOnly(allExposes)) {
            exposes = allExposes;
        }
        else {
            exposes = (device, options) => {
                const result = [];
                for (const item of allExposes) {
                    if (typeof item === 'function') {
                        result.push(...item(device, options));
                    }
                    else {
                        result.push(item);
                    }
                }
                return result;
            };
        }
        definition = { toZigbee, fromZigbee, exposes, meta, configure, endpoint, onEvent, ota, ...definitionWithoutExtend };
    }
    return definition;
}
function prepareDefinition(definition) {
    definition = processExtensions(definition);
    definition.toZigbee.push(toZigbee_1.default.scene_store, toZigbee_1.default.scene_recall, toZigbee_1.default.scene_add, toZigbee_1.default.scene_remove, toZigbee_1.default.scene_remove_all, toZigbee_1.default.scene_rename, toZigbee_1.default.read, toZigbee_1.default.write, toZigbee_1.default.command, toZigbee_1.default.factory_reset, toZigbee_1.default.zcl_command);
    if (definition.exposes && Array.isArray(definition.exposes) && !definition.exposes.find((e) => e.name === 'linkquality')) {
        definition.exposes = definition.exposes.concat([exposesLib.presets.linkquality()]);
    }
    validateDefinition(definition);
    // Add all the options
    if (!definition.options)
        definition.options = [];
    const optionKeys = definition.options.map((o) => o.name);
    // Add calibration/precision options based on expose
    for (const expose of Array.isArray(definition.exposes) ? definition.exposes : definition.exposes(null, null)) {
        if (!optionKeys.includes(expose.name) &&
            utils.isNumericExpose(expose) &&
            expose.name in utils.calibrateAndPrecisionRoundOptionsDefaultPrecision) {
            // Battery voltage is not calibratable
            if (expose.name === 'voltage' && expose.unit === 'mV')
                continue;
            const type = utils.calibrateAndPrecisionRoundOptionsIsPercentual(expose.name) ? 'percentual' : 'absolute';
            definition.options.push(exposesLib.options.calibration(expose.name, type));
            if (utils.calibrateAndPrecisionRoundOptionsDefaultPrecision[expose.name] !== 0) {
                definition.options.push(exposesLib.options.precision(expose.name));
            }
            optionKeys.push(expose.name);
        }
    }
    for (const converter of [...definition.toZigbee, ...definition.fromZigbee]) {
        if (converter.options) {
            const options = typeof converter.options === 'function' ? converter.options(definition) : converter.options;
            for (const option of options) {
                if (!optionKeys.includes(option.name)) {
                    definition.options.push(option);
                    optionKeys.push(option.name);
                }
            }
        }
    }
    return definition;
}
function postProcessConvertedFromZigbeeMessage(definition, payload, options) {
    // Apply calibration/precision options
    for (const [key, value] of Object.entries(payload)) {
        const definitionExposes = Array.isArray(definition.exposes) ? definition.exposes : definition.exposes(null, null);
        const expose = definitionExposes.find((e) => e.property === key);
        if (expose?.name in utils.calibrateAndPrecisionRoundOptionsDefaultPrecision && value !== '' && utils.isNumber(value)) {
            try {
                payload[key] = utils.calibrateAndPrecisionRoundOptions(value, options, expose.name);
            }
            catch (error) {
                logger.logger.error(`Failed to apply calibration to '${expose.name}': ${error.message}`, NS);
            }
        }
    }
}
function addDefinition(definition) {
    definition = prepareDefinition(definition);
    exports.definitions.splice(0, 0, definition);
    if ('fingerprint' in definition) {
        for (const fingerprint of definition.fingerprint) {
            addToLookup(fingerprint.modelID, definition);
        }
    }
    if ('zigbeeModel' in definition) {
        for (const zigbeeModel of definition.zigbeeModel) {
            addToLookup(zigbeeModel, definition);
        }
    }
}
for (const definition of devices_1.default) {
    addDefinition(definition);
}
async function findByDevice(device, generateForUnknown = false) {
    let definition = await findDefinition(device, generateForUnknown);
    if (definition && definition.whiteLabel) {
        const match = definition.whiteLabel.find((w) => 'fingerprint' in w && w.fingerprint.find((f) => isFingerprintMatch(f, device)));
        if (match) {
            definition = {
                ...definition,
                model: match.model,
                vendor: match.vendor,
                description: match.description || definition.description,
            };
        }
    }
    return definition;
}
async function findDefinition(device, generateForUnknown = false) {
    if (!device) {
        return null;
    }
    const candidates = getFromLookup(device.modelID);
    if (!candidates) {
        if (!generateForUnknown || device.type === 'Coordinator') {
            return null;
        }
        // Do not add this definition to cache,
        // as device configuration might change.
        return prepareDefinition((await (0, generateDefinition_1.generateDefinition)(device)).definition);
    }
    else if (candidates.length === 1 && candidates[0].zigbeeModel) {
        return candidates[0];
    }
    else {
        // First try to match based on fingerprint, return the first matching one.
        const fingerprintMatch = { priority: null, definition: null };
        for (const candidate of candidates) {
            if (candidate.fingerprint) {
                for (const fingerprint of candidate.fingerprint) {
                    const priority = fingerprint.priority ?? 0;
                    if (isFingerprintMatch(fingerprint, device) && (!fingerprintMatch.definition || priority > fingerprintMatch.priority)) {
                        fingerprintMatch.definition = candidate;
                        fingerprintMatch.priority = priority;
                    }
                }
            }
        }
        if (fingerprintMatch.definition) {
            return fingerprintMatch.definition;
        }
        // Match based on fingerprint failed, return first matching definition based on zigbeeModel
        for (const candidate of candidates) {
            if (candidate.zigbeeModel && candidate.zigbeeModel.includes(device.modelID)) {
                return candidate;
            }
        }
    }
    return null;
}
async function generateExternalDefinitionSource(device) {
    return (await (0, generateDefinition_1.generateDefinition)(device)).externalDefinitionSource;
}
function isFingerprintMatch(fingerprint, device) {
    let match = (!fingerprint.applicationVersion || device.applicationVersion === fingerprint.applicationVersion) &&
        (!fingerprint.manufacturerID || device.manufacturerID === fingerprint.manufacturerID) &&
        (!fingerprint.type || device.type === fingerprint.type) &&
        (!fingerprint.dateCode || device.dateCode === fingerprint.dateCode) &&
        (!fingerprint.hardwareVersion || device.hardwareVersion === fingerprint.hardwareVersion) &&
        (!fingerprint.manufacturerName || device.manufacturerName === fingerprint.manufacturerName) &&
        (!fingerprint.modelID || device.modelID === fingerprint.modelID) &&
        (!fingerprint.powerSource || device.powerSource === fingerprint.powerSource) &&
        (!fingerprint.softwareBuildID || device.softwareBuildID === fingerprint.softwareBuildID) &&
        (!fingerprint.stackVersion || device.stackVersion === fingerprint.stackVersion) &&
        (!fingerprint.zclVersion || device.zclVersion === fingerprint.zclVersion) &&
        (!fingerprint.ieeeAddr || device.ieeeAddr.match(fingerprint.ieeeAddr)) &&
        (!fingerprint.endpoints ||
            arrayEquals(device.endpoints.map((e) => e.ID), fingerprint.endpoints.map((e) => e.ID)));
    if (match && fingerprint.endpoints) {
        for (const fingerprintEndpoint of fingerprint.endpoints) {
            const deviceEndpoint = device.getEndpoint(fingerprintEndpoint.ID);
            match =
                match &&
                    (!fingerprintEndpoint.deviceID || deviceEndpoint.deviceID === fingerprintEndpoint.deviceID) &&
                    (!fingerprintEndpoint.profileID || deviceEndpoint.profileID === fingerprintEndpoint.profileID) &&
                    (!fingerprintEndpoint.inputClusters || arrayEquals(deviceEndpoint.inputClusters, fingerprintEndpoint.inputClusters)) &&
                    (!fingerprintEndpoint.outputClusters || arrayEquals(deviceEndpoint.outputClusters, fingerprintEndpoint.outputClusters));
        }
    }
    return match;
}
function findByModel(model) {
    /*
    Search device description by definition model name.
    Useful when redefining, expanding device descriptions in external converters.
    */
    model = model.toLowerCase();
    return exports.definitions.find((definition) => {
        const whiteLabelMatch = definition.whiteLabel && definition.whiteLabel.find((dd) => dd.model.toLowerCase() === model);
        return definition.model.toLowerCase() == model || whiteLabelMatch;
    });
}
// Can be used to handle events for devices which are not fully paired yet (no modelID).
// Example usecase: https://github.com/Koenkk/zigbee2mqtt/issues/2399#issuecomment-570583325
async function onEvent(type, data, device, meta) {
    // support Legrand security protocol
    // when pairing, a powered device will send a read frame to every device on the network
    // it expects at least one answer. The payload contains the number of seconds
    // since when the device is powered. If the value is too high, it will leave & not pair
    // 23 works, 200 doesn't
    if (device.manufacturerID === zigbee_herdsman_1.Zcl.ManufacturerCode.LEGRAND_GROUP && !device.customReadResponse) {
        device.customReadResponse = (frame, endpoint) => {
            if (frame.isCluster('genBasic') && frame.payload.find((i) => i.attrId === 61440)) {
                const options = { manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.LEGRAND_GROUP, disableDefaultResponse: true };
                const payload = { 0xf000: { value: 23, type: 35 } };
                endpoint.readResponse('genBasic', frame.header.transactionSequenceNumber, payload, options).catch((e) => {
                    logger.logger.warning(`Legrand security read response failed: ${e}`, NS);
                });
                return true;
            }
            return false;
        };
    }
    // Aqara feeder C1 polls the time during the interview, need to send back the local time instead of the UTC.
    // The device.definition has not yet been set - therefore the device.definition.onEvent method does not work.
    if (device.modelID === 'aqara.feeder.acn001' && !device.customReadResponse) {
        device.customReadResponse = (frame, endpoint) => {
            if (frame.isCluster('genTime')) {
                const oneJanuary2000 = new Date('January 01, 2000 00:00:00 UTC+00:00').getTime();
                const secondsUTC = Math.round((new Date().getTime() - oneJanuary2000) / 1000);
                const secondsLocal = secondsUTC - new Date().getTimezoneOffset() * 60;
                endpoint.readResponse('genTime', frame.header.transactionSequenceNumber, { time: secondsLocal }).catch((e) => {
                    logger.logger.warning(`ZNCWWSQ01LM custom time response failed: ${e}`, NS);
                });
                return true;
            }
            return false;
        };
    }
}
exports.setLogger = logger.setLogger;
//# sourceMappingURL=index.js.map