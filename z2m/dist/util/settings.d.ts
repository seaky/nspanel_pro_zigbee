import schemaJson from './settings.schema.json';
export { schemaJson };
export declare const CURRENT_VERSION = 4;
/** NOTE: by order of priority, lower index is lower level (more important) */
export declare const LOG_LEVELS: readonly string[];
export type LogLevel = 'error' | 'warning' | 'info' | 'debug';
export declare const defaults: RecursivePartial<Settings>;
declare function write(): void;
export declare function validate(): string[];
/**
 * Get the settings actually written in the yaml.
 * Env vars are applied on top.
 * Defaults merged on startup are not included.
 */
export declare function getPersistedSettings(): Partial<Settings>;
export declare function get(): Settings;
export declare function set(path: string[], value: string | number | boolean | KeyValue): void;
export declare function apply(settings: Record<string, unknown>, throwOnError?: boolean): boolean;
export declare function getGroup(IDorName: string | number): GroupOptions | undefined;
export declare function getDevice(IDorName: string): DeviceOptionsWithId | undefined;
export declare function addDevice(ID: string): DeviceOptionsWithId;
export declare function blockDevice(ID: string): void;
export declare function removeDevice(IDorName: string): void;
export declare function addGroup(name: string, ID?: string): GroupOptions;
export declare function removeGroup(IDorName: string | number): void;
export declare function changeEntityOptions(IDorName: string, newOptions: KeyValue): boolean;
export declare function changeFriendlyName(IDorName: string, newName: string): void;
export declare function reRead(): void;
export declare const testing: {
    write: typeof write;
    clear: () => void;
    defaults: RecursivePartial<Settings>;
    CURRENT_VERSION: number;
};
//# sourceMappingURL=settings.d.ts.map