import { Ota, Zh } from '../types';
/**
 * Ubisys switched firmware format when the switched to their newer
 *  `Ubisys Compact7B Stack` (I think it was 7B, could have bene earlier)
 *
 * Their firmware index lists a *.ota1.zigbee firmware for those devices that
 *  is in the old firmware format that will update the device to use the new
 *  format. The matching logisch seems to generally work, however as reported in
 *  Koenkk/zigbee-OTA#329 there still seems to be a bug lurking somewhere.
 */
/**
 * Helper functions
 */
export declare function getImageMeta(current: Ota.ImageInfo, device: Zh.Device): Promise<Ota.ImageMeta>;
/**
 * Interface implementation
 */
export declare function isUpdateAvailable(device: Zh.Device, requestPayload?: Ota.ImageInfo): Promise<import("../types").OtaUpdateAvailableResult>;
export declare function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress): Promise<number>;
//# sourceMappingURL=ubisys.d.ts.map