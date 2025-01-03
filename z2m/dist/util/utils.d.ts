import type * as zhc from 'zigbee-herdsman-converters';
declare function capitalize(s: string): string;
declare function getZigbee2MQTTVersion(includeCommitHash?: boolean): Promise<{
    commitHash?: string;
    version: string;
}>;
declare function getDependencyVersion(depend: string): Promise<{
    version: string;
}>;
declare function formatDate(time: number, type: 'ISO_8601' | 'ISO_8601_local' | 'epoch' | 'relative'): string | number;
declare function objectIsEmpty(object: object): boolean;
declare function objectHasProperties(object: {
    [s: string]: unknown;
}, properties: string[]): boolean;
declare function equalsPartial(object: KeyValue, expected: KeyValue): boolean;
declare function getObjectProperty(object: KeyValue, key: string, defaultValue: unknown): unknown;
declare function getResponse(request: KeyValue | string, data: KeyValue, error?: string): MQTTResponse;
declare function parseJSON(value: string, fallback: string): KeyValue | string;
declare function loadModuleFromText(moduleCode: string, name?: string): unknown;
declare function loadModuleFromFile(modulePath: string): unknown;
export declare function loadExternalConverter(moduleName: string): Generator<ExternalDefinition>;
/**
 * Delete all keys from passed object that have null/undefined values.
 *
 * @param {KeyValue} obj Object to process (in-place)
 * @param {string[]} [ignoreKeys] Recursively ignore these keys in the object (keep null/undefined values).
 */
declare function removeNullPropertiesFromObject(obj: KeyValue, ignoreKeys?: string[]): void;
declare function toNetworkAddressHex(value: number): string;
declare function toSnakeCaseObject(value: KeyValue): KeyValue;
declare function toSnakeCaseString(value: string): string;
declare function getAllFiles(path_: string): string[];
declare function validateFriendlyName(name: string, throwFirstError?: boolean): string[];
declare function sleep(seconds: number): Promise<void>;
declare function sanitizeImageParameter(parameter: string): string;
declare function isAvailabilityEnabledForEntity(entity: Device | Group, settings: Settings): boolean;
declare function isZHEndpoint(obj: unknown): obj is zh.Endpoint;
declare function flatten<Type>(arr: Type[][]): Type[];
declare function arrayUnique<Type>(arr: Type[]): Type[];
declare function isZHGroup(obj: unknown): obj is zh.Group;
declare function availabilityPayload(state: 'online' | 'offline', settings: Settings): string;
declare function publishLastSeen(data: eventdata.LastSeenChanged, settings: Settings, allowMessageEmitted: boolean, publishEntityState: PublishEntityState): Promise<void>;
declare function filterProperties(filter: string[] | undefined, data: KeyValue): void;
export declare function isNumericExpose(expose: zhc.Expose): expose is zhc.Numeric;
export declare function assertEnumExpose(expose: zhc.Expose): asserts expose is zhc.Enum;
export declare function assertNumericExpose(expose: zhc.Expose): asserts expose is zhc.Numeric;
export declare function assertBinaryExpose(expose: zhc.Expose): asserts expose is zhc.Binary;
export declare function isEnumExpose(expose: zhc.Expose): expose is zhc.Enum;
export declare function isBinaryExpose(expose: zhc.Expose): expose is zhc.Binary;
export declare function isLightExpose(expose: zhc.Expose): expose is zhc.Light;
declare function getScenes(entity: zh.Endpoint | zh.Group): Scene[];
declare function deviceNotCoordinator(device: zh.Device): boolean;
declare const _default: {
    capitalize: typeof capitalize;
    getZigbee2MQTTVersion: typeof getZigbee2MQTTVersion;
    getDependencyVersion: typeof getDependencyVersion;
    formatDate: typeof formatDate;
    objectIsEmpty: typeof objectIsEmpty;
    objectHasProperties: typeof objectHasProperties;
    equalsPartial: typeof equalsPartial;
    getObjectProperty: typeof getObjectProperty;
    getResponse: typeof getResponse;
    parseJSON: typeof parseJSON;
    loadModuleFromText: typeof loadModuleFromText;
    loadModuleFromFile: typeof loadModuleFromFile;
    removeNullPropertiesFromObject: typeof removeNullPropertiesFromObject;
    toNetworkAddressHex: typeof toNetworkAddressHex;
    toSnakeCaseString: typeof toSnakeCaseString;
    toSnakeCaseObject: typeof toSnakeCaseObject;
    isZHEndpoint: typeof isZHEndpoint;
    isZHGroup: typeof isZHGroup;
    hours: (hours: number) => number;
    minutes: (minutes: number) => number;
    seconds: (seconds: number) => number;
    validateFriendlyName: typeof validateFriendlyName;
    sleep: typeof sleep;
    sanitizeImageParameter: typeof sanitizeImageParameter;
    isAvailabilityEnabledForEntity: typeof isAvailabilityEnabledForEntity;
    publishLastSeen: typeof publishLastSeen;
    availabilityPayload: typeof availabilityPayload;
    getAllFiles: typeof getAllFiles;
    filterProperties: typeof filterProperties;
    flatten: typeof flatten;
    arrayUnique: typeof arrayUnique;
    getScenes: typeof getScenes;
    deviceNotCoordinator: typeof deviceNotCoordinator;
    noop: () => void;
};
export default _default;
//# sourceMappingURL=utils.d.ts.map