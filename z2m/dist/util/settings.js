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
exports.testing = exports.defaults = exports.LOG_LEVELS = exports.CURRENT_VERSION = exports.schemaJson = void 0;
exports.validate = validate;
exports.getPersistedSettings = getPersistedSettings;
exports.get = get;
exports.set = set;
exports.apply = apply;
exports.getGroup = getGroup;
exports.getDevice = getDevice;
exports.addDevice = addDevice;
exports.blockDevice = blockDevice;
exports.removeDevice = removeDevice;
exports.addGroup = addGroup;
exports.removeGroup = removeGroup;
exports.changeEntityOptions = changeEntityOptions;
exports.changeFriendlyName = changeFriendlyName;
exports.reRead = reRead;
const node_path_1 = __importDefault(require("node:path"));
const ajv_1 = __importDefault(require("ajv"));
const object_assign_deep_1 = __importDefault(require("object-assign-deep"));
const data_1 = __importDefault(require("./data"));
const settings_schema_json_1 = __importDefault(require("./settings.schema.json"));
exports.schemaJson = settings_schema_json_1.default;
const utils_1 = __importDefault(require("./utils"));
const yaml_1 = __importStar(require("./yaml"));
// When updating also update:
// - https://github.com/Koenkk/zigbee2mqtt/blob/dev/data/configuration.example.yaml#L2
// - https://github.com/zigbee2mqtt/hassio-zigbee2mqtt/blob/master/common/rootfs/docker-entrypoint.sh#L54
exports.CURRENT_VERSION = 4;
/** NOTE: by order of priority, lower index is lower level (more important) */
exports.LOG_LEVELS = ['error', 'warning', 'info', 'debug'];
const CONFIG_FILE_PATH = data_1.default.joinPath('configuration.yaml');
const NULLABLE_SETTINGS = ['homeassistant'];
const ajvSetting = new ajv_1.default({ allErrors: true }).addKeyword('requiresRestart').compile(settings_schema_json_1.default);
const ajvRestartRequired = new ajv_1.default({ allErrors: true }).addKeyword({ keyword: 'requiresRestart', validate: (s) => !s }).compile(settings_schema_json_1.default);
const ajvRestartRequiredDeviceOptions = new ajv_1.default({ allErrors: true })
    .addKeyword({ keyword: 'requiresRestart', validate: (s) => !s })
    .compile(settings_schema_json_1.default.definitions.device);
const ajvRestartRequiredGroupOptions = new ajv_1.default({ allErrors: true })
    .addKeyword({ keyword: 'requiresRestart', validate: (s) => !s })
    .compile(settings_schema_json_1.default.definitions.group);
