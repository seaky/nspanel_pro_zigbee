import { Buffer } from 'node:buffer';
import * as exposes from './exposes';
import * as modernExtend from './modernExtend';
import { BatteryLinearVoltage, BatteryNonLinearVoltage, Definition, Fz, KeyValue, KeyValueAny, ModernExtend, Tz } from './types';
declare type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export interface TrvScheduleConfigEvent {
    time: number;
    temperature: number;
}
export interface TrvScheduleConfig {
    days: Day[];
    events: TrvScheduleConfigEvent[];
}
export declare const buffer2DataObject: (model: Definition, buffer: Buffer) => KeyValue;
export declare const numericAttributes2Payload: (msg: Fz.Message, meta: Fz.Meta, model: Definition, options: KeyValue, dataObject: KeyValue) => Promise<KeyValue>;
type LumiPresenceRegionZone = {
    x: number;
    y: number;
};
export declare const presence: {
    constants: {
        region_event_key: number;
        region_event_types: {
            Enter: number;
            Leave: number;
            Occupied: number;
            Unoccupied: number;
        };
        region_config_write_attribute: number;
        region_config_write_attribute_type: number;
        region_config_cmds: {
            /**
             * Creates new region (or force replaces existing one)
             * with new zones definition.
             */
            create: number;
            /**
             * Modifies existing region.
             * Note: unused, as it seems to break existing regions
             * (region stops reporting new detection events).
             * Use "create" instead, as it replaces existing region with new one.
             */
            modify: number;
            /**
             * Deletes existing region.
             */
            delete: number;
        };
        region_config_regionId_min: number;
        region_config_regionId_max: number;
        region_config_zoneY_min: number;
        region_config_zoneY_max: number;
        region_config_zoneX_min: number;
        region_config_zoneX_max: number;
        region_config_cmd_suffix_upsert: number;
        region_config_cmd_suffix_delete: number;
    };
    mappers: {
        lumi_presence: {
            region_event_type_names: {
                [x: number]: string;
            };
        };
    };
    encodeXCellsDefinition: (xCells?: number[]) => number;
    encodeXCellIdx: (cellXIdx: number) => number;
    parseAqaraFp1RegionDeleteInput: (input: KeyValueAny) => {
        isSuccess: false;
        error: {
            reason: string;
        };
    } | {
        isSuccess: boolean;
        payload: {
            command: {
                region_id: number;
            };
        };
    };
    parseAqaraFp1RegionUpsertInput: (input: KeyValueAny) => {
        isSuccess: false;
        error: {
            reason: string;
        };
    } | {
        isSuccess: boolean;
        payload: {
            command: {
                region_id: number;
                zones: LumiPresenceRegionZone[];
            };
        };
    };
    isAqaraFp1RegionId: (value: any) => value is number;
    isAqaraFp1RegionZoneDefinition: (value: any) => value is LumiPresenceRegionZone;
    failure: (error: {
        reason: string;
    }) => {
        isSuccess: false;
        error: {
            reason: string;
        };
    };
};
export declare const trv: {
    decodeFirmwareVersionString(value: number): string;
    decodePreset(value: number): {
        setup: boolean;
        preset: string;
    };
    decodeHeartbeat(meta: Fz.Meta, model: Definition, messageBuffer: Buffer): KeyValue;
    /**
     * Decode a Zigbee schedule configuration message into a schedule configuration object.
     */
    decodeSchedule(buffer: Buffer): TrvScheduleConfig;
    validateSchedule(schedule: TrvScheduleConfig): void;
    /**
     * Encodes a schedule object into Zigbee message format.
     */
    encodeSchedule(schedule: TrvScheduleConfig): Buffer;
    stringifySchedule(schedule: TrvScheduleConfig): string;
    parseSchedule(stringifiedSchedule: string): TrvScheduleConfig;
};
export declare const manufacturerCode = 4447;
export declare const lumiModernExtend: {
    lumiLight: (args?: Omit<modernExtend.LightArgs, "colorTemp"> & {
        colorTemp?: true;
        powerOutageMemory?: "switch" | "light" | "enum";
        deviceTemperature?: boolean;
        powerOutageCount?: boolean;
    }) => ModernExtend;
    lumiOnOff: (args?: modernExtend.OnOffArgs & {
        operationMode?: boolean;
        powerOutageMemory?: "binary" | "enum";
        lockRelay?: boolean;
    }) => ModernExtend;
    lumiSwitchType: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiMotorSpeed: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiCurtainSpeed: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiCurtainManualOpenClose: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiCurtainAdaptivePullingSpeed: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiCurtainManualStop: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiCurtainReverse: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiCurtainStatus: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiCurtainLastManualOperation: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiCurtainPosition: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiCurtainTraverseTime: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiCurtainCalibrationStatus: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiCurtainCalibrated: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiCurtainIdentifyBeep: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiPowerOnBehavior: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiPowerOutageMemory: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiOperationMode: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiAction: (args?: Partial<modernExtend.ActionEnumLookupArgs>) => ModernExtend;
    lumiVoc: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiAirQuality: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiDisplayUnit: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiOutageCountRestoreBindReporting: () => ModernExtend;
    lumiZigbeeOTA: () => ModernExtend;
    lumiPower: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiElectricityMeter: () => ModernExtend;
    lumiOverloadProtection: (args?: Partial<modernExtend.NumericArgs>) => ModernExtend;
    lumiLedIndicator: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiLedDisabledNight: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiButtonLock: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiFlipIndicatorLight: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiPreventReset: () => ModernExtend;
    lumiClickMode: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiSlider: () => ModernExtend;
    lumiLockRelay: (args?: Partial<modernExtend.BinaryArgs>) => ModernExtend;
    lumiSetEventMode: () => ModernExtend;
    lumiSwitchMode: (args?: Partial<modernExtend.EnumLookupArgs>) => ModernExtend;
    lumiVibration: () => ModernExtend;
    lumiMiscellaneous: (args?: {
        cluster: "genBasic" | "manuSpecificLumi";
        deviceTemperatureAttribute?: number;
        powerOutageCountAttribute?: number;
        resetsWhenPairing?: boolean;
    }) => ModernExtend;
    lumiKnobRotation: () => ModernExtend;
    lumiCommandMode: (args?: {
        setEventMode: boolean;
    }) => ModernExtend;
    lumiBattery: (args?: {
        cluster?: "genBasic" | "manuSpecificLumi";
        voltageToPercentage?: BatteryNonLinearVoltage | BatteryLinearVoltage;
        percentageAtrribute?: number;
        voltageAttribute?: number;
    }) => ModernExtend;
    fp1ePresence: () => ModernExtend;
    fp1eMovement: () => ModernExtend;
    fp1eTargetDistance: () => ModernExtend;
    fp1eDetectionRange: () => ModernExtend;
    fp1eSpatialLearning: () => {
        isModernExtend: true;
        exposes: exposes.Enum[];
        toZigbee: {
            key: string[];
            convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        }[];
    };
    fp1eRestartDevice: () => {
        isModernExtend: true;
        exposes: exposes.Enum[];
        toZigbee: {
            key: string[];
            convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        }[];
    };
};
export { lumiModernExtend as modernExtend };
export declare const fromZigbee: {
    lumi_basic: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValue>;
    };
    lumi_basic_raw: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<{}>;
    };
    lumi_specific: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<KeyValue>;
    };
    lumi_co2: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            co2: number;
        };
    };
    lumi_pm25: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            pm25: any;
        };
    };
    lumi_contact: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    lumi_power: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            power: any;
        };
    };
    lumi_action: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    lumi_action_multistate: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            side: number;
            action_from_side?: undefined;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        } | {
            action: string;
            action_from_side: number;
            action_to_side: number;
            action_side: number;
            from_side: number;
            to_side: number;
            side: number;
        } | {
            action: string;
            side: number;
            action_from_side: number;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        } | {
            action: any;
            side?: undefined;
            action_from_side?: undefined;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        };
    };
    lumi_action_analog: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_temperature: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            temperature: number;
        };
    };
    lumi_pressure: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => Promise<{
            pressure: number;
        }>;
    };
    lumi_feeder: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    lumi_trv: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    lumi_presence_region_events: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    lumi_lock_report: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            keyerror: boolean;
            inserted: any;
            forgotten?: undefined;
        } | {
            inserted: any;
            keyerror?: undefined;
            forgotten?: undefined;
        } | {
            forgotten: any;
            keyerror?: undefined;
            inserted?: undefined;
        };
    };
    lumi_occupancy_illuminance: {
        cluster: string;
        type: string[];
        options: (exposes.Numeric | exposes.List)[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
            illuminance: number;
        };
    };
    lumi_curtain_position: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            position: number;
            state: string;
        };
    };
    lumi_curtain_position_tilt: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_operation_mode_basic: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_bulb_interval: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            state: string;
            brightness: any;
            color_temp: any;
        };
    };
    lumi_on_off: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            [x: string]: string;
        };
    };
    lumi_curtain_status: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            motor_state: any;
            running: boolean;
        };
    };
    lumi_curtain_options: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            hand_open: boolean;
            reverse_direction?: undefined;
            limits_calibration?: undefined;
        } | {
            reverse_direction: boolean;
            hand_open?: undefined;
            limits_calibration?: undefined;
        } | {
            limits_calibration: string;
            hand_open?: undefined;
            reverse_direction?: undefined;
        };
    };
    lumi_vibration_analog: {
        cluster: string;
        type: string[];
        options: exposes.Numeric[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_illuminance: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_occupancy: {
        cluster: string;
        type: string[];
        options: (exposes.Numeric | exposes.List)[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            occupancy: boolean;
        };
    };
    lumi_smoke: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
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
    lumi_gas_density: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gas_density: any;
        };
    };
    lumi_gas_sensitivity: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            sensitivity: any;
        };
    };
    lumi_door_lock_low_battery: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            battery_low: boolean;
        };
    };
    lumi_door_lock_report: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    lumi_action_on: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    lumi_action_off: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    lumi_action_step: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    lumi_action_stop: {
        cluster: string;
        type: string;
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            duration: number;
            action_duration: number;
        };
    };
    lumi_action_move: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    lumi_action_step_color_temp: {
        cluster: string;
        type: string;
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
        };
    };
    lumi_action_move_color_temp: {
        cluster: string;
        type: string;
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            duration: number;
            action_duration: number;
        } | {
            action: string;
            duration?: undefined;
            action_duration?: undefined;
        };
    };
    lumi_action_WXKG01LM: {
        cluster: string;
        type: string[];
        options: exposes.Numeric[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValueAny, meta: Fz.Meta) => void;
    };
    lumi_smart_panel_ZNCJMB14LM: {
        cluster: string;
        type: string[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
};
export declare const toZigbee: {
    lumi_power: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_led_disabled_night: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                led_disabled_night: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_flip_indicator_light: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                flip_indicator_light: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_power_outage_count: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_feeder: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                [x: string]: unknown;
            };
        }>;
    };
    lumi_detection_distance: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                detection_distance: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_trv: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_presence_region_upsert: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_presence_region_delete: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_cube_operation_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_operation_mode_basic: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                operation_mode: any;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_operation_mode_opple: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_detection_interval: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                detection_interval: number;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_overload_protection: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                overload_protection: number;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_mode_switch: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                mode_switch: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_button_switch_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                button_switch_mode: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_socket_button_lock: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                button_lock: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_dimmer_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                dimmer_mode: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_do_not_disturb: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                do_not_disturb: unknown;
            };
        }>;
    };
    lumi_switch_type: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                switch_type: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_power_outage_memory: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                power_outage_memory: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_light_power_outage_memory: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                power_outage_memory: unknown;
            };
        }>;
    };
    lumi_auto_off: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                auto_off: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_detection_period: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                detection_period: number;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_motion_sensitivity: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                motion_sensitivity: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_presence: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_monitoring_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                monitoring_mode: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_approach_distance: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                approach_distance: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_reset_nopresence_status: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_click_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                click_mode: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_switch_lock_relay_opple: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                lock_relay: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_operation_mode_opple: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                operation_mode: string;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_vibration_sensitivity: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                sensitivity: unknown;
            };
        }>;
    };
    lumi_interlock: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                interlock: unknown;
            };
        }>;
    };
    lumi_curtain_options: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                options: {
                    reverse_direction: boolean;
                    hand_open: boolean;
                    reset_limits: boolean;
                };
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_position_state: {
        key: string[];
        options: exposes.Binary[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                position: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_battery_voltage: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_charging_status: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_battery: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_trigger_indicator: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                trigger_indicator: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_hooks_lock: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                [x: string]: unknown;
            };
        }>;
    };
    lumi_curtain_hooks_state: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_hand_open: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_reverse: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_limits_calibration: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_limits_calibration_ZNCLDJ14LM: {
        key: string[];
        options: exposes.Enum[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_curtain_automatic_calibration_ZNCLDJ01LM: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_buzzer: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_buzzer_manual: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_heartbeat_indicator: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                heartbeat_indicator: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_selftest: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    lumi_linkage_alarm: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                linkage_alarm: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_state: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_alarm: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_density: {
        key: string[];
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_sensitivity: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                sensitivity: unknown;
            };
        }>;
    };
    lumi_gas_sensitivity: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                gas_sensitivity: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    lumi_smart_panel_ZNCJMB14LM: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: KeyValue;
        }>;
    };
};
export declare const legacyFromZigbee: {
    WXKG01LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => void;
    };
    WXKG11LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: any;
        };
    };
    lumi_action_click_multistate: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => any;
    };
    WXKG12LM_action_click_multistate: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => any;
    };
    WXKG03LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: string;
        };
    };
    WXKG02LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: any;
        };
    };
    WXKG02LM_click_multistate: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: string;
        };
    };
    QBKG04LM_QBKG11LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: string;
        };
    };
    QBKG11LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: any;
        };
    };
    QBKG03LM_QBKG12LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: any;
        };
    };
    QBKG03LM_buttons: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    QBKG12LM_click: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            click: string;
        };
    };
    lumi_on_off_action: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: any;
        };
    };
    lumi_multistate_action: {
        cluster: string;
        type: string[];
        options: exposes.Binary[];
        convert: (model: Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            action: string;
            side: number;
            action_from_side?: undefined;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        } | {
            action: string;
            action_from_side: number;
            action_to_side: number;
            action_side: number;
            from_side: number;
            to_side: number;
            side: number;
        } | {
            action: string;
            side: number;
            action_from_side: number;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        } | {
            action: any;
            side?: undefined;
            action_from_side?: undefined;
            action_to_side?: undefined;
            action_side?: undefined;
            from_side?: undefined;
            to_side?: undefined;
        };
    };
};
//# sourceMappingURL=lumi.d.ts.map