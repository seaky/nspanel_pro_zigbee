"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIndexOverride = void 0;
exports.getImageMeta = getImageMeta;
exports.getFirmwareFile = getFirmwareFile;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const url = 'https://raw.githubusercontent.com/Koenkk/zigbee-OTA/master/index.json';
const caBundleUrl = 'https://raw.githubusercontent.com/Koenkk/zigbee-OTA/master/cacerts.pem';
const NS = 'zhc:ota';
const axios = common.getAxios();
let overrideIndexFileName = null;
/**
 * Helper functions
 */
function fillImageInfo(meta) {
    // Web-hosted images must come with all fields filled already
    if (common.isValidUrl(meta.url)) {
        return meta;
    }
    // Nothing to do if needed fields were filled already
    if (meta.imageType !== undefined && meta.manufacturerCode !== undefined && meta.fileVersion !== undefined) {
        return meta;
    }
    // If no fields provided - get them from the image file
    const buffer = common.readLocalFile(meta.url);
    const start = buffer.indexOf(common.UPGRADE_FILE_IDENTIFIER);
    const image = common.parseImage(buffer.subarray(start));
    // Will fill only those fields that were absent
    if (meta.imageType === undefined)
        meta.imageType = image.header.imageType;
    if (meta.manufacturerCode === undefined)
        meta.manufacturerCode = image.header.manufacturerCode;
    if (meta.fileVersion === undefined)
        meta.fileVersion = image.header.fileVersion;
    return meta;
}
async function getIndex() {
    const { data: mainIndex } = await axios.get(url);
    if (!mainIndex) {
        throw new Error(`ZigbeeOTA: Error getting firmware page at '${url}'`);
    }
    logger_1.logger.debug(`Downloaded main index`, NS);
    if (overrideIndexFileName) {
        logger_1.logger.debug(`Loading override index '${overrideIndexFileName}'`, NS);
        const localIndex = await common.getOverrideIndexFile(overrideIndexFileName);
        // Resulting index will have overridden items first
        return localIndex.concat(mainIndex).map((item) => (common.isValidUrl(item.url) ? item : fillImageInfo(item)));
    }
    return mainIndex;
}
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Getting image metadata for '${device.modelID}'`, NS);
    const images = await getIndex();
    // NOTE: Officially an image can be determined with a combination of manufacturerCode and imageType.
    // However Gledopto pro products use the same imageType (0) for every device while the image is different.
    // For this case additional identification through the modelId is done.
    // In the case of Tuya and Moes, additional identification is carried out through the manufacturerName.
    const image = images.find((i) => i.imageType === current.imageType &&
        i.manufacturerCode === current.manufacturerCode &&
        (!i.minFileVersion || current.fileVersion >= i.minFileVersion) &&
        (!i.maxFileVersion || current.fileVersion <= i.maxFileVersion) &&
        (!i.modelId || i.modelId === device.modelID) &&
        (!i.manufacturerName || i.manufacturerName.includes(device.manufacturerName)));
    if (!image) {
        return null;
    }
    return {
        fileVersion: image.fileVersion,
        fileSize: image.fileSize,
        url: image.url,
        sha512: image.sha512,
        force: image.force,
    };
}
async function isNewImageAvailable(current, device, getImageMeta) {
    if (['lumi.airrtc.agl001', 'lumi.curtain.acn003', 'lumi.curtain.agl001'].includes(device.modelID)) {
        // The current.fileVersion which comes from the device is wrong.
        // Use the `lumiFileVersion` which comes from the manuSpecificLumi.attributeReport instead.
        // https://github.com/Koenkk/zigbee2mqtt/issues/16345#issuecomment-1454835056
        // https://github.com/Koenkk/zigbee2mqtt/issues/16345 doesn't seem to be needed for all
        // https://github.com/Koenkk/zigbee2mqtt/issues/15745
        if (device.meta.lumiFileVersion) {
            current = { ...current, fileVersion: device.meta.lumiFileVersion };
        }
    }
    return await common.isNewImageAvailable(current, device, getImageMeta);
}
async function getFirmwareFile(image) {
    const urlOrName = image.url;
    // First try to download firmware file with the URL provided
    if (common.isValidUrl(urlOrName)) {
        logger_1.logger.debug(`Downloading firmware image from '${urlOrName}' using the zigbeeOTA custom CA certificates`, NS);
        const otaCaBundle = await common.processCustomCaBundle(caBundleUrl);
        const response = await common.getAxios(otaCaBundle).get(urlOrName, { responseType: 'arraybuffer' });
        return response;
    }
    logger_1.logger.debug(`Trying to read firmware image from local file '${urlOrName}'`, NS);
    return { data: common.readLocalFile(urlOrName) };
}
/**
 * Interface implementation
 */
async function isUpdateAvailable(device, requestPayload = null) {
    return await common.isUpdateAvailable(device, requestPayload, isNewImageAvailable, getImageMeta);
}
async function updateToLatest(device, onProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta, getFirmwareFile);
}
const useIndexOverride = (indexFileName) => {
    overrideIndexFileName = indexFileName;
};
exports.useIndexOverride = useIndexOverride;
exports.getImageMeta = getImageMeta;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
exports.useIndexOverride = exports.useIndexOverride;
//# sourceMappingURL=zigbeeOTA.js.map