exports.defaults = {
    homeassistant: {
        enabled: false,
        discovery_topic: 'homeassistant',
        status_topic: 'homeassistant/status',
        legacy_action_sensor: false,
        experimental_event_entities: false,
    },
    availability: {
        enabled: false,
        active: { timeout: 10 },
        passive: { timeout: 1500 },
    },
    frontend: {
        enabled: false,
        port: 8080,
        base_url: '/',
    },
    mqtt: {
        base_topic: 'zigbee2mqtt',
        include_device_information: false,
        force_disable_retain: false,
        // 1MB = roughly 3.5KB per device * 300 devices for `/bridge/devices`
        maximum_packet_size: 1048576,
    },
    serial: {
        disable_led: false,
    },
    passlist: [],
    blocklist: [],
    map_options: {
        graphviz: {
            colors: {
                fill: {
                    enddevice: '#fff8ce',
                    coordinator: '#e04e5d',
                    router: '#4ea3e0',
                },
                font: {
                    coordinator: '#ffffff',
                    router: '#ffffff',
                    enddevice: '#000000',
                },
                line: {
                    active: '#009900',
                    inactive: '#994444',
                },
            },
        },
    },
    ota: {
        update_check_interval: 24 * 60,
        disable_automatic_update_check: false,
        image_block_response_delay: 250,
        default_maximum_data_size: 50,
    },
    device_options: {},
    advanced: {
        log_rotation: true,
        log_symlink_current: false,
        log_output: ['console', 'file'],
        log_directory: node_path_1.default.join(data_1.default.getPath(), 'log', '%TIMESTAMP%'),
        log_file: 'log.log',
        log_level: /* v8 ignore next */ process.env.DEBUG ? 'debug' : 'info',
        log_namespaced_levels: {},
        log_syslog: {},
        log_debug_to_mqtt_frontend: false,
        log_debug_namespace_ignore: '',
        pan_id: 0x1a62,
        ext_pan_id: [0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd],
        channel: 11,
        adapter_concurrent: undefined,
        adapter_delay: undefined,
        cache_state: true,
        cache_state_persistent: true,
        cache_state_send_on_startup: true,
        last_seen: 'disable',
        elapsed: false,
        network_key: [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13],
        timestamp_format: 'YYYY-MM-DD HH:mm:ss',
        output: 'json',
    },
};
let _settings;
let _settingsWithDefaults;
function loadSettingsWithDefaults() {
    if (!_settings) {
        _settings = read();
    }
    _settingsWithDefaults = (0, object_assign_deep_1.default)({}, exports.defaults, getPersistedSettings());
    if (!_settingsWithDefaults.devices) {
        _settingsWithDefaults.devices = {};
    }
    if (!_settingsWithDefaults.groups) {
        _settingsWithDefaults.groups = {};
    }
}
function parseValueRef(text) {
    const match = /!(.*) (.*)/g.exec(text);
    if (match) {
        let filename = match[1];
        // This is mainly for backward compatibility.
        if (!filename.endsWith('.yaml') && !filename.endsWith('.yml')) {
            filename += '.yaml';
        }
        return { filename, key: match[2] };
    }
    else {
        return null;
    }
}
function write() {
    const settings = getPersistedSettings();
    const toWrite = (0, object_assign_deep_1.default)({}, settings);
    // Read settings to check if we have to split devices/groups into separate file.
    const actual = yaml_1.default.read(CONFIG_FILE_PATH);
    // In case the setting is defined in a separate file (e.g. !secret network_key) update it there.
    for (const path of [
        ['mqtt', 'server'],
        ['mqtt', 'user'],
        ['mqtt', 'password'],
        ['advanced', 'network_key'],
        ['frontend', 'auth_token'],
    ]) {
        if (actual[path[0]] && actual[path[0]][path[1]]) {
            const ref = parseValueRef(actual[path[0]][path[1]]);
            if (ref) {
                yaml_1.default.updateIfChanged(data_1.default.joinPath(ref.filename), ref.key, toWrite[path[0]][path[1]]);
                toWrite[path[0]][path[1]] = actual[path[0]][path[1]];
            }
        }
    }
    // Write devices/groups to separate file if required.
    const writeDevicesOrGroups = (type) => {
        if (typeof actual[type] === 'string' || (Array.isArray(actual[type]) && actual[type].length > 0)) {
            const fileToWrite = Array.isArray(actual[type]) ? actual[type][0] : actual[type];
            const content = (0, object_assign_deep_1.default)({}, settings[type]);
            // If an array, only write to first file and only devices which are not in the other files.
            if (Array.isArray(actual[type])) {
                // skip i==0
                for (let i = 1; i < actual[type].length; i++) {
                    for (const key in yaml_1.default.readIfExists(data_1.default.joinPath(actual[type][i]))) {
                        delete content[key];
                    }
                }
            }
            yaml_1.default.writeIfChanged(data_1.default.joinPath(fileToWrite), content);
            toWrite[type] = actual[type];
        }
    };
    writeDevicesOrGroups('devices');
    writeDevicesOrGroups('groups');
    yaml_1.default.writeIfChanged(CONFIG_FILE_PATH, toWrite);
    _settings = read();
    loadSettingsWithDefaults();
}
function validate() {
    try {
        getPersistedSettings();
    }
    catch (error) {
        if (error instanceof yaml_1.YAMLFileException) {
            return [`Your YAML file: '${error.file}' is invalid (use https://jsonformatter.org/yaml-validator to find and fix the issue)`];
        }
        return [`${error}`];
    }
    if (!ajvSetting(_settings)) {
        // When `ajvSetting()` return false it always has `errors`.
        return ajvSetting.errors.map((v) => `${v.instancePath.substring(1)} ${v.message}`);
    }
    const errors = [];
    if (_settings.advanced &&
        _settings.advanced.network_key &&
        typeof _settings.advanced.network_key === 'string' &&
        _settings.advanced.network_key !== 'GENERATE') {
        errors.push(`advanced.network_key: should be array or 'GENERATE' (is '${_settings.advanced.network_key}')`);
    }
    if (_settings.advanced &&
        _settings.advanced.pan_id &&
        typeof _settings.advanced.pan_id === 'string' &&
        _settings.advanced.pan_id !== 'GENERATE') {
        errors.push(`advanced.pan_id: should be number or 'GENERATE' (is '${_settings.advanced.pan_id}')`);
    }
    if (_settings.advanced &&
        _settings.advanced.ext_pan_id &&
        typeof _settings.advanced.ext_pan_id === 'string' &&
        _settings.advanced.ext_pan_id !== 'GENERATE') {
        errors.push(`advanced.ext_pan_id: should be array or 'GENERATE' (is '${_settings.advanced.ext_pan_id}')`);
    }
    // Verify that all friendly names are unique
    const names = [];
    const check = (e) => {
        if (names.includes(e.friendly_name))
            errors.push(`Duplicate friendly_name '${e.friendly_name}' found`);
        errors.push(...utils_1.default.validateFriendlyName(e.friendly_name));
        names.push(e.friendly_name);
        if ('icon' in e && e.icon && !e.icon.startsWith('http://') && !e.icon.startsWith('https://') && !e.icon.startsWith('device_icons/')) {
            errors.push(`Device icon of '${e.friendly_name}' should start with 'device_icons/', got '${e.icon}'`);
        }
        if (e.qos != null && ![0, 1, 2].includes(e.qos)) {
            errors.push(`QOS for '${e.friendly_name}' not valid, should be 0, 1 or 2 got ${e.qos}`);
        }
    };
    const settingsWithDefaults = get();
    Object.values(settingsWithDefaults.devices).forEach((d) => check(d));
    Object.values(settingsWithDefaults.groups).forEach((g) => check(g));
    if (settingsWithDefaults.mqtt.version !== 5) {
        for (const device of Object.values(settingsWithDefaults.devices)) {
            if (device.retention) {
                errors.push('MQTT retention requires protocol version 5');
            }
        }
    }
    return errors;
}
function read() {
    const s = yaml_1.default.read(CONFIG_FILE_PATH);
    applyEnvironmentVariables(s);
    // Read !secret MQTT username and password if set
    const interpretValue = (value) => {
        if (typeof value === 'string') {
            const ref = parseValueRef(value);
            if (ref) {
                return yaml_1.default.read(data_1.default.joinPath(ref.filename))[ref.key];
            }
        }
        return value;
    };
    if (s.mqtt?.user) {
        s.mqtt.user = interpretValue(s.mqtt.user);
    }
    if (s.mqtt?.password) {
        s.mqtt.password = interpretValue(s.mqtt.password);
    }
    if (s.mqtt?.server) {
        s.mqtt.server = interpretValue(s.mqtt.server);
    }
    if (s.advanced?.network_key) {
        s.advanced.network_key = interpretValue(s.advanced.network_key);
    }
    if (s.frontend?.auth_token) {
        s.frontend.auth_token = interpretValue(s.frontend.auth_token);
    }
    // Read devices/groups configuration from separate file if specified.
    const readDevicesOrGroups = (type) => {
        if (typeof s[type] === 'string' || (Array.isArray(s[type]) && Array(s[type]).length > 0)) {
            const files = Array.isArray(s[type]) ? s[type] : [s[type]];
            s[type] = {};
            for (const file of files) {
                const content = yaml_1.default.readIfExists(data_1.default.joinPath(file));
                // @ts-expect-error noMutate not typed properly
                s[type] = object_assign_deep_1.default.noMutate(s[type], content);
            }
        }
    };
    readDevicesOrGroups('devices');
    readDevicesOrGroups('groups');
    return s;
}
function applyEnvironmentVariables(settings) {
    const iterate = (obj, path) => {
        for (const key in obj) {
            if (key !== 'type') {
                if (key !== 'properties' && obj[key]) {
                    const type = (obj[key].type || 'object').toString();
                    const envPart = path.reduce((acc, val) => `${acc}${val}_`, '');
                    const envVariableName = `ZIGBEE2MQTT_CONFIG_${envPart}${key}`.toUpperCase();
                    const envVariable = process.env[envVariableName];
                    if (envVariable) {
                        const setting = path.reduce((acc, val) => {
                            // @ts-expect-error ignore typing
                            acc[val] = acc[val] || {};
                            // @ts-expect-error ignore typing
                            return acc[val];
                        }, settings);
                        if (type.indexOf('object') >= 0 || type.indexOf('array') >= 0) {
                            try {
                                setting[key] = JSON.parse(envVariable);
                            }
                            catch {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setting[key] = envVariable;
                            }
                        }
                        else if (type.indexOf('number') >= 0) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setting[key] = (envVariable * 1);
                        }
                        else if (type.indexOf('boolean') >= 0) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setting[key] = (envVariable.toLowerCase() === 'true');
                        }
                        else {
                            if (type.indexOf('string') >= 0) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setting[key] = envVariable;
                            }
                        }
                    }
                }
                if (typeof obj[key] === 'object' && obj[key]) {
                    const newPath = [...path];
                    if (key !== 'properties' && key !== 'oneOf' && !Number.isInteger(Number(key))) {
                        newPath.push(key);
                    }
                    iterate(obj[key], newPath);
                }
            }
        }
    };
    iterate(settings_schema_json_1.default.properties, []);
}
/**
 * Get the settings actually written in the yaml.
 * Env vars are applied on top.
 * Defaults merged on startup are not included.
 */
