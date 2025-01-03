import { Tz, Zh } from './types';
export declare function readColorAttributes(entity: Zh.Endpoint | Zh.Group, meta: Tz.Meta, additionalAttributes?: string[]): string[];
export declare function findColorTempRange(entity: Zh.Endpoint | Zh.Group): number[];
export declare function clampColorTemp(colorTemp: number, colorTempMin: number, colorTempMax: number): number;
export declare function configure(device: Zh.Device, coordinatorEndpoint: Zh.Endpoint, readColorTempMinMaxAttribute: boolean): Promise<void>;
//# sourceMappingURL=light.d.ts.map