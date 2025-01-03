import { Light, Numeric } from './exposes';
import { BatteryLinearVoltage, BatteryNonLinearVoltage, Configure, Definition, Expose, Fz, KeyValue, KeyValueAny, OnEventData, OnEventType, Publish, Tz, Zh } from './types';
export declare function isLegacyEnabled(options: KeyValue): unknown;
export declare function flatten<Type>(arr: Type[][]): Type[];
export declare function onEventPoll(type: OnEventType, data: OnEventData, device: Zh.Device, options: KeyValue, key: string, defaultIntervalSeconds: number, poll: () => Promise<void>): void;
export declare function precisionRound(number: number, precision: number): number;
export declare function toLocalISOString(dDate: Date): string;
export declare function numberWithinRange(number: number, min: number, max: number): number;
/**
 * Maps number from one range to another. In other words it performs a linear interpolation.
 * Note that this function can interpolate values outside source range (linear extrapolation).
 * @param value - value to map
 * @param fromLow - source range lower value
 * @param fromHigh - source range upper value
 * @param toLow - target range lower value
 * @param toHigh - target range upper value
 * @param number - of decimal places to which result should be rounded
 * @returns value mapped to new range
 */
export declare function mapNumberRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number, precision?: number): number;
export declare function hasAlreadyProcessedMessage(msg: Fz.Message, model: Definition, ID?: number, key?: string): boolean;
export declare const calibrateAndPrecisionRoundOptionsDefaultPrecision: KeyValue;
export declare function calibrateAndPrecisionRoundOptionsIsPercentual(type: string): boolean;
export declare function calibrateAndPrecisionRoundOptions(number: number, options: KeyValue, type: string): number;
export declare function toPercentage(value: number, min: number, max: number): number;
export declare function addActionGroup(payload: KeyValue, msg: Fz.Message, definition: Definition): void;
export declare function getEndpointName(msg: Fz.Message, definition: Definition, meta: Fz.Meta): string | number;
export declare function postfixWithEndpointName(value: string, msg: Fz.Message, definition: Definition, meta: Fz.Meta): string;
export declare function exposeEndpoints<T extends Expose>(expose: T, endpointNames?: string[]): T[];
export declare function enforceEndpoint(entity: Zh.Endpoint, key: string, meta: Tz.Meta): import("zigbee-herdsman/dist/controller/model").Endpoint;
export declare function getKey<T>(object: {
    [s: string]: T;
} | {
    [s: number]: T;
}, value: T, fallback?: T, convertTo?: (v: unknown) => T): string | T;
export declare function batteryVoltageToPercentage(voltage: number, option: BatteryNonLinearVoltage | BatteryLinearVoltage): number;
export declare function getMetaValue<T>(entity: Zh.Group | Zh.Endpoint, definition: Definition | Definition[], key: string, groupStrategy?: 'allEqual' | 'first' | {
    atLeastOnce: T;
}, defaultValue?: T): T;
export declare function hasEndpoints(device: Zh.Device, endpoints: number[]): boolean;
export declare function isInRange(min: number, max: number, value: number): boolean;
export declare function replaceToZigbeeConvertersInArray(arr: Tz.Converter[], oldElements: Tz.Converter[], newElements: Tz.Converter[], errorIfNotInArray?: boolean): Tz.Converter[];
export declare function filterObject(obj: KeyValue, keys: string[]): KeyValue;
export declare function sleep(ms: number): Promise<unknown>;
export declare function toSnakeCase(value: string | KeyValueAny): string | KeyValueAny;
export declare function toCamelCase(value: KeyValueAny | string): string | KeyValueAny;
export declare function getLabelFromName(name: string): string;
export declare function saveSceneState(entity: Zh.Endpoint, sceneID: number, groupID: number, state: KeyValue, name: string): void;
export declare function deleteSceneState(entity: Zh.Endpoint, sceneID?: number, groupID?: number): void;
export declare function getSceneState(entity: Zh.Group | Zh.Endpoint, sceneID: number, groupID: number): any;
export declare function getEntityOrFirstGroupMember(entity: Zh.Group | Zh.Endpoint): import("zigbee-herdsman/dist/controller/model").Endpoint;
export declare function getTransition(entity: Zh.Endpoint | Zh.Group, key: string, meta: Tz.Meta): {
    time: number;
    specified: boolean;
};
export declare function getOptions(definition: Definition | Definition[], entity: Zh.Endpoint | Zh.Group, options?: {}): KeyValue;
export declare function getMetaValues(definitions: Definition | Definition[], entity: Zh.Endpoint | Zh.Group, allowed?: string[], options?: {}): KeyValue;
export declare function getObjectProperty(object: KeyValue, key: string, defaultValue: unknown): unknown;
export declare function validateValue(value: unknown, allowed: unknown[]): void;
export declare function getClusterAttributeValue<T>(endpoint: Zh.Endpoint, cluster: string, attribute: string, fallback?: T): Promise<T>;
export declare function normalizeCelsiusVersionOfFahrenheit(value: number): number;
export declare function noOccupancySince(endpoint: Zh.Endpoint, options: KeyValueAny, publish: Publish, action: 'start' | 'stop'): void;
export declare function attachOutputCluster(device: Zh.Device, clusterKey: string): void;
export declare function printNumberAsHex(value: number, hexLength: number): string;
export declare function printNumbersAsHexSequence(numbers: number[], hexLength: number): string;
export declare function assertObject(value: unknown, property?: string): asserts value is {
    [s: string]: any;
};
export declare function assertArray(value: unknown, property?: string): asserts value is Array<unknown>;
export declare function assertString(value: unknown, property?: string): asserts value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isObject(value: unknown): value is {
    [s: string]: any;
};
export declare function isString(value: unknown): value is string;
export declare function isBoolean(value: unknown): value is boolean;
export declare function assertNumber(value: unknown, property?: string): asserts value is number;
export declare function toNumber(value: unknown, property?: string): number;
export declare function getFromLookup<V>(value: unknown, lookup: {
    [s: number | string]: V;
}, defaultValue?: V, keyIsBool?: boolean): V;
export declare function getFromLookupByValue(value: unknown, lookup: {
    [s: string]: unknown;
}, defaultValue?: string): string;
export declare function configureSetPowerSourceWhenUnknown(powerSource: 'Battery' | 'Mains (single phase)'): Configure;
export declare function assertEndpoint(obj: unknown): asserts obj is Zh.Endpoint;
export declare function assertGroup(obj: unknown): asserts obj is Zh.Group;
export declare function isEndpoint(obj: Zh.Endpoint | Zh.Group | Zh.Device): obj is Zh.Endpoint;
export declare function isDevice(obj: Zh.Endpoint | Zh.Group | Zh.Device): obj is Zh.Device;
export declare function isGroup(obj: Zh.Endpoint | Zh.Group | Zh.Device): obj is Zh.Group;
export declare function isNumericExpose(expose: Expose): expose is Numeric;
export declare function isLightExpose(expose: Expose): expose is Light;
export declare function splitArrayIntoChunks<T>(arr: T[], chunkSize: number): T[][];
//# sourceMappingURL=utils.d.ts.map