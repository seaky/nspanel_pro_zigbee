import { Access, Range } from './types';
export type Feature = Numeric | Binary | Enum | Composite | List | Text;
export declare class Base {
    name: string;
    label: string;
    access: number;
    type: 'switch' | 'lock' | 'binary' | 'list' | 'numeric' | 'enum' | 'text' | 'composite' | 'light' | 'cover' | 'fan' | 'climate';
    endpoint?: string;
    property?: string;
    description?: string;
    features?: Feature[];
    category?: 'config' | 'diagnostic';
    withEndpoint(endpointName: string): this;
    withAccess(a: number): this;
    withProperty(property: string): this;
    withLabel(label: string): this;
    withDescription(description: string): this;
    withCategory(category: 'config' | 'diagnostic'): this;
    validateCategory(): void;
    addFeature(feature: Feature): void;
    removeFeature(feature: string): this;
    setAccess(feature: string, a: number): this;
    copy(target: Base): void;
}
export declare class Switch extends Base {
    features: Feature[];
    constructor();
    withState(property: string, toggle: string | boolean, description: string, access?: Access, value_on?: string, value_off?: string): this;
    clone(): Switch;
}
export declare class Lock extends Base {
    features: Feature[];
    constructor();
    withState(property: string, valueOn: string, valueOff: string, description: string, access?: Access): this;
    withLockState(property: string, description: string): this;
    clone(): Lock;
}
export declare class Binary extends Base {
    property: string;
    value_on: string | boolean;
    value_off: string | boolean;
    value_toggle?: string;
    constructor(name: string, access: number, valueOn: string | boolean, valueOff: string | boolean);
    clone(): Binary;
    withValueToggle(value: string): this;
}
export declare class List extends Base {
    property: string;
    item_type: Numeric | Binary | Composite | Text;
    length_min?: number;
    length_max?: number;
    constructor(name: string, access: number, itemType: Numeric | Binary | Composite | Text);
    withLengthMin(value: number): this;
    withLengthMax(value: number): this;
    clone(): List;
}
export declare class Numeric extends Base {
    property: string;
    unit?: string;
    value_max?: number;
    value_min?: number;
    value_step?: number;
    presets?: {
        name: string;
        value: number | string;
        description: string;
    }[];
    constructor(name: string, access: number);
    withUnit(unit: string): this;
    withValueMax(value: number): this;
    withValueMin(value: number): this;
    withValueStep(value: number): this;
    withPreset(name: string, value: number | string, description: string): this;
    clone(): Numeric;
}
export declare class Enum extends Base {
    property: string;
    values: (string | number)[];
    constructor(name: string, access: number, values: (string | number)[]);
    clone(): Enum;
}
export declare class Text extends Base {
    property: string;
    constructor(name: string, access: number);
    clone(): Text;
}
export declare class Composite extends Base {
    property: string;
    features: Feature[];
    constructor(name: string, property: string, access: number);
    withFeature(feature: Feature): this;
    clone(): Composite;
}
export declare class Light extends Base {
    features: Feature[];
    constructor();
    withBrightness(): this;
    withMinBrightness(): this;
    withMaxBrightness(): this;
    withLevelConfig(disableFeatures?: string[]): this;
    withColorTemp(range: Range): this;
    withColorTempStartup(range: Range): this;
    withColor(types: ('xy' | 'hs')[]): this;
    clone(): Light;
}
export declare class Cover extends Base {
    features: Feature[];
    constructor();
    withPosition(): this;
    withTilt(): this;
    clone(): Cover;
}
export declare class Fan extends Base {
    features: Feature[];
    constructor();
    withModes(modes: string[], access?: Access): this;
    clone(): Fan;
}
export declare class Climate extends Base {
    features: Feature[];
    constructor();
    withSetpoint(property: string, min: number, max: number, step: number, access?: Access): this;
    withLocalTemperature(access?: Access, description?: string): this;
    withLocalTemperatureCalibration(min?: number, max?: number, step?: number, access?: Access): this;
    withSystemMode(modes: string[], access?: Access, description?: string): this;
    withRunningState(modes: string[], access?: Access): this;
    withRunningMode(modes: string[], access?: Access): this;
    withFanMode(modes: string[], access?: Access): this;
    withSwingMode(modes: string[], access?: Access): this;
    withPreset(modes: string[], description?: string): this;
    withPiHeatingDemand(access?: Access): this;
    withControlSequenceOfOperation(modes: string[], access?: Access): this;
    withAcLouverPosition(positions: string[], access?: Access): this;
    withWeeklySchedule(modes: string[], access?: Access): this;
    clone(): Climate;
}
/**
 * The access property is a 3-bit bitmask.
 */
