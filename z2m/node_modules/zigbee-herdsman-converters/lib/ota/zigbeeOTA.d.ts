import { KeyValueAny, Ota, Zh } from '../types';
export declare function getImageMeta(current: Ota.ImageInfo, device: Zh.Device): Promise<Ota.ImageMeta>;
export declare function getFirmwareFile(image: KeyValueAny): Promise<import("axios").AxiosResponse<any, any> | {
    data: Buffer<ArrayBufferLike>;
}>;
/**
 * Interface implementation
 */
export declare function isUpdateAvailable(device: Zh.Device, requestPayload?: Ota.ImageInfo): Promise<import("../types").OtaUpdateAvailableResult>;
export declare function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress): Promise<number>;
export declare const useIndexOverride: (indexFileName: string) => void;
//# sourceMappingURL=zigbeeOTA.d.ts.map