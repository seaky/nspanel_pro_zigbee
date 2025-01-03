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
exports.useTestURL = void 0;
exports.getImageMeta = getImageMeta;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const productionURL = 'http://fw.ota.homesmart.ikea.net/feed/version_info.json';
const testURL = 'http://fw.test.ota.homesmart.ikea.net/feed/version_info.json';
const NS = 'zhc:ota:tradfri';
const axios = common.getAxios();
let useTestURL = false;
/**
 * Helper functions
 */
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const url = useTestURL ? testURL : productionURL;
    const { data: images } = await axios.get(url);
    if (!images?.length) {
        throw new Error(`TradfriOTA: Error getting firmware page at ${url}`);
    }
    const image = images.find((i) => i.fw_image_type === current.imageType);
    if (!image) {
        return null;
    }
    return {
        fileVersion: (image.fw_file_version_MSB << 16) | image.fw_file_version_LSB,
        url: image.fw_binary_url,
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
const useTestURL_ = () => {
    useTestURL = true;
};
exports.useTestURL = useTestURL_;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
exports.useTestURL = useTestURL_;
//# sourceMappingURL=tradfri.js.map