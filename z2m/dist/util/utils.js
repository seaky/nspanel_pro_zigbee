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
exports.isNumericExpose = isNumericExpose;
exports.assertEnumExpose = assertEnumExpose;
exports.assertNumericExpose = assertNumericExpose;
exports.assertBinaryExpose = assertBinaryExpose;
exports.isEnumExpose = isEnumExpose;
exports.isBinaryExpose = isBinaryExpose;
exports.isLightExpose = isLightExpose;
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const es6_1 = __importDefault(require("fast-deep-equal/es6"));
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const data_1 = __importDefault(require("./data"));
const BASE64_IMAGE_REGEX = new RegExp(`data:image/(?<extension>.+);base64,(?<data>.+)`);
function pad(num) {
    const norm = Math.floor(Math.abs(num));
    return (norm < 10 ? '0' : '') + norm;
}
// construct a local ISO8601 string (instead of UTC-based)
// Example:
//  - ISO8601 (UTC) = 2019-03-01T15:32:45.941+0000
//  - ISO8601 (local) = 2019-03-01T16:32:45.941+0100 (for timezone GMT+1)
function toLocalISOString(date) {
    const tzOffset = -date.getTimezoneOffset();
    const plusOrMinus = tzOffset >= 0 ? '+' : '-';
    return (date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds()) +
        plusOrMinus +
        pad(tzOffset / 60) +
        ':' +
        pad(tzOffset % 60));
}
function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
async function getZigbee2MQTTVersion(includeCommitHash = true) {
    const git = await Promise.resolve().then(() => __importStar(require('git-last-commit')));
    const packageJSON = await Promise.resolve(`${'../..' + '/package.json'}`).then(s => __importStar(require(s)));
    if (!includeCommitHash) {
        return { version: packageJSON.version, commitHash: undefined };
    }
    return await new Promise((resolve) => {
        const version = packageJSON.version;
        git.getLastCommit((err, commit) => {
            let commitHash = undefined;
            if (err) {
                try {
                    commitHash = node_fs_1.default.readFileSync(node_path_1.default.join(__dirname, '..', '..', 'dist', '.hash'), 'utf-8');
                    /* v8 ignore start */
                }
                catch {
                    commitHash = 'unknown';
                }
                /* v8 ignore stop */
            }
            else {
                commitHash = commit.shortHash;
            }
            commitHash = commitHash.trim();
            resolve({ commitHash, version });
        });
    });
}
async function getDependencyVersion(depend) {
    const packageJsonPath = require.resolve(`${depend}/package.json`);
    const version = JSON.parse(node_fs_1.default.readFileSync(packageJsonPath, 'utf8')).version;
    return { version };
}
function formatDate(time, type) {
    if (type === 'ISO_8601')
        return new Date(time).toISOString();
    else if (type === 'ISO_8601_local')
        return toLocalISOString(new Date(time));
    else if (type === 'epoch')
        return time;
    else {
        // relative
        return (0, humanize_duration_1.default)(Date.now() - time, { language: 'en', largest: 2, round: true }) + ' ago';
    }
}
function objectIsEmpty(object) {
    // much faster than checking `Object.keys(object).length`
    for (const k in object)
        return false;
    return true;
}
function objectHasProperties(object, properties) {
    for (const property of properties) {
        if (object[property] === undefined) {
            return false;
        }
    }
    return true;
}
function equalsPartial(object, expected) {
    for (const [key, value] of Object.entries(expected)) {
        if (!(0, es6_1.default)(object[key], value)) {
            return false;
        }
    }
    return true;
}
function getObjectProperty(object, key, defaultValue) {
    return object && object[key] !== undefined ? object[key] : defaultValue;
}
function getResponse(request, data, error) {
    if (error !== undefined) {
        const response = {
            data: {}, // always return an empty `data` payload on error
            status: 'error',
            error: error,
        };
        if (typeof request === 'object' && request.transaction !== undefined) {
            response.transaction = request.transaction;
        }
        return response;
    }
    else {
        const response = {
            data, // valid from error check
            status: 'ok',
        };
        if (typeof request === 'object' && request.transaction !== undefined) {
            response.transaction = request.transaction;
        }
        return response;
    }
}
function parseJSON(value, fallback) {
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
/**
 * Delete all keys from passed object that have null/undefined values.
 *
 * @param {KeyValue} obj Object to process (in-place)
 * @param {string[]} [ignoreKeys] Recursively ignore these keys in the object (keep null/undefined values).
 */
function removeNullPropertiesFromObject(obj, ignoreKeys = []) {
    for (const key of Object.keys(obj)) {
        if (ignoreKeys.includes(key)) {
            continue;
        }
        const value = obj[key];
        if (value == null) {
            delete obj[key];
        }
        else if (typeof value === 'object') {
            removeNullPropertiesFromObject(value, ignoreKeys);
        }
    }
}
function toNetworkAddressHex(value) {
    const hex = value.toString(16);
    return `0x${'0'.repeat(4 - hex.length)}${hex}`;
}
function charRange(start, stop) {
    const result = [];
    for (let idx = start.charCodeAt(0), end = stop.charCodeAt(0); idx <= end; ++idx) {
        result.push(idx);
    }
    return result;
}
const controlCharacters = [...charRange('\u0000', '\u001F'), ...charRange('\u007f', '\u009F'), ...charRange('\ufdd0', '\ufdef')];
function containsControlCharacter(str) {
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        if (controlCharacters.includes(ch) || [0xfffe, 0xffff].includes(ch & 0xffff)) {
            return true;
        }
    }
    return false;
}
function getAllFiles(path_) {
    const result = [];
    for (let item of node_fs_1.default.readdirSync(path_)) {
        item = node_path_1.default.join(path_, item);
        if (node_fs_1.default.lstatSync(item).isFile()) {
            result.push(item);
        }
        else {
            result.push(...getAllFiles(item));
        }
    }
    return result;
}
function validateFriendlyName(name, throwFirstError = false) {
    const errors = [];
    if (name.length === 0)
        errors.push(`friendly_name must be at least 1 char long`);
    if (name.endsWith('/') || name.startsWith('/'))
        errors.push(`friendly_name is not allowed to end or start with /`);
    if (containsControlCharacter(name))
        errors.push(`friendly_name is not allowed to contain control char`);
    if (name.match(/.*\/\d*$/))
        errors.push(`Friendly name cannot end with a "/DIGIT" ('${name}')`);
    if (name.includes('#') || name.includes('+')) {
        errors.push(`MQTT wildcard (+ and #) not allowed in friendly_name ('${name}')`);
    }
    if (throwFirstError && errors.length) {
        throw new Error(errors[0]);
    }
    return errors;
}
function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
function sanitizeImageParameter(parameter) {
    const replaceByDash = [/\?/g, /&/g, /[^a-z\d\- _./:]/gi];
    let sanitized = parameter;
    replaceByDash.forEach((r) => (sanitized = sanitized.replace(r, '-')));
    return sanitized;
}
function isAvailabilityEnabledForEntity(entity, settings) {
    if (entity.isDevice() && entity.options.disabled) {
        return false;
    }
    if (entity.isGroup()) {
        return !entity.membersDevices().some((d) => !isAvailabilityEnabledForEntity(d, settings));
    }
    if (entity.options.availability != null) {
        return !!entity.options.availability;
    }
    if (!settings.availability.enabled) {
        return false;
    }
    return true;
}
function isZHEndpoint(obj) {
    return obj?.constructor.name.toLowerCase() === 'endpoint';
}
function flatten(arr) {
    return [].concat(...arr);
}
function arrayUnique(arr) {
    return [...new Set(arr)];
}
function isZHGroup(obj) {
    return obj?.constructor.name.toLowerCase() === 'group';
}
const hours = (hours) => 1000 * 60 * 60 * hours;
const minutes = (minutes) => 1000 * 60 * minutes;
const seconds = (seconds) => 1000 * seconds;
async function publishLastSeen(data, settings, allowMessageEmitted, publishEntityState) {
    /**
     * Prevent 2 MQTT publishes when 1 message event is received;
     * - In case reason == messageEmitted, receive.ts will only call this when it did not publish a
     *      message based on the received zigbee message. In this case allowMessageEmitted has to be true.
     * - In case reason !== messageEmitted, controller.ts will call this based on the zigbee-herdsman
     *      lastSeenChanged event.
     */
    const allow = data.reason !== 'messageEmitted' || (data.reason === 'messageEmitted' && allowMessageEmitted);
    if (settings.advanced.last_seen && settings.advanced.last_seen !== 'disable' && allow) {
        await publishEntityState(data.device, {}, 'lastSeenChanged');
    }
}
function filterProperties(filter, data) {
    if (filter) {
        for (const property of Object.keys(data)) {
            if (filter.find((p) => property.match(`^${p}$`))) {
                delete data[property];
            }
        }
    }
}
function isNumericExpose(expose) {
    return expose?.type === 'numeric';
}
function assertEnumExpose(expose) {
    (0, node_assert_1.default)(expose?.type === 'enum');
}
function assertNumericExpose(expose) {
    (0, node_assert_1.default)(expose?.type === 'numeric');
}
function assertBinaryExpose(expose) {
    (0, node_assert_1.default)(expose?.type === 'binary');
}
function isEnumExpose(expose) {
    return expose?.type === 'enum';
}
function isBinaryExpose(expose) {
    return expose?.type === 'binary';
}
function isLightExpose(expose) {
    return expose.type === 'light';
}
function getScenes(entity) {
    const scenes = {};
    const endpoints = isZHEndpoint(entity) ? [entity] : entity.members;
    const groupID = isZHEndpoint(entity) ? 0 : entity.groupID;
    for (const endpoint of endpoints) {
        for (const [key, data] of Object.entries(endpoint.meta?.scenes || {})) {
            const split = key.split('_');
            const sceneID = parseInt(split[0], 10);
            const sceneGroupID = parseInt(split[1], 10);
            if (sceneGroupID === groupID) {
                scenes[sceneID] = { id: sceneID, name: data.name || `Scene ${sceneID}` };
            }
        }
    }
    return Object.values(scenes);
}
function deviceNotCoordinator(device) {
    return device.type !== 'Coordinator';
}
function matchBase64File(value) {
    if (value !== undefined) {
        const match = value.match(BASE64_IMAGE_REGEX);
        if (match) {
            (0, node_assert_1.default)(match.groups?.extension && match.groups?.data);
            return { extension: match.groups.extension, data: match.groups.data };
        }
    }
    return false;
}
function saveBase64DeviceIcon(base64Match) {
    const md5Hash = node_crypto_1.default.createHash('md5').update(base64Match.data).digest('hex');
    const fileSettings = `device_icons/${md5Hash}.${base64Match.extension}`;
    const file = node_path_1.default.join(data_1.default.getPath(), fileSettings);
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(file), { recursive: true });
    node_fs_1.default.writeFileSync(file, base64Match.data, { encoding: 'base64' });
    return fileSettings;
}
/* v8 ignore next */
const noop = () => { };
exports.default = {
    matchBase64File,
    saveBase64DeviceIcon,
    capitalize,
    getZigbee2MQTTVersion,
    getDependencyVersion,
    formatDate,
    objectIsEmpty,
    objectHasProperties,
    equalsPartial,
    getObjectProperty,
    getResponse,
    parseJSON,
    removeNullPropertiesFromObject,
    toNetworkAddressHex,
    isZHEndpoint,
    isZHGroup,
    hours,
    minutes,
    seconds,
    validateFriendlyName,
    sleep,
    sanitizeImageParameter,
    isAvailabilityEnabledForEntity,
    publishLastSeen,
    getAllFiles,
    filterProperties,
    flatten,
    arrayUnique,
    getScenes,
    deviceNotCoordinator,
    noop,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNVQSwwQ0FFQztBQUVELDRDQUVDO0FBRUQsa0RBRUM7QUFFRCxnREFFQztBQUVELG9DQUVDO0FBRUQsd0NBRUM7QUFFRCxzQ0FFQztBQTdWRCw4REFBaUM7QUFDakMsOERBQWlDO0FBQ2pDLHNEQUF5QjtBQUN6QiwwREFBNkI7QUFFN0IsOERBQXlDO0FBQ3pDLDBFQUFpRDtBQUVqRCxrREFBMEI7QUFFMUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBRXhGLFNBQVMsR0FBRyxDQUFDLEdBQVc7SUFDcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkMsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pDLENBQUM7QUFFRCwwREFBMEQ7QUFDMUQsV0FBVztBQUNYLGtEQUFrRDtBQUNsRCx5RUFBeUU7QUFDekUsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFVO0lBQ2hDLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0MsTUFBTSxXQUFXLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFOUMsT0FBTyxDQUNILElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDbEIsR0FBRztRQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLEdBQUc7UUFD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