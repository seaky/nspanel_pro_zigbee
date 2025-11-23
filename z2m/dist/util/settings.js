"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = exports.defaults = exports.LOG_LEVELS = exports.CURRENT_VERSION = exports.schemaJson = void 0;
exports.writeMinimalDefaults = writeMinimalDefaults;
exports.setOnboarding = setOnboarding;
exports.write = write;
exports.validate = validate;
exports.validateNonRequired = validateNonRequired;
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
const yaml_1 = __importDefault(require("./yaml"));
// When updating also update:
// - https://github.com/Koenkk/zigbee2mqtt/blob/dev/data/configuration.example.yaml#L2
exports.CURRENT_VERSION = 4;
/** NOTE: by order of priority, lower index is lower level (more important) */
exports.LOG_LEVELS = ["error", "warning", "info", "debug"];
const CONFIG_FILE_PATH = data_1.default.joinPath("configuration.yaml");
const NULLABLE_SETTINGS = ["homeassistant"];
const ajvSetting = new ajv_1.default({ allErrors: true }).addKeyword("requiresRestart").compile(settings_schema_json_1.default);
const ajvRestartRequired = new ajv_1.default({ allErrors: true }).addKeyword({ keyword: "requiresRestart", validate: (s) => !s }).compile(settings_schema_json_1.default);
const ajvRestartRequiredDeviceOptions = new ajv_1.default({ allErrors: true })
    .addKeyword({ keyword: "requiresRestart", validate: (s) => !s })
    .compile(settings_schema_json_1.default.definitions.device);
const ajvRestartRequiredGroupOptions = new ajv_1.default({ allErrors: true })
    .addKeyword({ keyword: "requiresRestart", validate: (s) => !s })
    .compile(settings_schema_json_1.default.definitions.group);
