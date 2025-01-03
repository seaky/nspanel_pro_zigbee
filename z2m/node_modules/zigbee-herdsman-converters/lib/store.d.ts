import { Zh } from './types';
export declare function hasValue(entity: Zh.Endpoint | Zh.Group | Zh.Device, key: string): boolean;
export declare function getValue(entity: Zh.Endpoint | Zh.Group | Zh.Device, key: string, default_?: unknown): any;
export declare function putValue(entity: Zh.Endpoint | Zh.Group | Zh.Device, key: string, value: unknown): void;
export declare function clearValue(entity: Zh.Endpoint | Zh.Group | Zh.Device, key: string): void;
export declare function clear(): void;
//# sourceMappingURL=store.d.ts.map