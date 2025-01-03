import { KeyValueAny, Ota, OtaUpdateAvailableResult, Zh } from '../types';
type IsNewImageAvailable = (current: Ota.ImageInfo, device: Zh.Device, getImageMeta: Ota.GetImageMeta) => Promise<{
    available: number;
    currentFileVersion: number;
    otaFileVersion: number;
}>;
type DownloadImage = (meta: Ota.ImageMeta) => Promise<{
    data: Buffer;
}>;
type GetNewImage = (current: Ota.Version, device: Zh.Device, getImageMeta: Ota.GetImageMeta, downloadImage: DownloadImage, suppressElementImageParseFailure: boolean) => Promise<Ota.Image>;
export declare const UPGRADE_FILE_IDENTIFIER: Buffer<ArrayBuffer>;
export declare function getAxios(caBundle?: string[]): import("axios").AxiosInstance;
export declare function setDataDir(dir: string): void;
export declare function isValidUrl(url: string): boolean;
export declare function readLocalFile(fileName: string): Buffer;
export declare function getFirmwareFile(image: KeyValueAny): Promise<{
    data: Buffer;
}>;
export declare function processCustomCaBundle(uri: string): Promise<string[]>;
export declare function getOverrideIndexFile(urlOrName: string): Promise<any>;
export declare function parseImage(buffer: Buffer, suppressElementImageParseFailure?: boolean): Ota.Image;
export declare function validateImageData(image: Ota.Image): void;
export declare function isUpdateAvailable(device: Zh.Device, requestPayload: Ota.ImageInfo, isNewImageAvailable?: IsNewImageAvailable, getImageMeta?: Ota.GetImageMeta): Promise<OtaUpdateAvailableResult>;
export declare function isNewImageAvailable(current: Ota.ImageInfo, device: Zh.Device, getImageMeta: Ota.GetImageMeta): ReturnType<IsNewImageAvailable>;
/**
 * @see https://zigbeealliance.org/wp-content/uploads/2021/10/07-5123-08-Zigbee-Cluster-Library.pdf 11.12
 */
export declare function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress, getNewImage: GetNewImage, getImageMeta?: Ota.GetImageMeta, downloadImage?: DownloadImage, suppressElementImageParseFailure?: boolean): Promise<number>;
export declare function getNewImage(current: Ota.ImageInfo, device: Zh.Device, getImageMeta: Ota.GetImageMeta, downloadImage: DownloadImage, suppressElementImageParseFailure: boolean): Promise<Ota.Image>;
export {};
//# sourceMappingURL=common.d.ts.map