exports.defaults = {
    homeassistant: {
        enabled: false,
        discovery_topic: "homeassistant",
        status_topic: "homeassistant/status",
        legacy_action_sensor: false,
        experimental_event_entities: false,
    },
    availability: {
        enabled: false,
        active: { timeout: 10, max_jitter: 30000, backoff: true, pause_on_backoff_gt: 0 },
        passive: { timeout: 1500 },
    },
    frontend: {
        enabled: false,
        package: "zigbee2mqtt-windfront",
        port: 8080,
        base_url: "/",
    },
    mqtt: {
        base_topic: "zigbee2mqtt",
        include_device_information: false,
        force_disable_retain: false,
        // 1MB = roughly 3.5KB per device * 300 devices for `/bridge/devices`
        maximum_packet_size: 1048576,
        keepalive: 60,
        reject_unauthorized: true,
        version: 4,
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
                    enddevice: "#fff8ce",
                    coordinator: "#e04e5d",
                    router: "#4ea3e0",
                },
                font: {
                    coordinator: "#ffffff",
                    router: "#ffffff",
                    enddevice: "#000000",
                },
                line: {
                    active: "#009900",
                    inactive: "#994444",
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
        log_output: ["console", "file"],
        log_directory: node_path_1.default.join(data_1.default.getPath(), "log", "%TIMESTAMP%"),
        log_file: "log.log",
        log_level: /* v8 ignore next */ process.env.DEBUG ? "debug" : "info",
        log_namespaced_levels: {},
        log_syslog: {},
        log_debug_to_mqtt_frontend: false,
        log_debug_namespace_ignore: "",
        log_directories_to_keep: 10,
        pan_id: 0x1a62,
        ext_pan_id: [0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd],
        channel: 11,
        adapter_concurrent: undefined,
        adapter_delay: undefined,
        cache_state: true,
        cache_state_persistent: true,
        cache_state_send_on_startup: true,
        last_seen: "disable",
        elapsed: false,
        network_key: [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13],
        timestamp_format: "YYYY-MM-DD HH:mm:ss",
        output: "json",
    },
    health: {
        interval: 10,
        reset_on_check: false,
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
        if (!filename.endsWith(".yaml") && !filename.endsWith(".yml")) {
            filename += ".yaml";
        }
        return { filename, key: match[2] };
    }
    return null;
}
function writeMinimalDefaults() {
    const minimal = {
        version: exports.CURRENT_VERSION,
        mqtt: {
            base_topic: exports.defaults.mqtt.base_topic,
            server: "mqtt://localhost:1883",
        },
        serial: {},
        advanced: {
            log_level: exports.defaults.advanced.log_level,
            channel: exports.defaults.advanced.channel,
            network_key: "GENERATE",
            pan_id: "GENERATE",
            ext_pan_id: "GENERATE",
        },
        frontend: {
            enabled: exports.defaults.frontend.enabled,
            port: exports.defaults.frontend.port,
        },
        homeassistant: {
            enabled: exports.defaults.homeassistant.enabled,
        },
    };
    applyEnvironmentVariables(minimal);
    yaml_1.default.writeIfChanged(CONFIG_FILE_PATH, minimal);
    _settings = read();
    loadSettingsWithDefaults();
}
function setOnboarding(value) {
    const settings = getPersistedSettings();
    if (value) {
        if (!settings.onboarding) {
            settings.onboarding = value;
            write();
        }
    }
    else if (settings.onboarding) {
        delete settings.onboarding;
        write();
    }
}
function write() {
    const settings = getPersistedSettings();
    const toWrite = (0, object_assign_deep_1.default)({}, settings);
    // Read settings to check if we have to split devices/groups into separate file.
    const actual = yaml_1.default.read(CONFIG_FILE_PATH);
    // In case the setting is defined in a separate file (e.g. !secret network_key) update it there.
    for (const [ns, key] of [
        ["mqtt", "server"],
        ["mqtt", "user"],
        ["mqtt", "password"],
        ["advanced", "network_key"],
        ["frontend", "auth_token"],
    ]) {
        if (actual[ns]?.[key]) {
            const ref = parseValueRef(actual[ns][key]);
            if (ref) {
                yaml_1.default.updateIfChanged(data_1.default.joinPath(ref.filename), ref.key, toWrite[ns][key]);
                toWrite[ns][key] = actual[ns][key];
            }
        }
    }
    // Write devices/groups to separate file if required.
    const writeDevicesOrGroups = (type) => {
        if (typeof actual[type] === "string" || (Array.isArray(actual[type]) && actual[type].length > 0)) {
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
    writeDevicesOrGroups("devices");
    writeDevicesOrGroups("groups");
    applyEnvironmentVariables(toWrite);
    yaml_1.default.writeIfChanged(CONFIG_FILE_PATH, toWrite);
    _settings = read();
    loadSettingsWithDefaults();
}
function validate() {
    getPersistedSettings();
    if (!ajvSetting(_settings)) {
        // biome-ignore lint/style/noNonNullAssertion: When `ajvSetting()` return false it always has `errors`
        return ajvSetting.errors.map((v) => `${v.instancePath.substring(1)} ${v.message}`);
    }
    const errors = [];
    if (_settings.advanced?.network_key && typeof _settings.advanced.network_key === "string" && _settings.advanced.network_key !== "GENERATE") {
        errors.push(`advanced.network_key: should be array or 'GENERATE' (is '${_settings.advanced.network_key}')`);
    }
    if (_settings.advanced?.pan_id && typeof _settings.advanced.pan_id === "string" && _settings.advanced.pan_id !== "GENERATE") {
        errors.push(`advanced.pan_id: should be number or 'GENERATE' (is '${_settings.advanced.pan_id}')`);
    }
    if (_settings.advanced?.ext_pan_id && typeof _settings.advanced.ext_pan_id === "string" && _settings.advanced.ext_pan_id !== "GENERATE") {
        errors.push(`advanced.ext_pan_id: should be array or 'GENERATE' (is '${_settings.advanced.ext_pan_id}')`);
    }
    // Verify that all friendly names are unique
    const names = [];
    const check = (e) => {
        if (names.includes(e.friendly_name))
            errors.push(`Duplicate friendly_name '${e.friendly_name}' found`);
        errors.push(...utils_1.default.validateFriendlyName(e.friendly_name));
        names.push(e.friendly_name);
        if ("icon" in e && e.icon && !e.icon.startsWith("http://") && !e.icon.startsWith("https://") && !e.icon.startsWith("device_icons/")) {
            errors.push(`Device icon of '${e.friendly_name}' should start with 'device_icons/', got '${e.icon}'`);
        }
    };
    const settingsWithDefaults = get();
    for (const key in settingsWithDefaults.devices) {
        check(settingsWithDefaults.devices[key]);
    }
    for (const key in settingsWithDefaults.groups) {
        check(settingsWithDefaults.groups[key]);
    }
    if (settingsWithDefaults.mqtt.version !== 5) {
        for (const device of Object.values(settingsWithDefaults.devices)) {
            if (device.retention) {
                errors.push("MQTT retention requires protocol version 5");
            }
        }
    }
    return errors;
}
function validateNonRequired() {
    getPersistedSettings();
    if (!ajvSetting(_settings)) {
        // biome-ignore lint/style/noNonNullAssertion: When `ajvSetting()` return false it always has `errors`
        const errors = ajvSetting.errors.filter((e) => e.keyword !== "required");
        return errors.map((v) => `${v.instancePath.substring(1)} ${v.message}`);
    }
    return [];
}
function read() {
    const s = yaml_1.default.read(CONFIG_FILE_PATH);
    // Read !secret MQTT username and password if set
    const interpretValue = (value) => {
        if (typeof value === "string") {
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
        if (typeof s[type] === "string" || (Array.isArray(s[type]) && Array(s[type]).length > 0)) {
            const files = Array.isArray(s[type]) ? s[type] : [s[type]];
            s[type] = {};
            for (const file of files) {
                const content = yaml_1.default.readIfExists(data_1.default.joinPath(file));
                // @ts-expect-error noMutate not typed properly
                s[type] = object_assign_deep_1.default.noMutate(s[type], content);
            }
        }
    };
    readDevicesOrGroups("devices");
    readDevicesOrGroups("groups");
    return s;
}
function applyEnvironmentVariables(settings) {
    const iterate = (obj, path) => {
        for (const key in obj) {
            if (key !== "type") {
                if (key !== "properties" && obj[key]) {
                    const type = (obj[key].type || "object").toString();
                    const envPart = path.reduce((acc, val) => `${acc}${val}_`, "");
                    const envVariableName = `ZIGBEE2MQTT_CONFIG_${envPart}${key}`.toUpperCase();
                    const envVariable = process.env[envVariableName];
                    if (envVariable) {
                        const setting = path.reduce((acc, val) => {
                            // @ts-expect-error ignore typing
                            acc[val] = acc[val] || {};
                            // @ts-expect-error ignore typing
                            return acc[val];
                        }, settings);
                        if (type.indexOf("object") >= 0 || type.indexOf("array") >= 0) {
                            try {
                                setting[key] = JSON.parse(envVariable);
                            }
                            catch {
                                // biome-ignore lint/suspicious/noExplicitAny: auto-parsing
                                setting[key] = envVariable;
                            }
                        }
                        else if (type.indexOf("number") >= 0) {
                            // biome-ignore lint/suspicious/noExplicitAny: auto-parsing
                            setting[key] = (envVariable * 1);
                        }
                        else if (type.indexOf("boolean") >= 0) {
                            // biome-ignore lint/suspicious/noExplicitAny: auto-parsing
                            setting[key] = (envVariable.toLowerCase() === "true");
                        }
                        else {
                            if (type.indexOf("string") >= 0) {
                                // biome-ignore lint/suspicious/noExplicitAny: auto-parsing
                                setting[key] = envVariable;
                            }
                        }
                    }
                }
                if (typeof obj[key] === "object" && obj[key]) {
                    const newPath = [...path];
                    if (key !== "properties" && key !== "oneOf" && !Number.isInteger(Number(key))) {
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
    // biome-ignore lint/style/noNonNullAssertion: just loaded
    return _settingsWithDefaults;
}
function set(path, value) {
    // biome-ignore lint/suspicious/noExplicitAny: auto-parsing
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
    if (!ajvSetting(newSettings) && throwOnError) {
        // biome-ignore lint/style/noNonNullAssertion: When `ajvSetting()` return false it always has `errors`
        const errors = ajvSetting.errors.filter((e) => e.keyword !== "required");
        if (errors.length) {
            const error = errors[0];
            throw new Error(`${error.instancePath.substring(1)} ${error.message}`);
        }
    }
    _settings = newSettings;
    write();
    ajvRestartRequired(settings);
    const restartRequired = Boolean(ajvRestartRequired.errors && !!ajvRestartRequired.errors.find((e) => e.keyword === "requiresRestart"));
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
function addDevice(id) {
    if (getDevice(id)) {
        throw new Error(`Device '${id}' already exists`);
    }
    const settings = getPersistedSettings();
    if (!settings.devices) {
        settings.devices = {};
    }
    settings.devices[id] = { friendly_name: id };
    write();
    // biome-ignore lint/style/noNonNullAssertion: valid from creation above
    return getDevice(id);
}
function blockDevice(id) {
    const settings = getPersistedSettings();
    if (!settings.blocklist) {
        settings.blocklist = [];
    }
    settings.blocklist.push(id);
    write();
}
function removeDevice(IDorName) {
    const device = getDeviceThrowIfNotExists(IDorName);
    const settings = getPersistedSettings();
    delete settings.devices?.[device.ID];
    write();
}
function addGroup(name, id) {
    utils_1.default.validateFriendlyName(name, true);
    if (getGroup(name) || getDevice(name)) {
        throw new Error(`friendly_name '${name}' is already in use`);
    }
    const settings = getPersistedSettings();
    if (!settings.groups) {
        settings.groups = {};
    }
    if (id == null || (typeof id === "string" && id.trim() === "")) {
        // look for free ID
        id = "1";
        while (settings.groups[id]) {
            id = (Number.parseInt(id) + 1).toString();
        }
    }
    else {
        // ensure provided ID is not in use
        id = id.toString();
        if (settings.groups[id]) {
            throw new Error(`Group ID '${id}' is already in use`);
        }
    }
    settings.groups[id] = { friendly_name: name };
    write();
    // biome-ignore lint/style/noNonNullAssertion: valid from creation above
    return getGroup(id);
}
function removeGroup(IDorName) {
    const groupID = getGroupThrowIfNotExists(IDorName.toString()).ID;
    const settings = getPersistedSettings();
    // biome-ignore lint/style/noNonNullAssertion: throwing above if not valid
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
        // biome-ignore lint/style/noNonNullAssertion: valid from above
        const settingsDevice = settings.devices[device.ID];
        (0, object_assign_deep_1.default)(settingsDevice, newOptions);
        utils_1.default.removeNullPropertiesFromObject(settingsDevice, NULLABLE_SETTINGS);
        validator = ajvRestartRequiredDeviceOptions;
    }
    else {
        const group = getGroup(IDorName);
        if (group) {
            // biome-ignore lint/style/noNonNullAssertion: valid from above
            const settingsGroup = settings.groups[group.ID];
            (0, object_assign_deep_1.default)(settingsGroup, newOptions);
            utils_1.default.removeNullPropertiesFromObject(settingsGroup, NULLABLE_SETTINGS);
            validator = ajvRestartRequiredGroupOptions;
        }
        else {
            throw new Error(`Device or group '${IDorName}' does not exist`);
        }
    }
    write();
    validator(newOptions);
    const restartRequired = Boolean(validator.errors && !!validator.errors.find((e) => e.keyword === "requiresRestart"));
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
        // biome-ignore lint/style/noNonNullAssertion: valid from above
        settings.devices[device.ID].friendly_name = newName;
    }
    else {
        const group = getGroup(IDorName);
        if (group) {
            // biome-ignore lint/style/noNonNullAssertion: valid from above
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbC9zZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUEwSkEsb0RBOEJDO0FBRUQsc0NBY0M7QUFFRCxzQkF1REM7QUFFRCw0QkFvREM7QUFFRCxrREFXQztBQW9IRCxvREFNQztBQUVELGtCQU9DO0FBRUQsa0JBa0JDO0FBRUQsc0JBeUJDO0FBRUQsNEJBZUM7QUFZRCw4QkFlQztBQVdELDhCQWdCQztBQUVELGtDQVFDO0FBRUQsb0NBS0M7QUFFRCw0QkFpQ0M7QUFFRCxrQ0FPQztBQUVELGtEQWlDQztBQUVELGdEQXdCQztBQUVELHdCQUtDO0FBOXJCRCwwREFBNkI7QUFFN0IsOENBQXNCO0FBQ3RCLDRFQUFrRDtBQUNsRCxrREFBMEI7QUFDMUIsa0ZBQWdEO0FBSXhDLHFCQUpELDhCQUFVLENBSUM7QUFIbEIsb0RBQTRCO0FBQzVCLGtEQUEwQjtBQUcxQiw2QkFBNkI7QUFDN0Isc0ZBQXNGO0FBQ3pFLFFBQUEsZUFBZSxHQUFHLENBQUMsQ0FBQztBQUNqQyw4RUFBOEU7QUFDakUsUUFBQSxVQUFVLEdBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFVLENBQUM7QUFHNUYsTUFBTSxnQkFBZ0IsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDN0QsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksYUFBRyxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUFVLENBQUMsQ0FBQztBQUNoRyxNQUFNLGtCQUFrQixHQUFHLElBQUksYUFBRyxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsVUFB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