function getPersistedSettings() {
    if (!_settings) {
        _settings = read();
    }
    return _settings;
}
function get() {
    if (!_settingsWithDefaults) {
        loadSettingsWithDefaults();
    }
    return _settingsWithDefaults;
}
function set(path, value) {
    /* eslint-disable-next-line */
    let settings = getPersistedSettings();
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (i === path.length - 1) {
            settings[key] = value;
        }
        else {
            if (!settings[key]) {
                settings[key] = {};
            }
            settings = settings[key];
        }
    }
    write();
}
function apply(settings, throwOnError = true) {
    getPersistedSettings(); // Ensure _settings is initialized.
    // @ts-expect-error noMutate not typed properly
    const newSettings = object_assign_deep_1.default.noMutate(_settings, settings);
    utils_1.default.removeNullPropertiesFromObject(newSettings, NULLABLE_SETTINGS);
    ajvSetting(newSettings);
    if (throwOnError) {
        const errors = ajvSetting.errors && ajvSetting.errors.filter((e) => e.keyword !== 'required');
        if (errors?.length) {
            const error = errors[0];
            throw new Error(`${error.instancePath.substring(1)} ${error.message}`);
        }
    }
    _settings = newSettings;
    write();
    ajvRestartRequired(settings);
    const restartRequired = Boolean(ajvRestartRequired.errors && !!ajvRestartRequired.errors.find((e) => e.keyword === 'requiresRestart'));
    return restartRequired;
}
function getGroup(IDorName) {
    const settings = get();
    const byID = settings.groups[IDorName];
    if (byID) {
        return { ...byID, ID: Number(IDorName) };
    }
    for (const [ID, group] of Object.entries(settings.groups)) {
        if (group.friendly_name === IDorName) {
            return { ...group, ID: Number(ID) };
        }
    }
    return undefined;
}
function getGroupThrowIfNotExists(IDorName) {
    const group = getGroup(IDorName);
    if (!group) {
        throw new Error(`Group '${IDorName}' does not exist`);
    }
    return group;
}
function getDevice(IDorName) {
    const settings = get();
    const byID = settings.devices[IDorName];
    if (byID) {
        return { ...byID, ID: IDorName };
    }
    for (const [ID, device] of Object.entries(settings.devices)) {
        if (device.friendly_name === IDorName) {
            return { ...device, ID };
        }
    }
    return undefined;
}
function getDeviceThrowIfNotExists(IDorName) {
    const device = getDevice(IDorName);
    if (!device) {
        throw new Error(`Device '${IDorName}' does not exist`);
    }
    return device;
}
function addDevice(ID) {
    if (getDevice(ID)) {
        throw new Error(`Device '${ID}' already exists`);
    }
    const settings = getPersistedSettings();
    if (!settings.devices) {
        settings.devices = {};
    }
    settings.devices[ID] = { friendly_name: ID };
    write();
    return getDevice(ID); // valid from creation above
}
function blockDevice(ID) {
    const settings = getPersistedSettings();
    if (!settings.blocklist) {
        settings.blocklist = [];
    }
    settings.blocklist.push(ID);
    write();
}
function removeDevice(IDorName) {
    const device = getDeviceThrowIfNotExists(IDorName);
    const settings = getPersistedSettings();
    delete settings.devices?.[device.ID];
    write();
}
function addGroup(name, ID) {
    utils_1.default.validateFriendlyName(name, true);
    if (getGroup(name) || getDevice(name)) {
        throw new Error(`friendly_name '${name}' is already in use`);
    }
    const settings = getPersistedSettings();
    if (!settings.groups) {
        settings.groups = {};
    }
    if (ID == undefined) {
        // look for free ID
        ID = '1';
        while (settings.groups[ID]) {
            ID = (Number.parseInt(ID) + 1).toString();
        }
    }
    else {
        // ensure provided ID is not in use
        ID = ID.toString();
        if (settings.groups[ID]) {
            throw new Error(`Group ID '${ID}' is already in use`);
        }
    }
    settings.groups[ID] = { friendly_name: name };
    write();
    return getGroup(ID); // valid from creation above
}
function removeGroup(IDorName) {
    const groupID = getGroupThrowIfNotExists(IDorName.toString()).ID;
    const settings = getPersistedSettings();
    delete settings.groups[groupID];
    write();
}
function changeEntityOptions(IDorName, newOptions) {
    const settings = getPersistedSettings();
    delete newOptions.friendly_name;
    delete newOptions.devices;
    let validator;
    const device = getDevice(IDorName);
    if (device) {
        (0, object_assign_deep_1.default)(settings.devices[device.ID], newOptions);
        utils_1.default.removeNullPropertiesFromObject(settings.devices[device.ID], NULLABLE_SETTINGS);
        validator = ajvRestartRequiredDeviceOptions;
    }
    else {
        const group = getGroup(IDorName);
        if (group) {
            (0, object_assign_deep_1.default)(settings.groups[group.ID], newOptions);
            utils_1.default.removeNullPropertiesFromObject(settings.groups[group.ID], NULLABLE_SETTINGS);
            validator = ajvRestartRequiredGroupOptions;
        }
        else {
            throw new Error(`Device or group '${IDorName}' does not exist`);
        }
    }
    write();
    validator(newOptions);
    const restartRequired = Boolean(validator.errors && !!validator.errors.find((e) => e.keyword === 'requiresRestart'));
    return restartRequired;
}
function changeFriendlyName(IDorName, newName) {
    utils_1.default.validateFriendlyName(newName, true);
    if (getGroup(newName) || getDevice(newName)) {
        throw new Error(`friendly_name '${newName}' is already in use`);
    }
    const settings = getPersistedSettings();
    const device = getDevice(IDorName);
    if (device) {
        settings.devices[device.ID].friendly_name = newName;
    }
    else {
        const group = getGroup(IDorName);
        if (group) {
            settings.groups[group.ID].friendly_name = newName;
        }
        else {
            throw new Error(`Device or group '${IDorName}' does not exist`);
        }
    }
    write();
}
function reRead() {
    _settings = undefined;
    getPersistedSettings();
    _settingsWithDefaults = undefined;
    get();
}
exports.testing = {
    write,
    clear: () => {
        _settings = undefined;
        _settingsWithDefaults = undefined;
    },
    defaults: exports.defaults,
    CURRENT_VERSION: exports.CURRENT_VERSION,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbC9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3TUEsNEJBeUVDO0FBcUhELG9EQU1DO0FBRUQsa0JBTUM7QUFFRCxrQkFrQkM7QUFFRCxzQkF5QkM7QUFFRCw0QkFlQztBQVlELDhCQWVDO0FBV0QsOEJBZUM7QUFFRCxrQ0FRQztBQUVELG9DQUtDO0FBRUQsNEJBZ0NDO0FBRUQsa0NBTUM7QUFFRCxrREE2QkM7QUFFRCxnREFzQkM7QUFFRCx3QkFLQztBQWxvQkQsMERBQTZCO0FBRTdCLDhDQUEwQztBQUMxQyw0RUFBa0Q7QUFFbEQsa0RBQTBCO0FBQzFCLGtGQUFnRDtBQUl4QyxxQkFKRCw4QkFBVSxDQUlDO0FBSGxCLG9EQUE0QjtBQUM1QiwrQ0FBK0M7QUFHL0MsNkJBQTZCO0FBQzdCLHNGQUFzRjtBQUN0Rix5R0FBeUc7QUFDNUYsUUFBQSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLDhFQUE4RTtBQUNqRSxRQUFBLFVBQVUsR0FBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQVUsQ0FBQztBQUc1RixNQUFNLGdCQUFnQixHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM3RCxNQUFNLGlCQUFpQixHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxhQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsOEJBQVUsQ0FBQyxDQUFDO0FBQ2hHLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxhQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxVQUFV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