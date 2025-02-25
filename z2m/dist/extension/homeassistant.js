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
const node_assert_1 = __importDefault(require("node:assert"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importStar(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const ACTION_PATTERNS = [
    '^(?<button>(?:button_)?[a-z0-9]+)_(?<action>(?:press|hold)(?:_release)?)$',
    '^(?<action>recall|scene)_(?<scene>[0-2][0-9]{0,2})$',
    '^(?<actionPrefix>region_)(?<region>[1-9]|10)_(?<action>enter|leave|occupied|unoccupied)$',
    '^(?<action>dial_rotate)_(?<direction>left|right)_(?<speed>step|slow|fast)$',
    '^(?<action>brightness_step)(?:_(?<direction>up|down))?$',
];
const ACCESS_STATE = 0b001;
const ACCESS_SET = 0b010;
const GROUP_SUPPORTED_TYPES = ['light', 'switch', 'lock', 'cover'];
const COVER_OPENING_LOOKUP = ['opening', 'open', 'forward', 'up', 'rising'];
const COVER_CLOSING_LOOKUP = ['closing', 'close', 'backward', 'back', 'reverse', 'down', 'declining'];
const COVER_STOPPED_LOOKUP = ['stopped', 'stop', 'pause', 'paused'];
const SWITCH_DIFFERENT = ['valve_detection', 'window_detection', 'auto_lock', 'away_mode'];
const BINARY_DISCOVERY_LOOKUP = {
    activity_led_indicator: { icon: 'mdi:led-on' },
    auto_off: { icon: 'mdi:flash-auto' },
    battery_low: { entity_category: 'diagnostic', device_class: 'battery' },
    button_lock: { entity_category: 'config', icon: 'mdi:lock' },
    calibration: { entity_category: 'config', icon: 'mdi:progress-wrench' },
    capabilities_configurable_curve: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    capabilities_forward_phase_control: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    capabilities_overload_detection: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    capabilities_reactance_discriminator: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    capabilities_reverse_phase_control: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    carbon_monoxide: { device_class: 'carbon_monoxide' },
    card: { entity_category: 'config', icon: 'mdi:clipboard-check' },
    child_lock: { entity_category: 'config', icon: 'mdi:account-lock' },
    color_sync: { entity_category: 'config', icon: 'mdi:sync-circle' },
    consumer_connected: { device_class: 'plug' },
    contact: { device_class: 'door' },
    garage_door_contact: { device_class: 'garage_door', payload_on: false, payload_off: true },
    eco_mode: { entity_category: 'config', icon: 'mdi:leaf' },
    expose_pin: { entity_category: 'config', icon: 'mdi:pin' },
    flip_indicator_light: { entity_category: 'config', icon: 'mdi:arrow-left-right' },
    gas: { device_class: 'gas' },
    indicator_mode: { entity_category: 'config', icon: 'mdi:led-on' },
    invert_cover: { entity_category: 'config', icon: 'mdi:arrow-left-right' },
    led_disabled_night: { entity_category: 'config', icon: 'mdi:led-off' },
    led_indication: { entity_category: 'config', icon: 'mdi:led-on' },
    led_enable: { entity_category: 'config', icon: 'mdi:led-on' },
    motor_reversal: { entity_category: 'config', icon: 'mdi:arrow-left-right' },
    moving: { device_class: 'moving' },
    no_position_support: { entity_category: 'config', icon: 'mdi:minus-circle-outline' },
    noise_detected: { device_class: 'sound' },
    occupancy: { device_class: 'occupancy' },
    power_outage_memory: { entity_category: 'config', icon: 'mdi:memory' },
    presence: { device_class: 'presence' },
    setup: { device_class: 'running' },
    smoke: { device_class: 'smoke' },
    sos: { device_class: 'safety' },
    schedule: { icon: 'mdi:calendar' },
    status_capacitive_load: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    status_forward_phase_control: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    status_inductive_load: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    status_overload: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    status_reverse_phase_control: { entity_category: 'diagnostic', icon: 'mdi:tune' },
    tamper: { device_class: 'tamper' },
    temperature_scale: { entity_category: 'config', icon: 'mdi:temperature-celsius' },
    test: { entity_category: 'diagnostic', icon: 'mdi:test-tube' },
    th_heater: { icon: 'mdi:heat-wave' },
    trigger_indicator: { icon: 'mdi:led-on' },
    valve_alarm: { device_class: 'problem' },
    valve_detection: { icon: 'mdi:pipe-valve' },
    valve_state: { device_class: 'opening' },
    vibration: { device_class: 'vibration' },
    water_leak: { device_class: 'moisture' },
    window: { device_class: 'window' },
    window_detection: { icon: 'mdi:window-open-variant' },
    window_open: { device_class: 'window' },
};
const NUMERIC_DISCOVERY_LOOKUP = {
    ac_frequency: { device_class: 'frequency', enabled_by_default: false, entity_category: 'diagnostic', state_class: 'measurement' },
    action_duration: { icon: 'mdi:timer', device_class: 'duration' },
    alarm_humidity_max: { device_class: 'humidity', entity_category: 'config', icon: 'mdi:water-plus' },
    alarm_humidity_min: { device_class: 'humidity', entity_category: 'config', icon: 'mdi:water-minus' },
    alarm_temperature_max: { device_class: 'temperature', entity_category: 'config', icon: 'mdi:thermometer-high' },
    alarm_temperature_min: { device_class: 'temperature', entity_category: 'config', icon: 'mdi:thermometer-low' },
    angle: { icon: 'angle-acute' },
    angle_axis: { icon: 'angle-acute' },
    aqi: { device_class: 'aqi', state_class: 'measurement' },
    auto_relock_time: { entity_category: 'config', icon: 'mdi:timer' },
    away_preset_days: { entity_category: 'config', icon: 'mdi:timer' },
    away_preset_temperature: { entity_category: 'config', icon: 'mdi:thermometer' },
    ballast_maximum_level: { entity_category: 'config' },
    ballast_minimum_level: { entity_category: 'config' },
    ballast_physical_maximum_level: { entity_category: 'diagnostic' },
    ballast_physical_minimum_level: { entity_category: 'diagnostic' },
    battery: { device_class: 'battery', state_class: 'measurement' },
    battery2: { device_class: 'battery', entity_category: 'diagnostic', state_class: 'measurement' },
    battery_voltage: { device_class: 'voltage', entity_category: 'diagnostic', state_class: 'measurement', enabled_by_default: true },
    boost_heating_countdown: { device_class: 'duration' },
    boost_heating_countdown_time_set: { entity_category: 'config', icon: 'mdi:timer' },
    boost_time: { entity_category: 'config', icon: 'mdi:timer' },
    calibration: { entity_category: 'config', icon: 'mdi:wrench-clock' },
    calibration_time: { entity_category: 'config', icon: 'mdi:wrench-clock' },
    co2: { device_class: 'carbon_dioxide', state_class: 'measurement' },
    comfort_temperature: { entity_category: 'config', icon: 'mdi:thermometer' },
    cpu_temperature: {
        device_class: 'temperature',
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    cube_side: { icon: 'mdi:cube' },
    current: {
        device_class: 'current',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    current_phase_b: {
        device_class: 'current',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    current_phase_c: {
        device_class: 'current',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    deadzone_temperature: { entity_category: 'config', icon: 'mdi:thermometer' },
    detection_interval: { icon: 'mdi:timer' },
    device_temperature: {
        device_class: 'temperature',
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    distance: { device_class: 'distance', state_class: 'measurement' },
    duration: { entity_category: 'config', icon: 'mdi:timer' },
    eco2: { device_class: 'carbon_dioxide', state_class: 'measurement' },
    eco_temperature: { entity_category: 'config', icon: 'mdi:thermometer' },
    energy: { device_class: 'energy', state_class: 'total_increasing' },
    external_temperature_input: { icon: 'mdi:thermometer' },
    formaldehyd: { state_class: 'measurement' },
    flow: { device_class: 'volume_flow_rate', state_class: 'measurement' },
    gas_density: { icon: 'mdi:google-circles-communities', state_class: 'measurement' },
    hcho: { icon: 'mdi:air-filter', state_class: 'measurement' },
    humidity: { device_class: 'humidity', state_class: 'measurement' },
    humidity_calibration: { entity_category: 'config', icon: 'mdi:wrench-clock' },
    humidity_max: { entity_category: 'config', icon: 'mdi:water-percent' },
    humidity_min: { entity_category: 'config', icon: 'mdi:water-percent' },
    illuminance_calibration: { entity_category: 'config', icon: 'mdi:wrench-clock' },
    illuminance: { device_class: 'illuminance', state_class: 'measurement' },
    internalTemperature: {
        device_class: 'temperature',
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    linkquality: {
        enabled_by_default: false,
        entity_category: 'diagnostic',
        icon: 'mdi:signal',
        state_class: 'measurement',
    },
    local_temperature: { device_class: 'temperature', state_class: 'measurement' },
    max_range: { entity_category: 'config', icon: 'mdi:signal-distance-variant' },
    max_temperature: { entity_category: 'config', icon: 'mdi:thermometer-high' },
    max_temperature_limit: { entity_category: 'config', icon: 'mdi:thermometer-high' },
    min_temperature_limit: { entity_category: 'config', icon: 'mdi:thermometer-low' },
    min_temperature: { entity_category: 'config', icon: 'mdi:thermometer-low' },
    minimum_on_level: { entity_category: 'config' },
    measurement_poll_interval: { entity_category: 'config', icon: 'mdi:clock-out' },
    motion_sensitivity: { entity_category: 'config', icon: 'mdi:motion-sensor' },
    noise: { device_class: 'sound_pressure', state_class: 'measurement' },
    noise_detect_level: { icon: 'mdi:volume-equal' },
    noise_timeout: { icon: 'mdi:timer' },
    occupancy_level: { icon: 'mdi:motion-sensor' },
    occupancy_sensitivity: { entity_category: 'config', icon: 'mdi:motion-sensor' },
    occupancy_timeout: { entity_category: 'config', icon: 'mdi:timer' },
    overload_protection: { icon: 'mdi:flash' },
    pm10: { device_class: 'pm10', state_class: 'measurement' },
    pm25: { device_class: 'pm25', state_class: 'measurement' },
    people: { state_class: 'measurement', icon: 'mdi:account-multiple' },
    position: { icon: 'mdi:valve', state_class: 'measurement' },
    power: { device_class: 'power', state_class: 'measurement' },
    power_phase_b: { device_class: 'power', state_class: 'measurement' },
    power_phase_c: { device_class: 'power', state_class: 'measurement' },
    power_factor: { device_class: 'power_factor', enabled_by_default: false, entity_category: 'diagnostic', state_class: 'measurement' },
    power_outage_count: { icon: 'mdi:counter', enabled_by_default: false },
    precision: { entity_category: 'config', icon: 'mdi:decimal-comma-increase' },
    pressure: { device_class: 'atmospheric_pressure', state_class: 'measurement' },
    presence_timeout: { entity_category: 'config', icon: 'mdi:timer' },
    reporting_time: { entity_category: 'config', icon: 'mdi:clock-time-one-outline' },
    requested_brightness_level: {
        enabled_by_default: false,
        entity_category: 'diagnostic',
        icon: 'mdi:brightness-5',
    },
    requested_brightness_percent: {
        enabled_by_default: false,
        entity_category: 'diagnostic',
        icon: 'mdi:brightness-5',
    },
    smoke_density: { icon: 'mdi:google-circles-communities', state_class: 'measurement' },
    soil_moisture: { device_class: 'moisture', state_class: 'measurement' },
    temperature: { device_class: 'temperature', state_class: 'measurement' },
    temperature_calibration: { entity_category: 'config', icon: 'mdi:wrench-clock' },
    temperature_max: { entity_category: 'config', icon: 'mdi:thermometer-plus' },
    temperature_min: { entity_category: 'config', icon: 'mdi:thermometer-minus' },
    temperature_offset: { icon: 'mdi:thermometer-lines' },
    transition: { entity_category: 'config', icon: 'mdi:transition' },
    trigger_count: { icon: 'mdi:counter', enabled_by_default: false },
    voc: { device_class: 'volatile_organic_compounds', state_class: 'measurement' },
    voc_index: { state_class: 'measurement', icon: 'mdi:molecule' },
    voc_parts: { device_class: 'volatile_organic_compounds_parts', state_class: 'measurement' },
    vibration_timeout: { entity_category: 'config', icon: 'mdi:timer' },
    voltage: {
        device_class: 'voltage',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    voltage_phase_b: {
        device_class: 'voltage',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    voltage_phase_c: {
        device_class: 'voltage',
        enabled_by_default: false,
        entity_category: 'diagnostic',
        state_class: 'measurement',
    },
    water_consumed: {
        device_class: 'water',
        state_class: 'total_increasing',
    },
    x_axis: { icon: 'mdi:axis-x-arrow' },
    y_axis: { icon: 'mdi:axis-y-arrow' },
    z_axis: { icon: 'mdi:axis-z-arrow' },
};
const ENUM_DISCOVERY_LOOKUP = {
    action: { icon: 'mdi:gesture-double-tap' },
    alarm_humidity: { entity_category: 'config', icon: 'mdi:water-percent-alert' },
    alarm_temperature: { entity_category: 'config', icon: 'mdi:thermometer-alert' },
    backlight_auto_dim: { entity_category: 'config', icon: 'mdi:brightness-auto' },
    backlight_mode: { entity_category: 'config', icon: 'mdi:lightbulb' },
    calibrate: { icon: 'mdi:tune' },
    color_power_on_behavior: { entity_category: 'config', icon: 'mdi:palette' },
    control_mode: { entity_category: 'config', icon: 'mdi:tune' },
    device_mode: { entity_category: 'config', icon: 'mdi:tune' },
    effect: { enabled_by_default: false, icon: 'mdi:palette' },
    force: { entity_category: 'config', icon: 'mdi:valve' },
    keep_time: { entity_category: 'config', icon: 'mdi:av-timer' },
    identify: { device_class: 'identify' },
    keypad_lockout: { entity_category: 'config', icon: 'mdi:lock' },
    load_detection_mode: { entity_category: 'config', icon: 'mdi:tune' },
    load_dimmable: { entity_category: 'config', icon: 'mdi:chart-bell-curve' },
    load_type: { entity_category: 'config', icon: 'mdi:led-on' },
    melody: { entity_category: 'config', icon: 'mdi:music-note' },
    mode_phase_control: { entity_category: 'config', icon: 'mdi:tune' },
    mode: { entity_category: 'config', icon: 'mdi:tune' },
    mode_switch: { icon: 'mdi:tune' },
    motion_sensitivity: { entity_category: 'config', icon: 'mdi:tune' },
    operation_mode: { entity_category: 'config', icon: 'mdi:tune' },
    power_on_behavior: { entity_category: 'config', icon: 'mdi:power-settings' },
    power_outage_memory: { entity_category: 'config', icon: 'mdi:power-settings' },
    power_supply_mode: { entity_category: 'config', icon: 'mdi:power-settings' },
    power_type: { entity_category: 'config', icon: 'mdi:lightning-bolt-circle' },
    restart: { device_class: 'restart' },
    sensitivity: { entity_category: 'config', icon: 'mdi:tune' },
    sensor: { icon: 'mdi:tune' },
    sensors_type: { entity_category: 'config', icon: 'mdi:tune' },
    sound_volume: { entity_category: 'config', icon: 'mdi:volume-high' },
    status: { icon: 'mdi:state-machine' },
    switch_type: { entity_category: 'config', icon: 'mdi:tune' },
    temperature_display_mode: { entity_category: 'config', icon: 'mdi:thermometer' },
    temperature_sensor_select: { entity_category: 'config', icon: 'mdi:home-thermometer' },
    thermostat_unit: { entity_category: 'config', icon: 'mdi:thermometer' },
    update: { device_class: 'update' },
    volume: { entity_category: 'config', icon: 'mdi: volume-high' },
    week: { entity_category: 'config', icon: 'mdi:calendar-clock' },
};
const LIST_DISCOVERY_LOOKUP = {
    action: { icon: 'mdi:gesture-double-tap' },
    color_options: { icon: 'mdi:palette' },
    level_config: { entity_category: 'diagnostic' },
    programming_mode: { icon: 'mdi:calendar-clock' },
    schedule_settings: { icon: 'mdi:calendar-clock' },
};
const featurePropertyWithoutEndpoint = (feature) => {
    if (feature.endpoint) {
        return feature.property.slice(0, -1 + -1 * feature.endpoint.length);
    }
    else {
        return feature.property;
    }
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
    get ID() {
        return this.coordinatorIeeeAddress;
    }
    get name() {
        return 'bridge';
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
        this.coordinatorFirmwareVersion = version.meta.revision ? `${version.meta.revision}` : /* v8 ignore next */ '';
        this.discoveryEntries = discovery;
        this.options = {
            ID: `bridge_${ieeeAdress}`,
            homeassistant: {
                name: `Zigbee2MQTT Bridge`,
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
    discoveryRegexWoTopic = new RegExp(`(.*)/(.*)/(.*)/config`);
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
        if (settings.get().advanced.output === 'attribute') {
            throw new Error('Home Assistant integration is not possible with attribute output!');
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
            logger_1.default.warning('In order for Home Assistant integration to work properly set `cache_state: true');
        }
        this.zigbee2MQTTVersion = (await utils_1.default.getZigbee2MQTTVersion(false)).version;
        this.discoveryOrigin = { name: 'Zigbee2MQTT', sw: this.zigbee2MQTTVersion, url: 'https://www.zigbee2mqtt.io' };
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
            logger_1.default.debug(`Discovering entities to Home Assistant`);
            await this.discover(this.bridge);
            for (const e of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
                await this.discover(e);
            }
        }, utils_1.default.seconds(discoverWait));
    }
    getDiscovered(entity) {
        const ID = typeof entity === 'string' || typeof entity === 'number' ? entity : entity.ID;
        if (!(ID in this.discovered)) {
            this.discovered[ID] = { messages: {}, triggers: new Set(), mockProperties: new Set(), discovered: false };
        }
        return this.discovered[ID];
    }
    exposeToConfig(exposes, entityType, allExposes, definition) {
        // For groups an array of exposes (of the same type) is passed, this is to determine e.g. what features
        // to use for a bulb (e.g. color_xy/color_temp)
        (0, node_assert_1.default)(entityType === 'group' || exposes.length === 1, 'Multiple exposes for device not allowed');
        const firstExpose = exposes[0];
        (0, node_assert_1.default)(entityType === 'device' || GROUP_SUPPORTED_TYPES.includes(firstExpose.type), `Unsupported expose type ${firstExpose.type} for group`);
        const discoveryEntries = [];
        const endpoint = entityType === 'device' ? exposes[0].endpoint : undefined;
        const getProperty = (feature) => (entityType === 'group' ? featurePropertyWithoutEndpoint(feature) : feature.property);
        switch (firstExpose.type) {
            case 'light': {
                const hasColorXY = exposes.find((expose) => expose.features.find((e) => e.name === 'color_xy'));
                const hasColorHS = exposes.find((expose) => expose.features.find((e) => e.name === 'color_hs'));
                const hasBrightness = exposes.find((expose) => expose.features.find((e) => e.name === 'brightness'));
                const hasColorTemp = exposes.find((expose) => expose.features.find((e) => e.name === 'color_temp'));
                const state = firstExpose.features.find((f) => f.name === 'state');
                (0, node_assert_1.default)(state, `Light expose must have a 'state'`);
                // Prefer HS over XY when at least one of the lights in the group prefers HS over XY.
                // A light prefers HS over XY when HS is earlier in the feature array than HS.
                const preferHS = exposes
                    .map((e) => [e.features.findIndex((ee) => ee.name === 'color_xy'), e.features.findIndex((ee) => ee.name === 'color_hs')])
                    .filter((d) => d[0] !== -1 && d[1] !== -1 && d[1] < d[0]).length !== 0;
                const discoveryEntry = {
                    type: 'light',
                    object_id: endpoint ? `light_${endpoint}` : 'light',
                    mockProperties: [{ property: state.property, value: null }],
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        brightness: !!hasBrightness,
                        schema: 'json',
                        command_topic: true,
                        brightness_scale: 254,
                        command_topic_prefix: endpoint,
                        state_topic_postfix: endpoint,
                    },
                };
                const colorModes = [
                    hasColorXY && !preferHS ? 'xy' : null,
                    (!hasColorXY || preferHS) && hasColorHS ? 'hs' : null,
                    hasColorTemp ? 'color_temp' : null,
                ].filter((c) => c);
                if (colorModes.length) {
                    discoveryEntry.discovery_payload.supported_color_modes = colorModes;
                }
                if (hasColorTemp) {
                    const colorTemps = exposes
                        .map((expose) => expose.features.find((e) => e.name === 'color_temp'))
                        .filter((e) => e !== undefined && (0, utils_1.isNumericExpose)(e));
                    const max = Math.min(...colorTemps.map((e) => e.value_max).filter((e) => e !== undefined));
                    const min = Math.max(...colorTemps.map((e) => e.value_min).filter((e) => e !== undefined));
                    discoveryEntry.discovery_payload.max_mireds = max;
                    discoveryEntry.discovery_payload.min_mireds = min;
                }
                const effects = utils_1.default.arrayUnique(utils_1.default.flatten(allExposes
                    .filter(utils_1.isEnumExpose)
                    .filter((e) => e.name === 'effect')
                    .map((e) => e.values)));
                if (effects.length) {
                    discoveryEntry.discovery_payload.effect = true;
                    discoveryEntry.discovery_payload.effect_list = effects;
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case 'switch': {
                const state = firstExpose.features.filter(utils_1.isBinaryExpose).find((f) => f.name === 'state');
                (0, node_assert_1.default)(state, `Switch expose must have a 'state'`);
                const property = getProperty(state);
                const discoveryEntry = {
                    type: 'switch',
                    object_id: endpoint ? `switch_${endpoint}` : 'switch',
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
                    if (property === 'window_detection') {
                        discoveryEntry.discovery_payload.icon = 'mdi:window-open-variant';
                    }
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case 'climate': {
                const setpointProperties = ['occupied_heating_setpoint', 'current_heating_setpoint'];
                const setpoint = firstExpose.features.filter(utils_1.isNumericExpose).find((f) => setpointProperties.includes(f.name));
                (0, node_assert_1.default)(setpoint && setpoint.value_min !== undefined && setpoint.value_max !== undefined, 'No setpoint found or it is missing value_min/max');
                const temperature = firstExpose.features.find((f) => f.name === 'local_temperature');
                (0, node_assert_1.default)(temperature, 'No temperature found');
                const discoveryEntry = {
                    type: 'climate',
                    object_id: endpoint ? `climate_${endpoint}` : 'climate',
                    mockProperties: [],
                    discovery_payload: {
                        name: endpoint ? utils_1.default.capitalize(endpoint) : null,
                        // Static
                        state_topic: false,
                        temperature_unit: 'C',
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
                const mode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === 'system_mode');
                if (mode) {
                    if (mode.values.includes('sleep')) {
                        // 'sleep' is not supported by Home Assistant, but is valid according to ZCL
                        // TRV that support sleep (e.g. Viessmann) will have it removed from here,
                        // this allows other expose consumers to still use it, e.g. the frontend.
                        mode.values.splice(mode.values.indexOf('sleep'), 1);
                    }
                    discoveryEntry.discovery_payload.mode_state_topic = true;
                    discoveryEntry.discovery_payload.mode_state_template = `{{ value_json.${mode.property} }}`;
                    discoveryEntry.discovery_payload.modes = mode.values;
                    discoveryEntry.discovery_payload.mode_command_topic = true;
                }
                const state = firstExpose.features.find((f) => f.name === 'running_state');
                if (state) {
                    discoveryEntry.mockProperties.push({ property: state.property, value: null });
                    discoveryEntry.discovery_payload.action_topic = true;
                    discoveryEntry.discovery_payload.action_template =
                        `{% set values = ` +
                            `{None:None,'idle':'idle','heat':'heating','cool':'cooling','fan_only':'fan'}` +
                            ` %}{{ values[value_json.${state.property}] }}`;
                }
                const coolingSetpoint = firstExpose.features.find((f) => f.name === 'occupied_cooling_setpoint');
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
                const fanMode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === 'fan_mode');
                if (fanMode) {
                    discoveryEntry.discovery_payload.fan_modes = fanMode.values;
                    discoveryEntry.discovery_payload.fan_mode_command_topic = true;
                    discoveryEntry.discovery_payload.fan_mode_state_template = `{{ value_json.${fanMode.property} }}`;
                    discoveryEntry.discovery_payload.fan_mode_state_topic = true;
                }
                const swingMode = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === 'swing_mode');
                if (swingMode) {
                    discoveryEntry.discovery_payload.swing_modes = swingMode.values;
                    discoveryEntry.discovery_payload.swing_mode_command_topic = true;
                    discoveryEntry.discovery_payload.swing_mode_state_template = `{{ value_json.${swingMode.property} }}`;
                    discoveryEntry.discovery_payload.swing_mode_state_topic = true;
                }
                const preset = firstExpose.features.filter(utils_1.isEnumExpose).find((f) => f.name === 'preset');
                if (preset) {
                    discoveryEntry.discovery_payload.preset_modes = preset.values;
                    discoveryEntry.discovery_payload.preset_mode_command_topic = 'preset';
                    discoveryEntry.discovery_payload.preset_mode_value_template = `{{ value_json.${preset.property} }}`;
                    discoveryEntry.discovery_payload.preset_mode_state_topic = true;
                }
                const tempCalibration = firstExpose.features
                    .filter(utils_1.isNumericExpose)
                    .find((f) => f.name === 'local_temperature_calibration');
                if (tempCalibration) {
                    const discoveryEntry = {
                        type: 'number',
                        object_id: endpoint ? `${tempCalibration.name}_${endpoint}` : `${tempCalibration.name}`,
                        mockProperties: [{ property: tempCalibration.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? `${tempCalibration.label} ${endpoint}` : tempCalibration.label,
                            value_template: `{{ value_json.${tempCalibration.property} }}`,
                            command_topic: true,
                            command_topic_prefix: endpoint,
                            command_topic_postfix: tempCalibration.property,
                            device_class: 'temperature',
                            entity_category: 'config',
                            icon: 'mdi:math-compass',
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
                const piHeatingDemand = firstExpose.features.filter(utils_1.isNumericExpose).find((f) => f.name === 'pi_heating_demand');
                if (piHeatingDemand) {
                    const discoveryEntry = {
                        type: 'sensor',
                        object_id: endpoint ? /* v8 ignore next */ `${piHeatingDemand.name}_${endpoint}` : `${piHeatingDemand.name}`,
                        mockProperties: [{ property: piHeatingDemand.property, value: null }],
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${piHeatingDemand.label} ${endpoint}` : piHeatingDemand.label,
                            value_template: `{{ value_json.${piHeatingDemand.property} }}`,
                            ...(piHeatingDemand.unit && { unit_of_measurement: piHeatingDemand.unit }),
                            entity_category: 'diagnostic',
                            icon: 'mdi:radiator',
                        },
                    };
                    discoveryEntries.push(discoveryEntry);
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case 'lock': {
                const state = firstExpose.features.filter(utils_1.isBinaryExpose).find((f) => f.name === 'state');
                (0, node_assert_1.default)(state?.name === 'state', "Lock expose must have a 'state'");
                const discoveryEntry = {
                    type: 'lock',
                    /* v8 ignore next */
                    object_id: endpoint ? `lock_${endpoint}` : 'lock',
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
            case 'cover': {
                const state = exposes
                    .find((expose) => expose.features.find((e) => e.name === 'state'))
                    ?.features.find((f) => f.name === 'state');
                (0, node_assert_1.default)(state, `Cover expose must have a 'state'`);
                const position = exposes
                    .find((expose) => expose.features.find((e) => e.name === 'position'))
                    ?.features.find((f) => f.name === 'position');
                const tilt = exposes
                    .find((expose) => expose.features.find((e) => e.name === 'tilt'))
                    ?.features.find((f) => f.name === 'tilt');
                const motorState = allExposes
                    ?.filter(utils_1.isEnumExpose)
                    .find((e) => ['motor_state', 'moving'].includes(e.name) && e.access === ACCESS_STATE);
                const running = allExposes?.filter(utils_1.isBinaryExpose)?.find((e) => e.name === 'running');
                const discoveryEntry = {
                    type: 'cover',
                    mockProperties: [{ property: state.property, value: null }],
                    object_id: endpoint ? `cover_${endpoint}` : 'cover',
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
                    discoveryEntry.discovery_payload.value_template =
                        `{% if "${featurePropertyWithoutEndpoint(running)}" in value_json ` +
                            `and value_json.${featurePropertyWithoutEndpoint(running)} %} {% if value_json.${featurePropertyWithoutEndpoint(position)} > 0 %} closing ` +
                            `{% else %} opening {% endif %} {% else %} stopped {% endif %}`;
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
                        discoveryEntry.discovery_payload.value_template =
                            `{% if "${featurePropertyWithoutEndpoint(motorState)}" in value_json ` +
                                `and value_json.${featurePropertyWithoutEndpoint(motorState)} %} {{ value_json.${featurePropertyWithoutEndpoint(motorState)} }} {% else %} ` +
                                `${stoppedState} {% endif %}`;
                    }
                }
                // If curtains do not have `running`, `motor_state` or `moving` properties.
                if (!discoveryEntry.discovery_payload.value_template) {
                    discoveryEntry.discovery_payload.value_template = `{{ value_json.${featurePropertyWithoutEndpoint(state)} }}`;
                    discoveryEntry.discovery_payload.state_open = 'OPEN';
                    discoveryEntry.discovery_payload.state_closed = 'CLOSE';
                    discoveryEntry.discovery_payload.state_stopped = 'STOP';
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
            case 'fan': {
                (0, node_assert_1.default)(!endpoint, `Endpoint not supported for fan type`);
                const discoveryEntry = {
                    type: 'fan',
                    object_id: 'fan',
                    mockProperties: [{ property: 'fan_state', value: null }],
                    discovery_payload: {
                        name: null,
                        state_topic: true,
                        state_value_template: '{{ value_json.fan_state }}',
                        command_topic: true,
                        command_topic_postfix: 'fan_state',
                    },
                };
                const speed = firstExpose.features.filter(utils_1.isEnumExpose).find((e) => e.name === 'mode');
                if (speed) {
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
                    let speeds = ['off'].concat(['low', 'medium', 'high', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter((s) => speed.values.includes(s)));
                    let presets = ['on', 'auto', 'smart'].filter((s) => speed.values.includes(s));
                    if (['99432'].includes(definition.model)) {
                        // The Hampton Bay 99432 fan implements 4 speeds using the ZCL
                        // hvacFanCtrl values `low`, `medium`, `high`, and `on`, and
                        // 1 preset called "Comfort Breeze" using the ZCL value `smart`.
                        // ZCL value `auto` is unused.
                        speeds = ['off', 'low', 'medium', 'high', 'on'];
                        presets = ['smart'];
                    }
                    const allowed = [...speeds, ...presets];
                    speed.values.forEach((s) => (0, node_assert_1.default)(allowed.includes(s.toString())));
                    const percentValues = speeds.map((s, i) => `'${s}':${i}`).join(', ');
                    const percentCommands = speeds.map((s, i) => `${i}:'${s}'`).join(', ');
                    const presetList = presets.map((s) => `'${s}'`).join(', ');
                    discoveryEntry.discovery_payload.percentage_state_topic = true;
                    discoveryEntry.discovery_payload.percentage_command_topic = true;
                    discoveryEntry.discovery_payload.percentage_value_template = `{{ {${percentValues}}[value_json.${speed.property}] | default('None') }}`;
                    discoveryEntry.discovery_payload.percentage_command_template = `{{ {${percentCommands}}[value] | default('') }}`;
                    discoveryEntry.discovery_payload.speed_range_min = 1;
                    discoveryEntry.discovery_payload.speed_range_max = speeds.length - 1;
                    (0, node_assert_1.default)(presets.length !== 0);
                    discoveryEntry.discovery_payload.preset_mode_state_topic = true;
                    discoveryEntry.discovery_payload.preset_mode_command_topic = 'fan_mode';
                    discoveryEntry.discovery_payload.preset_mode_value_template = `{{ value_json.${speed.property} if value_json.${speed.property} in [${presetList}] else 'None' | default('None') }}`;
                    discoveryEntry.discovery_payload.preset_modes = presets;
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case 'binary': {
                /**
                 * If Z2M binary attribute has SET access then expose it as `switch` in HA
                 * There is also a check on the values for typeof boolean to prevent invalid values and commands
                 * silently failing - commands work fine but some devices won't reject unexpected values.
                 * https://github.com/Koenkk/zigbee2mqtt/issues/7740
                 */
                (0, utils_1.assertBinaryExpose)(firstExpose);
                if (firstExpose.access & ACCESS_SET) {
                    const discoveryEntry = {
                        type: 'switch',
                        mockProperties: [{ property: firstExpose.property, value: null }],
                        object_id: endpoint ? `switch_${firstExpose.name}_${endpoint}` : `switch_${firstExpose.name}`,
                        discovery_payload: {
                            name: endpoint ? /* v8 ignore next */ `${firstExpose.label} ${endpoint}` : firstExpose.label,
                            value_template: typeof firstExpose.value_on === 'boolean'
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
                        type: 'binary_sensor',
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
            case 'numeric': {
                (0, utils_1.assertNumericExpose)(firstExpose);
                const allowsSet = firstExpose.access & ACCESS_SET;
                /**
                 * If numeric attribute has SET access then expose as SELECT entity.
                 */
                if (allowsSet) {
                    const discoveryEntry = {
                        type: 'number',
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
                    if (NUMERIC_DISCOVERY_LOOKUP[firstExpose.name]?.device_class === 'temperature') {
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
                if (firstExpose.unit && ['Wh', 'kWh'].includes(firstExpose.unit)) {
                    Object.assign(extraAttrs, { device_class: 'energy', state_class: 'total_increasing' });
                }
                let key = firstExpose.name;
                // Home Assistant uses a different voc device_class for µg/m³ versus ppb or ppm.
                if (firstExpose.name === 'voc' && firstExpose.unit && ['ppb', 'ppm'].includes(firstExpose.unit)) {
                    key = 'voc_parts';
                }
                const discoveryEntry = {
                    type: 'sensor',
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
                if (discoveryEntry.discovery_payload.entity_category === 'config') {
                    discoveryEntry.discovery_payload.entity_category = 'diagnostic';
                }
                discoveryEntries.push(discoveryEntry);
                break;
            }
            case 'enum': {
                (0, utils_1.assertEnumExpose)(firstExpose);
                /**
                 * If enum attribute does not have SET access and is named 'action', then expose
                 * as EVENT entity. Wildcard actions like `recall_*` are currently not supported.
                 */
                if (firstExpose.property === 'action') {
                    if (this.experimentalEventEntities &&
                        firstExpose.access & ACCESS_STATE &&
                        !(firstExpose.access & ACCESS_SET) &&
                        firstExpose.property == 'action') {
                        discoveryEntries.push({
                            type: 'event',
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
                        type: 'button',
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
                        type: 'select',
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
                        type: 'sensor',
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
            case 'text':
            case 'composite':
            case 'list': {
                const firstExposeTyped = firstExpose;
                if (firstExposeTyped.type === 'text' && firstExposeTyped.access & ACCESS_SET) {
                    discoveryEntries.push({
                        type: 'text',
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
                        type: 'sensor',
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
            /* v8 ignore start */
            default:
                throw new Error(`Unsupported exposes type: '${firstExpose.type}'`);
            /* v8 ignore stop */
        }
        // Exposes with category 'config' or 'diagnostic' are always added to the respective category.
        // This takes precedence over definitions in this file.
        if (firstExpose.category === 'config') {
            discoveryEntries.forEach((d) => (d.discovery_payload.entity_category = 'config'));
        }
        else if (firstExpose.category === 'diagnostic') {
            discoveryEntries.forEach((d) => (d.discovery_payload.entity_category = 'diagnostic'));
        }
        discoveryEntries.forEach((d) => {
            // If a sensor has entity category `config`, then change
            // it to `diagnostic`. Sensors have no input, so can't be configured.
            // https://github.com/Koenkk/zigbee2mqtt/pull/19474
            if (['binary_sensor', 'sensor'].includes(d.type) && d.discovery_payload.entity_category === 'config') {
                d.discovery_payload.entity_category = 'diagnostic';
            }
            // Event entities cannot have an entity_category set.
            if (d.type === 'event' && d.discovery_payload.entity_category) {
                delete d.discovery_payload.entity_category;
            }
            // Let Home Assistant generate entity name when device_class is present
            if (d.discovery_payload.device_class) {
                delete d.discovery_payload.name;
            }
        });
        return discoveryEntries;
    }
    async onEntityRemoved(data) {
        logger_1.default.debug(`Clearing Home Assistant discovery for '${data.name}'`);
        const discovered = this.getDiscovered(data.id);
        for (const topic of Object.keys(discovered.messages)) {
            await this.mqtt.publish(topic, '', { retain: true, qos: 1 }, this.discoveryTopic, false, false);
        }
        delete this.discovered[data.id];
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
            await this.publishEntityState(data.entity, { action: '' });
        }
        /**
         * Implements the MQTT device trigger (https://www.home-assistant.io/integrations/device_trigger.mqtt/)
         * The MQTT device trigger does not support JSON parsing, so it cannot listen to zigbee2mqtt/my_device
         * Whenever a device publish an {action: *} we discover an MQTT device trigger sensor
         * and republish it to zigbee2mqtt/my_device/action
         */
        if (settings.get().advanced.output === 'json' && entity.isDevice() && entity.definition && data.message.action) {
            const value = data.message['action'].toString();
            await this.publishDeviceTriggerDiscover(entity, 'action', value);
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
                await this.mqtt.publish(topic, '', { retain: true, qos: 1 }, this.discoveryTopic, false, false);
            }
            discovered.messages = {};
            // Make sure Home Assistant deletes the old entity first otherwise another one (_2) is created
            // https://github.com/Koenkk/zigbee2mqtt/issues/12610
            await utils_1.default.sleep(2);
        }
        await this.discover(data.entity);
        if (data.entity.isDevice()) {
            for (const config of this.getDiscovered(data.entity).triggers) {
                const key = config.substring(0, config.indexOf('_'));
                const value = config.substring(config.indexOf('_') + 1);
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
                configs.push(...this.exposeToConfig([expose], 'device', exposes, entity.definition));
            }
        }
        else if (isGroup) {
            // group
            const exposesByType = {};
            const allExposes = [];
            entity.zh.members
                .map((e) => this.zigbee.resolveEntity(e.getDevice()))
                .filter((d) => d.definition)
                .forEach((device) => {
                const exposes = device.exposes();
                allExposes.push(...exposes);
                for (const expose of exposes.filter((e) => GROUP_SUPPORTED_TYPES.includes(e.type))) {
                    let key = expose.type;
                    if (['switch', 'lock', 'cover'].includes(expose.type) && expose.endpoint) {
                        // A device can have multiple of these types which have to discovered separately.
                        // e.g. switch with property state and valve_detection.
                        const state = expose.features.find((f) => f.name === 'state');
                        (0, node_assert_1.default)(state, `'switch', 'lock' or 'cover' is missing state`);
                        key += featurePropertyWithoutEndpoint(state);
                    }
                    if (!exposesByType[key])
                        exposesByType[key] = [];
                    exposesByType[key].push(expose);
                }
            });
            configs = [].concat(...Object.values(exposesByType).map((exposes) => this.exposeToConfig(exposes, 'group', allExposes)));
        }
        else {
            // Discover bridge config.
            configs.push(...entity.configs);
        }
        if (isDevice && settings.get().advanced.last_seen !== 'disable') {
            const config = {
                type: 'sensor',
                object_id: 'last_seen',
                mockProperties: [{ property: 'last_seen', value: null }],
                discovery_payload: {
                    name: 'Last seen',
                    value_template: '{{ value_json.last_seen }}',
                    icon: 'mdi:clock',
                    enabled_by_default: false,
                    entity_category: 'diagnostic',
                },
            };
            if (settings.get().advanced.last_seen.startsWith('ISO_8601')) {
                config.discovery_payload.device_class = 'timestamp';
            }
            configs.push(config);
        }
        if (isDevice && entity.definition?.ota) {
            const updateSensor = {
                type: 'update',
                object_id: 'update',
                mockProperties: [{ property: 'update', value: { state: null } }],
                discovery_payload: {
                    name: null,
                    entity_picture: 'https://github.com/Koenkk/zigbee2mqtt/raw/master/images/logo.png',
                    state_topic: true,
                    device_class: 'firmware',
                    entity_category: 'config',
                    command_topic: `${settings.get().mqtt.base_topic}/bridge/request/device/ota_update/update`,
                    payload_install: `{"id": "${entity.ieeeAddr}"}`,
                    value_template: `{"latest_version":"{{ value_json['update']['latest_version'] }}","installed_version":"{{ value_json['update']['installed_version'] }}","update_percentage":{{ value_json['update'].get('progress', 'null') }}}`,
                },
            };
            configs.push(updateSensor);
        }
        // Discover scenes.
        const endpointsOrGroups = isDevice ? entity.zh.endpoints : isGroup ? [entity.zh] : [];
        endpointsOrGroups.forEach((endpointOrGroup) => {
            utils_1.default.getScenes(endpointOrGroup).forEach((scene) => {
                const sceneEntry = {
                    type: 'scene',
                    object_id: `scene_${scene.id}`,
                    mockProperties: [],
                    discovery_payload: {
                        name: `${scene.name}`,
                        state_topic: false,
                        command_topic: true,
                        payload_on: `{ "scene_recall": ${scene.id} }`,
                        object_id_postfix: `_${scene.name.replace(/\s+/g, '_').toLowerCase()}`,
                    },
                };
                configs.push(sceneEntry);
            });
        });
        // deep clone of the config objects
        configs = JSON.parse(JSON.stringify(configs));
        if (entity.options.homeassistant) {
            const s = entity.options.homeassistant;
            configs = configs.filter((config) => s[config.object_id] === undefined || s[config.object_id] != null);
            configs.forEach((config) => {
                const configOverride = s[config.object_id];
                if (configOverride) {
                    config.object_id = configOverride.object_id || config.object_id;
                    config.type = configOverride.type || config.type;
                }
            });
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
        else if (isDevice &&
            (!entity.definition || entity.zh.interviewing || (entity.options.homeassistant !== undefined && !entity.options.homeassistant))) {
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
            payload.object_id = devicePayload.name.replace(/\s+/g, '_').toLowerCase();
            if (config.object_id.startsWith(config.type) && config.object_id.includes('_')) {
                payload.object_id += `_${config.object_id.split(/_(.+)/)[1]}`;
            }
            else if (!config.object_id.startsWith(config.type)) {
                payload.object_id += `_${config.object_id}`;
            }
            // Allow customization of the `payload.object_id` without touching the other uses of `config.object_id`
            // (e.g. for setting the `payload.unique_id` and as an internal key).
            payload.object_id = `${payload.object_id}${payload.object_id_postfix ?? ''}`;
            delete payload.object_id_postfix;
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
                        payload.availability_mode = 'all';
                        payload.availability.push({ topic: `${baseTopic}/availability` });
                    }
                }
                else {
                    // Bridge availability is different.
                    payload.availability_mode = 'all';
                }
                if (isDevice && entity.options.disabled) {
                    // Mark disabled device always as unavailable
                    payload.availability.forEach((a) => (a.value_template = '{{ "offline" }}'));
                }
                else {
                    payload.availability.forEach((a) => (a.value_template = '{{ value_json.state }}'));
                }
            }
            else {
                delete payload.availability;
            }
            const commandTopicPrefix = payload.command_topic_prefix ? `${payload.command_topic_prefix}/` : '';
            delete payload.command_topic_prefix;
            const commandTopicPostfix = payload.command_topic_postfix ? `/${payload.command_topic_postfix}` : '';
            delete payload.command_topic_postfix;
            const commandTopic = `${baseTopic}/${commandTopicPrefix}set${commandTopicPostfix}`;
            if (payload.command_topic && typeof payload.command_topic !== 'string') {
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
                payload.percentage_command_topic = `${baseTopic}/${commandTopicPrefix}set/fan_mode`;
            }
            if (payload.preset_mode_state_topic) {
                payload.preset_mode_state_topic = stateTopic;
            }
            if (payload.preset_mode_command_topic) {
                payload.preset_mode_command_topic = `${baseTopic}/${commandTopicPrefix}set/` + payload.preset_mode_command_topic;
            }
            if (payload.action_topic) {
                payload.action_topic = stateTopic;
            }
            // Override configuration with user settings.
            if (entity.options.homeassistant != undefined) {
                const add = (obj, ignoreName) => {
                    Object.keys(obj).forEach((key) => {
                        if (['type', 'object_id'].includes(key)) {
                            return;
                        }
                        else if (ignoreName && key === 'name') {
                            return;
                        }
                        else if (['number', 'string', 'boolean'].includes(typeof obj[key]) || Array.isArray(obj[key])) {
                            payload[key] = obj[key];
                        }
                        else if (obj[key] === null) {
                            delete payload[key];
                        }
                        else if (key === 'device' && typeof obj[key] === 'object') {
                            Object.keys(obj['device']).forEach((key) => {
                                payload['device'][key] = obj['device'][key];
                            });
                        }
                    });
                };
                add(entity.options.homeassistant, true);
                if (entity.options.homeassistant[config.object_id] != undefined) {
                    add(entity.options.homeassistant[config.object_id], false);
                }
            }
            if (entity.isDevice()) {
                entity.definition?.meta?.overrideHaDiscoveryPayload?.(payload);
            }
            const topic = this.getDiscoveryTopic(config, entity);
            const payloadStr = (0, json_stable_stringify_without_jsonify_1.default)(payload);
            newDiscoveredTopics.add(topic);
            // Only discover when not discovered yet
            const discoveredMessage = discovered.messages[topic];
            if (!discoveredMessage || discoveredMessage.payload !== payloadStr || !discoveredMessage.published) {
                discovered.messages[topic] = { payload: payloadStr, published: publish };
                if (publish) {
                    await this.mqtt.publish(topic, payloadStr, { retain: true, qos: 1 }, this.discoveryTopic, false, false);
                }
            }
            else {
                logger_1.default.debug(`Skipping discovery of '${topic}', already discovered`);
            }
            config.mockProperties?.forEach((mockProperty) => discovered.mockProperties.add(mockProperty));
        }
        for (const topic of lastDiscoveredTopics) {
            const isDeviceAutomation = topic.match(this.discoveryRegexWoTopic)?.[1] === 'device_automation';
            if (!newDiscoveredTopics.has(topic) && !isDeviceAutomation) {
                await this.mqtt.publish(topic, '', { retain: true, qos: 1 }, this.discoveryTopic, false, false);
            }
        }
    }
    async onMQTTMessage(data) {
        const discoveryMatch = data.topic.match(this.discoveryRegex);
        const isDeviceAutomation = discoveryMatch && discoveryMatch[1] === 'device_automation';
        if (discoveryMatch) {
            // Clear outdated discovery configs and remember already discovered device_automations
            let message;
            try {
                message = JSON.parse(data.message);
                const baseTopic = settings.get().mqtt.base_topic + '/';
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
            const ID = discoveryMatch[2].includes('_') ? discoveryMatch[2].split('_')[1] : discoveryMatch[2];
            const entity = ID === this.bridge.ID ? this.bridge : this.zigbee.resolveEntity(ID);
            let clear = !entity || (entity.isDevice() && !entity.definition);
            // Only save when topic matches otherwise config is not updated when renamed by editing configuration.yaml
            if (entity) {
                const key = `${discoveryMatch[3].substring(0, discoveryMatch[3].indexOf('_'))}`;
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
                await this.mqtt.publish(topic, '', { retain: true, qos: 1 }, this.discoveryTopic, false, false);
            }
            else if (entity) {
                this.getDiscovered(entity).messages[topic] = { payload: (0, json_stable_stringify_without_jsonify_1.default)(message), published: true };
            }
        }
        else if (data.topic === this.statusTopic && data.message.toLowerCase() === 'online') {
            const timer = setTimeout(async () => {
                // Publish all device states.
                for (const entity of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
                    if (this.state.exists(entity)) {
                        await this.publishEntityState(entity, this.state.get(entity), 'publishCached');
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
            if (topic.startsWith('scene')) {
                await this.mqtt.publish(topic, '', { retain: true, qos: 1 }, this.discoveryTopic, false, false);
                delete discovered.messages[topic];
            }
        }
        // Make sure Home Assistant deletes the old entity first otherwise another one (_2) is created
        // https://github.com/Koenkk/zigbee2mqtt/issues/12610
        logger_1.default.debug(`Finished clearing scene discovery topics, waiting for Home Assistant.`);
        await utils_1.default.sleep(2);
        // Re-discover entity (including any new scenes).
        logger_1.default.debug(`Re-discovering entities with their scenes.`);
        await this.discover(data.entity);
    }
    getDevicePayload(entity) {
        const identifierPostfix = entity.isGroup() ? `zigbee2mqtt_${this.getEncodedBaseTopic()}` : 'zigbee2mqtt';
        // Allow device name to be overridden by homeassistant config
        let deviceName = entity.name;
        if (typeof entity.options.homeassistant?.name === 'string') {
            deviceName = entity.options.homeassistant.name;
        }
        const payload = {
            identifiers: [`${identifierPostfix}_${entity.options.ID}`],
            name: deviceName,
            sw_version: `Zigbee2MQTT ${this.zigbee2MQTTVersion}`,
        };
        const url = settings.get().frontend?.url ?? '';
        if (entity.isDevice()) {
            (0, node_assert_1.default)(entity.definition, `Cannot 'getDevicePayload' for unsupported device`);
            payload.model = entity.definition.description;
            payload.model_id = entity.definition.model;
            payload.manufacturer = entity.definition.vendor;
            payload.sw_version = entity.zh.softwareBuildID;
            payload.hw_version = entity.zh.hardwareVersion;
            payload.configuration_url = `${url}/#/device/${entity.ieeeAddr}/info`;
        }
        else if (entity.isGroup()) {
            payload.model = 'Group';
            payload.manufacturer = 'Zigbee2MQTT';
            payload.configuration_url = `${url}/#/group/${entity.ID}`;
        }
        else {
            payload.model = 'Bridge';
            payload.manufacturer = 'Zigbee2MQTT';
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
        this.getDiscovered(entity).mockProperties.forEach((mockProperty) => {
            if (message[mockProperty.property] === undefined) {
                message[mockProperty.property] = mockProperty.value;
            }
        });
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
            .mqtt.base_topic.split('')
            .map((s) => s.charCodeAt(0).toString())
            .join('');
    }
    getDiscoveryTopic(config, entity) {
        const key = entity.isDevice() ? entity.ieeeAddr : `${this.getEncodedBaseTopic()}_${entity.ID}`;
        return `${config.type}/${key}/${config.object_id}/config`;
    }
    async publishDeviceTriggerDiscover(device, key, value, force = false) {
        const haConfig = device.options.homeassistant;
        if (device.options.homeassistant !== undefined &&
            (haConfig == null || (haConfig.device_automation !== undefined && typeof haConfig === 'object' && haConfig.device_automation == null))) {
            return;
        }
        const discovered = this.getDiscovered(device);
        const discoveredKey = `${key}_${value}`;
        if (discovered.triggers.has(discoveredKey) && !force) {
            return;
        }
        const config = {
            type: 'device_automation',
            object_id: `${key}_${value}`,
            mockProperties: [],
            discovery_payload: {
                automation_type: 'trigger',
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
        await this.mqtt.publish(topic, (0, json_stable_stringify_without_jsonify_1.default)(payload), { retain: true, qos: 1 }, this.discoveryTopic, false, false);
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
            type: 'binary_sensor',
            object_id: 'connection_state',
            mockProperties: [],
            discovery_payload: {
                name: 'Connection state',
                device_class: 'connectivity',
                entity_category: 'diagnostic',
                state_topic: true,
                state_topic_postfix: 'state',
                value_template: '{{ value_json.state }}',
                payload_on: 'online',
                payload_off: 'offline',
                availability: false,
            },
        }, {
            type: 'binary_sensor',
            object_id: 'restart_required',
            mockProperties: [],
            discovery_payload: {
                name: 'Restart required',
                device_class: 'problem',
                entity_category: 'diagnostic',
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: 'info',
                value_template: '{{ value_json.restart_required }}',
                payload_on: true,
                payload_off: false,
            },
        }, 
        // Buttons.
        {
            type: 'button',
            object_id: 'restart',
            mockProperties: [],
            discovery_payload: {
                name: 'Restart',
                device_class: 'restart',
                state_topic: false,
                command_topic: `${baseTopic}/request/restart`,
                payload_press: '',
            },
        }, 
        // Selects.
        {
            type: 'select',
            object_id: 'log_level',
            mockProperties: [],
            discovery_payload: {
                name: 'Log level',
                entity_category: 'config',
                state_topic: true,
                state_topic_postfix: 'info',
                value_template: '{{ value_json.log_level | lower }}',
                command_topic: `${baseTopic}/request/options`,
                command_template: '{"options": {"advanced": {"log_level": "{{ value }}" } } }',
                options: settings.LOG_LEVELS,
            },
        }, 
        // Sensors:
        {
            type: 'sensor',
            object_id: 'version',
            mockProperties: [],
            discovery_payload: {
                name: 'Version',
                icon: 'mdi:zigbee',
                entity_category: 'diagnostic',
                state_topic: true,
                state_topic_postfix: 'info',
                value_template: '{{ value_json.version }}',
            },
        }, {
            type: 'sensor',
            object_id: 'coordinator_version',
            mockProperties: [],
            discovery_payload: {
                name: 'Coordinator version',
                icon: 'mdi:chip',
                entity_category: 'diagnostic',
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: 'info',
                value_template: '{{ value_json.coordinator.meta.revision }}',
            },
        }, {
            type: 'sensor',
            object_id: 'network_map',
            mockProperties: [],
            discovery_payload: {
                name: 'Network map',
                entity_category: 'diagnostic',
                enabled_by_default: false,
                state_topic: true,
                state_topic_postfix: 'response/networkmap',
                value_template: "{{ now().strftime('%Y-%m-%d %H:%M:%S') }}",
                json_attributes_topic: `${baseTopic}/response/networkmap`,
                json_attributes_template: '{{ value_json.data.value | tojson }}',
            },
        }, 
        // Switches.
        {
            type: 'switch',
            object_id: 'permit_join',
            mockProperties: [],
            discovery_payload: {
                name: 'Permit join',
                icon: 'mdi:human-greeting-proximity',
                state_topic: true,
                state_topic_postfix: 'info',
                value_template: '{{ value_json.permit_join | lower }}',
                command_topic: `${baseTopic}/request/permit_join`,
                state_on: 'true',
                state_off: 'false',
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
            logger_1.default.debug('Found scene wildcard action ' + m.groups.action);
            return this.buildAction(m.groups, { scene: 'wildcard' });
        }
        m = action.match(/^(?<actionPrefix>region_)\*_(?<action>enter|leave|occupied|unoccupied)$/);
        if (m?.groups?.action) {
            logger_1.default.debug('Found region wildcard action ' + m.groups.action);
            return this.buildAction(m.groups, { region: 'wildcard' });
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
        return utils_1.default.arrayUnique(values.map((v) => this.parseActionValue(v.toString()).action).filter((v) => !v.includes('*')));
    }
    parseGroupsFromRegex(pattern) {
        return [...pattern.matchAll(/\(\?<([a-zA-Z]+)>/g)].map((v) => v[1]);
    }
    getActionValueTemplate() {
        // TODO: Implement parsing for all event types.
        const patterns = ACTION_PATTERNS.map((v) => {
            return `{"pattern": '${v.replaceAll(/\?<([a-zA-Z]+)>/g, '?P<$1>')}', "groups": [${this.parseGroupsFromRegex(v)
                .map((g) => `"${g}"`)
                .join(', ')}]}`;
        }).join(',\n');
        const value_template = `{% set patterns = [\n${patterns}\n] %}\n` +
            `{% set action_value = value_json.action|default('') %}\n` +
            `{% set ns = namespace(r=[('action', action_value)]) %}\n` +
            `{% for p in patterns %}\n` +
            `  {% set m = action_value|regex_findall(p.pattern) %}\n` +
            `  {% if m[0] is undefined %}{% continue %}{% endif %}\n` +
            `  {% for key, value in zip(p.groups, m[0]) %}\n` +
            `    {% set ns.r = ns.r|rejectattr(0, 'eq', key)|list + [(key, value)] %}\n` +
            `  {% endfor %}\n` +
            `{% endfor %}\n` +
            `{% if (ns.r|selectattr(0, 'eq', 'actionPrefix')|first) is defined %}\n` +
            `  {% set ns.r = ns.r|rejectattr(0, 'eq', 'action')|list + [('action', ns.r|selectattr(0, 'eq', 'actionPrefix')|map(attribute=1)|first + ns.r|selectattr(0, 'eq', 'action')|map(attribute=1)|first)] %}\n` +
            `{% endif %}\n` +
            `{% set ns.r = ns.r + [('event_type', ns.r|selectattr(0, 'eq', 'action')|map(attribute=1)|first)] %}\n` +
            `{{dict.from_keys(ns.r|rejectattr(0, 'in', ('action', 'actionPrefix'))|reject('eq', ('event_type', None))|reject('eq', ('event_type', '')))|to_json}}`;
        return value_template;
    }
}
exports.default = HomeAssistant;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZWFzc2lzdGFudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vaG9tZWFzc2lzdGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUVqQyxvRUFBa0M7QUFDbEMsa0hBQThEO0FBSTlELDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsdURBQThJO0FBQzlJLDREQUFvQztBQTRCcEMsTUFBTSxlQUFlLEdBQWE7SUFDOUIsMkVBQTJFO0lBQzNFLHFEQUFxRDtJQUNyRCwwRkFBMEY7SUFDMUYsNEVBQTRFO0lBQzVFLHlEQUF5RDtDQUM1RCxDQUFDO0FBQ0YsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQzNCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN6QixNQUFNLHFCQUFxQixHQUEwQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzFGLE1BQU0sb0JBQW9CLEdBQTBCLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25HLE1BQU0sb0JBQW9CLEdBQTBCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDN0gsTUFBTSxvQkFBb0IsR0FBMEIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzRixNQUFNLGdCQUFnQixHQUEwQixDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNsSCxNQUFNLHVCQUF1QixHQUE0QjtJQUNyRCxzQkFBc0IsRUFBRSxFQUFDLElBQUksRUFBRSxZQUFZLEVB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