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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const node_assert_1 = __importDefault(require("node:assert"));
const node_path_1 = __importDefault(require("node:path"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const device_1 = __importDefault(require("../model/device"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
class OTAUpdate extends extension_1.default {
    #topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/device/ota_update/(update|check|schedule|unschedule)/?(downgrade)?`, "i");
    inProgress = new Set();
    lastChecked = new Map();
    scheduledUpgrades = new Set();
    scheduledDowngrades = new Set();
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        this.eventBus.onDeviceMessage(this, this.onZigbeeEvent);
        const otaSettings = settings.get().ota;
        // Let OTA module know if the override index file is provided
        let overrideIndexLocation = otaSettings.zigbee_ota_override_index_location;
        // If the file name is not a full path, then treat it as a relative to the data directory
        if (overrideIndexLocation && !zigbee_herdsman_converters_1.ota.isValidUrl(overrideIndexLocation) && !node_path_1.default.isAbsolute(overrideIndexLocation)) {
            overrideIndexLocation = data_1.default.joinPath(overrideIndexLocation);
        }
        // In order to support local firmware files we need to let zigbeeOTA know where the data directory is
        zigbee_herdsman_converters_1.ota.setConfiguration({
            dataDir: data_1.default.getPath(),
            overrideIndexLocation,
            // TODO: implement me
            imageBlockResponseDelay: otaSettings.image_block_response_delay,
            defaultMaximumDataSize: otaSettings.default_maximum_data_size,
        });
        // In case Zigbee2MQTT is restared during an update, progress and remaining values are still in state, remove them.
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            this.removeProgressAndRemainingFromState(device);
            // Reset update state, e.g. when Z2M restarted during update.
            if (this.state.get(device).update?.state === "updating") {
                this.state.get(device).update.state = "available";
            }
        }
    }
    removeProgressAndRemainingFromState(device) {
        const deviceState = this.state.get(device);
        if (deviceState.update) {
            delete deviceState.update.progress;
            delete deviceState.update.remaining;
        }
    }
    async onZigbeeEvent(data) {
        if (data.type !== "commandQueryNextImageRequest" || !data.device.definition || this.inProgress.has(data.device.ieeeAddr)) {
            return;
        }
        // `commandQueryNextImageRequest` check above should ensures this is valid but...
        (0, node_assert_1.default)(data.meta.zclTransactionSequenceNumber !== undefined, "Missing 'queryNextImageRequest' transaction sequence number (cannot match reply)");
        logger_1.default.debug(`Device '${data.device.name}' requested OTA`);
        if (data.device.definition.ota) {
            if (this.scheduledUpgrades.has(data.device.ieeeAddr) || this.scheduledDowngrades.has(data.device.ieeeAddr)) {
                this.inProgress.add(data.device.ieeeAddr);
                logger_1.default.info(`Updating '${data.device.name}' to latest firmware`);
                try {
                    const fileVersion = await zigbee_herdsman_converters_1.ota.update(data.device.zh, data.device.otaExtraMetas, this.scheduledDowngrades.has(data.device.ieeeAddr), async (progress, remaining) => {
                        let msg = `Update of '${data.device.name}' at ${progress.toFixed(2)}%`;
                        if (remaining) {
                            msg += `, ≈ ${Math.round(remaining / 60)} minutes remaining`;
                        }
                        logger_1.default.info(msg);
                        await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, "updating", progress, remaining ?? undefined));
                    }, data.data, data.meta.zclTransactionSequenceNumber);
                    // remove right away on update success or no image in case any of the below calls fail
                    this.scheduledUpgrades.delete(data.device.ieeeAddr);
                    this.scheduledDowngrades.delete(data.device.ieeeAddr);
                    if (fileVersion === undefined) {
                        logger_1.default.info(`No image currently available for '${data.device.name}'. Unscheduling.`);
                        // XXX: superfluous?
                        this.removeProgressAndRemainingFromState(data.device);
                        await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, "idle"));
                        this.inProgress.delete(data.device.ieeeAddr);
                        return;
                    }
                    logger_1.default.info(`Finished update of '${data.device.name}'`);
                    this.removeProgressAndRemainingFromState(data.device);
                    await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, { available: false, currentFileVersion: fileVersion, otaFileVersion: fileVersion }));
                    const firmwareTo = await this.readSoftwareBuildIDAndDateCode(data.device);
                    logger_1.default.info(() => `Device '${data.device.name}' was updated to '${(0, json_stable_stringify_without_jsonify_1.default)(firmwareTo)}'`);
                    /**
                     * Re-configure after reading software build ID and date code, some devices use a
                     * custom attribute for this (e.g. Develco SMSZB-120)
                     */
                    this.eventBus.emitReconfigure({ device: data.device });
                    this.eventBus.emitDevicesChanged();
                }
                catch (e) {
                    logger_1.default.debug(`Update of '${data.device.name}' failed (${e}). Retry scheduled for next request.`);
                    this.removeProgressAndRemainingFromState(data.device);
                    await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, "scheduled"));
                }
                this.inProgress.delete(data.device.ieeeAddr);
                return; // we're done
            }
            if (!settings.get().ota.disable_automatic_update_check) {
                // When a device does a next image request, it will usually do it a few times after each other
                // with only 10 - 60 seconds inbetween. It doesn't make sense to check for a new update
                // each time, so this interval can be set by the user. The default is 1,440 minutes (one day).
                const updateCheckInterval = settings.get().ota.update_check_interval * 1000 * 60;
                const deviceLastChecked = this.lastChecked.get(data.device.ieeeAddr);
                const check = deviceLastChecked !== undefined ? Date.now() - deviceLastChecked > updateCheckInterval : true;
                if (!check) {
                    return;
                }
                this.inProgress.add(data.device.ieeeAddr);
                this.lastChecked.set(data.device.ieeeAddr, Date.now());
                let availableResult;
                try {
                    // never use 'previous' when responding to device request
                    availableResult = await zigbee_herdsman_converters_1.ota.isUpdateAvailable(data.device.zh, data.device.otaExtraMetas, data.data, false);
                }
                catch (error) {
                    logger_1.default.debug(`Failed to check if update available for '${data.device.name}' (${error})`);
                }
                await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, availableResult ?? "idle"));
                if (availableResult?.available) {
                    const message = `Update available for '${data.device.name}'`;
                    logger_1.default.info(message);
                }
            }
        }
        // Respond to stop the client from requesting OTAs
        const endpoint = data.device.zh.endpoints.find((e) => e.supportsOutputCluster("genOta")) || data.endpoint;
        await endpoint.commandResponse("genOta", "queryNextImageResponse", { status: zigbee_herdsman_1.Zcl.Status.NO_IMAGE_AVAILABLE }, undefined, data.meta.zclTransactionSequenceNumber);
        logger_1.default.debug(`Responded to OTA request of '${data.device.name}' with 'NO_IMAGE_AVAILABLE'`);
        this.inProgress.delete(data.device.ieeeAddr);
    }
    async readSoftwareBuildIDAndDateCode(device, sendPolicy) {
        try {
            const endpoint = device.zh.endpoints.find((e) => e.supportsInputCluster("genBasic"));
            (0, node_assert_1.default)(endpoint);
            const result = await endpoint.read("genBasic", ["dateCode", "swBuildId"], { sendPolicy });
            return { softwareBuildID: result.swBuildId, dateCode: result.dateCode };
        }
        catch {
            return undefined;
        }
    }
    getEntityPublishPayload(device, state, progress, remaining) {
        const deviceUpdateState = this.state.get(device).update;
        const payload = {
            update: {
                state: typeof state === "string" ? state : state.available ? "available" : "idle",
                installed_version: typeof state === "string" ? deviceUpdateState?.installed_version : state.currentFileVersion,
                latest_version: typeof state === "string" ? deviceUpdateState?.latest_version : state.otaFileVersion,
            },
        };
        if (progress !== undefined) {
            payload.update.progress = progress;
        }
        if (remaining !== undefined) {
            payload.update.remaining = Math.round(remaining);
        }
        return payload;
    }
    async onMQTTMessage(data) {
        const topicMatch = data.topic.match(this.#topicRegex);
        if (!topicMatch) {
            return;
        }
        const message = utils_1.default.parseJSON(data.message, data.message);
        const ID = (typeof message === "object" && message.id !== undefined ? message.id : message);
        const device = this.zigbee.resolveEntity(ID);
        const type = topicMatch[1];
        const downgrade = topicMatch[2] === "downgrade";
        let error;
        let errorStack;
        if (!(device instanceof device_1.default)) {
            error = `Device '${ID}' does not exist`;
        }
        else if (!device.definition || !device.definition.ota) {
            error = `Device '${device.name}' does not support OTA updates`;
        }
        else if (this.inProgress.has(device.ieeeAddr)) {
            // also guards against scheduling while check/update op in progress that could result in undesired OTA state
            error = `Update or check for update already in progress for '${device.name}'`;
        }
        else {
            switch (type) {
                case "check": {
                    this.inProgress.add(device.ieeeAddr);
                    logger_1.default.info(`Checking if update available for '${device.name}'`);
                    try {
                        const availableResult = await zigbee_herdsman_converters_1.ota.isUpdateAvailable(device.zh, device.otaExtraMetas, undefined, downgrade);
                        logger_1.default.info(`${availableResult.available ? "Update" : "No update"} available for '${device.name}'`);
                        await this.publishEntityState(device, this.getEntityPublishPayload(device, availableResult));
                        this.lastChecked.set(device.ieeeAddr, Date.now());
                        const response = utils_1.default.getResponse(message, {
                            id: ID,
                            update_available: availableResult.available,
                        });
                        await this.mqtt.publish("bridge/response/device/ota_update/check", (0, json_stable_stringify_without_jsonify_1.default)(response));
                    }
                    catch (e) {
                        error = `Failed to check if update available for '${device.name}' (${e.message})`;
                        errorStack = e.stack;
                    }
                    break;
                }
                case "update": {
                    this.inProgress.add(device.ieeeAddr);
                    if (this.scheduledUpgrades.delete(device.ieeeAddr)) {
                        logger_1.default.info(`Previously scheduled '${device.name}' upgrade was cancelled by manual update`);
                    }
                    else if (this.scheduledDowngrades.delete(device.ieeeAddr)) {
                        logger_1.default.info(`Previously scheduled '${device.name}' downgrade was cancelled by manual update`);
                    }
                    logger_1.default.info(`Updating '${device.name}' to ${downgrade ? "previous" : "latest"} firmware`);
                    try {
                        const firmwareFrom = await this.readSoftwareBuildIDAndDateCode(device, "immediate");
                        const fileVersion = await zigbee_herdsman_converters_1.ota.update(device.zh, device.otaExtraMetas, downgrade, async (progress, remaining) => {
                            let msg = `Update of '${device.name}' at ${progress.toFixed(2)}%`;
                            if (remaining) {
                                msg += `, ≈ ${Math.round(remaining / 60)} minutes remaining`;
                            }
                            logger_1.default.info(msg);
                            await this.publishEntityState(device, this.getEntityPublishPayload(device, "updating", progress, remaining ?? undefined));
                        });
                        if (fileVersion === undefined) {
                            throw new Error("No image currently available");
                        }
                        logger_1.default.info(`Finished update of '${device.name}'`);
                        this.removeProgressAndRemainingFromState(device);
                        await this.publishEntityState(device, this.getEntityPublishPayload(device, { available: false, currentFileVersion: fileVersion, otaFileVersion: fileVersion }));
                        const firmwareTo = await this.readSoftwareBuildIDAndDateCode(device);
                        logger_1.default.info(() => `Device '${device.name}' was updated from '${(0, json_stable_stringify_without_jsonify_1.default)(firmwareFrom)}' to '${(0, json_stable_stringify_without_jsonify_1.default)(firmwareTo)}'`);
                        /**
                         * Re-configure after reading software build ID and date code, some devices use a
                         * custom attribute for this (e.g. Develco SMSZB-120)
                         */
                        this.eventBus.emitReconfigure({ device });
                        this.eventBus.emitDevicesChanged();
                        const response = utils_1.default.getResponse(message, {
                            id: ID,
                            from: firmwareFrom ? { software_build_id: firmwareFrom.softwareBuildID, date_code: firmwareFrom.dateCode } : undefined,
                            to: firmwareTo ? { software_build_id: firmwareTo.softwareBuildID, date_code: firmwareTo.dateCode } : undefined,
                        });
                        await this.mqtt.publish("bridge/response/device/ota_update/update", (0, json_stable_stringify_without_jsonify_1.default)(response));
                    }
                    catch (e) {
                        logger_1.default.debug(`Update of '${device.name}' failed (${e})`);
                        error = `Update of '${device.name}' failed (${e.message})`;
                        errorStack = e.stack;
                        this.removeProgressAndRemainingFromState(device);
                        await this.publishEntityState(device, this.getEntityPublishPayload(device, "available"));
                    }
                    break;
                }
                case "schedule": {
                    // ensure only one type scheduled by deleting from the other if necessary
                    if (downgrade) {
                        if (this.scheduledUpgrades.delete(device.ieeeAddr)) {
                            logger_1.default.info(`Previously scheduled '${device.name}' upgrade was cancelled in favor of new downgrade request`);
                        }
                        this.scheduledDowngrades.add(device.ieeeAddr);
                    }
                    else {
                        if (this.scheduledDowngrades.delete(device.ieeeAddr)) {
                            logger_1.default.info(`Previously scheduled '${device.name}' downgrade was cancelled in favor of new upgrade request`);
                        }
                        this.scheduledUpgrades.add(device.ieeeAddr);
                    }
                    logger_1.default.info(`Scheduled '${device.name}' to ${downgrade ? "downgrade" : "upgrade"} firmware on next request from device`);
                    await this.publishEntityState(device, this.getEntityPublishPayload(device, "scheduled", undefined, undefined));
                    const response = utils_1.default.getResponse(message, {
                        id: ID,
                    });
                    await this.mqtt.publish("bridge/response/device/ota_update/schedule", (0, json_stable_stringify_without_jsonify_1.default)(response));
                    break;
                }
                case "unschedule": {
                    if (this.scheduledUpgrades.delete(device.ieeeAddr)) {
                        logger_1.default.info(`Previously scheduled '${device.name}' upgrade was cancelled`);
                    }
                    else if (this.scheduledDowngrades.delete(device.ieeeAddr)) {
                        logger_1.default.info(`Previously scheduled '${device.name}' downgrade was cancelled`);
                    }
                    await this.publishEntityState(device, this.getEntityPublishPayload(device, "idle", undefined, undefined));
                    const response = utils_1.default.getResponse(message, {
                        id: ID,
                    });
                    await this.mqtt.publish("bridge/response/device/ota_update/unschedule", (0, json_stable_stringify_without_jsonify_1.default)(response));
                    break;
                }
            }
            this.inProgress.delete(device.ieeeAddr);
        }
        if (error) {
            const response = utils_1.default.getResponse(message, {}, error);
            await this.mqtt.publish(`bridge/response/device/ota_update/${type}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
            logger_1.default.error(error);
            if (errorStack) {
                logger_1.default.debug(errorStack);
            }
        }
    }
}
exports.default = OTAUpdate;
__decorate([
    bind_decorator_1.default
], OTAUpdate.prototype, "onZigbeeEvent", null);
__decorate([
    bind_decorator_1.default
], OTAUpdate.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RhVXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9vdGFVcGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4REFBaUM7QUFDakMsMERBQTZCO0FBQzdCLG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFDOUQscURBQW9DO0FBRXBDLDJFQUErQztBQUMvQyw2REFBcUM7QUFFckMsd0RBQW1DO0FBQ25DLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQWNwQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7SUFDNUMsV0FBVyxHQUFHLElBQUksTUFBTSxDQUNwQixJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxvRkFBb0YsRUFDdEgsR0FBRyxDQUNOLENBQUM7SUFDTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUMvQixXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7SUFDeEMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUN0QyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBRWhELDZDQUE2QztJQUNwQyxLQUFLLENBQUMsS0FBSztRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUN2Qyw2REFBNkQ7UUFDN0QsSUFBSSxxQkFBcUIsR0FBRyxXQUFXLENBQUMsa0NBQWtDLENBQUM7UUFFM0UseUZB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