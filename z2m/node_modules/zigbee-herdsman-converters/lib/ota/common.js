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
exports.UPGRADE_FILE_IDENTIFIER = void 0;
exports.getAxios = getAxios;
exports.setDataDir = setDataDir;
exports.isValidUrl = isValidUrl;
exports.readLocalFile = readLocalFile;
exports.getFirmwareFile = getFirmwareFile;
exports.processCustomCaBundle = processCustomCaBundle;
exports.getOverrideIndexFile = getOverrideIndexFile;
exports.parseImage = parseImage;
exports.validateImageData = validateImageData;
exports.isUpdateAvailable = isUpdateAvailable;
exports.isNewImageAvailable = isNewImageAvailable;
exports.updateToLatest = updateToLatest;
exports.getNewImage = getNewImage;
const assert_1 = __importDefault(require("assert"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = require("fs");
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const tls_1 = __importDefault(require("tls"));
const axios_1 = __importDefault(require("axios"));
const buffer_crc32_1 = __importDefault(require("buffer-crc32"));
const https_proxy_agent_1 = require("https-proxy-agent");
const URI = __importStar(require("uri-js"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const logger_1 = require("../logger");
const utils_1 = require("../utils");
const NS = 'zhc:ota:common';
let dataDir = null;
const MAX_TIMEOUT = 2147483647; // +- 24 days
const IMAGE_BLOCK_RESPONSE_DELAY = 250;
exports.UPGRADE_FILE_IDENTIFIER = Buffer.from([0x1e, 0xf1, 0xee, 0x0b]);
const VALID_SILABS_CRC = 0x2144df1c;
const EBL_TAG_HEADER = 0x0;
const EBL_TAG_ENC_HEADER = 0xfb05;
const EBL_TAG_END = 0xfc04;
const EBL_PADDING = 0xff;
const EBL_IMAGE_SIGNATURE = 0xe350;
const GBL_TAG_HEADER = 0xeb17a603;
const GBL_TAG_END = 0xfc0404fc;
// ----
// Helper functions
// ----
function getAxios(caBundle = null) {
    let config = {};
    const httpsAgentOptions = {};
    if (caBundle !== null) {
        // We also include all system default CAs, as setting custom CAs fully replaces the default list
        httpsAgentOptions.ca = [...tls_1.default.rootCertificates, ...caBundle];
    }
    const proxy = process.env.HTTPS_PROXY;
    if (proxy) {
        config = {
            proxy: false,
            httpsAgent: new https_proxy_agent_1.HttpsProxyAgent(proxy, httpsAgentOptions),
            headers: {
                'Accept-Encoding': '*',
            },
        };
    }
    else {
        config = {
            httpsAgent: new https_1.default.Agent(httpsAgentOptions),
        };
    }
    const axiosInstance = axios_1.default.create(config);
    axiosInstance.defaults.maxRedirects = 0; // Set to 0 to prevent automatic redirects
    // Add work with 302 redirects without hostname in Location header
    axiosInstance.interceptors.response.use((response) => response, (error) => {
        // get domain from basic url
        if (error.response && [301, 302].includes(error.response.status)) {
            let redirectUrl = error.response.headers.location;
            try {
                const parsedUrl = new URL(redirectUrl);
                if (!parsedUrl.protocol || !parsedUrl.host) {
                    throw new Error(`Get Axios, no scheme or domain`);
                }
            }
            catch {
                // Prepend scheme and domain from the original request's base URL
                const baseURL = new URL(error.config.url);
                redirectUrl = `${baseURL.origin}${redirectUrl}`;
            }
            return axiosInstance.get(redirectUrl, { responseType: error.config.responseType || 'arraybuffer' });
        }
    });
    return axiosInstance;
}
function setDataDir(dir) {
    dataDir = dir;
}
function isValidUrl(url) {
    try {
        const parsed = URI.parse(url);
        return parsed.scheme === 'http' || parsed.scheme === 'https';
    }
    catch {
        return false;
    }
}
function readLocalFile(fileName) {
    // If the file name is not a full path, then treat it as a relative to the data directory
    if (!path_1.default.isAbsolute(fileName) && dataDir) {
        fileName = path_1.default.join(dataDir, fileName);
    }
    logger_1.logger.debug(`Getting local firmware file '${fileName}'`, NS);
    return (0, fs_1.readFileSync)(fileName);
}
async function getFirmwareFile(image) {
    const urlOrName = image.url;
    // First try to download firmware file with the URL provided
    if (isValidUrl(urlOrName)) {
        logger_1.logger.debug(`Downloading firmware image from '${urlOrName}'`, NS);
        return await getAxios().get(urlOrName, { responseType: 'arraybuffer' });
    }
    logger_1.logger.debug(`Try to read firmware image from local file '${urlOrName}'`, NS);
    return { data: readLocalFile(urlOrName) };
}
async function processCustomCaBundle(uri) {
    let rawCaBundle = '';
    if (isValidUrl(uri)) {
        rawCaBundle = (await axios_1.default.get(uri)).data;
    }
    else {
        if (!path_1.default.isAbsolute(uri) && dataDir) {
            uri = path_1.default.join(dataDir, uri);
        }
        rawCaBundle = (0, fs_1.readFileSync)(uri, { encoding: 'utf-8' });
    }
    // Parse the raw CA bundle into clean, separate CA certs
    const lines = rawCaBundle.split('\n');
    const caBundle = [];
    let inCert = false;
    let currentCert = '';
    for (const line of lines) {
        if (line === '-----BEGIN CERTIFICATE-----') {
            inCert = true;
        }
        if (inCert) {
            currentCert = currentCert + line + '\n';
        }
        if (line === '-----END CERTIFICATE-----') {
            inCert = false;
            caBundle.push(currentCert);
            currentCert = '';
        }
    }
    return caBundle;
}
async function getOverrideIndexFile(urlOrName) {
    if (isValidUrl(urlOrName)) {
        const { data: index } = await getAxios().get(urlOrName);
        if (!index) {
            throw new Error(`Error getting override index file from '${urlOrName}'`);
        }
        return index;
    }
    return JSON.parse((0, fs_1.readFileSync)(urlOrName, 'utf-8'));
}
// ----
// OTA functions
// ----
function getOTAEndpoint(device) {
    return device.endpoints.find((e) => e.supportsOutputCluster('genOta'));
}
function parseSubElement(buffer, position) {
    const tagID = buffer.readUInt16LE(position);
    const length = buffer.readUInt32LE(position + 2);
    const data = buffer.subarray(position + 6, position + 6 + length);
    return { tagID, length, data };
}
function parseImage(buffer, suppressElementImageParseFailure = false) {
    const header = {
        otaUpgradeFileIdentifier: buffer.subarray(0, 4),
        otaHeaderVersion: buffer.readUInt16LE(4),
        otaHeaderLength: buffer.readUInt16LE(6),
        otaHeaderFieldControl: buffer.readUInt16LE(8),
        manufacturerCode: buffer.readUInt16LE(10),
        imageType: buffer.readUInt16LE(12),
        fileVersion: buffer.readUInt32LE(14),
        zigbeeStackVersion: buffer.readUInt16LE(18),
        otaHeaderString: buffer.toString('utf8', 20, 52),
        totalImageSize: buffer.readUInt32LE(52),
    };
    let headerPos = 56;
    let didSuppressElementImageParseFailure = false;
    if (header.otaHeaderFieldControl & 1) {
        header.securityCredentialVersion = buffer.readUInt8(headerPos);
        headerPos += 1;
    }
    if (header.otaHeaderFieldControl & 2) {
        header.upgradeFileDestination = buffer.subarray(headerPos, headerPos + 8);
        headerPos += 8;
    }
    if (header.otaHeaderFieldControl & 4) {
        header.minimumHardwareVersion = buffer.readUInt16LE(headerPos);
        headerPos += 2;
        header.maximumHardwareVersion = buffer.readUInt16LE(headerPos);
        headerPos += 2;
    }
    const raw = buffer.subarray(0, header.totalImageSize);
    (0, assert_1.default)(exports.UPGRADE_FILE_IDENTIFIER.equals(header.otaUpgradeFileIdentifier), `Not an OTA file`);
    let position = header.otaHeaderLength;
    const elements = [];
    try {
        while (position < header.totalImageSize) {
            const element = parseSubElement(buffer, position);
            elements.push(element);
            position += element.data.length + 6;
        }
    }
    catch (error) {
        if (!suppressElementImageParseFailure) {
            throw error;
        }
        didSuppressElementImageParseFailure = true;
        logger_1.logger.debug('Partially failed to parse the image, continuing anyway...', NS);
    }
    if (!didSuppressElementImageParseFailure) {
        (0, assert_1.default)(position === header.totalImageSize, `Size mismatch`);
    }
    return { header, elements, raw };
}
function validateImageData(image) {
    for (const element of image.elements) {
        const { data } = element;
        if (data.readUInt32BE(0) === GBL_TAG_HEADER) {
            validateSilabsGbl(data);
        }
        else {
            const tag = data.readUInt16BE(0);
            if ((tag === EBL_TAG_HEADER && data.readUInt16BE(6) === EBL_IMAGE_SIGNATURE) || tag === EBL_TAG_ENC_HEADER) {
                validateSilabsEbl(data);
            }
        }
    }
}
function validateSilabsEbl(data) {
    const dataLength = data.length;
    let position = 0;
    while (position + 4 <= dataLength) {
        const tag = data.readUInt16BE(position);
        const len = data.readUInt16BE(position + 2);
        position += 4 + len;
        if (tag !== EBL_TAG_END) {
            continue;
        }
        for (let position2 = position; position2 < dataLength; position2++) {
            (0, assert_1.default)(data.readUInt8(position2) === EBL_PADDING, `Image padding contains invalid bytes`);
        }
        const calculatedCrc32 = buffer_crc32_1.default.unsigned(data.subarray(0, position));
        (0, assert_1.default)(calculatedCrc32 === VALID_SILABS_CRC, `Image CRC-32 is invalid`);
        return;
    }
    throw new Error(`Image is truncated, not long enough to contain a valid tag`);
}
function validateSilabsGbl(data) {
    const dataLength = data.length;
    let position = 0;
    while (position + 8 <= dataLength) {
        const tag = data.readUInt32BE(position);
        const len = data.readUInt32LE(position + 4);
        position += 8 + len;
        if (tag !== GBL_TAG_END) {
            continue;
        }
        const calculatedCrc32 = buffer_crc32_1.default.unsigned(data.subarray(0, position));
        (0, assert_1.default)(calculatedCrc32 === VALID_SILABS_CRC, `Image CRC-32 is invalid`);
        return;
    }
    throw new Error(`Image is truncated, not long enough to contain a valid tag`);
}
function cancelWaiters(waiters) {
    waiters.imageBlockOrPageRequest?.cancel();
    waiters.upgradeEndRequest?.cancel();
}
async function sendQueryNextImageResponse(endpoint, image, requestTransactionSequenceNumber) {
    const payload = {
        status: zigbee_herdsman_1.Zcl.Status.SUCCESS,
        manufacturerCode: image.header.manufacturerCode,
        imageType: image.header.imageType,
        fileVersion: image.header.fileVersion,
        imageSize: image.header.totalImageSize,
    };
    try {
        await endpoint.commandResponse('genOta', 'queryNextImageResponse', payload, null, requestTransactionSequenceNumber);
    }
    catch (error) {
        logger_1.logger.debug(`Failed to send queryNextImageResponse: ${error}`, NS);
    }
}
async function imageNotify(endpoint) {
    await endpoint.commandResponse('genOta', 'imageNotify', { payloadType: 0, queryJitter: 100 }, { sendPolicy: 'immediate' });
}
async function requestOTA(endpoint) {
    // Some devices (e.g. Insta) take very long trying to discover the correct coordinator EP for OTA.
    const queryNextImageRequest = endpoint.waitForCommand('genOta', 'queryNextImageRequest', null, 60000);
    try {
        await imageNotify(endpoint);
        const response = await queryNextImageRequest.promise;
        return [response.header.transactionSequenceNumber, response.payload];
    }
    catch {
        queryNextImageRequest.cancel();
        throw new Error(`Device didn't respond to OTA request`);
    }
}
function getImageBlockResponsePayload(image, imageBlockRequest, pageOffset, pageSize) {
    let start = imageBlockRequest.payload.fileOffset + pageOffset;
    // When the data size is too big, OTA gets unstable, so default it to 50 bytes maximum.
    // - Insta devices, OTA only works for data sizes 40 and smaller (= manufacturerCode 4474).
    // - Legrand devices (newer firmware) require up to 64 bytes (= manufacturerCode 4129).
    let maximumDataSize = 50;
    if (imageBlockRequest.payload.manufacturerCode === zigbee_herdsman_1.Zcl.ManufacturerCode.INSTA_GMBH) {
        maximumDataSize = 40;
    }
    else if (imageBlockRequest.payload.manufacturerCode === zigbee_herdsman_1.Zcl.ManufacturerCode.LEGRAND_GROUP) {
        maximumDataSize = Infinity;
    }
    let dataSize = Math.min(maximumDataSize, imageBlockRequest.payload.maximumDataSize);
    // Hack for https://github.com/Koenkk/zigbee-OTA/issues/328 (Legrand OTA not working)
    if (imageBlockRequest.payload.manufacturerCode === zigbee_herdsman_1.Zcl.ManufacturerCode.LEGRAND_GROUP &&
        imageBlockRequest.payload.fileOffset === 50 &&
        imageBlockRequest.payload.maximumDataSize === 12) {
        logger_1.logger.info(`Detected Legrand firmware issue, attempting to reset the OTA stack`, NS);
        // The following vector seems to buffer overflow the device to reset the OTA stack!
        start = 78;
        dataSize = 64;
    }
    if (pageSize) {
        dataSize = Math.min(dataSize, pageSize - pageOffset);
    }
    let end = start + dataSize;
    if (end > image.raw.length) {
        end = image.raw.length;
    }
    logger_1.logger.debug(`Request offsets: fileOffset=${imageBlockRequest.payload.fileOffset} pageOffset=${pageOffset} ` +
        `maximumDataSize=${imageBlockRequest.payload.maximumDataSize}`, NS);
    logger_1.logger.debug(`Payload offsets: start=${start} end=${end} dataSize=${dataSize}`, NS);
    return {
        status: zigbee_herdsman_1.Zcl.Status.SUCCESS,
        manufacturerCode: imageBlockRequest.payload.manufacturerCode,
        imageType: imageBlockRequest.payload.imageType,
        fileVersion: imageBlockRequest.payload.fileVersion,
        fileOffset: start,
        dataSize: end - start,
        data: image.raw.subarray(start, end),
    };
}
function callOnProgress(startTime, lastUpdate, imageBlockRequest, image, onProgress) {
    const now = Date.now();
    // Call on progress every +- 30 seconds
    if (lastUpdate === null || now - lastUpdate > 30000) {
        const totalDuration = (now - startTime) / 1000; // in seconds
        const bytesPerSecond = imageBlockRequest.payload.fileOffset / totalDuration;
        const remaining = (image.header.totalImageSize - imageBlockRequest.payload.fileOffset) / bytesPerSecond;
        let percentage = imageBlockRequest.payload.fileOffset / image.header.totalImageSize;
        percentage = Math.round(percentage * 10000) / 100;
        logger_1.logger.debug(`Update at ${percentage}%, remaining ${remaining} seconds`, NS);
        onProgress(percentage, remaining === Infinity ? null : remaining);
        return now;
    }
    else {
        return lastUpdate;
    }
}
async function isUpdateAvailable(device, requestPayload, isNewImageAvailable = null, getImageMeta = null) {
    const logId = `'${device.ieeeAddr}' (${device.modelID})`;
    logger_1.logger.debug(`Checking if an update is available for ${logId}`, NS);
    if (requestPayload == null) {
        const endpoint = getOTAEndpoint(device);
        (0, assert_1.default)(endpoint != null, `Failed to find an endpoint which supports the OTA cluster for ${logId}`);
        logger_1.logger.debug(`Using endpoint '${endpoint.ID}'`, NS);
        const [, payload] = await requestOTA(endpoint);
        logger_1.logger.debug(`Got request '${JSON.stringify(payload)}'`, NS);
        requestPayload = payload;
    }
    const availableResult = await isNewImageAvailable(requestPayload, device, getImageMeta);
    logger_1.logger.debug(`Update available for ${logId}: ${availableResult.available < 0 ? 'YES' : 'NO'}`, NS);
    if (availableResult.available > 0) {
        logger_1.logger.warning(`Firmware on ${logId} is newer than latest firmware online.`, NS);
    }
    return { ...availableResult, available: availableResult.available < 0 };
}
async function isNewImageAvailable(current, device, getImageMeta) {
    const currentS = JSON.stringify(current);
    logger_1.logger.debug(`Is new image available for '${device.ieeeAddr}' (${device.modelID}), current '${currentS}'`, NS);
    const meta = await getImageMeta(current, device);
    // Soft-fail because no images in repo/URL for specified device
    if (!meta) {
        const metaS = `device '${device.modelID}', hardwareVersion '${device.hardwareVersion}', manufacturerName ${device.manufacturerName}`;
        logger_1.logger.debug(`Images currently unavailable for ${metaS}, ${currentS}'`, NS);
        return {
            available: 0,
            currentFileVersion: current.fileVersion,
            otaFileVersion: current.fileVersion,
        };
    }
    logger_1.logger.debug(`Is new image available for '${device.ieeeAddr}' (${device.modelID}), latest meta '${JSON.stringify(meta)}'`, NS);
    // Negative number means the new firmware is 'newer' than current one
    return {
        available: meta.force ? -1 : Math.sign(current.fileVersion - meta.fileVersion),
        currentFileVersion: current.fileVersion,
        otaFileVersion: meta.fileVersion,
    };
}
/**
 * @see https://zigbeealliance.org/wp-content/uploads/2021/10/07-5123-08-Zigbee-Cluster-Library.pdf 11.12
 */
async function updateToLatest(device, onProgress, getNewImage, getImageMeta = null, downloadImage = null, suppressElementImageParseFailure = false) {
    const logId = `'${device.ieeeAddr}' (${device.modelID})`;
    logger_1.logger.debug(`Updating ${logId} to latest`, NS);
    const endpoint = getOTAEndpoint(device);
    (0, assert_1.default)(endpoint != null, `Failed to find an endpoint which supports the OTA cluster for ${logId}`);
    logger_1.logger.debug(`Using endpoint '${endpoint.ID}'`, NS);
    const [transNum, requestPayload] = await requestOTA(endpoint);
    logger_1.logger.debug(`Got request payload '${JSON.stringify(requestPayload)}'`, NS);
    const image = await getNewImage(requestPayload, device, getImageMeta, downloadImage, suppressElementImageParseFailure);
    logger_1.logger.debug(`Got new image for ${logId}`, NS);
    // reply to `queryNextImageRequest` in `requestOTA` now that we have the data for it,
    // should trigger image block/page request from device
    await sendQueryNextImageResponse(endpoint, image, transNum);
    const waiters = {};
    let lastBlockResponseTime = 0;
    let lastUpdate = null;
    const startTime = Date.now();
    let ended = false;
    const sendImageBlockResponse = async (imageBlockRequest, pageOffset, pageSize) => {
        // Reduce network congestion by throttling response if necessary
        {
            const blockResponseTime = Date.now();
            const delay = blockResponseTime - lastBlockResponseTime;
            if (delay < IMAGE_BLOCK_RESPONSE_DELAY) {
                await (0, utils_1.sleep)(IMAGE_BLOCK_RESPONSE_DELAY - delay);
            }
            lastBlockResponseTime = blockResponseTime;
        }
        try {
            const blockPayload = getImageBlockResponsePayload(image, imageBlockRequest, pageOffset, pageSize);
            await endpoint.commandResponse('genOta', 'imageBlockResponse', blockPayload, null, imageBlockRequest.header.transactionSequenceNumber);
            pageOffset += blockPayload.dataSize;
        }
        catch (error) {
            // Shit happens, device will probably do a new imageBlockRequest so don't care.
            logger_1.logger.debug(`Image block response failed: ${error}`, NS);
        }
        lastUpdate = callOnProgress(startTime, lastUpdate, imageBlockRequest, image, onProgress);
        return pageOffset;
    };
    const sendImage = async () => {
        let imageBlockOrPageRequestTimeoutMs = 150000;
        // increase the upgradeEndReq wait time to solve the problem of OTA timeout failure of Sonoff Devices
        // (https://github.com/Koenkk/zigbee-herdsman-converters/issues/6657)
        if (requestPayload.manufacturerCode === zigbee_herdsman_1.Zcl.ManufacturerCode.SHENZHEN_COOLKIT_TECHNOLOGY_CO_LTD && requestPayload.imageType == 8199) {
            imageBlockOrPageRequestTimeoutMs = 3600000;
        }
        // Bosch transmits the firmware updates in the background in their native implementation.
        // According to the app, this can take up to 2 days. Therefore, we assume to get at least
        // one package request per hour from the device here.
        if (requestPayload.manufacturerCode == zigbee_herdsman_1.Zcl.ManufacturerCode.ROBERT_BOSCH_GMBH) {
            imageBlockOrPageRequestTimeoutMs = 60 * 60 * 1000;
        }
        // Increase the timeout for Legrand devices, so that they will re-initiate and update themselves
        // Newer firmwares have ackward behaviours when it comes to the handling of the last bytes of OTA updates
        if (requestPayload.manufacturerCode === zigbee_herdsman_1.Zcl.ManufacturerCode.LEGRAND_GROUP) {
            imageBlockOrPageRequestTimeoutMs = 30 * 60 * 1000;
        }
        while (!ended) {
            const imageBlockRequest = endpoint.waitForCommand('genOta', 'imageBlockRequest', null, imageBlockOrPageRequestTimeoutMs);
            const imagePageRequest = endpoint.waitForCommand('genOta', 'imagePageRequest', null, imageBlockOrPageRequestTimeoutMs);
            waiters.imageBlockOrPageRequest = {
                promise: Promise.race([imageBlockRequest.promise, imagePageRequest.promise]),
                cancel: () => {
                    imageBlockRequest.cancel();
                    imagePageRequest.cancel();
                },
            };
            try {
                const result = await waiters.imageBlockOrPageRequest.promise;
                let pageOffset = 0;
                let pageSize = 0;
                if ('pageSize' in result.payload) {
                    // imagePageRequest
                    pageSize = result.payload.pageSize;
                    const handleImagePageRequestBlocks = async (imagePageRequest) => {
                        if (pageOffset < pageSize) {
                            pageOffset = await sendImageBlockResponse(imagePageRequest, pageOffset, pageSize);
                            await handleImagePageRequestBlocks(imagePageRequest);
                        }
                    };
                    await handleImagePageRequestBlocks(result);
                }
                else {
                    // imageBlockRequest
                    pageOffset = await sendImageBlockResponse(result, pageOffset, pageSize);
                }
            }
            catch (error) {
                cancelWaiters(waiters);
                throw new Error(`Timeout. Device did not start/finish firmware download after being notified. (${error})`);
            }
        }
    };
    // will eventually time out in `sendImage` if this never resolves when it's supposed to
    waiters.upgradeEndRequest = endpoint.waitForCommand('genOta', 'upgradeEndRequest', null, MAX_TIMEOUT);
    logger_1.logger.debug(`Starting update`, NS);
    // `sendImage` is looping and never resolves, so will only stop before `upgradeEndRequest` resolves if it throws
    await Promise.race([sendImage(), waiters.upgradeEndRequest.promise]);
    cancelWaiters(waiters);
    ended = true;
    // already resolved when this is reached
    const endResult = await waiters.upgradeEndRequest.promise;
    logger_1.logger.debug(`Got upgrade end request for ${logId}: ${JSON.stringify(endResult.payload)}`, NS);
    if (endResult.payload.status === zigbee_herdsman_1.Zcl.Status.SUCCESS) {
        const payload = {
            manufacturerCode: image.header.manufacturerCode,
            imageType: image.header.imageType,
            fileVersion: image.header.fileVersion,
            currentTime: 0,
            upgradeTime: 1,
        };
        try {
            await endpoint.commandResponse('genOta', 'upgradeEndResponse', payload, null, endResult.header.transactionSequenceNumber);
            logger_1.logger.debug(`Update successful. Waiting for device announce...`, NS);
            onProgress(100, null);
            let timer = null;
            return await new Promise((resolve) => {
                const onDeviceAnnounce = () => {
                    clearTimeout(timer);
                    logger_1.logger.debug(`Received device announce, update finished.`, NS);
                    resolve(image.header.fileVersion);
                };
                // force "finished" after 2 minutes
                timer = setTimeout(() => {
                    device.removeListener('deviceAnnounce', onDeviceAnnounce);
                    logger_1.logger.debug(`Timed out waiting for device announce, update considered finished.`, NS);
                    resolve(image.header.fileVersion);
                }, 120 * 1000);
                device.once('deviceAnnounce', onDeviceAnnounce);
            });
        }
        catch (error) {
            throw new Error(`Upgrade end response failed: ${error}`);
        }
    }
    else {
        /**
         * For other status value received such as INVALID_IMAGE, REQUIRE_MORE_IMAGE, or ABORT,
         * the upgrade server SHALL not send Upgrade End Response command but it SHALL send default
         * response command with status of success and it SHALL wait for the client to reinitiate the upgrade process.
         */
        try {
            await endpoint.defaultResponse(zigbee_herdsman_1.Zcl.Clusters.genOta.commands.upgradeEndRequest.ID, zigbee_herdsman_1.Zcl.Status.SUCCESS, zigbee_herdsman_1.Zcl.Clusters.genOta.ID, endResult.header.transactionSequenceNumber);
        }
        catch (error) {
            logger_1.logger.debug(`Upgrade end request default response failed: ${error}`, NS);
        }
        throw new Error(`Update failed with reason: '${zigbee_herdsman_1.Zcl.Status[endResult.payload.status]}'`);
    }
}
async function getNewImage(current, device, getImageMeta, downloadImage, suppressElementImageParseFailure) {
    // TODO: better errors (these are reported in frontend notifies)
    const logId = `'${device.ieeeAddr}' (${device.modelID})`;
    const meta = await getImageMeta(current, device);
    (0, assert_1.default)(!!meta, `Images for ${logId} currently unavailable`);
    logger_1.logger.debug(`Getting new image for ${logId}, latest meta ${JSON.stringify(meta)}`, NS);
    (0, assert_1.default)(meta.fileVersion > current.fileVersion || meta.force, `No new image available`);
    const download = downloadImage ? await downloadImage(meta) : await getAxios().get(meta.url, { responseType: 'arraybuffer' });
    const checksum = meta.sha512 || meta.sha256;
    if (checksum) {
        const hash = crypto_1.default.createHash(meta.sha512 ? 'sha512' : 'sha256');
        hash.update(download.data);
        (0, assert_1.default)(hash.digest('hex') === checksum, `File checksum validation failed`);
        logger_1.logger.debug(`Update checksum validation succeeded for ${logId}`, NS);
    }
    const start = download.data.indexOf(exports.UPGRADE_FILE_IDENTIFIER);
    const image = parseImage(download.data.slice(start), suppressElementImageParseFailure);
    logger_1.logger.debug(`Get new image for ${logId}, image header ${JSON.stringify(image.header)}`, NS);
    (0, assert_1.default)(image.header.fileVersion === meta.fileVersion, `File version mismatch`);
    (0, assert_1.default)(!meta.fileSize || image.header.totalImageSize === meta.fileSize, `Image size mismatch`);
    (0, assert_1.default)(image.header.manufacturerCode === current.manufacturerCode, `Manufacturer code mismatch`);
    (0, assert_1.default)(image.header.imageType === current.imageType, `Image type mismatch`);
    if ('minimumHardwareVersion' in image.header && 'maximumHardwareVersion' in image.header) {
        (0, assert_1.default)(image.header.minimumHardwareVersion <= device.hardwareVersion && device.hardwareVersion <= image.header.maximumHardwareVersion, `Hardware version mismatch`);
    }
    validateImageData(image);
    return image;
}
exports.UPGRADE_FILE_IDENTIFIER = exports.UPGRADE_FILE_IDENTIFIER;
exports.isUpdateAvailable = isUpdateAvailable;
exports.parseImage = parseImage;
exports.validateImageData = validateImageData;
exports.isNewImageAvailable = isNewImageAvailable;
exports.updateToLatest = updateToLatest;
exports.getNewImage = getNewImage;
exports.getAxios = getAxios;
exports.isValidUrl = isValidUrl;
exports.setDataDir = setDataDir;
exports.getFirmwareFile = getFirmwareFile;
exports.readLocalFile = readLocalFile;
exports.getOverrideIndexFile = getOverrideIndexFile;
//# sourceMappingURL=common.js.map