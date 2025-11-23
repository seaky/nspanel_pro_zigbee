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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.HomeAssistant = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importStar(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const ACTION_PATTERNS = [
    "^(?<button>(?:button_)?[a-z0-9]+)_(?<action>(?:press|hold)(?:_release)?)$",
    "^(?<action>recall|scene)_(?<scene>[0-2][0-9]{0,2})$",
    "^(?<actionPrefix>region_)(?<region>[1-9]|10)_(?<action>enter|leave|occupied|unoccupied)$",
    "^(?<action>dial_rotate)_(?<direction>left|right)_(?<speed>step|slow|fast)$",
    "^(?<action>brightness_step)(?:_(?<direction>up|down))?$",
];
const ACCESS_STATE = 0b001;
const ACCESS_SET = 0b010;
const GROUP_SUPPORTED_TYPES = ["light", "switch", "lock", "cover"];
const COVER_OPENING_LOOKUP = ["opening", "open", "forward", "up", "rising"];
const COVER_CLOSING_LOOKUP = ["closing", "close", "backward", "back", "reverse", "down", "declining"];
const COVER_STOPPED_LOOKUP = ["stopped", "stop", "pause", "paused"];
const SWITCH_DIFFERENT = ["valve_detection", "window_detection", "auto_lock", "away_mode"];
const BINARY_DISCOVERY_LOOKUP = {
    activity_led_indicator: { icon: "mdi:led-on" },
    auto_off: { icon: "mdi:flash-auto" },
    battery_low: { entity_category: "diagnostic", device_class: "battery" },
    button_lock: { entity_category: "config", icon: "mdi:lock" },
    calibration: { entity_category: "config", icon: "mdi:progress-wrench" },
    capabilities_configurable_curve: { entity_category: "diagnostic", icon: "mdi:tune" },
    capabilities_forward_phase_control: { entity_category: "diagnostic", icon: "mdi:tune" },
    capabilities_overload_detection: { entity_category: "diagnostic", icon: "mdi:tune" },
    capabilities_reactance_discriminator: { entity_category: "diagnostic", icon: "mdi:tune" },
    capabilities_reverse_phase_control: { entity_category: "diagnostic", icon: "mdi:tune" },
    carbon_monoxide: { device_class: "carbon_monoxide" },
    card: { entity_category: "config", icon: "mdi:clipboard-check" },
    child_lock: { entity_category: "config", icon: "mdi:account-lock" },
    color_sync: { entity_category: "config", icon: "mdi:sync-circle" },
    consumer_connected: { device_class: "plug" },
    contact: { device_class: "door" },
    garage_door_contact: { device_class: "garage_door", payload_on: false, payload_off: true },
    eco_mode: { entity_category: "config", icon: "mdi:leaf" },
    expose_pin: { entity_category: "config", icon: "mdi:pin" },
    flip_indicator_light: { entity_category: "config", icon: "mdi:arrow-left-right" },
    gas: { device_class: "gas" },
    indicator_mode: { entity_category: "config", icon: "mdi:led-on" },
    invert_cover: { entity_category: "config", icon: "mdi:arrow-left-right" },
    led_disabled_night: { entity_category: "config", icon: "mdi:led-off" },
    led_indication: { entity_category: "config", icon: "mdi:led-on" },
    led_enable: { entity_category: "config", icon: "mdi:led-on" },
    motor_reversal: { entity_category: "config", icon: "mdi:arrow-left-right" },
    moving: { device_class: "moving" },
    no_position_support: { entity_category: "config", icon: "mdi:minus-circle-outline" },
    noise_detected: { device_class: "sound" },
    occupancy: { device_class: "occupancy" },
    power_outage_memory: { entity_category: "config", icon: "mdi:memory" },
    presence: { device_class: "occupancy" },
    setup: { device_class: "running" },
    smoke: { device_class: "smoke" },
    sos: { device_class: "safety" },
    schedule: { icon: "mdi:calendar" },
    status_capacitive_load: { entity_category: "diagnostic", icon: "mdi:tune" },
    status_forward_phase_control: { entity_category: "diagnostic", icon: "mdi:tune" },
    status_inductive_load: { entity_category: "diagnostic", icon: "mdi:tune" },
    status_overload: { entity_category: "diagnostic", icon: "mdi:tune" },
    status_reverse_phase_control: { entity_category: "diagnostic", icon: "mdi:tune" },
    tamper: { device_class: "tamper" },
    temperature_scale: { entity_category: "config", icon: "mdi:temperature-celsius" },
    test: { entity_category: "diagnostic", icon: "mdi:test-tube" },
    th_heater: { icon: "mdi:heat-wave" },
    trigger_indicator: { icon: "mdi:led-on" },
    valve_alarm: { device_class: "problem" },
    valve_detection: { icon: "mdi:pipe-valve" },
    valve_state: { device_class: "opening" },
    vibration: { device_class: "vibration" },
    water_leak: { device_class: "moisture" },
    window: { device_class: "window" },
    window_detection: { icon: "mdi:window-open-variant" },
    window_open: { device_class: "window" },
};
const NUMERIC_DISCOVERY_LOOKUP = {
    ac_frequency: { device_class: "frequency", state_class: "measurement" },
    action_duration: { icon: "mdi:timer", device_class: "duration" },
    alarm_humidity_max: { device_class: "humidity", entity_category: "config", icon: "mdi:water-plus" },
    alarm_humidity_min: { device_class: "humidity", entity_category: "config", icon: "mdi:water-minus" },
    alarm_temperature_max: { device_class: "temperature", entity_category: "config", icon: "mdi:thermometer-high" },
    alarm_temperature_min: { device_class: "temperature", entity_category: "config", icon: "mdi:thermometer-low" },
    angle: { icon: "angle-acute" },
    angle_axis: { icon: "angle-acute" },
    aqi: { device_class: "aqi", state_class: "measurement" },
    auto_relock_time: { entity_category: "config", icon: "mdi:timer" },
    away_preset_days: { entity_category: "config", icon: "mdi:timer" },
    away_preset_temperature: { entity_category: "config", icon: "mdi:thermometer" },
    ballast_maximum_level: { entity_category: "config" },
    ballast_minimum_level: { entity_category: "config" },
    ballast_physical_maximum_level: { entity_category: "diagnostic" },
    ballast_physical_minimum_level: { entity_category: "diagnostic" },
    battery: { device_class: "battery", state_class: "measurement" },
    battery2: { device_class: "battery", entity_category: "diagnostic", state_class: "measurement" },
    battery_voltage: { device_class: "voltage", entity_category: "diagnostic", state_class: "measurement", enabled_by_default: true },
    boost_heating_countdown: { device_class: "duration" },
    boost_heating_countdown_time_set: { entity_category: "config", icon: "mdi:timer" },
    boost_time: { entity_category: "config", icon: "mdi:timer" },
    calibration: { entity_category: "config", icon: "mdi:wrench-clock" },
    calibration_time: { entity_category: "config", icon: "mdi:wrench-clock" },
    co2: { device_class: "carbon_dioxide", state_class: "measurement" },
    comfort_temperature: { entity_category: "config", icon: "mdi:thermometer" },
    cpu_temperature: {
        device_class: "temperature",
        entity_category: "diagnostic",
        state_class: "measurement",
    },
    cube_side: { icon: "mdi:cube" },
    current: { device_class: "current", state_class: "measurement" },
    current_phase_b: { device_class: "current", state_class: "measurement" },
    current_phase_c: { device_class: "current", state_class: "measurement" },
    deadzone_temperature: { entity_category: "config", icon: "mdi:thermometer" },
    detection_interval: { icon: "mdi:timer" },
    device_temperature: {
        device_class: "temperature",
        entity_category: "diagnostic",
        state_class: "measurement",
    },
    distance: { device_class: "distance", state_class: "measurement" },
    duration: { entity_category: "config", icon: "mdi:timer" },
    eco2: { device_class: "carbon_dioxide", state_class: "measurement" },
    eco_temperature: { entity_category: "config", icon: "mdi:thermometer" },
    energy: { device_class: "energy", state_class: "total_increasing" },
    external_temperature_input: { device_class: "temperature", icon: "mdi:thermometer" },
    external_temperature: { device_class: "temperature", icon: "mdi:thermometer" },
    external_humidity: { device_class: "humidity", icon: "mdi:water-percent" },
    formaldehyd: { state_class: "measurement" },
    flow: { device_class: "volume_flow_rate", state_class: "measurement" },
    gas_density: { icon: "mdi:google-circles-communities", state_class: "measurement" },
    hcho: { icon: "mdi:air-filter", state_class: "measurement" },
    humidity: { device_class: "humidity", state_class: "measurement" },
    humidity_calibration: { entity_category: "config", icon: "mdi:wrench-clock" },
    humidity_max: { entity_category: "config", icon: "mdi:water-percent" },
    humidity_min: { entity_category: "config", icon: "mdi:water-percent" },
    illuminance_calibration: { entity_category: "config", icon: "mdi:wrench-clock" },
    illuminance: { device_class: "illuminance", state_class: "measurement" },
    internalTemperature: {
        device_class: "temperature",
        entity_category: "diagnostic",
        state_class: "measurement",
    },
    linkquality: {
        enabled_by_default: false,
        entity_category: "diagnostic",
        icon: "mdi:signal",
        state_class: "measurement",
    },
    local_temperature: { device_class: "temperature", state_class: "measurement" },
    max_range: { entity_category: "config", icon: "mdi:signal-distance-variant" },
    max_temperature: { entity_category: "config", icon: "mdi:thermometer-high" },
    max_temperature_limit: { entity_category: "config", icon: "mdi:thermometer-high" },
    min_temperature_limit: { entity_category: "config", icon: "mdi:thermometer-low" },
    min_temperature: { entity_category: "config", icon: "mdi:thermometer-low" },
    minimum_on_level: { entity_category: "config" },
    measurement_poll_interval: { entity_category: "config", icon: "mdi:clock-out" },
    motion_sensitivity: { entity_category: "config", icon: "mdi:motion-sensor" },
    noise: { device_class: "sound_pressure", state_class: "measurement" },
    noise_detect_level: { icon: "mdi:volume-equal" },
    noise_timeout: { icon: "mdi:timer" },
    occupancy_level: { icon: "mdi:motion-sensor" },
    occupancy_sensitivity: { entity_category: "config", icon: "mdi:motion-sensor" },
    occupancy_timeout: { entity_category: "config", icon: "mdi:timer" },
    overload_protection: { icon: "mdi:flash" },
    pm10: { device_class: "pm10", state_class: "measurement" },
    pm25: { device_class: "pm25", state_class: "measurement" },
    people: { state_class: "measurement", icon: "mdi:account-multiple" },
    position: { icon: "mdi:valve", state_class: "measurement" },
    power: { device_class: "power", state_class: "measurement" },
    power_phase_b: { device_class: "power", state_class: "measurement" },
    power_phase_c: { device_class: "power", state_class: "measurement" },
    power_factor: { device_class: "power_factor", enabled_by_default: false, entity_category: "diagnostic", state_class: "measurement" },
    power_outage_count: { icon: "mdi:counter", enabled_by_default: false },
    precision: { entity_category: "config", icon: "mdi:decimal-comma-increase" },
    pressure: { device_class: "atmospheric_pressure", state_class: "measurement" },
    presence_timeout: { entity_category: "config", icon: "mdi:timer" },
    reporting_time: { entity_category: "config", icon: "mdi:clock-time-one-outline" },
    requested_brightness_level: {
        enabled_by_default: false,
        entity_category: "diagnostic",
        icon: "mdi:brightness-5",
    },
    requested_brightness_percent: {
        enabled_by_default: false,
        entity_category: "diagnostic",
        icon: "mdi:brightness-5",
    },
    smoke_density: { icon: "mdi:google-circles-communities", state_class: "measurement" },
    soil_moisture: { device_class: "moisture", state_class: "measurement" },
    temperature: { device_class: "temperature", state_class: "measurement" },
    temperature_calibration: { entity_category: "config", icon: "mdi:wrench-clock" },
    temperature_max: { entity_category: "config", icon: "mdi:thermometer-plus" },
    temperature_min: { entity_category: "config", icon: "mdi:thermometer-minus" },
    temperature_offset: { icon: "mdi:thermometer-lines" },
    transition: { entity_category: "config", icon: "mdi:transition" },
    trigger_count: { icon: "mdi:counter", enabled_by_default: false },
    voc: { device_class: "volatile_organic_compounds", state_class: "measurement" },
    voc_index: { state_class: "measurement", icon: "mdi:molecule" },
    voc_parts: { device_class: "volatile_organic_compounds_parts", state_class: "measurement" },
    vibration_timeout: { entity_category: "config", icon: "mdi:timer" },
    voltage: { device_class: "voltage", state_class: "measurement" },
    voltage_phase_b: { device_class: "voltage", state_class: "measurement" },
    voltage_phase_c: { device_class: "voltage", state_class: "measurement" },
    water_consumed: {
        device_class: "water",
        state_class: "total_increasing",
    },
    x: { icon: "mdi:axis-x-arrow", state_class: "measurement" },
    x_axis: { icon: "mdi:axis-x-arrow", state_class: "measurement" },
    y: { icon: "mdi:axis-y-arrow", state_class: "measurement" },
    y_axis: { icon: "mdi:axis-y-arrow", state_class: "measurement" },
    z: { icon: "mdi:axis-z-arrow", state_class: "measurement" },
    z_axis: { icon: "mdi:axis-z-arrow", state_class: "measurement" },
};
const ENUM_DISCOVERY_LOOKUP = {
    action: { icon: "mdi:gesture-double-tap" },
    alarm_humidity: { entity_category: "config", icon: "mdi:water-percent-alert" },
    alarm_temperature: { entity_category: "config", icon: "mdi:thermometer-alert" },
    backlight_auto_dim: { entity_category: "config", icon: "mdi:brightness-auto" },
    backlight_mode: { entity_category: "config", icon: "mdi:lightbulb" },
    calibrate: { icon: "mdi:tune" },
    color_power_on_behavior: { entity_category: "config", icon: "mdi:palette" },
    control_mode: { entity_category: "config", icon: "mdi:tune" },
    device_mode: { entity_category: "config", icon: "mdi:tune" },
    effect: { enabled_by_default: false, icon: "mdi:palette" },
    force: { entity_category: "config", icon: "mdi:valve" },
    keep_time: { entity_category: "config", icon: "mdi:av-timer" },
    identify: { device_class: "identify" },
    keypad_lockout: { entity_category: "config", icon: "mdi:lock" },
    load_detection_mode: { entity_category: "config", icon: "mdi:tune" },
    load_dimmable: { entity_category: "config", icon: "mdi:chart-bell-curve" },
    load_type: { entity_category: "config", icon: "mdi:led-on" },
    melody: { entity_category: "config", icon: "mdi:music-note" },
    mode_phase_control: { entity_category: "config", icon: "mdi:tune" },
    mode: { entity_category: "config", icon: "mdi:tune" },
    mode_switch: { icon: "mdi:tune" },
    motion_sensitivity: { entity_category: "config", icon: "mdi:tune" },
    operation_mode: { entity_category: "config", icon: "mdi:tune" },
    power_on_behavior: { entity_category: "config", icon: "mdi:power-settings" },
    power_outage_memory: { entity_category: "config", icon: "mdi:power-settings" },
    power_supply_mode: { entity_category: "config", icon: "mdi:power-settings" },
    power_type: { entity_category: "config", icon: "mdi:lightning-bolt-circle" },
    restart: { device_class: "restart" },
    sensitivity: { entity_category: "config", icon: "mdi:tune" },
    sensor: { icon: "mdi:tune" },
    sensors_type: { entity_category: "config", icon: "mdi:tune" },
    sound_volume: { entity_category: "config", icon: "mdi:volume-high" },
    status: { icon: "mdi:state-machine" },
    switch_type: { entity_category: "config", icon: "mdi:tune" },
    temperature_display_mode: { entity_category: "config", icon: "mdi:thermometer" },
    temperature_sensor_select: { entity_category: "config", icon: "mdi:home-thermometer" },
    thermostat_unit: { entity_category: "config", icon: "mdi:thermometer" },
    update: { device_class: "update" },
    volume: { entity_category: "config", icon: "mdi: volume-high" },
    week: { entity_category: "config", icon: "mdi:calendar-clock" },
};
const LIST_DISCOVERY_LOOKUP = {
    action: { icon: "mdi:gesture-double-tap" },
    color_options: { icon: "mdi:palette" },
    level_config: { entity_category: "diagnostic" },
    programming_mode: { icon: "mdi:calendar-clock" },
    schedule_settings: { icon: "mdi:calendar-clock" },
};
const featurePropertyWithoutEndpoint = (feature) => {
    if (feature.endpoint) {
        return feature.property.slice(0, -1 + -1 * feature.endpoint.length);
    }
    return feature.property;
};
/**
 * This class handles the bridge entity configuration for Home Assistant Discovery.
 */
class Bridge {
    coordinatorIeeeAddress;
    coordinatorType;
    coordinatorFirmwareVersion;
    discoveryEntries;
    options;
    // biome-ignore lint/style/useNamingConvention: API
    get ID() {
        return this.coordinatorIeeeAddress;
    }
    get name() {
        return "bridge";
    }
    get hardwareVersion() {
        return this.coordinatorType;
    }
    get firmwareVersion() {
        return this.coordinatorFirmwareVersion;
    }
    get configs() {
        return this.discoveryEntries;
    }
    constructor(ieeeAdress, version, discovery) {
        this.coordinatorIeeeAddress = ieeeAdress;
        this.coordinatorType = version.type;
        this.coordinatorFirmwareVersion = version.meta.revision ? `${version.meta.revision}` : /* v8 ignore next */ "";
        this.discoveryEntries = discovery;
        this.options = {
            ID: `bridge_${ieeeAdress}`,
            homeassistant: {
                name: "Zigbee2MQTT Bridge",
            },
        };
    }
    isDevice() {
        return false;
    }
    isGroup() {
        return false;
    }
}
/**
 * This extensions handles integration with HomeAssistant
 */
class HomeAssistant extends extension_1.default {
    discovered = {};
    discoveryTopic;
    discoveryRegex;
    discoveryRegexWoTopic = /(.*)\/(.*)\/(.*)\/config/;
    statusTopic;
    legacyActionSensor;
    experimentalEventEntities;
    // @ts-expect-error initialized in `start`
    zigbee2MQTTVersion;
    // @ts-expect-error initialized in `start`
    discoveryOrigin;
    // @ts-expect-error initialized in `start`
    bridge;
    // @ts-expect-error initialized in `start`
    bridgeIdentifier;
    actionValueTemplate;
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        if (settings.get().advanced.output === "attribute") {
            throw new Error("Home Assistant integration is not possible with attribute output!");
        }
        const haSettings = settings.get().homeassistant;
        (0, node_assert_1.default)(haSettings.enabled, `Home Assistant extension created with setting 'enabled: false'`);
        this.discoveryTopic = haSettings.discovery_topic;
        this.discoveryRegex = new RegExp(`${haSettings.discovery_topic}/(.*)/(.*)/(.*)/config`);
        this.statusTopic = haSettings.status_topic;
        this.legacyActionSensor = haSettings.legacy_action_sensor;
        this.experimentalEventEntities = haSettings.experimental_event_entities;
        if (haSettings.discovery_topic === settings.get().mqtt.base_topic) {
            throw new Error(`'homeassistant.discovery_topic' cannot not be equal to the 'mqtt.base_topic' (got '${settings.get().mqtt.base_topic}')`);
        }
        this.actionValueTemplate = this.getActionValueTemplate();
    }
    async start() {
        if (!settings.get().advanced.cache_state) {
            logger_1.default.warning("In order for Home Assistant integration to work properly set `cache_state: true");
        }
        this.zigbee2MQTTVersion = (await utils_1.default.getZigbee2MQTTVersion(false)).version;
        this.discoveryOrigin = { name: "Zigbee2MQTT", sw: this.zigbee2MQTTVersion, url: "https://www.zigbee2mqtt.io" };
        this.bridge = this.getBridgeEntity(await this.zigbee.getCoordinatorVersion());
        this.bridgeIdentifier = this.getDevicePayload(this.bridge).identifiers[0];
        this.eventBus.onEntityRemoved(this, this.onEntityRemoved);
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        this.eventBus.onEntityRenamed(this, this.onEntityRenamed);
        this.eventBus.onPublishEntityState(this, this.onPublishEntityState);
        this.eventBus.onGroupMembersChanged(this, this.onGroupMembersChanged);
        this.eventBus.onDeviceAnnounce(this, this.onZigbeeEvent);
        this.eventBus.onDeviceJoined(this, this.onZigbeeEvent);
        this.eventBus.onDeviceInterview(this, this.onZigbeeEvent);
        this.eventBus.onDeviceMessage(this, this.onZigbeeEvent);
        this.eventBus.onScenesChanged(this, this.onScenesChanged);
        this.eventBus.onEntityOptionsChanged(this, async (data) => await this.discover(data.entity));
        this.eventBus.onExposesChanged(this, async (data) => await this.discover(data.device));
        await this.mqtt.subscribe(this.statusTopic);
        /**
         * Prevent unnecessary re-discovery of entities by waiting 5 seconds for retained discovery messages to come in.
         * Any received discovery messages will not be published again.
         * Unsubscribe from the discoveryTopic to prevent receiving our own messages.
         */
        const discoverWait = 5;
        // Discover with `published = false`, this will populate `this.discovered` without publishing the discoveries.
        // This is needed for clearing outdated entries in `this.onMQTTMessage()`
        await this.discover(this.bridge, false);
        for (const e of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
            await this.discover(e, false);
        }
        logger_1.default.debug(`Discovering entities to Home Assistant in ${discoverWait}s`);
        await this.mqtt.subscribe(`${this.discoveryTopic}/#`);
        setTimeout(async () => {
            await this.mqtt.unsubscribe(`${this.discoveryTopic}/#`);
            logger_1.default.debug("Discovering entities to Home Assistant");
            await this.discover(this.bridge);
            for (const e of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
                await this.discover(e);
            }
        }, utils_1.default.seconds(discoverWait));
    }
    getDiscovered(entity) {
        const ID = typeof entity === "string" || typeof entity === "number" ? entity : entity.ID;
        if (!(ID in this.discovered)) {
            this.discovered[ID] = { messages: {}, triggers: new Set(), mockProperties: new Set(), discovered: false };
        }
        return this.discovered[ID];
    }
    exposeToConfig(exposes, entityType, allExposes, definition) {
        // For groups an array of exposes (of the same type) is passed, this is to determine e.g. what features
        // to use for a bulb (e.g. color_xy/color_temp)
        (0, node_assert_1.default)(entityType === "group" || exposes.length === 1, "Multiple exposes for device not allowed");
        const firstExpose = exposes[0];
        (0, node_assert_1.default)(entityType === "device" || GROUP_SUPPORTED_TYPES.includes(firstExpose.type), `Unsupported expose type ${firstExpose.type} for group`);
        const discoveryEntries = [];
        const endpoint = entityType === "device" ? exposes[0].endpoint : undefined;
        const getProperty = (feature) => (entityType === "group" ? featurePropertyWithoutEndpoint(feature) : feature.property);
        switch (firstExpose.type) {
            case "light": {
                const hasColorXY = exposes.find((expose) => expose.features.find((e) => e.name === "color_xy"));
                const hasColorHS = exposes.find((expose) => expose.features.find((e) => e.name === "color_hs"));
                const hasBrightness = exposes.find((expose) => expose.features.find((e) => e.name === "brightness"));
                const hasColorTemp = exposes.find((expose) => expose.features.find((e) => e.name === "color_temp"));
                const state = firstExpose.features.find((f) => f.name === "state");
                (0, node_assert_1.default)(state, `Light expose must have a 'state'`);
                // Prefer HS over XY when at least one of the lights in the group prefers HS over XY.
                // A light prefers HS over XY when HS is earlier in the feature array than HS.
                const preferHS = exposes
                    .map((e) => [e.features.findIndex((ee) => ee.name === "color_xy"), e.features.findIndex((ee) => ee.name === "color_hs")])
                    .filter((d) => d[0] !== -1 && d[1] !== -1 && d[1] < d[0]).length !== 0;
                const discoveryEntry = {
                    type: "light",
                    object_id: endpoint ? `light_${endpoint}` : "light",
                    mockProperties: [{ property: state.property, value: null }],
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        brightness: !!hasBrightness,
                        schema: "json",
                        command_topic: true,
                        brightness_scale: 254,
                        command_topic_prefix: endpoint,
                        state_topic_postfix: endpoint,
                    },
                };
                const colorModes = [
                    hasColorXY && !preferHS ? "xy" : null,
                    (!hasColorXY || preferHS) && hasColorHS ? "hs" : null,
                    hasColorTemp ? "color_temp" : null,
                ].filter((c) => c);
                if (colorModes.length) {
                    discoveryEntry.discovery_payload.supported_color_modes = colorModes;
                }
                else {
                    /**
                     * All bulbs support brightness, note that `brightness` cannot be combined
                     * with other color modes.
                     * https://github.com/Koenkk/zigbee2mqtt/issues/26520#issuecomment-2692432058
                     */
                    discoveryEntry.discovery_payload.supported_color_modes = ["brightness"];
                }
                if (hasColorTemp) {
                    const colorTemps = exposes
                        .map((expose) => expose.features.find((e) => e.name === "color_temp"))
                        .filter((e) => e !== undefined && (0, utils_1.isNumericExpose)(e));
                    const max = Math.min(...colorTemps.map((e) => e.value_max).filter((e) => e !== undefined));
                    const min = Math.max(...colorTemps.map((e) => e.value_min).filter((e) => e !== undefined));
                    discoveryEntry.discovery_payload.max_mireds = max;
                    discoveryEntry.discovery_payload.min_mireds = min;
                }
                const effects = utils_1.default.arrayUnique(utils_1.default.flatten(allExposes
                    .filter(utils_1.isEnumExpose)
                    .filter((e) => e.name === "effect")
                    .map((e) => e.values)));
                if (effects.length) {
                    discoveryEntry.discovery_payload.effect = true;
                    discoveryEntry.discovery_payload.effect_list = effects;
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "switch": {
                const state = firstExpose.features.filter(utils_1.isBinaryExpose).find((f) => f.name === "state");
                (0, node_assert_1.default)(state, `Switch expose must have a 'state'`);
                const property = getProperty(state);
                const discoveryEntry = {
                    type: "switch",
                    object_id: endpoint ? `switch_${endpoint}` : "switch",
                    mockProperties: [{ property: property, value: null }],
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        payload_off: state.value_off,
                        payload_on: state.value_on,
                        value_template: `{{ value_json.${property} }}`,
                        command_topic: true,
                        command_topic_prefix: endpoint,
                    },
                };
                if (SWITCH_DIFFERENT.includes(property)) {
                    discoveryEntry.discovery_payload.name = firstExpose.label;
                    discoveryEntry.discovery_payload.command_topic_postfix = property;
                    discoveryEntry.discovery_payload.state_off = state.value_off;
                    discoveryEntry.discovery_payload.state_on = state.value_on;
                    discoveryEntry.object_id = property;
                    if (property === "window_detection") {
                        discoveryEntry.discovery_payload.icon = "mdi:window-open-variant";
                    }
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "climate": {
                const setpointProperties = ["occupied_heating_setpoint", "current_heating_setpoint"];
                const setpoint = firstExpose.features.filter(utils_1.isNumericExpose).find((f) => setpointProperties.includes(f.name));
                (0, node_assert_1.default)(setpoint && setpoint.value_min !== undefined && setpoint.value_max !== undefined, "No setpoint found or it is missing value_min/max");
                const temperature = firstExpose.features.find((f) => f.name === "local_temperature");
                (0, node_assert_1.default)(temperature, "No temperature found");
                const discoveryEntry = {
                    type: "climate",
                    object_id: endpoint ? `climate_${endpoint}` : "climate",
                    mockProperties: [],
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        // Static
                        state_topic: false,
                        temperature_unit: "C",
                        // Setpoint
                        temp_step: setpoint.value_step,
                        min_temp: setpoint.value_min.toString(),
                        max_temp: setpoint.value_max.toString(),
                        // Temperature
                        current_temperature_topic: true,
                        current_temperature_template: `{{ value_json.${temperature.property} }}`,
                        command_topic_prefix: endpoint,
                    },
                };
                const mode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === "system_mode");
                if (mode) {
                    if (mode.values.includes("sleep")) {
                        // 'sleep' is not supported by Home Assistant, but is valid according to ZCL
                        // TRV that support sleep (e.g. Viessmann) will have it removed from here,
                        // this allows other expose consumers to still use it, e.g. the frontend.
                        mode.values.splice(mode.values.indexOf("sleep"), 1);
                    }
                    discoveryEntry.discovery_payload.mode_state_topic = true;
                    discoveryEntry.discovery_payload.mode_state_template = `{{ value_json.${mode.property} }}`;
                    discoveryEntry.discovery_payload.modes = mode.values;
                    discoveryEntry.discovery_payload.mode_command_topic = true;
                }
                const state = firstExpose.features.find((f) => f.name === "running_state");
                if (state) {
                    discoveryEntry.mockProperties.push({ property: state.property, value: null });
                    discoveryEntry.discovery_payload.action_topic = true;
                    discoveryEntry.discovery_payload.action_template = `{% set values = {None:None,'idle':'idle','heat':'heating','cool':'cooling','fan_only':'fan'} %}{{ values[value_json.${state.property}] }}`;
                }
                const coolingSetpoint = firstExpose.features.find((f) => f.name === "occupied_cooling_setpoint");
                if (coolingSetpoint) {
                    discoveryEntry.discovery_payload.temperature_low_command_topic = setpoint.name;
                    discoveryEntry.discovery_payload.temperature_low_state_template = `{{ value_json.${setpoint.property} }}`;
                    discoveryEntry.discovery_payload.temperature_low_state_topic = true;
                    discoveryEntry.discovery_payload.temperature_high_command_topic = coolingSetpoint.name;
                    discoveryEntry.discovery_payload.temperature_high_state_template = `{{ value_json.${coolingSetpoint.property} }}`;
                    discoveryEntry.discovery_payload.temperature_high_state_topic = true;
                }
                else {
                    discoveryEntry.discovery_payload.temperature_command_topic = setpoint.name;
                    discoveryEntry.discovery_payload.temperature_state_template = `{{ value_json.${setpoint.property} }}`;
                    discoveryEntry.discovery_payload.temperature_state_topic = true;
                }
                const fanMode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === "fan_mode");
                if (fanMode) {
                    discoveryEntry.discovery_payload.fan_modes = fanMode.values;
                    discoveryEntry.discovery_payload.fan_mode_command_topic = true;
                    discoveryEntry.discovery_payload.fan_mode_state_template = `{{ value_json.${fanMode.property} }}`;
                    discoveryEntry.discovery_payload.fan_mode_state_topic = true;
                }
                const swingMode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === "swing_mode");
                if (swingMode) {
                    discoveryEntry.discovery_payload.swing_modes = swingMode.values;
                    discoveryEntry.discovery_payload.swing_mode_command_topic = true;
                    discoveryEntry.discovery_payload.swing_mode_state_template = `{{ value_json.${swingMode.property} }}`;
                    discoveryEntry.discovery_payload.swing_mode_state_topic = true;
                }
                const preset = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === "preset");
                if (preset) {
                    discoveryEntry.discovery_payload.preset_modes = preset.values;
                    discoveryEntry.discovery_payload.preset_mode_command_topic = "preset";
                    discoveryEntry.discovery_payload.preset_mode_value_template = `{{ value_json.${preset.property} }}`;
                    discoveryEntry.discovery_payload.preset_mode_state_topic = true;
                }
                const tempCalibration = firstExpose.features
                    .filter(utils_1.isNumericExpose)
                    .find((f) => f.name === "local_temperature_calibration");
                if (tempCalibration) {
                    const discoveryEntry = {
                        type: "number",
                        object_id: endpoint ? `${tempCalibration.name}_${endpoint}` : `${tempCalibration.name}`,
                        mockProperties: [{ property: tempCalibration.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${tempCalibration.label} ${endpoint}` : tempCalibration.label,
                            value_template: `{{ value_json.${tempCalibration.property} }}`,
                            command_topic: true,
                            command_topic_prefix: endpoint,
                            command_topic_postfix: tempCalibration.property,
                            device_class: "temperature",
                            entity_category: "config",
                            icon: "mdi:math-compass",
                            ...(tempCalibration.unit && { unit_of_measurement: tempCalibration.unit }),
                        },
                    };
                    if (tempCalibration.value_min != null)
                        discoveryEntry.discovery_payload.min = tempCalibration.value_min;
                    if (tempCalibration.value_max != null)
                        discoveryEntry.discovery_payload.max = tempCalibration.value_max;
                    if (tempCalibration.value_step != null) {
                        discoveryEntry.discovery_payload.step = tempCalibration.value_step;
                    }
                    discoveryEntries.push(discoveryEntry);
                }
                const piHeatingDemand = firstExpose.features.filter(utils_1.isNumericExpose).find((f) => f.name === "pi_heating_demand");
                if (piHeatingDemand) {
                    const discoveryEntry = {
                        object_id: endpoint ? `${piHeatingDemand.name}_${endpoint}` : `${piHeatingDemand.name}`,
                        mockProperties: [{ property: piHeatingDemand.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${piHeatingDemand.label} ${endpoint}` : piHeatingDemand.label,
                            value_template: `{{ value_json.${piHeatingDemand.property} }}`,
                            ...(piHeatingDemand.unit && { unit_of_measurement: piHeatingDemand.unit }),
                            icon: "mdi:radiator",
                        },
                    };
                    (0, node_assert_1.default)(discoveryEntry.discovery_payload);
                    if (piHeatingDemand.access & ACCESS_SET) {
                        discoveryEntry.type = "number";
                        discoveryEntry.discovery_payload.command_topic = true;
                        discoveryEntry.discovery_payload.command_topic_prefix = endpoint;
                        discoveryEntry.discovery_payload.command_topic_postfix = piHeatingDemand.property;
                        discoveryEntry.discovery_payload.min = piHeatingDemand.value_min;
                        discoveryEntry.discovery_payload.max = piHeatingDemand.value_max;
                    }
                    else {
                        discoveryEntry.type = "sensor";
                        discoveryEntry.discovery_payload.entity_category = "diagnostic";
                    }
                    discoveryEntries.push(discoveryEntry);
                }
                const piCoolingDemand = firstExpose.features.filter(utils_1.isNumericExpose).find((f) => f.name === "pi_cooling_demand");
                if (piCoolingDemand) {
                    const discoveryEntry = {
                        type: "sensor",
                        object_id: endpoint ? /* v8 ignore next */ `${piCoolingDemand.name}_${endpoint}` : `${piCoolingDemand.name}`,
                        mockProperties: [{ property: piCoolingDemand.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${piCoolingDemand.label} ${endpoint}` : piCoolingDemand.label,
                            value_template: `{{ value_json.${piCoolingDemand.property} }}`,
                            ...(piCoolingDemand.unit && { unit_of_measurement: piCoolingDemand.unit }),
                            entity_category: "diagnostic",
                            icon: "mdi:air-conditioner",
                        },
                    };
                    discoveryEntries.push(discoveryEntry);
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "lock": {
                const state = firstExpose.features.filter(utils_1.isBinaryExpose).find((f) => f.name === "state");
                (0, node_assert_1.default)(state?.name === "state", "Lock expose must have a 'state'");
                const discoveryEntry = {
                    type: "lock",
                    /* v8 ignore next */
                    object_id: endpoint ? `lock_${endpoint}` : "lock",
                    mockProperties: [{ property: state.property, value: null }],
                    discovery_payload: {
                        /* v8 ignore next */
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        command_topic_prefix: endpoint,
                        command_topic: true,
                        value_template: `{{ value_json.${state.property} }}`,
                        state_locked: state.value_on,
                        state_unlocked: state.value_off,
                        /* v8 ignore next */
                        command_topic_postfix: endpoint ? state.property : null,
                    },
                };
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "cover": {
                const state = exposes
                    .find((expose) => expose.features.find((e) => e.name === "state"))
                    ?.features.find((f) => f.name === "state");
                (0, node_assert_1.default)(state, `Cover expose must have a 'state'`);
                const position = exposes
                    .find((expose) => expose.features.find((e) => e.name === "position"))
                    ?.features.find((f) => f.name === "position");
                const tilt = exposes
                    .find((expose) => expose.features.find((e) => e.name === "tilt"))
                    ?.features.find((f) => f.name === "tilt");
                const motorState = allExposes
                    ?.filter(utils_1.isEnumExpose)
                    .find((e) => ["motor_state", "moving"].includes(e.name) && e.access === ACCESS_STATE);
                const running = allExposes?.filter(utils_1.isBinaryExpose)?.find((e) => e.name === "running");
                const discoveryEntry = {
                    type: "cover",
                    mockProperties: [{ property: state.property, value: null }],
                    object_id: endpoint ? `cover_${endpoint}` : "cover",
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        command_topic_prefix: endpoint,
                        command_topic: true,
                        state_topic: true,
                        state_topic_postfix: endpoint,
                    },
                };
                // If curtains have `running` property, use this in discovery.
                // The movement direction is calculated (assumed) in this case.
                if (running) {
                    (0, node_assert_1.default)(position, `Cover must have 'position' when it has 'running'`);
                    discoveryEntry.discovery_payload.value_template = `{% if "${featurePropertyWithoutEndpoint(running)}" in value_json and value_json.${featurePropertyWithoutEndpoint(running)} %} {% if value_json.${featurePropertyWithoutEndpoint(position)} > 0 %} closing {% else %} opening {% endif %} {% else %} stopped {% endif %}`;
                }
                // If curtains have `motor_state` or `moving` property, lookup for possible
                // state names to detect movement direction and use this in discovery.
                if (motorState) {
                    const openingState = motorState.values.find((s) => COVER_OPENING_LOOKUP.includes(s.toString().toLowerCase()));
                    const closingState = motorState.values.find((s) => COVER_CLOSING_LOOKUP.includes(s.toString().toLowerCase()));
                    const stoppedState = motorState.values.find((s) => COVER_STOPPED_LOOKUP.includes(s.toString().toLowerCase()));
                    if (openingState && closingState && stoppedState) {
                        discoveryEntry.discovery_payload.state_opening = openingState;
                        discoveryEntry.discovery_payload.state_closing = closingState;
                        discoveryEntry.discovery_payload.state_stopped = stoppedState;
                        discoveryEntry.discovery_payload.value_template = `{% if "${featurePropertyWithoutEndpoint(motorState)}" in value_json and value_json.${featurePropertyWithoutEndpoint(motorState)} %} {{ value_json.${featurePropertyWithoutEndpoint(motorState)} }} {% else %} ${stoppedState} {% endif %}`;
                    }
                }
                // If curtains do not have `running`, `motor_state` or `moving` properties.
                if (!discoveryEntry.discovery_payload.value_template) {
                    discoveryEntry.discovery_payload.value_template = `{{ value_json.${featurePropertyWithoutEndpoint(state)} }}`;
                    discoveryEntry.discovery_payload.state_open = "OPEN";
                    discoveryEntry.discovery_payload.state_closed = "CLOSE";
                    discoveryEntry.discovery_payload.state_stopped = "STOP";
                }
                /* v8 ignore start */
                if (!position && !tilt) {
                    discoveryEntry.discovery_payload.optimistic = true;
                }
                /* v8 ignore stop */
                if (position) {
                    discoveryEntry.discovery_payload = {
                        ...discoveryEntry.discovery_payload,
                        position_template: `{{ value_json.${featurePropertyWithoutEndpoint(position)} }}`,
                        set_position_template: `{ "${getProperty(position)}": {{ position }} }`,
                        set_position_topic: true,
                        position_topic: true,
                    };
                }
                if (tilt) {
                    discoveryEntry.discovery_payload = {
                        ...discoveryEntry.discovery_payload,
                        tilt_command_topic: true,
                        tilt_status_topic: true,
                        tilt_status_template: `{{ value_json.${featurePropertyWithoutEndpoint(tilt)} }}`,
                    };
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "fan": {
                (0, node_assert_1.default)(!endpoint, "Endpoint not supported for fan type");
                const discoveryEntry = {
                    type: "fan",
                    object_id: "fan",
                    mockProperties: [{ property: "fan_state", value: null }],
                    discovery_payload: {
                        name: null,
                        state_topic: true,
                        command_topic: true,
                    },
                };
                const modeEmulatedSpeed = firstExpose.features.filter(utils_1.isEnumExpose).find((e) => e.name === "mode");
                const nativeSpeed = firstExpose.features.filter(utils_1.isNumericExpose).find((e) => e.name === "speed");
                // Exactly one mode needs to be active (logical xor)
                (0, node_assert_1.default)(!modeEmulatedSpeed !== !nativeSpeed, "Fans need to be either mode- or speed-controlled");
                if (modeEmulatedSpeed) {
                    // A fan entity in Home Assistant 2021.3 and above may have a speed,
                    // controlled by a percentage from 1 to 100, and/or non-speed presets.
                    // The MQTT Fan integration allows the speed percentage to be mapped
                    // to a narrower range of speeds (e.g. 1-3), and for these speeds to be
                    // translated to and from MQTT messages via templates.
                    //
                    // For the fixed fan modes in ZCL hvacFanCtrl, we model speeds "low",
                    // "medium", and "high" as three speeds covering the full percentage
                    // range as done in Home Assistant's zigpy fan integration, plus
                    // presets "on", "auto" and "smart" to cover the remaining modes in
                    // ZCL. This supports a generic ZCL HVAC Fan Control fan. "Off" is
                    // always a valid speed.
                    let speeds = ["off"].concat(["low", "medium", "high", "1", "2", "3", "4", "5", "6", "7", "8", "9"].filter((s) => modeEmulatedSpeed.values.includes(s)));
                    let presets = ["on", "auto", "smart"].filter((s) => modeEmulatedSpeed.values.includes(s));
                    if (definition?.model === "99432") {
                        // The Hampton Bay 99432 fan implements 4 speeds using the ZCL
                        // hvacFanCtrl values `low`, `medium`, `high`, and `on`, and
                        // 1 preset called "Comfort Breeze" using the ZCL value `smart`.
                        // ZCL value `auto` is unused.
                        speeds = ["off", "low", "medium", "high", "on"];
                        presets = ["smart"];
                    }
                    const allowed = [...speeds, ...presets];
                    for (const val of modeEmulatedSpeed.values) {
                        (0, node_assert_1.default)(allowed.includes(val.toString()));
                    }
                    const percentValues = speeds.map((s, i) => `'${s}':${i}`).join(", ");
                    const percentCommands = speeds.map((s, i) => `${i}:'${s}'`).join(", ");
                    const presetList = presets.map((s) => `'${s}'`).join(", ");
                    discoveryEntry.discovery_payload.percentage_state_topic = true;
                    discoveryEntry.discovery_payload.percentage_command_topic = "fan_mode";
                    discoveryEntry.discovery_payload.percentage_value_template = `{{ {${percentValues}}[value_json.${modeEmulatedSpeed.property}] | default('None') }}`;
                    discoveryEntry.discovery_payload.percentage_command_template = `{{ {${percentCommands}}[value] | default('') }}`;
                    discoveryEntry.discovery_payload.speed_range_min = 1;
                    discoveryEntry.discovery_payload.speed_range_max = speeds.length - 1;
                    (0, node_assert_1.default)(presets.length !== 0);
                    discoveryEntry.discovery_payload.preset_mode_state_topic = true;
                    discoveryEntry.discovery_payload.preset_mode_command_topic = "fan_mode";
                    discoveryEntry.discovery_payload.preset_mode_value_template = `{{ value_json.${modeEmulatedSpeed.property} if value_json.${modeEmulatedSpeed.property} in [${presetList}] else 'None' | default('None') }}`;
                    discoveryEntry.discovery_payload.preset_modes = presets;
                    // Emulate state based on mode
                    discoveryEntry.discovery_payload.state_value_template = "{{ value_json.fan_state }}";
                    discoveryEntry.discovery_payload.command_topic_postfix = "fan_state";
                }
                else if (nativeSpeed) {
                    discoveryEntry.discovery_payload.percentage_state_topic = true;
                    discoveryEntry.discovery_payload.percentage_command_topic = "speed";
                    discoveryEntry.discovery_payload.percentage_value_template = `{{ value_json.${nativeSpeed.property} | default('None') }}`;
                    discoveryEntry.discovery_payload.percentage_command_template = `{{ value | default('') }}`;
                    discoveryEntry.discovery_payload.speed_range_min = nativeSpeed.value_min;
                    discoveryEntry.discovery_payload.speed_range_max = nativeSpeed.value_max;
                    // Speed-controlled fans generally have an onOff cluster, use that for state
                    discoveryEntry.discovery_payload.state_value_template = "{{ value_json.state }}";
                    discoveryEntry.discovery_payload.command_topic_postfix = "state";
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "binary": {
                /**
                 * If Z2M binary attribute has SET access then expose it as `switch` in HA
                 * There is also a check on the values for typeof boolean to prevent invalid values and commands
                 * silently failing - commands work fine but some devices won't reject unexpected values.
                 * https://github.com/Koenkk/zigbee2mqtt/issues/7740
                 */
                (0, utils_1.assertBinaryExpose)(firstExpose);
                if (firstExpose.access & ACCESS_SET) {
                    const discoveryEntry = {
                        type: "switch",
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        object_id: endpoint ? `switch_${firstExpose.name}_${endpoint}` : `switch_${firstExpose.name}`,
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: typeof firstExpose.value_on === "boolean"
                                ? `{% if value_json.${firstExpose.property} %}true{% else %}false{% endif %}`
                                : `{{ value_json.${firstExpose.property} }}`,
                            payload_on: firstExpose.value_on.toString(),
                            payload_off: firstExpose.value_off.toString(),
                            command_topic: true,
                            command_topic_prefix: endpoint,
                            command_topic_postfix: firstExpose.property,
                            ...(BINARY_DISCOVERY_LOOKUP[firstExpose.name] || {}),
                        },
                    };
                    discoveryEntries.push(discoveryEntry);
                }
                else {
                    const discoveryEntry = {
                        type: "binary_sensor",
                        object_id: endpoint ? `${firstExpose.name}_${endpoint}` : `${firstExpose.name}`,
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: `{{ value_json.${firstExpose.property} }}`,
                            payload_on: firstExpose.value_on,
                            payload_off: firstExpose.value_off,
                            ...(BINARY_DISCOVERY_LOOKUP[firstExpose.name] || {}),
                        },
                    };
                    discoveryEntries.push(discoveryEntry);
                }
                break;
            }
            case "numeric": {
                (0, utils_1.assertNumericExpose)(firstExpose);
                const allowsSet = firstExpose.access & ACCESS_SET;
                /**
                 * If numeric attribute has SET access then expose as SELECT entity.
                 */
                if (allowsSet) {
                    const discoveryEntry = {
                        type: "number",
                        object_id: endpoint ? `${firstExpose.name}_${endpoint}` : `${firstExpose.name}`,
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: `{{ value_json.${firstExpose.property} }}`,
                            command_topic: true,
                            command_topic_prefix: endpoint,
                            command_topic_postfix: firstExpose.property,
                            ...(firstExpose.unit && { unit_of_measurement: firstExpose.unit }),
                            ...(firstExpose.value_step && { step: firstExpose.value_step }),
                            ...NUMERIC_DISCOVERY_LOOKUP[firstExpose.name],
                        },
                    };
                    if (NUMERIC_DISCOVERY_LOOKUP[firstExpose.name]?.device_class === "temperature") {
                        discoveryEntry.discovery_payload.device_class = NUMERIC_DISCOVERY_LOOKUP[firstExpose.name]?.device_class;
                    }
                    else {
                        delete discoveryEntry.discovery_payload.device_class;
                    }
                    if (firstExpose.value_min != null)
                        discoveryEntry.discovery_payload.min = firstExpose.value_min;
                    if (firstExpose.value_max != null)
                        discoveryEntry.discovery_payload.max = firstExpose.value_max;
                    discoveryEntries.push(discoveryEntry);
                    break;
                }
                const extraAttrs = {};
                // If a variable includes Wh, mark it as energy
                if (firstExpose.unit && ["Wh", "kWh"].includes(firstExpose.unit)) {
                    Object.assign(extraAttrs, { device_class: "energy", state_class: "total_increasing" });
                }
                // If a variable includes A or mA, mark it as current
                else if (firstExpose.unit && ["A", "mA"].includes(firstExpose.unit)) {
                    Object.assign(extraAttrs, { device_class: "current", state_class: "measurement" });
                }
                // If a variable includes mW, W, kW mark it as power
                else if (firstExpose.unit && ["mW", "W", "kW"].includes(firstExpose.unit)) {
                    Object.assign(extraAttrs, { device_class: "power", state_class: "measurement" });
                }
                let key = firstExpose.name;
                // Home Assistant uses a different voc device_class for µg/m³ versus ppb or ppm.
                if (firstExpose.name === "voc" && firstExpose.unit && ["ppb", "ppm"].includes(firstExpose.unit)) {
                    key = "voc_parts";
                }
                const discoveryEntry = {
                    type: "sensor",
                    object_id: endpoint ? `${firstExpose.name}_${endpoint}` : `${firstExpose.name}`,
                    mockProperties: [{ property: firstExpose.property, value: null }],
                    discovery_payload: {
                        name: endpoint ? `${firstExpose.label} ${endpoint}` : firstExpose.label,
                        value_template: `{{ value_json.${firstExpose.property} }}`,
                        enabled_by_default: !allowsSet,
                        ...(firstExpose.unit && { unit_of_measurement: firstExpose.unit }),
                        ...NUMERIC_DISCOVERY_LOOKUP[key],
                        ...extraAttrs,
                    },
                };
                // When a device_class is set, unit_of_measurement must be set, otherwise warnings are generated.
                // https://github.com/Koenkk/zigbee2mqtt/issues/15958#issuecomment-1377483202
                if (discoveryEntry.discovery_payload.device_class && !discoveryEntry.discovery_payload.unit_of_measurement) {
                    delete discoveryEntry.discovery_payload.device_class;
                }
                // entity_category config is not allowed for sensors
                // https://github.com/Koenkk/zigbee2mqtt/issues/20252
                if (discoveryEntry.discovery_payload.entity_category === "config") {
                    discoveryEntry.discovery_payload.entity_category = "diagnostic";
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case "enum": {
                (0, utils_1.assertEnumExpose)(firstExpose);
                /**
                 * If enum attribute does not have SET access and is named 'action', then expose
                 * as EVENT entity. Wildcard actions like `recall_*` are currently not supported.
                 */
                if (firstExpose.property === "action") {
                    if (this.experimentalEventEntities &&
                        firstExpose.access & ACCESS_STATE &&
                        !(firstExpose.access & ACCESS_SET) &&
                        firstExpose.property === "action") {
                        discoveryEntries.push({
                            type: "event",
                            object_id: firstExpose.property,
                            mockProperties: [],
                            discovery_payload: {
                                name: endpoint ? /* v8 ignore next */ `${firstExpose.label} ${endpoint}` : firstExpose.label,
                                state_topic: true,
                                event_types: this.prepareActionEventTypes(firstExpose.values),
                                value_template: this.actionValueTemplate,
                                ...ENUM_DISCOVERY_LOOKUP[firstExpose.name],
                            },
                        });
                    }
                    if (!this.legacyActionSensor) {
                        break;
                    }
                }
                const valueTemplate = firstExpose.access & ACCESS_STATE ? `{{ value_json.${firstExpose.property} }}` : undefined;
                /**
                 * If enum has only one item and has SET access then expose as BUTTON entity.
                 */
                if (firstExpose.access & ACCESS_SET && firstExpose.values.length === 1) {
                    discoveryEntries.push({
                        type: "button",
                        object_id: firstExpose.property,
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            state_topic: false,
                            command_topic_prefix: endpoint,
                            command_topic: true,
                            command_topic_postfix: firstExpose.property,
                            payload_press: firstExpose.values[0].toString(),
                            ...ENUM_DISCOVERY_LOOKUP[firstExpose.name],
                        },
                    });
                    break;
                }
                /**
                 * If enum attribute has SET access then expose as SELECT entity.
                 */
                if (firstExpose.access & ACCESS_SET) {
                    discoveryEntries.push({
                        type: "select",
                        object_id: firstExpose.property,
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: valueTemplate,
                            state_topic: !!(firstExpose.access & ACCESS_STATE),
                            command_topic_prefix: endpoint,
                            command_topic: true,
                            command_topic_postfix: firstExpose.property,
                            options: firstExpose.values.map((v) => v.toString()),
                            ...ENUM_DISCOVERY_LOOKUP[firstExpose.name],
                        },
                    });
                    break;
                }
                /**
                 * Otherwise expose as SENSOR entity.
                 */
                if (firstExpose.access & ACCESS_STATE) {
                    discoveryEntries.push({
                        type: "sensor",
                        object_id: firstExpose.property,
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: valueTemplate,
                            ...ENUM_DISCOVERY_LOOKUP[firstExpose.name],
                        },
                    });
                }
                break;
            }
            case "text":
            case "composite":
            case "list": {
                const firstExposeTyped = firstExpose;
                if (firstExposeTyped.type === "text" && firstExposeTyped.access & ACCESS_SET) {
                    discoveryEntries.push({
                        type: "text",
                        object_id: firstExposeTyped.property,
                        mockProperties: [{ property: firstExposeTyped.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${firstExposeTyped.label} ${endpoint}` : firstExposeTyped.label,
                            state_topic: firstExposeTyped.access & ACCESS_STATE,
                            value_template: `{{ value_json.${firstExposeTyped.property} }}`,
                            command_topic_prefix: endpoint,
                            command_topic: true,
                            command_topic_postfix: firstExposeTyped.property,
                            ...LIST_DISCOVERY_LOOKUP[firstExposeTyped.name],
                        },
                    });
                    break;
                }
                if (firstExposeTyped.access & ACCESS_STATE) {
                    discoveryEntries.push({
                        type: "sensor",
                        object_id: firstExposeTyped.property,
                        mockProperties: [{ property: firstExposeTyped.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${firstExposeTyped.label} ${endpoint}` : firstExposeTyped.label,
                            // Truncate text if it's too long
                            // https://github.com/Koenkk/zigbee2mqtt/issues/23199
                            value_template: `{{ value_json.${firstExposeTyped.property} | default('',True) | string | truncate(254, True, '', 0) }}`,
                            ...LIST_DISCOVERY_LOOKUP[firstExposeTyped.name],
                        },
                    });
                }
                break;
            }
        }
        // Exposes with category 'config' or 'diagnostic' are always added to the respective category.
        // This takes precedence over definitions in this file.
        if (firstExpose.category === "config" || firstExpose.category === "diagnostic") {
            for (const entry of discoveryEntries) {
                entry.discovery_payload.entity_category = firstExpose.category;
            }
        }
        for (const entry of discoveryEntries) {
            // If a sensor has entity category `config`, then change
            // it to `diagnostic`. Sensors have no input, so can't be configured.
            // https://github.com/Koenkk/zigbee2mqtt/pull/19474
            if (["binary_sensor", "sensor"].includes(entry.type) && entry.discovery_payload.entity_category === "config") {
                entry.discovery_payload.entity_category = "diagnostic";
            }
            // Event entities cannot have an entity_category set.
            if (entry.type === "event" && entry.discovery_payload.entity_category) {
                delete entry.discovery_payload.entity_category;
            }
            // Let Home Assistant generate entity name when device_class is present
            if (entry.discovery_payload.device_class) {
                delete entry.discovery_payload.name;
            }
        }
        return discoveryEntries;
    }
    async onEntityRemoved(data) {
        logger_1.default.debug(`Clearing Home Assistant discovery for '${data.name}'`);
        const discovered = this.getDiscovered(data.entity.ID);
        for (const topic of Object.keys(discovered.messages)) {
            await this.mqtt.publish(topic, "", { clientOptions: { retain: true, qos: 1 }, baseTopic: this.discoveryTopic, skipReceive: false });
        }
        delete this.discovered[data.entity.ID];
    }
    async onGroupMembersChanged(data) {
        await this.discover(data.group);
    }
    async onPublishEntityState(data) {
        /**
         * In case we deal with a lightEndpoint configuration Zigbee2MQTT publishes
         * e.g. {state_l1: ON, brightness_l1: 250} to zigbee2mqtt/mydevice.
         * As the Home Assistant MQTT JSON light cannot be configured to use state_l1/brightness_l1
         * as the state variables, the state topic is set to zigbee2mqtt/mydevice/l1.
         * Here we retrieve all the attributes with the _l1 values and republish them on
         * zigbee2mqtt/mydevice/l1.
         */
        // biome-ignore lint/style/noNonNullAssertion: TODO: biome migration: should this be validated instead?
        const entity = this.zigbee.resolveEntity(data.entity.name);
        if (entity.isDevice()) {
            for (const topic in this.getDiscovered(entity).messages) {
                const topicMatch = topic.match(this.discoveryRegexWoTopic);
                /* v8 ignore start */
                if (!topicMatch) {
                    continue;
                }
                /* v8 ignore stop */
                const objectID = topicMatch[3];
                const lightMatch = /^light_(.*)/.exec(objectID);
                const coverMatch = /^cover_(.*)/.exec(objectID);
                const match = lightMatch || coverMatch;
                if (match) {
                    const endpoint = match[1];
                    const endpointRegExp = new RegExp(`(.*)_${endpoint}`);
                    const payload = {};
                    for (const key of Object.keys(data.message)) {
                        const keyMatch = endpointRegExp.exec(key);
                        if (keyMatch) {
                            payload[keyMatch[1]] = data.message[key];
                        }
                    }
                    await this.mqtt.publish(`${data.entity.name}/${endpoint}`, (0, json_stable_stringify_without_jsonify_1.default)(payload), {});
                }
            }
        }
        /**
         * Publish an empty value for click and action payload, in this way Home Assistant
         * can use Home Assistant entities in automations.
         * https://github.com/Koenkk/zigbee2mqtt/issues/959#issuecomment-480341347
         */
        if (this.legacyActionSensor && data.message.action) {
            await this.publishEntityState(data.entity, { action: "" });
        }
        /**
         * Implements the MQTT device trigger (https://www.home-assistant.io/integrations/device_trigger.mqtt/)
         * The MQTT device trigger does not support JSON parsing, so it cannot listen to zigbee2mqtt/my_device
         * Whenever a device publish an {action: *} we discover an MQTT device trigger sensor
         * and republish it to zigbee2mqtt/my_device/action
         */
        if (settings.get().advanced.output === "json" && entity.isDevice() && entity.definition && data.message.action) {
            const value = data.message.action.toString();
            await this.publishDeviceTriggerDiscover(entity, "action", value);
            await this.mqtt.publish(`${data.entity.name}/action`, value, {});
        }
    }
    async onEntityRenamed(data) {
        logger_1.default.debug(`Refreshing Home Assistant discovery topic for '${data.entity.name}'`);
        // Clear before rename so Home Assistant uses new friendly_name
        // https://github.com/Koenkk/zigbee2mqtt/issues/4096#issuecomment-674044916
        if (data.homeAssisantRename) {
            const discovered = this.getDiscovered(data.entity);
            for (const topic of Object.keys(discovered.messages)) {
                await this.mqtt.publish(topic, "", { clientOptions: { retain: true, qos: 1 }, baseTopic: this.discoveryTopic, skipReceive: false });
            }
            discovered.messages = {};
            // Make sure Home Assistant deletes the old entity first otherwise another one (_2) is created
            // https://github.com/Koenkk/zigbee2mqtt/issues/12610
            await utils_1.default.sleep(2);
        }
        await this.discover(data.entity);
        if (data.entity.isDevice()) {
            for (const config of this.getDiscovered(data.entity).triggers) {
                const key = config.substring(0, config.indexOf("_"));
                const value = config.substring(config.indexOf("_") + 1);
                await this.publishDeviceTriggerDiscover(data.entity, key, value, true);
            }
        }
    }
    getConfigs(entity) {
        const isDevice = entity.isDevice();
        const isGroup = entity.isGroup();
        /* v8 ignore next */
        if (!entity || (isDevice && !entity.definition))
            return [];
        let configs = [];
        if (isDevice) {
            const exposes = entity.exposes(); // avoid calling it hundred of times/s
            for (const expose of exposes) {
                configs.push(...this.exposeToConfig([expose], "device", exposes, entity.definition));
            }
        }
        else if (isGroup) {
            // group
            const exposesByType = {};
            const allExposes = [];
            for (const member of entity.zh.members) {
                const device = this.zigbee.resolveEntity(member.getDevice());
                if (device.definition) {
                    const exposes = device.exposes();
                    allExposes.push(...exposes);
                    for (const expose of exposes.filter((e) => GROUP_SUPPORTED_TYPES.includes(e.type))) {
                        let key = expose.type;
                        if (["switch", "lock", "cover"].includes(expose.type) && expose.endpoint) {
                            // A device can have multiple of these types which have to discovered separately.
                            // e.g. switch with property state and valve_detection.
                            const state = expose.features.find((f) => f.name === "state");
                            (0, node_assert_1.default)(state, `'switch', 'lock' or 'cover' is missing state`);
                            key += featurePropertyWithoutEndpoint(state);
                        }
                        if (!exposesByType[key])
                            exposesByType[key] = [];
                        exposesByType[key].push(expose);
                    }
                }
            }
            configs = [].concat(...Object.values(exposesByType).map((exposes) => this.exposeToConfig(exposes, "group", allExposes)));
        }
        else {
            // Discover bridge config.
            configs.push(...entity.configs);
        }
        if (isDevice && settings.get().advanced.last_seen !== "disable") {
            const config = {
                type: "sensor",
                object_id: "last_seen",
                mockProperties: [{ property: "last_seen", value: null }],
                discovery_payload: {
                    name: "Last seen",
                    value_template: "{{ value_json.last_seen }}",
                    icon: "mdi:clock",
                    enabled_by_default: false,
                    entity_category: "diagnostic",
                },
            };
            if (settings.get().advanced.last_seen.startsWith("ISO_8601")) {
                config.discovery_payload.device_class = "timestamp";
            }
            configs.push(config);
        }
        if (isDevice && entity.definition?.ota) {
            const updateSensor = {
                type: "update",
                object_id: "update",
                mockProperties: [{ property: "update", value: { state: null } }],
                discovery_payload: {
                    name: null,
                    entity_picture: "https://github.com/Koenkk/zigbee2mqtt/raw/master/images/logo.png",
                    state_topic: true,
                    device_class: "firmware",
                    entity_category: "config",
                    command_topic: `${settings.get().mqtt.base_topic}/bridge/request/device/ota_update/update`,
                    payload_install: `{"id": "${entity.ieeeAddr}"}`,
                    value_template: `{"latest_version":"{{ value_json['update']['latest_version'] }}","installed_version":"{{ value_json['update']['installed_version'] }}","update_percentage":{{ value_json['update'].get('progress', 'null') }},"in_progress":{{ (value_json['update']['state'] == 'updating')|lower }}}`,
                },
            };
            configs.push(updateSensor);
        }
        // Discover scenes.
        for (const endpointOrGroup of isDevice ? entity.zh.endpoints : isGroup ? [entity.zh] : []) {
            for (const scene of utils_1.default.getScenes(endpointOrGroup)) {
                const sceneEntry = {
                    type: "scene",
                    object_id: `scene_${scene.id}`,
                    mockProperties: [],
                    discovery_payload: {
                        name: `${scene.name}`,
                        state_topic: false,
                        command_topic: true,
                        payload_on: `{ "scene_recall": ${scene.id} }`,
                        object_id_postfix: `_${scene.name.replace(/\s+/g, "_").toLowerCase()}`,
                    },
                };
                configs.push(sceneEntry);
            }
        }
        // deep clone of the config objects
        configs = JSON.parse(JSON.stringify(configs));
        if (entity.options.homeassistant) {
            const s = entity.options.homeassistant;
            configs = configs.filter((config) => s[config.object_id] === undefined || s[config.object_id] != null);
            for (const config of configs) {
                const configOverride = s[config.object_id];
                if (configOverride) {
                    config.object_id = configOverride.object_id || config.object_id;
                    config.type = configOverride.type || config.type;
                }
            }
        }
        return configs;
    }
    async discover(entity, publish = true) {
        // Handle type differences.
        const isDevice = entity.isDevice();
        const isGroup = entity.isGroup();
        if (isGroup && entity.zh.members.length === 0) {
            return;
        }
        if (isDevice &&
            (!entity.definition || !entity.interviewed || (entity.options.homeassistant !== undefined && !entity.options.homeassistant))) {
            return;
        }
        const discovered = this.getDiscovered(entity);
        discovered.discovered = true;
        const lastDiscoveredTopics = Object.keys(discovered.messages);
        const newDiscoveredTopics = new Set();
        for (const config of this.getConfigs(entity)) {
            const payload = { ...config.discovery_payload };
            const baseTopic = `${settings.get().mqtt.base_topic}/${entity.name}`;
            let stateTopic = baseTopic;
            if (payload.state_topic_postfix) {
                stateTopic += `/${payload.state_topic_postfix}`;
                delete payload.state_topic_postfix;
            }
            if (payload.state_topic === undefined || payload.state_topic) {
                payload.state_topic = stateTopic;
            }
            else {
                if (payload.state_topic !== undefined) {
                    delete payload.state_topic;
                }
            }
            if (payload.position_topic) {
                payload.position_topic = stateTopic;
            }
            if (payload.tilt_status_topic) {
                payload.tilt_status_topic = stateTopic;
            }
            const devicePayload = this.getDevicePayload(entity);
            // Suggest object_id (entity_id) for entity
            payload.object_id = devicePayload.name.replace(/\s+/g, "_").toLowerCase();
            if (config.object_id.startsWith(config.type) && config.object_id.includes("_")) {
                payload.object_id += `_${config.object_id.split(/_(.+)/)[1]}`;
            }
            else if (!config.object_id.startsWith(config.type)) {
                payload.object_id += `_${config.object_id}`;
            }
            // Allow customization of the `payload.object_id` without touching the other uses of `config.object_id`
            // (e.g. for setting the `payload.unique_id` and as an internal key).
            payload.object_id = `${payload.object_id}${payload.object_id_postfix ?? ""}`;
            delete payload.object_id_postfix;
            // Set `default_entity_id`, as of HA 2025.10 this replaces the `object_id`.
            // For migration purposes we set both for now.
            // https://github.com/home-assistant/core/pull/151775
            payload.default_entity_id = `${config.type}.${payload.object_id}`;
            // Set unique_id
            payload.unique_id = `${entity.options.ID}_${config.object_id}_${settings.get().mqtt.base_topic}`;
            // Attributes for device registry and origin
            payload.device = devicePayload;
            payload.origin = this.discoveryOrigin;
            // Availability payload (can be disabled by setting `payload.availability = false`).
            if (payload.availability === undefined || payload.availability) {
                payload.availability = [{ topic: `${settings.get().mqtt.base_topic}/bridge/state` }];
                if (isDevice || isGroup) {
                    if (utils_1.default.isAvailabilityEnabledForEntity(entity, settings.get())) {
                        payload.availability_mode = "all";
                        payload.availability.push({ topic: `${baseTopic}/availability` });
                    }
                }
                else {
                    // Bridge availability is different.
                    payload.availability_mode = "all";
                }
                if (isDevice && entity.options.disabled) {
                    // Mark disabled device always as unavailable
                    for (const entry of payload.availability) {
                        entry.value_template = '{{ "offline" }}';
                    }
                }
                else {
                    for (const entry of payload.availability) {
                        entry.value_template = "{{ value_json.state }}";
                    }
                }
            }
            else {
                delete payload.availability;
            }
            const commandTopicPrefix = payload.command_topic_prefix ? `${payload.command_topic_prefix}/` : "";
            delete payload.command_topic_prefix;
            const commandTopicPostfix = payload.command_topic_postfix ? `/${payload.command_topic_postfix}` : "";
            delete payload.command_topic_postfix;
            const commandTopic = `${baseTopic}/${commandTopicPrefix}set${commandTopicPostfix}`;
            if (payload.command_topic && typeof payload.command_topic !== "string") {
                payload.command_topic = commandTopic;
            }
            if (payload.set_position_topic) {
                payload.set_position_topic = commandTopic;
            }
            if (payload.tilt_command_topic) {
                payload.tilt_command_topic = `${baseTopic}/${commandTopicPrefix}set/tilt`;
            }
            if (payload.mode_state_topic) {
                payload.mode_state_topic = stateTopic;
            }
            if (payload.mode_command_topic) {
                payload.mode_command_topic = `${baseTopic}/${commandTopicPrefix}set/system_mode`;
            }
            if (payload.current_temperature_topic) {
                payload.current_temperature_topic = stateTopic;
            }
            if (payload.temperature_state_topic) {
                payload.temperature_state_topic = stateTopic;
            }
            if (payload.temperature_low_state_topic) {
                payload.temperature_low_state_topic = stateTopic;
            }
            if (payload.temperature_high_state_topic) {
                payload.temperature_high_state_topic = stateTopic;
            }
            if (payload.temperature_command_topic) {
                payload.temperature_command_topic = `${baseTopic}/${commandTopicPrefix}set/${payload.temperature_command_topic}`;
            }
            if (payload.temperature_low_command_topic) {
                payload.temperature_low_command_topic = `${baseTopic}/${commandTopicPrefix}set/${payload.temperature_low_command_topic}`;
            }
            if (payload.temperature_high_command_topic) {
                payload.temperature_high_command_topic = `${baseTopic}/${commandTopicPrefix}set/${payload.temperature_high_command_topic}`;
            }
            if (payload.fan_mode_state_topic) {
                payload.fan_mode_state_topic = stateTopic;
            }
            if (payload.fan_mode_command_topic) {
                payload.fan_mode_command_topic = `${baseTopic}/${commandTopicPrefix}set/fan_mode`;
            }
            if (payload.swing_mode_state_topic) {
                payload.swing_mode_state_topic = stateTopic;
            }
            if (payload.swing_mode_command_topic) {
                payload.swing_mode_command_topic = `${baseTopic}/${commandTopicPrefix}set/swing_mode`;
            }
            if (payload.percentage_state_topic) {
                payload.percentage_state_topic = stateTopic;
            }
            if (payload.percentage_command_topic) {
                payload.percentage_command_topic = `${baseTopic}/${commandTopicPrefix}set/${payload.percentage_command_topic}`;
            }
            if (payload.preset_mode_state_topic) {
                payload.preset_mode_state_topic = stateTopic;
            }
            if (payload.preset_mode_command_topic) {
                payload.preset_mode_command_topic = `${baseTopic}/${commandTopicPrefix}set/${payload.preset_mode_command_topic}`;
            }
            if (payload.action_topic) {
                payload.action_topic = stateTopic;
            }
            // Override configuration with user settings.
            if (entity.options.homeassistant != null) {
                const add = (obj, ignoreName) => {
                    for (const key in obj) {
                        if (key === "type" || key === "object_id") {
                            continue;
                        }
                        if (ignoreName && key === "name") {
                            continue;
                        }
                        if (["number", "string", "boolean"].includes(typeof obj[key]) || Array.isArray(obj[key])) {
                            payload[key] = obj[key];
                        }
                        else if (obj[key] === null) {
                            delete payload[key];
                        }
                        else if (key === "device" && typeof obj[key] === "object") {
                            for (const devKey in obj.device) {
                                payload.device[devKey] = obj.device[devKey];
                            }
                        }
                    }
                };
                add(entity.options.homeassistant, true);
                if (entity.options.homeassistant[config.object_id] != null) {
                    add(entity.options.homeassistant[config.object_id], false);
                }
            }
            if (entity.isDevice()) {
                try {
                    entity.definition?.meta?.overrideHaDiscoveryPayload?.(payload);
                }
                catch (error) {
                    logger_1.default.error(`Failed to override HA discovery payload (${error.stack})`);
                }
            }
            const topic = this.getDiscoveryTopic(config, entity);
            const payloadStr = (0, json_stable_stringify_without_jsonify_1.default)(payload);
            newDiscoveredTopics.add(topic);
            // Only discover when not discovered yet
            const discoveredMessage = discovered.messages[topic];
            if (!discoveredMessage || discoveredMessage.payload !== payloadStr || !discoveredMessage.published) {
                discovered.messages[topic] = { payload: payloadStr, published: publish };
                if (publish) {
                    await this.mqtt.publish(topic, payloadStr, {
                        clientOptions: { retain: true, qos: 1 },
                        baseTopic: this.discoveryTopic,
                        skipReceive: false,
                    });
                }
            }
            else {
                logger_1.default.debug(`Skipping discovery of '${topic}', already discovered`);
            }
            if (config.mockProperties) {
                for (const mockProperty of config.mockProperties) {
                    discovered.mockProperties.add(mockProperty);
                }
            }
        }
        for (const topic of lastDiscoveredTopics) {
            const isDeviceAutomation = topic.match(this.discoveryRegexWoTopic)?.[1] === "device_automation";
            if (!newDiscoveredTopics.has(topic) && !isDeviceAutomation) {
                await this.mqtt.publish(topic, "", { clientOptions: { retain: true, qos: 1 }, baseTopic: this.discoveryTopic, skipReceive: false });
            }
        }
    }
    async onMQTTMessage(data) {
        const discoveryMatch = data.topic.match(this.discoveryRegex);
        const isDeviceAutomation = discoveryMatch && discoveryMatch[1] === "device_automation";
        if (discoveryMatch) {
            // Clear outdated discovery configs and remember already discovered device_automations
            let message;
            try {
                message = JSON.parse(data.message);
                const baseTopic = `${settings.get().mqtt.base_topic}/`;
                if (isDeviceAutomation && (!message.topic || !message.topic.startsWith(baseTopic))) {
                    return;
                }
                if (!isDeviceAutomation && (!message.availability || !message.availability[0].topic.startsWith(baseTopic))) {
                    return;
                }
            }
            catch {
                return;
            }
            // Group discovery topic uses "ENCODEDBASETOPIC_GROUPID", device use ieeeAddr
            const ID = discoveryMatch[2].includes("_") ? discoveryMatch[2].split("_")[1] : discoveryMatch[2];
            const entity = ID === this.bridge.ID ? this.bridge : this.zigbee.resolveEntity(ID);
            let clear = !entity || (entity.isDevice() && !entity.definition);
            // Only save when topic matches otherwise config is not updated when renamed by editing configuration.yaml
            if (entity) {
                const key = `${discoveryMatch[3].substring(0, discoveryMatch[3].indexOf("_"))}`;
                const triggerTopic = `${settings.get().mqtt.base_topic}/${entity.name}/${key}`;
                if (isDeviceAutomation && message.topic === triggerTopic) {
                    this.getDiscovered(ID).triggers.add(discoveryMatch[3]);
                }
            }
            const topic = data.topic.substring(this.discoveryTopic.length + 1);
            if (!clear && !isDeviceAutomation && entity && !(topic in this.getDiscovered(entity).messages)) {
                clear = true;
            }
            // Device was flagged to be excluded from homeassistant discovery
            clear = clear || Boolean(entity && entity.options.homeassistant !== undefined && !entity.options.homeassistant);
            if (clear) {
                logger_1.default.debug(`Clearing outdated Home Assistant config '${data.topic}'`);
                await this.mqtt.publish(topic, "", { clientOptions: { retain: true, qos: 1 }, baseTopic: this.discoveryTopic, skipReceive: false });
            }
            else if (entity) {
                this.getDiscovered(entity).messages[topic] = { payload: (0, json_stable_stringify_without_jsonify_1.default)(message), published: true };
            }
        }
        else if (data.topic === this.statusTopic && data.message.toLowerCase() === "online") {
            const timer = setTimeout(async () => {
                // Publish all device states.
                for (const entity of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
                    if (this.state.exists(entity)) {
                        await this.publishEntityState(entity, this.state.get(entity), "publishCached");
                    }
                }
                clearTimeout(timer);
            }, 30000);
        }
    }
    async onZigbeeEvent(data) {
        if (!this.getDiscovered(data.device).discovered) {
            await this.discover(data.device);
        }
    }
    async onScenesChanged(data) {
        // Re-trigger MQTT discovery of changed devices and groups, similar to bridge.ts
        // First, clear existing scene discovery topics
        logger_1.default.debug(`Clearing Home Assistant scene discovery for '${data.entity.name}'`);
        const discovered = this.getDiscovered(data.entity);
        for (const topic of Object.keys(discovered.messages)) {
            if (topic.startsWith("scene")) {
                await this.mqtt.publish(topic, "", { clientOptions: { retain: true, qos: 1 }, baseTopic: this.discoveryTopic, skipReceive: false });
                delete discovered.messages[topic];
            }
        }
        // Make sure Home Assistant deletes the old entity first otherwise another one (_2) is created
        // https://github.com/Koenkk/zigbee2mqtt/issues/12610
        logger_1.default.debug("Finished clearing scene discovery topics, waiting for Home Assistant.");
        await utils_1.default.sleep(2);
        // Re-discover entity (including any new scenes).
        logger_1.default.debug("Re-discovering entities with their scenes.");
        await this.discover(data.entity);
    }
    getDevicePayload(entity) {
        const identifierPostfix = entity.isGroup() ? `zigbee2mqtt_${this.getEncodedBaseTopic()}` : "zigbee2mqtt";
        // Allow device name to be overridden by homeassistant config
        let deviceName = entity.name;
        if (typeof entity.options.homeassistant?.name === "string") {
            deviceName = entity.options.homeassistant.name;
        }
        const payload = {
            identifiers: [`${identifierPostfix}_${entity.options.ID}`],
            name: deviceName,
            sw_version: `Zigbee2MQTT ${this.zigbee2MQTTVersion}`,
        };
        const url = settings.get().frontend?.url ?? "";
        // Since zigbee2mqtt-windfront support multiple instances the configuration URL contains the
        // instance ID. Since we don't know which instance it is we always point to 0.
        // https://github.com/Koenkk/zigbee2mqtt/issues/28936
        const urlEntityPostfix = settings.get().frontend.package === "zigbee2mqtt-windfront" ? "0/" : "";
        if (entity.isDevice()) {
            (0, node_assert_1.default)(entity.definition, `Cannot 'getDevicePayload' for unsupported device`);
            payload.model = entity.definition.description;
            payload.model_id = entity.definition.model;
            payload.manufacturer = entity.definition.vendor;
            payload.sw_version = entity.zh.softwareBuildID;
            payload.hw_version = entity.zh.hardwareVersion;
            payload.configuration_url = `${url}/#/device/${urlEntityPostfix}${entity.ieeeAddr}/info`;
        }
        else if (entity.isGroup()) {
            payload.model = "Group";
            payload.manufacturer = "Zigbee2MQTT";
            payload.configuration_url = `${url}/#/group/${urlEntityPostfix}${entity.ID}`;
        }
        else {
            payload.model = "Bridge";
            payload.manufacturer = "Zigbee2MQTT";
            payload.hw_version = `${entity.hardwareVersion} ${entity.firmwareVersion}`;
            payload.sw_version = this.zigbee2MQTTVersion;
            payload.configuration_url = `${url}/#/settings`;
        }
        if (!url) {
            delete payload.configuration_url;
        }
        // Link devices & groups to bridge.
        if (entity !== this.bridge) {
            payload.via_device = this.bridgeIdentifier;
        }
        return payload;
    }
    adjustMessageBeforePublish(entity, message) {
        for (const mockProperty of this.getDiscovered(entity).mockProperties) {
            if (message[mockProperty.property] === undefined) {
                message[mockProperty.property] = mockProperty.value;
            }
        }
        // Copy hue -> h, saturation -> s to make homeassistant happy
        if (message.color !== undefined) {
            if (message.color.hue !== undefined) {
                message.color.h = message.color.hue;
            }
            if (message.color.saturation !== undefined) {
                message.color.s = message.color.saturation;
            }
        }
        if (entity.isDevice() && entity.definition?.ota && message.update?.latest_version == null) {
            message.update = { ...message.update, installed_version: -1, latest_version: -1 };
        }
    }
    getEncodedBaseTopic() {
        return settings
            .get()
            .mqtt.base_topic.split("")
            .map((s) => s.charCodeAt(0).toString())
            .join("");
    }
    getDiscoveryTopic(config, entity) {
        const key = entity.isDevice() ? entity.ieeeAddr : `${this.getEncodedBaseTopic()}_${entity.ID}`;
        return `${config.type}/${key}/${config.object_id}/config`;
    }
    async publishDeviceTriggerDiscover(device, key, value, force = false) {
        const haConfig = device.options.homeassistant;
        if (device.options.homeassistant !== undefined &&
            (haConfig == null || (haConfig.device_automation !== undefined && typeof haConfig === "object" && haConfig.device_automation == null))) {
            return;
        }
        const discovered = this.getDiscovered(device);
        const discoveredKey = `${key}_${value}`;
        if (discovered.triggers.has(discoveredKey) && !force) {
            return;
        }
        const config = {
            type: "device_automation",
            object_id: `${key}_${value}`,
            mockProperties: [],
            discovery_payload: {
                automation_type: "trigger",
                type: key,
            },
        };
        const topic = this.getDiscoveryTopic(config, device);
        const payload = {
            ...config.discovery_payload,
            subtype: value,
            payload: value,
            topic: `${settings.get().mqtt.base_topic}/${device.name}/${key}`,
            device: this.getDevicePayload(device),
            origin: this.discoveryOrigin,
        };
        await this.mqtt.publish(topic, (0, json_stable_stringify_without_jsonify_1.default)(payload), {
            clientOptions: { retain: true, qos: 1 },
            baseTopic: this.discoveryTopic,
            skipReceive: false,
        });
        discovered.triggers.add(discoveredKey);
    }
    getBridgeEntity(coordinatorVersion) {
        const coordinatorIeeeAddress = this.zigbee.firstCoordinatorEndpoint().deviceIeeeAddress;
        const discovery = [];
        const bridge = new Bridge(coordinatorIeeeAddress, coordinatorVersion, discovery);
        const baseTopic = `${settings.get().mqtt.base_topic}/${bridge.name}`;
        discovery.push(
        // Binary sensors.
        {
            type: "binary_sensor",
            object_id: "connection_state",
            mockProperties: [],
            discovery_payload: {
                name: "Connection state",
                device_class: "connectivity",
                entity_category: "diagnostic",
                state_topic: true,
                state_topic_postfix: "state",
                value_template: "{{ value_json.state }}",
                payload_on: "online",
                payload_off: "offline",
                availability: false,
            },
        }, {
            type: "binary_sensor",
            object_id: "restart_required",
            mockProperties: [],
            discovery_payload: {
                name: "Restart required",
                device_class: "problem",
                entity_category: "diagnostic",
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: "info",
                value_template: "{{ value_json.restart_required }}",
                payload_on: true,
                payload_off: false,
            },
        }, 
        // Buttons.
        {
            type: "button",
            object_id: "restart",
            mockProperties: [],
            discovery_payload: {
                name: "Restart",
                device_class: "restart",
                state_topic: false,
                command_topic: `${baseTopic}/request/restart`,
                payload_press: "",
            },
        }, 
        // Selects.
        {
            type: "select",
            object_id: "log_level",
            mockProperties: [],
            discovery_payload: {
                name: "Log level",
                entity_category: "config",
                state_topic: true,
                state_topic_postfix: "info",
                value_template: "{{ value_json.log_level | lower }}",
                command_topic: `${baseTopic}/request/options`,
                command_template: '{"options": {"advanced": {"log_level": "{{ value }}" } } }',
                options: settings.LOG_LEVELS,
            },
        }, 
        // Sensors:
        {
            type: "sensor",
            object_id: "version",
            mockProperties: [],
            discovery_payload: {
                name: "Version",
                icon: "mdi:zigbee",
                entity_category: "diagnostic",
                state_topic: true,
                state_topic_postfix: "info",
                value_template: "{{ value_json.version }}",
            },
        }, {
            type: "sensor",
            object_id: "coordinator_version",
            mockProperties: [],
            discovery_payload: {
                name: "Coordinator version",
                icon: "mdi:chip",
                entity_category: "diagnostic",
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: "info",
                value_template: "{{ value_json.coordinator.meta.revision }}",
            },
        }, {
            type: "sensor",
            object_id: "network_map",
            mockProperties: [],
            discovery_payload: {
                name: "Network map",
                entity_category: "diagnostic",
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: "response/networkmap",
                value_template: "{{ now().strftime('%Y-%m-%d %H:%M:%S') }}",
                json_attributes_topic: `${baseTopic}/response/networkmap`,
                json_attributes_template: "{{ value_json.data.value | tojson }}",
            },
        }, 
        // Switches.
        {
            type: "switch",
            object_id: "permit_join",
            mockProperties: [],
            discovery_payload: {
                name: "Permit join",
                icon: "mdi:human-greeting-proximity",
                state_topic: true,
                state_topic_postfix: "info",
                value_template: "{{ value_json.permit_join | lower }}",
                command_topic: `${baseTopic}/request/permit_join`,
                state_on: "true",
                state_off: "false",
                payload_on: '{"time": 254}',
                payload_off: '{"time": 0}',
            },
        });
        return bridge;
    }
    parseActionValue(action) {
        // Handle standard actions.
        for (const p of ACTION_PATTERNS) {
            const m = action.match(p);
            if (m?.groups?.action) {
                return this.buildAction(m.groups);
            }
        }
        // Handle wildcard actions.
        let m = action.match(/^(?<action>recall|scene)_\*(?:_(?<endpoint>e1|e2|s1|s2))?$/);
        if (m?.groups?.action) {
            logger_1.default.debug(`Found scene wildcard action ${m.groups.action}`);
            return this.buildAction(m.groups, { scene: "wildcard" });
        }
        m = action.match(/^(?<actionPrefix>region_)\*_(?<action>enter|leave|occupied|unoccupied)$/);
        if (m?.groups?.action) {
            logger_1.default.debug(`Found region wildcard action ${m.groups.action}`);
            return this.buildAction(m.groups, { region: "wildcard" });
        }
        // If nothing matches, keep the plain action value.
        return { action };
    }
    buildAction(groups, props = {}) {
        utils_1.default.removeNullPropertiesFromObject(groups);
        let a = groups.action;
        if (groups?.actionPrefix) {
            a = groups.actionPrefix + a;
            delete groups.actionPrefix;
        }
        return { ...groups, action: a, ...props };
    }
    prepareActionEventTypes(values) {
        return utils_1.default.arrayUnique(values.map((v) => this.parseActionValue(v.toString()).action).filter((v) => !v.includes("*")));
    }
    parseGroupsFromRegex(pattern) {
        return [...pattern.matchAll(/\(\?<([a-zA-Z]+)>/g)].map((v) => v[1]);
    }
    getActionValueTemplate() {
        // TODO: Implement parsing for all event types.
        const patterns = ACTION_PATTERNS.map((v) => {
            return `{"pattern": '${v.replaceAll(/\?<([a-zA-Z]+)>/g, "?P<$1>")}', "groups": [${this.parseGroupsFromRegex(v)
                .map((g) => `"${g}"`)
                .join(", ")}]}`;
        }).join(",\n");
        const value_template = `{% set patterns = [\n${patterns}\n] %}
{% set action_value = value_json.action|default('') %}
{% set ns = namespace(r=[('action', action_value)]) %}
{% for p in patterns %}
  {% set m = action_value|regex_findall(p.pattern) %}
  {% if m[0] is undefined %}{% continue %}{% endif %}
  {% for key, value in zip(p.groups, m[0]) %}
    {% set ns.r = ns.r|rejectattr(0, 'eq', key)|list + [(key, value)] %}
  {% endfor %}
{% endfor %}
{% if (ns.r|selectattr(0, 'eq', 'actionPrefix')|first) is defined %}
  {% set ns.r = ns.r|rejectattr(0, 'eq', 'action')|list + [('action', ns.r|selectattr(0, 'eq', 'actionPrefix')|map(attribute=1)|first + ns.r|selectattr(0, 'eq', 'action')|map(attribute=1)|first)] %}
{% endif %}
{% set ns.r = ns.r + [('event_type', ns.r|selectattr(0, 'eq', 'action')|map(attribute=1)|first)] %}
{{dict.from_keys(ns.r|rejectattr(0, 'in', ('action', 'actionPrefix'))|reject('eq', ('event_type', None))|reject('eq', ('event_type', '')))|to_json}}`;
        return value_template;
    }
}
exports.HomeAssistant = HomeAssistant;
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onEntityRemoved", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onGroupMembersChanged", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onPublishEntityState", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onEntityRenamed", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onMQTTMessage", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onZigbeeEvent", null);
__decorate([
    bind_decorator_1.default
], HomeAssistant.prototype, "onScenesChanged", null);
exports.default = HomeAssistant;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZWFzc2lzdGFudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vaG9tZWFzc2lzdGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4REFBaUM7QUFDakMsb0VBQWtDO0FBQ2xDLGtIQUE4RDtBQUc5RCw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLHVEQUE4STtBQUM5SSw0REFBb0M7QUE0QnBDLE1BQU0sZUFBZSxHQUFhO0lBQzlCLDJFQUEyRTtJQUMzRSxxREFBcUQ7SUFDckQsMEZBQTBGO0lBQzFGLDRFQUE0RTtJQUM1RSx5REFBeUQ7Q0FDNUQsQ0FBQztBQUNGLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztBQUMzQixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDekIsTUFBTSxxQkFBcUIsR0FBMEIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMxRixNQUFNLG9CQUFvQixHQUEwQixDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRyxNQUFNLG9CQUFvQixHQUEwQixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzdILE1BQU0sb0JBQW9CLEdBQTBCLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0YsTUFBTSxnQkFBZ0IsR0FBMEIsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEgsTUFBTSx1QkFBdUIsR0FBNEI7SUFDckQsc0JBQXNCLEVBQUUsRUFBQyxJQUFJLEVBQUUsWUFBWSxF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