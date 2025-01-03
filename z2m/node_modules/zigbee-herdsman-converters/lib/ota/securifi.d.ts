import { Ota, Zh } from '../types';
export declare function isUpdateAvailable(device: Zh.Device, requestPayload?: Ota.ImageInfo): Promise<import("../types").OtaUpdateAvailableResult>;
export declare function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress): Promise<number>;
//# sourceMappingURL=securifi.d.ts.map