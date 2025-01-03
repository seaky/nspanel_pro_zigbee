import * as exposes from '../lib/exposes';
import { Fz, KeyValue, KeyValueAny } from '../lib/types';
declare const converters: {
    command_arm_with_transaction: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    metering_datek: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    EKO09738_metering: {
        /**
         * Elko EKO09738 and EKO09716 reports power in mW, scale to W
         */
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    command_on_presence: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<{
            action: string;
            presence: boolean;
        }>;
    };
    ias_ace_occupancy_with_timeout: {
        cluster: string;
        type: string;
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    SP600_power: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    stelpro_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    viessmann_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    eurotronic_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    terncy_raw: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    ZM35HQ_attr: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    schneider_lighting_ballast_configuration: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    wiser_lighting_ballast_configuration: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValueAny>;
    };
    wiser_smart_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<void>;
    };
    nodon_pilot_wire_mode: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    TS110E: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    TS110E_light_type: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    TS110E_switch_type: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    fan: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            fan_mode: any;
            fan_state: string;
        };
    };
    thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    thermostat_weekly_schedule: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: {
                days: string[];
                transitions: KeyValueAny[];
            };
        };
    };
    hvac_user_interface: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lock_operation_event: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
            action_user: any;
            action_source: any;
            action_source_name: string;
        };
    };
    lock_programming_event: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
            action_user: any;
            action_source: any;
            action_source_name: string;
        };
    };
    lock: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lock_pin_code_response: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lock_user_status_response: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    linkquality_from_basic: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            linkquality: number;
        };
    };
    battery: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: number;
        };
    };
    device_temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            device_temperature: number;
        };
    };
    humidity: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: number;
        };
    };
    pm25: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            pm25: any;
        };
    };
    flow: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: number;
        };
    };
    soil_moisture: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            soil_moisture: number;
        };
    };
    illuminance: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            illuminance: any;
            illuminance_lux: number;
        };
    };
    pressure: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            pressure: number;
        };
    };
    co2: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            co2: number;
        };
    };
    occupancy: {
        cluster: string;
        type: string[];
        options: exposes.List[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    occupancy_with_timeout: {
        cluster: string;
        type: string[];
        options: (exposes.Numeric | exposes.List)[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    occupancy_timeout: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy_timeout: any;
        };
    };
    brightness: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: any;
        };
    };
    level_config: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    color_colortemp: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    meter_identification: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    metering: {
        /**
         * When using this converter also add the following to the configure method of the device:
         * await readMeteringPowerConverterAttributes(endpoint);
         */
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    electrical_measurement: {
        /**
         * When using this converter also add the following to the configure method of the device:
         * await readEletricalMeasurementConverterAttributes(endpoint);
         */
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    on_off: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    on_off_force_multiendpoint: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    on_off_skip_duplicate_transaction: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    power_on_behavior: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: any;
        };
    };
    ias_no_alarm: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_siren: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            alarm: boolean;
            tamper: boolean;
            battery_low: boolean;
            supervision_reports: boolean;
            restore_reports: boolean;
            ac_status: boolean;
            test: boolean;
        };
    };
    ias_water_leak_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            water_leak: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_water_leak_alarm_1_report: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            water_leak: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_vibration_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            vibration: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_vibration_alarm_1_with_timeout: {
        cluster: string;
        type: string;
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            vibration: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_gas_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gas: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_gas_alarm_2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gas: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_smoke_alarm_1: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            smoke: boolean;
            tamper: boolean;
            battery_low: boolean;
            supervision_reports: boolean;
            restore_reports: boolean;
            trouble: boolean;
            ac_status: boolean;
            test: boolean;
            battery_defect: boolean;
        };
    };
    ias_contact_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: boolean;
        };
    };
    ias_contact_alarm_1_report: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_carbon_monoxide_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            carbon_monoxide: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_carbon_monoxide_alarm_1_gas_alarm_2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            carbon_monoxide: boolean;
            gas: boolean;
            tamper: boolean;
            battery_low: boolean;
            trouble: boolean;
            ac_connected: boolean;
            test: boolean;
            battery_defect: boolean;
        };
    };
    ias_sos_alarm_2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            sos: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_occupancy_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_occupancy_alarm_1_report: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_occupancy_alarm_2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    ias_alarm_only_alarm_1: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            alarm: boolean;
        };
    };
    ias_occupancy_only_alarm_2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    ias_occupancy_alarm_1_with_timeout: {
        cluster: string;
        type: string;
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    command_store: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_recall: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_panic: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_arm: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    command_cover_stop: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_cover_open: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_cover_close: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_on: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_off: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_off_with_effect: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_toggle: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_move_to_level: {
        cluster: string;
        type: string[];
        options: exposes.Composite[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    command_move: {
        cluster: string;
        type: string[];
        options: exposes.Composite[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_rate: any;
        };
    };
    command_step: {
        cluster: string;
        type: string[];
        options: exposes.Composite[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    command_stop: {
        cluster: string;
        type: string[];
        options: exposes.Composite[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_move_color_temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_rate: any;
            action_minimum: any;
            action_maximum: any;
        };
    };
    command_step_color_temperature: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    command_ehanced_move_to_hue_and_saturation: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_enhanced_hue: any;
            action_hue: number;
            action_saturation: any;
            action_transition_time: any;
        };
    };
    command_move_to_hue_and_saturation: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_hue: any;
            action_saturation: any;
            action_transition_time: any;
        };
    };
    command_step_hue: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_step_size: any;
            action_transition_time: number;
        };
    };
    command_step_saturation: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_step_size: any;
            action_transition_time: number;
        };
    };
    command_color_loop_set: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_update_flags: {
                action: boolean;
                direction: boolean;
                time: boolean;
                start_hue: boolean;
            };
            action_action: any;
            action_direction: string;
            action_time: any;
            action_start_hue: any;
        };
    };
    command_move_to_color_temp: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_color_temperature: any;
            action_transition_time: any;
        };
    };
    command_move_to_color: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_color: {
                x: number;
                y: number;
            };
            action_transition_time: any;
        };
    };
    command_move_hue: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_rate: any;
        };
    };
    command_move_to_saturation: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_saturation: any;
            action_transition_time: any;
        };
    };
    command_move_to_hue: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_hue: any;
            action_transition_time: number;
            action_direction: string;
        };
    };
    command_emergency: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    command_on_state: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    command_off_state: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    identify: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    cover_position_tilt: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    cover_position_via_brightness: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
            position: number;
        };
    };
    cover_state_via_onoff: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
        };
    };
    curtain_position_analog_output: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            position: number;
        };
    };
    lighting_ballast_configuration: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    checkin_presence: {
        cluster: string;
        type: string[];
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            presence: boolean;
        };
    };
    ias_enroll: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            enrolled: boolean;
            ias_cie_address: any;
            zone_id: any;
        };
    };
    ias_wd: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    power_source: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    namron_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    namron_hvac_user_interface: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    elko_thermostat: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    ias_smoke_alarm_1_develco: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            smoke: boolean;
            battery_low: boolean;
            supervision_reports: boolean;
            restore_reports: boolean;
            test: boolean;
        };
    };
    ts0201_temperature_humidity_alarm: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    tuya_led_controller: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    wiser_device_info: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    tuya_doorbell_button: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    terncy_knob: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_direction: string;
            action_number: number;
        };
    };
    DTB190502A1: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            cpu_temperature: number;
            key_state: any;
            led_state: any;
        };
    };
    ZigUP: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: any;
            state: string;
            cpu_temperature: number;
            external_temperature: number;
            external_humidity: number;
            s0_counts: any;
            adc_volt: number;
            dig_input: any;
            reason: any;
        };
    };
    terncy_contact: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    terncy_temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            temperature: number;
        };
    };
    ts0216_siren: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    tuya_cover_options_2: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    tuya_cover_options: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    WSZ01_on_off_action: {
        cluster: number;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    tuya_switch_scene: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_scene: any;
        };
    };
    livolo_switch_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state_left: string;
            state_right: string;
        };
    };
    livolo_socket_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
        };
    };
    livolo_new_switch_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
        };
    };
    livolo_new_switch_state_2gang: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state_left: string;
            state_right: string;
        };
    };
    livolo_new_switch_state_4gang: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state_left: string;
            state_right: string;
            state_bottom_left: string;
            state_bottom_right: string;
        };
    };
    livolo_curtain_switch_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state_left: string;
            state_right: string;
        };
    };
    livolo_dimmer_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
            brightness?: undefined;
            brightness_percent?: undefined;
            level?: undefined;
        } | {
            brightness: number;
            brightness_percent: number;
            level: number;
            state?: undefined;
        };
    };
    livolo_cover_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            position: number;
            state: string;
            moving: boolean;
            motor_direction: string;
            motor_speed: number;
        } | {
            motor_speed: any;
            motor_direction: string;
        };
    };
    livolo_hygrometer_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            temperature: number;
            humidity?: undefined;
        } | {
            humidity: number;
            temperature?: undefined;
        };
    };
    livolo_illuminance_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            illuminance: number;
            noise_detected?: undefined;
            noise_level?: undefined;
        } | {
            noise_detected: boolean;
            noise_level: any;
            illuminance?: undefined;
        };
    };
    livolo_pir_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    easycode_action: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    easycodetouch_action: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    livolo_switch_state_raw: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state_left: string;
            state_right: string;
        };
    };
    ptvo_switch_uart: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    ptvo_switch_analog_input: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    keypad20states: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: boolean;
        };
    };
    keypad20_battery: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            battery: number;
            voltage: number;
        };
    };
    plaid_battery: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    heiman_ir_remote: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    meazon_meter: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_thermostat: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_thermostat_setpoint_scheduled: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_icon_floor_sensor: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_icon_battery: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_icon_regulator: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    danfoss_icon_hvac_user_interface: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    orvibo_raw_1: {
        cluster: number;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    orvibo_raw_2: {
        cluster: number;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    tint_scene: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    tint404011_move_to_color_temp: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_color_temperature: any;
            action_transition_time: any;
            action_color_temperature_direction: string;
        };
    };
    restorable_brightness: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            brightness: any;
        } | {
            brightness?: undefined;
        };
    };
    ewelink_action: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    diyruz_contact: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    diyruz_rspm: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
            cpu_temperature: number;
            power: number;
            current: number;
            action: string;
        };
    };
    K4003C_binary_input: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    enocean_ptm215z: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    enocean_ptm215ze: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    enocean_ptm216z: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    _8840100H_water_leak_alarm: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            water_leak: boolean;
        };
    };
    diyruz_freepad_clicks: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    kmpcil_res005_occupancy: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    kmpcil_res005_on_off: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
        };
    };
    _3310_humidity: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            humidity: number;
        };
    };
    smartthings_acceleration: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    byun_smoke_false: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            smoke: boolean;
        };
    };
    byun_smoke_true: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            smoke: boolean;
        };
    };
    byun_gas_false: {
        cluster: number;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gas: boolean;
        };
    };
    byun_gas_true: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gas: boolean;
        };
    };
    hue_smart_button_event: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    legrand_binary_input_moving: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    legrand_binary_input_on_off: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    bticino_4027C_binary_input_moving: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            position: number;
        } | {
            action: string;
            position?: undefined;
        };
    };
    legrand_scenes: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    legrand_master_switch_center: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    legrand_pilot_wire_mode: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    legrand_power_alarm: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    legrand_greenpower: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    W2_module_carbon_monoxide: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            carbon_monoxide: boolean;
        };
    };
    command_status_change_notification_action: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    ptvo_multistate_action: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    konke_action: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    qlwz_letv8key_switch: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    keen_home_smart_vent_pressure: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            pressure: any;
        };
    };
    U02I007C01_contact: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    U02I007C01_water_leak: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            water_leak: boolean;
        };
    };
    heiman_hcho: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            hcho: number;
        };
    };
    heiman_air_quality: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    scenes_recall_scene_65024: {
        cluster: number;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    adeo_button_65024: {
        cluster: number;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    color_stop_raw: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    almond_click: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    SAGE206612_state: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    ZMCSW032D_cover_position: {
        cluster: string;
        type: string[];
        options: (exposes.Numeric | exposes.Binary)[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    PGC410EU_presence: {
        cluster: string;
        type: string;
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            presence: boolean;
        };
    };
    STS_PRS_251_presence: {
        cluster: string;
        type: string[];
        options: exposes.Numeric[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            presence: boolean;
        };
    };
    heiman_scenes: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    javis_lock_report: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_user: number;
            action_source: number;
            action_source_name: any;
        };
    };
    diyruz_freepad_config: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    diyruz_geiger: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            radioactive_events_per_minute: any;
            radiation_dose_per_hour: any;
        };
    };
    diyruz_geiger_config: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    diyruz_airsense_config_co2: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    diyruz_airsense_config_temp: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    diyruz_airsense_config_pres: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    diyruz_airsense_config_hum: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    diyruz_zintercom_config: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    CC2530ROUTER_led: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            led: boolean;
        };
    };
    CC2530ROUTER_meta: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            description: any;
            type: any;
            rssi: any;
        };
    };
    KAMI_contact: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    KAMI_occupancy: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    DNCKAT_S00X_buttons: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    hue_motion_sensitivity: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            motion_sensitivity: any;
        };
    };
    hue_motion_led_indication: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            led_indication: boolean;
        };
    };
    hue_wall_switch_device_mode: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            device_mode: string;
        };
    };
    CCTSwitch_D0001_levelctrl: {
        cluster: string;
        options: exposes.Binary[];
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    CCTSwitch_D0001_lighting: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    hue_wall_switch: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    hue_dimmer_switch: {
        cluster: string;
        type: string;
        options: exposes.Composite[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    hue_tap: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    hue_twilight: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    tuya_relay_din_led_indicator: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    ias_keypad: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            tamper: boolean;
            battery_low: boolean;
            restore_reports: boolean;
        };
    };
    itcmdr_clicks: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    ZB003X_attr: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            sensitivity: any;
            keep_time?: undefined;
        } | {
            keep_time: any;
            sensitivity?: undefined;
        };
    };
    ZB003X_occupancy: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            tamper: boolean;
        };
    };
    idlock: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    idlock_fw: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    schneider_pilot_mode: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    schneider_ui_action: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    schneider_temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: number;
        };
    };
    wiser_smart_thermostat_client: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: KeyValueAny) => Promise<void>;
    };
    wiser_smart_setpoint_command_client: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    rc_110_level_to_scene: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    heiman_doorbell_button: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
            tamper: boolean;
            battery_low: boolean;
        };
    };
    sihas_people_cnt: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            people: number;
            status: any;
        };
    };
    sihas_action: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    tuya_operation_mode: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            operation_mode: any;
        };
    };
    sunricher_switch2801K2: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    sunricher_switch2801K4: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    command_stop_move_raw: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    tuya_multi_action: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    led_on_motion: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    hw_version: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    SNZB02_temperature: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: number;
        };
    };
    SNZB02_humidity: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            humidity: number;
        };
    };
    awox_colors: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_group: number;
        };
    };
    awox_refreshColored: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_group: number;
        };
    };
    awox_refresh: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            action_group: number;
        };
    };
    ignore_onoff_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_basic_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_illuminance_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_occupancy_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_temperature_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_humidity_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_pressure_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_analog_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_multistate_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_power_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_light_brightness_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_light_color_colortemp_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_closuresWindowCovering_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_thermostat_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_iaszone_attreport: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_iaszone_statuschange: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_iaszone_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_iasace_commandgetpanelstatus: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_genIdentify: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_command_on: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_command_off: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_command_off_with_effect: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_command_step: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_command_stop: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_poll_ctrl: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_genLevelCtrl_report: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_genOta: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_haDiagnostic: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_zclversion_read: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_time_read: {
        cluster: string;
        type: string;
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_tuya_set_time: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_tuya_raw: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_metering: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    ignore_electrical_measurement: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
};
export default converters;
//# sourceMappingURL=fromZigbee.d.ts.map