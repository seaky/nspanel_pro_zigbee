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
exports.getImageMeta = getImageMeta;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const axios = common.getAxios();
const firmwareManifest = 'https://update.gammatroniques.fr/ticmeter/manifest.json';
async function getImageMeta(current, device) {
    logger_1.logger.info(`GMMTS OTA: call getImageMeta for ${device.modelID}`, 'TICMeter');
    const { data: releases } = await axios.get(firmwareManifest);
    if (!releases.builds) {
        throw new Error(`GMMTS OTA: No builds available for ${device.modelID}`);
    }
    const appUrl = releases.builds[0].parts.find((part) => part.type === 'app');
    logger_1.logger.info(`GMMTS OTA: Using firmware file ` + appUrl.path + ` for ${device.modelID}`, 'TICMeter');
    const image = common.parseImage((await common.getAxios().get(appUrl.ota, { responseType: 'arraybuffer' })).data);
    const ret = {
        fileVersion: image.header.fileVersion,
        fileSize: image.header.totalImageSize,
        url: appUrl.ota,
    };
    logger_1.logger.debug(`GMMTS OTA: Image header  ${JSON.stringify(image.header)}`, 'TICMeter');
    logger_1.logger.info(`GMMTS OTA: Image metadata for ${device.modelID}: ${JSON.stringify(ret)}`, 'TICMeter');
    return ret;
}
/**
 * Interface implementation
 */
async function isUpdateAvailable(device, requestPayload = null) {
    return await common.isUpdateAvailable(device, requestPayload, common.isNewImageAvailable, getImageMeta);
}
async function updateToLatest(device, onProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta);
}
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
//# sourceMappingURL=gmmts.js.map