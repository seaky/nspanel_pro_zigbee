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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageMeta = getImageMeta;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const tar_stream_1 = __importDefault(require("tar-stream"));
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const url = 'https://eu.salusconnect.io/demo/default/status/firmware?timestamp=0';
const NS = 'zhc:ota:salus';
const axios = common.getAxios();
/**
 * Helper functions
 */
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const { data } = await axios.get(url);
    if (!data?.versions?.length) {
        throw new Error(`SalusOTA: Error getting firmware page at ${url}`);
    }
    const image = data.versions.find((i) => i.model === device.modelID);
    if (!image) {
        return null;
    }
    return {
        fileVersion: parseInt(image.version, 16),
        url: image.url.replace(/^http:\/\//, 'https://'),
    };
}
async function untar(tarStream) {
    return await new Promise((resolve, reject) => {
        const extract = tar_stream_1.default.extract();
        const result = [];
        extract.on('error', reject);
        extract.on('entry', (headers, stream, next) => {
            const buffers = [];
            stream.on('data', function (data) {
                buffers.push(data);
            });
            stream.on('end', function () {
                result.push({
                    headers,
                    data: Buffer.concat(buffers),
                });
                next();
            });
            stream.resume();
        });
        extract.on('finish', () => {
            resolve(result);
        });
        tarStream.pipe(extract);
    });
}
async function downloadImage(meta) {
    const download = await axios.get(meta.url, { responseType: 'stream' });
    const files = await untar(download.data);
    // @ts-expect-error ignore
    const imageFile = files.find((file) => file.headers.name.endsWith('.ota'));
    return imageFile;
}
/**
 * Interface implementation
 */
async function isUpdateAvailable(device, requestPayload = null) {
    return await common.isUpdateAvailable(device, requestPayload, common.isNewImageAvailable, getImageMeta);
}
async function updateToLatest(device, onProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta, downloadImage);
}
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
//# sourceMappingURL=salus.js.map