export declare let schema: KeyValue;
/** NOTE: by order of priority, lower index is lower level (more important) */
export declare const LOG_LEVELS: readonly string[];
export type LogLevel = (typeof LOG_LEVELS)[number];
declare function write(): void;
export declare function validate(): string[];
export declare function get(): Settings;
export declare function set(path: string[], value: string | number | boolean | KeyValue): void;
export declare function apply(settings: Record<string, unknown>): boolean;
export declare function getGroup(IDorName: string | number): GroupOptions | undefined;
export declare function getGroups(): GroupOptions[];
export declare function getDevice(IDorName: string): DeviceOptionsWithId | undefined;
export declare function addDevice(ID: string): DeviceOptionsWithId;
export declare function addDeviceToPasslist(ID: string): void;
export declare function blockDevice(ID: string): void;
export declare function removeDevice(IDorName: string): void;
export declare function addGroup(name: string, ID?: string): GroupOptions;
export declare function addDeviceToGroup(IDorName: string, keys: string[]): void;
export declare function removeDeviceFromGroup(IDorName: string, keys: string[]): void;
export declare function removeGroup(IDorName: string | number): void;
export declare function changeEntityOptions(IDorName: string, newOptions: KeyValue): boolean;
export declare function changeFriendlyName(IDorName: string, newName: string): void;
export declare function reRead(): void;
export declare const testing: {
    write: typeof write;
    clear: () => void;
    defaults: RecursivePartial<Settings>;
};
export {};
//# sourceMappingURL=settings.d.ts.map