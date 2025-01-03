import { Ota, Zh } from '../types';
/**
 * Helper functions
 */
export declare function getImageMeta(current: Ota.ImageInfo, device: Zh.Device): Promise<Ota.ImageMeta>;
/**
 * Interface implementation
 */
export declare function isUpdateAvailable(device: Zh.Device, requestPayload?: Ota.ImageInfo): Promise<import("../types").OtaUpdateAvailableResult>;
export declare function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress): Promise<number>;
//# sourceMappingURL=ledvance.d.ts.map