export declare const access: {
    STATE: Access;
    SET: Access;
    GET: Access;
    STATE_SET: Access;
    STATE_GET: Access;
    ALL: Access;
};
export declare const options: {
    calibration: (name: string, type?: string) => Numeric;
    precision: (name: string) => Numeric;
    invert_cover: () => Binary;
    color_sync: () => Binary;
    thermostat_unit: () => Enum;
    expose_pin: () => Binary;
    occupancy_timeout: () => Numeric;
    occupancy_timeout_2: () => Numeric;
    vibration_timeout: () => Numeric;
    simulated_brightness: (extraNote?: string) => Composite;
    no_occupancy_since_true: () => List;
    no_occupancy_since_false: () => List;
    presence_timeout: () => Numeric;
    no_position_support: () => Binary;
    transition: () => Numeric;
    legacy: () => Binary;
    measurement_poll_interval: (extraNote?: string) => Numeric;
    illuminance_below_threshold_check: () => Binary;
    state_action: () => Binary;
    identify_timeout: () => Numeric;
    cover_position_tilt_disable_report: () => Binary;
    local_temperature_based_on_sensor: () => Binary;
};
export declare const presets: {
    binary: (name: string, access: number, valueOn: string | boolean, valueOff: string | boolean) => Binary;
    climate: () => Climate;
    composite: (name: string, property: string, access: number) => Composite;
    cover: () => Cover;
    enum: (name: string, access: number, values: (string | number)[]) => Enum;
    light: () => Light;
    numeric: (name: string, access: number) => Numeric;
    text: (name: string, access: number) => Text;
    list: (name: string, access: number, itemType: Feature) => List;
    switch_: () => Switch;
    ac_frequency: () => Numeric;
    action: (values: string[]) => Enum;
    action_duration: () => Numeric;
    action_group: () => Numeric;
    angle: (name: string) => Numeric;
    angle_axis: (name: string) => Numeric;
    aqi: () => Numeric;
    auto_lock: () => Switch;
    auto_off: (offTime: number) => Binary;
    auto_relock_time: () => Numeric;
    away_mode: () => Switch;
    away_preset_days: () => Numeric;
    away_preset_temperature: () => Numeric;
    battery: () => Numeric;
    battery_low: () => Binary;
    battery_voltage: () => Numeric;
    boost_time: () => Numeric;
    button_lock: () => Binary;
    calibrated: () => Binary;
    carbon_monoxide: () => Binary;
    child_lock: () => Lock;
    child_lock_bool: () => Binary;
    co2: () => Numeric;
    co: () => Numeric;
    comfort_temperature: () => Numeric;
    consumer_connected: () => Binary;
    contact: () => Binary;
    cover_position: () => Cover;
    cover_position_tilt: () => Cover;
    cover_tilt: () => Cover;
    cover_mode: () => Composite;
    cpu_temperature: () => Numeric;
    cube_side: (name: string) => Numeric;
    current: () => Numeric;
    current_phase_b: () => Numeric;
    current_phase_c: () => Numeric;
    deadzone_temperature: () => Numeric;
    detection_interval: () => Numeric;
    device_temperature: () => Numeric;
    eco2: () => Numeric;
    eco_mode: () => Binary;
    eco_temperature: () => Numeric;
    effect: () => Enum;
    energy: () => Numeric;
    produced_energy: () => Numeric;
    energy_produced: () => Numeric;
    fan: () => Fan;
    flip_indicator_light: () => Binary;
    force: () => Enum;
    formaldehyd: () => Numeric;
    gas: () => Binary;
    hcho: () => Numeric;
    holiday_temperature: () => Numeric;
    humidity: () => Numeric;
    illuminance: () => Numeric;
    illuminance_lux: () => Numeric;
    brightness_state: () => Enum;
    keypad_lockout: () => Enum;
    led_disabled_night: () => Binary;
    light_brightness: () => Light;
    light_brightness_color: (preferHueAndSaturation: boolean) => Light;
    light_brightness_colorhs: () => Light;
    light_brightness_colortemp: (colorTempRange: Range) => Light;
    light_brightness_colortemp_color: (colorTempRange?: Range, preferHueAndSaturation?: boolean) => Light;
    light_brightness_colortemp_colorhs: (colorTempRange: Range) => Light;
    light_brightness_colortemp_colorxy: (colorTempRange?: Range) => Light;
    light_brightness_colorxy: () => Light;
    light_colorhs: () => Light;
    light_color_options: () => Composite;
    linkquality: () => Numeric;
    local_temperature: () => Numeric;
    lock: () => Lock;
    lock_action: () => Enum;
    lock_action_source_name: () => Enum;
    lock_action_user: () => Numeric;
    max_cool_setpoint_limit: (min: number, max: number, step: number) => Numeric;
    min_cool_setpoint_limit: (min: number, max: number, step: number) => Numeric;
    max_heat_setpoint_limit: (min: number, max: number, step: number) => Numeric;
    min_heat_setpoint_limit: (min: number, max: number, step: number) => Numeric;
    max_temperature: () => Numeric;
    max_temperature_limit: () => Numeric;
    min_temperature_limit: () => Numeric;
    min_temperature: () => Numeric;
    mode_switch_select: (mode_switch_names: string[]) => Enum;
    motion_sensitivity_select: (motion_sensitivity_names: string[]) => Enum;
    noise: () => Numeric;
    noise_detected: () => Binary;
    occupancy: () => Binary;
    occupancy_level: () => Numeric;
    open_window: () => Binary;
    open_window_temperature: () => Numeric;
    operation_mode_select: (operation_mode_names: string[]) => Enum;
    overload_protection: (min: number, max: number) => Numeric;
    pm1: () => Numeric;
    pm10: () => Numeric;
    pm25: () => Numeric;
    position: () => Numeric;
    power: () => Numeric;
    power_phase_b: () => Numeric;
    power_phase_c: () => Numeric;
    power_factor: () => Numeric;
    power_factor_phase_b: () => Numeric;
    power_factor_phase_c: () => Numeric;
    power_apparent: () => Numeric;
    power_apparent_phase_b: () => Numeric;
    power_apparent_phase_c: () => Numeric;
    power_on_behavior: (values?: string[]) => Enum;
    power_outage_count: (resetsWhenPairing?: boolean) => Numeric;
    power_outage_memory: () => Binary;
    power_reactive: () => Numeric;
    power_reactive_phase_b: () => Numeric;
    power_reactive_phase_c: () => Numeric;
    presence: () => Binary;
    pressure: () => Numeric;
    programming_operation_mode: (values?: string[]) => Enum;
    setup: () => Binary;
    schedule: () => Binary;
    schedule_settings: () => Text;
    external_temperature_input: () => Numeric;
    smoke: () => Binary;
    soil_moisture: () => Numeric;
    sos: () => Binary;
    sound_volume: () => Enum;
    switch: (description?: string) => Switch;
    switch_type: () => Enum;
    door_state: () => Enum;
    tamper: () => Binary;
    temperature: () => Numeric;
    temperature_sensor_select: (sensor_names: string[]) => Enum;
    test: () => Binary;
    trigger_count: (sinceScheduledReport?: boolean) => Numeric;
    trigger_indicator: () => Binary;
    valve_alarm: () => Binary;
    valve_position: () => Numeric;
    valve_switch: () => Binary;
    valve_state: () => Binary;
    valve_detection: () => Switch;
    valve_detection_bool: () => Binary;
    vibration: () => Binary;
    tilt: () => Binary;
    voc: () => Numeric;
    voc_index: () => Numeric;
    voltage: () => Numeric;
    voltage_phase_b: () => Numeric;
    voltage_phase_c: () => Numeric;
    water_leak: () => Binary;
    pilot_wire_mode: (values?: string[]) => Enum;
    rain: () => Binary;
    warning: () => Composite;
    week: () => Enum;
    window_detection: () => Switch;
    window_detection_bool: () => Binary;
    window_open: () => Binary;
    moving: () => Binary;
    x_axis: () => Numeric;
    y_axis: () => Numeric;
    z_axis: () => Numeric;
    pincode: () => Composite;
    squawk: () => Composite;
    identify_duration: () => Numeric;
    identify: () => Enum;
    min_brightness: () => Numeric;
    max_brightness: () => Numeric;
};
//# sourceMappingURL=exposes.d.ts.map