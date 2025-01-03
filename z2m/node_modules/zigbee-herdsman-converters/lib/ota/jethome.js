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
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const baseurl = 'https://fw.jethome.ru';
const deviceurl = `${baseurl}/api/devices/`;
const NS = 'zhc:ota:jethome';
const axios = common.getAxios();
let overrideIndexFileName = null;
/**
 * Helper functions
 */
async function getIndex(modelID) {
    if (overrideIndexFileName) {
        logger_1.logger.debug(`Loading override index ${overrideIndexFileName}`, NS);
        const overrideIndex = await common.getOverrideIndexFile(overrideIndexFileName);
        return overrideIndex;
    }
    else {
        const url = `${deviceurl}${modelID}/info`;
        const { data: index } = await axios.get(url);
        if (!index) {
            throw new Error(`JetHomeOTA: Error getting firmware page at ${url}`);
        }
        logger_1.logger.debug(`Downloaded index for ${modelID}`, NS);
        return index;
    }
}
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const images = await getIndex(device.modelID);
    // XXX: this is assumed to always be present even for devices that support OTA but without images yet available?
    if (!images?.latest_firmware?.release?.images) {
        throw new Error(`JetHomeOTA: Error getting firmware images`);
    }
    // we need to return the latest_firmware.release.urls.zigbee.ota
    const jetimage = images.latest_firmware.release.images['zigbee.ota'];
    if (!jetimage) {
        return null;
    }
    logger_1.logger.debug(`Version: ${images.latest_firmware.release.version} size: ${jetimage.filesize} url: ${baseurl + jetimage.url}`, NS);
    return {
        fileVersion: Number(images.latest_firmware.release.version),
        fileSize: jetimage.filesize,
        url: baseurl + jetimage.url,
    };
}
/**
 * Interface implementation
 */
async function isUpdateAvailable(device, requestPayload = null) {
    return await common.isUpdateAvailable(device, requestPayload, common.isNewImageAvailable, getImageMeta);
}
async function updateToLatest(device, onProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta, common.getFirmwareFile);
}
const useIndexOverride = (indexFileName) => {
    overrideIndexFileName = indexFileName;
};
exports.useIndexOverride = useIndexOverride;
exports.getImageMeta = getImageMeta;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
exports.useIndexOverride = exports.useIndexOverride;
//# sourceMappingURL=jethome.js.map