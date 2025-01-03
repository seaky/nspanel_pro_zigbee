import { ClusterDefinition } from 'zigbee-herdsman/dist/zspec/zcl/definition/tstype';
import { Access, BatteryLinearVoltage, BatteryNonLinearVoltage, Configure, DefinitionOta, Fz, KeyValue, ModernExtend, Range, Tz, Zh } from './types';
export declare const TIME_LOOKUP: {
    MAX: number;
    '4_HOURS': number;
    '1_HOUR': number;
    '30_MINUTES': number;
    '5_MINUTES': number;
    '2_MINUTES': number;
    '1_MINUTE': number;
    '10_SECONDS': number;
    '5_SECONDS': number;
    '1_SECOND': number;
    MIN: number;
};
type ReportingConfigTime = number | keyof typeof TIME_LOOKUP;
type ReportingConfigAttribute = string | number | {
    ID: number;
    type: number;
};
type ReportingConfig = {
    min: ReportingConfigTime;
    max: ReportingConfigTime;
    change: number;
    attribute: ReportingConfigAttribute;
};
export type ReportingConfigWithoutAttribute = Omit<ReportingConfig, 'attribute'>;
export declare function setupAttributes(entity: Zh.Device | Zh.Endpoint, coordinatorEndpoint: Zh.Endpoint, cluster: string | number, config: ReportingConfig[], configureReporting?: boolean, read?: boolean): Promise<void>;
export declare function setupConfigureForReporting(cluster: string | number, attribute: ReportingConfigAttribute, config: ReportingConfigWithoutAttribute, access: Access, endpointNames?: string[]): Configure;
export declare function setupConfigureForBinding(cluster: string | number, clusterType: 'input' | 'output', endpointNames?: string[]): Configure;
export declare function setupConfigureForReading(cluster: string | number, attributes: (string | number)[], endpointNames?: string[]): Configure;
export declare function determineEndpoint(entity: Zh.Endpoint | Zh.Group, meta: Tz.Meta, cluster: string | number): Zh.Endpoint | Zh.Group;
export declare function forceDeviceType(args: {
    type: 'EndDevice' | 'Router';
}): ModernExtend;
export declare function forcePowerSource(args: {
    powerSource: 'Mains (single phase)' | 'Battery';
}): ModernExtend;
export interface LinkQualityArgs {
    reporting?: boolean;
    attribute?: string | {
        ID: number;
        type: number;
    };
    reportingConfig?: ReportingConfigWithoutAttribute;
}
export declare function linkQuality(args?: LinkQualityArgs): ModernExtend;
export interface BatteryArgs {
    voltageToPercentage?: BatteryNonLinearVoltage | BatteryLinearVoltage;
    dontDividePercentage?: boolean;
    percentage?: boolean;
    voltage?: boolean;
    lowStatus?: boolean;
    percentageReportingConfig?: ReportingConfigWithoutAttribute;
    percentageReporting?: boolean;
    voltageReportingConfig?: ReportingConfigWithoutAttribute;
    voltageReporting?: boolean;
}
export declare function battery(args?: BatteryArgs): ModernExtend;
export declare function deviceTemperature(args?: Partial<NumericArgs>): ModernExtend;
export declare function identify(args?: {
    isSleepy: boolean;
}): ModernExtend;
export interface OnOffArgs {
    powerOnBehavior?: boolean;
    ota?: DefinitionOta;
    skipDuplicateTransaction?: boolean;
    endpointNames?: string[];
    configureReporting?: boolean;
    description?: string;
}
export declare function onOff(args?: OnOffArgs): ModernExtend;
export interface CommandsOnOffArgs {
    commands?: ('on' | 'off' | 'toggle')[];
    bind?: boolean;
    endpointNames?: string[];
    legacyAction?: boolean;
}
export declare function commandsOnOff(args?: CommandsOnOffArgs): ModernExtend;
export declare function customTimeResponse(start: '1970_UTC' | '2000_LOCAL'): ModernExtend;
export declare function illuminance(args?: Partial<NumericArgs>): ModernExtend;
export declare function temperature(args?: Partial<NumericArgs>): ModernExtend;
export declare function pressure(args?: Partial<NumericArgs>): ModernExtend;
export declare function flow(args?: Partial<NumericArgs>): ModernExtend;
export declare function humidity(args?: Partial<NumericArgs>): ModernExtend;
export declare function soilMoisture(args?: Partial<NumericArgs>): ModernExtend;
export interface OccupancyArgs {
    pirConfig?: ('otu_delay' | 'uto_delay' | 'uto_threshold')[];
    ultrasonicConfig?: ('otu_delay' | 'uto_delay' | 'uto_threshold')[];
    contactConfig?: ('otu_delay' | 'uto_delay' | 'uto_threshold')[];
    reporting?: boolean;
    reportingConfig?: ReportingConfigWithoutAttribute;
    endpointNames?: string[];
}
export declare function occupancy(args?: OccupancyArgs): ModernExtend;
export declare function co2(args?: Partial<NumericArgs>): ModernExtend;
export declare function pm25(args?: Partial<NumericArgs>): ModernExtend;
export interface LightArgs {
    effect?: boolean;
    powerOnBehavior?: boolean;
    colorTemp?: {
        startup?: boolean;
        range: Range;
    };
    color?: boolean | {
        modes?: ('xy' | 'hs')[];
        applyRedFix?: boolean;
        enhancedHue?: boolean;
    };
    turnsOffAtBrightness1?: boolean;
    configureReporting?: boolean;
    endpointNames?: string[];
    ota?: DefinitionOta;
    levelConfig?: {
        disabledFeatures?: string[];
    };
}
export declare function light(args?: LightArgs): ModernExtend;
export interface CommandsLevelCtrl {
    commands?: ('brightness_move_to_level' | 'brightness_move_up' | 'brightness_move_down' | 'brightness_step_up' | 'brightness_step_down' | 'brightness_stop')[];
    bind?: boolean;
    endpointNames?: string[];
    legacyAction?: boolean;
}
export declare function commandsLevelCtrl(args?: CommandsLevelCtrl): ModernExtend;
export type ColorCtrlCommand = 'color_temperature_move_stop' | 'color_temperature_move_up' | 'color_temperature_move_down' | 'color_temperature_step_up' | 'color_temperature_step_down' | 'enhanced_move_to_hue_and_saturation' | 'move_to_hue_and_saturation' | 'color_hue_step_up' | 'color_hue_step_down' | 'color_saturation_step_up' | 'color_saturation_step_down' | 'color_loop_set' | 'color_temperature_move' | 'color_move' | 'hue_move' | 'hue_stop' | 'move_to_saturation' | 'move_to_hue';
export interface CommandsColorCtrl {
    commands?: ColorCtrlCommand[];
    bind?: boolean;
    endpointNames?: string[];
}
export declare function commandsColorCtrl(args?: CommandsColorCtrl): ModernExtend;
export declare function lightingBallast(): ModernExtend;
export interface LockArgs {
    pinCodeCount: number;
    endpointNames?: string[];
}
export declare function lock(args?: LockArgs): ModernExtend;
export interface WindowCoveringArgs {
    controls: ('lift' | 'tilt')[];
    coverInverted?: boolean;
    stateSource?: 'lift' | 'tilt';
    configureReporting?: boolean;
    coverMode?: boolean;
    endpointNames?: string[];
}
export declare function windowCovering(args: WindowCoveringArgs): ModernExtend;
export interface CommandsWindowCoveringArgs {
    commands?: ('open' | 'close' | 'stop')[];
    bind?: boolean;
    endpointNames?: string[];
    legacyAction: boolean;
}
export declare function commandsWindowCovering(args?: CommandsWindowCoveringArgs): ModernExtend;
export type iasZoneType = 'occupancy' | 'contact' | 'smoke' | 'water_leak' | 'rain' | 'carbon_monoxide' | 'sos' | 'vibration' | 'alarm' | 'gas' | 'generic';
export type iasZoneAttribute = 'alarm_1' | 'alarm_2' | 'tamper' | 'battery_low' | 'supervision_reports' | 'restore_reports' | 'ac_status' | 'test' | 'trouble' | 'battery_defect';
export interface IasArgs {
    zoneType: iasZoneType;
    zoneAttributes: iasZoneAttribute[];
    alarmTimeout?: boolean;
    zoneStatusReporting?: boolean;
    description?: string;
}
export declare function iasZoneAlarm(args: IasArgs): ModernExtend;
export interface IasWarningArgs {
    reversePayload?: boolean;
}
export declare function iasWarning(args?: IasWarningArgs): ModernExtend;
type MultiplierDivisor = {
    multiplier?: number;
    divisor?: number;
};
export interface ElectricityMeterArgs {
    cluster?: 'both' | 'metering' | 'electrical';
    electricalMeasurementType?: 'both' | 'ac' | 'dc';
    current?: false | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    power?: false | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    voltage?: false | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    energy?: false | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    producedEnergy?: false | true | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    acFrequency?: false | true | (MultiplierDivisor & Partial<ReportingConfigWithoutAttribute>);
    threePhase?: boolean;
    configureReporting?: boolean;
    powerFactor?: boolean;
    endpointNames?: string[];
    fzMetering?: Fz.Converter;
    fzElectricalMeasurement?: Fz.Converter;
}
export declare function electricityMeter(args?: ElectricityMeterArgs): ModernExtend;
export declare function ota(definition?: DefinitionOta): ModernExtend;
export interface CommandsScenesArgs {
    commands?: string[];
    bind?: boolean;
    endpointNames?: string[];
}
export declare function commandsScenes(args?: CommandsScenesArgs): ModernExtend;
export interface EnumLookupArgs {
    name: string;
    lookup: KeyValue;
    cluster: string | number;
    attribute: string | {
        ID: number;
        type: number;
    };
    description: string;
    zigbeeCommandOptions?: {
        manufacturerCode?: number;
        disableDefaultResponse?: boolean;
    };
    access?: 'STATE' | 'STATE_GET' | 'STATE_SET' | 'SET' | 'ALL';
    endpointName?: string;
    reporting?: ReportingConfigWithoutAttribute;
    entityCategory?: 'config' | 'diagnostic';
}
export declare function enumLookup(args: EnumLookupArgs): ModernExtend;
export type ScaleFunction = (value: number, type: 'from' | 'to') => number;
export interface NumericArgs {
    name: string;
    cluster: string | number;
    attribute: string | {
        ID: number;
        type: number;
    };
    description: string;
    zigbeeCommandOptions?: {
        manufacturerCode?: number;
        disableDefaultResponse?: boolean;
    };
    access?: 'STATE' | 'STATE_GET' | 'STATE_SET' | 'SET' | 'ALL';
    unit?: string;
    endpointNames?: string[];
    reporting?: ReportingConfigWithoutAttribute;
    valueMin?: number;
    valueMax?: number;
    valueStep?: number;
    valueIgnore?: number[];
    scale?: number | ScaleFunction;
    label?: string;
    entityCategory?: 'config' | 'diagnostic';
    precision?: number;
}
export declare function numeric(args: NumericArgs): ModernExtend;
export interface BinaryArgs {
    name: string;
    valueOn: [string | boolean, unknown];
    valueOff: [string | boolean, unknown];
    cluster: string | number;
    attribute: string | {
        ID: number;
        type: number;
    };
    description: string;
    zigbeeCommandOptions?: {
        manufacturerCode: number;
    };
    endpointName?: string;
    reporting?: ReportingConfig;
    access?: 'STATE' | 'STATE_GET' | 'STATE_SET' | 'SET' | 'ALL';
    entityCategory?: 'config' | 'diagnostic';
}
export declare function binary(args: BinaryArgs): ModernExtend;
export type Parse = (msg: Fz.Message, attributeKey: string | number) => unknown;
export interface ActionEnumLookupArgs {
    actionLookup: KeyValue;
    cluster: string | number;
    attribute: string | {
        ID: number;
        type: number;
    };
    endpointNames?: string[];
    buttonLookup?: KeyValue;
    extraActions?: string[];
    commands?: string[];
    parse?: Parse;
}
export declare function actionEnumLookup(args: ActionEnumLookupArgs): ModernExtend;
export interface QuirkAddEndpointClusterArgs {
    endpointID: number;
    inputClusters?: string[] | number[];
    outputClusters?: string[] | number[];
}
export declare function quirkAddEndpointCluster(args: QuirkAddEndpointClusterArgs): ModernExtend;
export declare function quirkCheckinInterval(timeout: number | keyof typeof TIME_LOOKUP): ModernExtend;
export declare function reconfigureReportingsOnDeviceAnnounce(): ModernExtend;
export declare function deviceEndpoints(args: {
    endpoints: {
        [n: string]: number;
    };
    multiEndpointSkip?: string[];
}): ModernExtend;
export declare function deviceAddCustomCluster(clusterName: string, clusterDefinition: ClusterDefinition): ModernExtend;
export declare function ignoreClusterReport(args: {
    cluster: string | number;
}): ModernExtend;
export declare function bindCluster(args: {
    cluster: string | number;
    clusterType: 'input' | 'output';
    endpointNames?: string[];
}): ModernExtend;
export {};
//# sourceMappingURL=modernExtend.d.ts.map