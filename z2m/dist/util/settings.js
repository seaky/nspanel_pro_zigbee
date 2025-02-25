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
        log_console_json: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbC9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5TUEsNEJBeUVDO0FBcUhELG9EQU1DO0FBRUQsa0JBTUM7QUFFRCxrQkFrQkM7QUFFRCxzQkF5QkM7QUFFRCw0QkFlQztBQVlELDhCQWVDO0FBV0QsOEJBZUM7QUFFRCxrQ0FRQztBQUVELG9DQUtDO0FBRUQsNEJBZ0NDO0FBRUQsa0NBTUM7QUFFRCxrREE2QkM7QUFFRCxnREFzQkM7QUFFRCx3QkFLQztBQW5vQkQsMERBQTZCO0FBRTdCLDhDQUEwQztBQUMxQyw0RUFBa0Q7QUFFbEQsa0RBQTBCO0FBQzFCLGtGQUFnRDtBQUl4QyxxQkFKRCw4QkFBVSxDQUlDO0FBSGxCLG9EQUE0QjtBQUM1QiwrQ0FBK0M7QUFHL0MsNkJBQTZCO0FBQzdCLHNGQUFzRjtBQUN0Rix5R0FBeUc7QUFDNUYsUUFBQSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLDhFQUE4RTtBQUNqRSxRQUFBLFVBQVUsR0FBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQVUsQ0FBQztBQUc1RixNQUFNLGdCQUFnQixHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM3RCxNQUFNLGlCQUFpQixHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxhQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsOEJBQVUsQ0FBQyxDQUFDO0FBQ2hHLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxhQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxVQUFV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