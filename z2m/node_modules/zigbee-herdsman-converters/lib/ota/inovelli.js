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
/**
 * Helper functions
 *
 * @packageDocumentation
 */
const url = 'https://files.inovelli.com/firmware/firmware.json';
const NS = 'zhc:ota:inovelli';
const axios = common.getAxios();
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const { data: images } = await axios.get(url);
    if (!images) {
        throw new Error(`InovelliOTA: Error getting firmware page at ${url}`);
    }
    if (Object.keys(images).indexOf(device.modelID) === -1) {
        return null;
    }
    // Force for now.  There is only beta firmware at the moment.
    const useBetaChannel = true;
    const image = images[device.modelID]
        .filter((i) => (useBetaChannel ? true : i.channel === 'production'))
        .sort((a, b) => {
        const aRadix = a.version.match(/[A-F]/) ? 16 : 10;
        const bRadix = b.version.match(/[A-F]/) ? 16 : 10;
        // @ts-expect-error ignore
        const aVersion = parseFloat(a.version, aRadix);
        // @ts-expect-error ignore
        const bVersion = parseFloat(b.version, bRadix);
        // doesn't matter which order they are in
        if (aVersion < bVersion) {
            return -1;
        }
        if (aVersion > bVersion) {
            return 1;
        }
        return 0;
    })
        .pop();
    if (!image) {
        logger_1.logger.warning(`No image found in the ${useBetaChannel ? 'beta' : 'production'} channel for device '${device.modelID}'`, NS);
        return null;
    }
    // version in the firmware removes the zero padding and support hex versioning
    return {
        // @ts-expect-error ignore
        fileVersion: parseFloat(image.version, image.version.match(/[A-F]/) ? 16 : 10),
        url: image.firmware,
    };
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
//# sourceMappingURL=inovelli.js.map