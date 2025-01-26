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
const topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/request/device/ota_update/(update|check)/?(downgrade)?`, 'i');
class OTAUpdate extends extension_1.default {
    inProgress = new Set();
    lastChecked = {};
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
            if (this.state.get(device).update?.state === 'updating') {
                this.state.get(device).update.state = 'available';
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
        if (data.type !== 'commandQueryNextImageRequest' || !data.device.definition || this.inProgress.has(data.device.ieeeAddr))
            return;
        logger_1.default.debug(`Device '${data.device.name}' requested OTA`);
        const automaticOTACheckDisabled = settings.get().ota.disable_automatic_update_check;
        if (data.device.definition.ota && !automaticOTACheckDisabled) {
            // When a device does a next image request, it will usually do it a few times after each other
            // with only 10 - 60 seconds inbetween. It doesn't make sense to check for a new update
            // each time, so this interval can be set by the user. The default is 1,440 minutes (one day).
            const updateCheckInterval = settings.get().ota.update_check_interval * 1000 * 60;
            const check = this.lastChecked[data.device.ieeeAddr] !== undefined
                ? Date.now() - this.lastChecked[data.device.ieeeAddr] > updateCheckInterval
                : true;
            if (!check)
                return;
            this.lastChecked[data.device.ieeeAddr] = Date.now();
            let availableResult;
            try {
                // never use 'previous' when responding to device request
                availableResult = await zigbee_herdsman_converters_1.ota.isUpdateAvailable(data.device.zh, data.device.otaExtraMetas, data.data, false);
            }
            catch (error) {
                logger_1.default.debug(`Failed to check if update available for '${data.device.name}' (${error})`);
            }
            await this.publishEntityState(data.device, this.getEntityPublishPayload(data.device, availableResult ?? 'idle'));
            if (availableResult?.available) {
                const message = `Update available for '${data.device.name}'`;
                logger_1.default.info(message);
            }
        }
        // Respond to stop the client from requesting OTAs
        const endpoint = data.device.zh.endpoints.find((e) => e.supportsOutputCluster('genOta')) || data.endpoint;
        await endpoint.commandResponse('genOta', 'queryNextImageResponse', { status: zigbee_herdsman_1.Zcl.Status.NO_IMAGE_AVAILABLE }, undefined, data.meta.zclTransactionSequenceNumber);
        logger_1.default.debug(`Responded to OTA request of '${data.device.name}' with 'NO_IMAGE_AVAILABLE'`);
    }
    async readSoftwareBuildIDAndDateCode(device, sendPolicy) {
        try {
            const endpoint = device.zh.endpoints.find((e) => e.supportsInputCluster('genBasic'));
            (0, node_assert_1.default)(endpoint);
            const result = await endpoint.read('genBasic', ['dateCode', 'swBuildId'], { sendPolicy });
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
                state: typeof state === 'string' ? state : state.available ? 'available' : 'idle',
                installed_version: typeof state === 'string' ? deviceUpdateState?.installed_version : state.currentFileVersion,
                latest_version: typeof state === 'string' ? deviceUpdateState?.latest_version : state.otaFileVersion,
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
        const topicMatch = data.topic.match(topicRegex);
        if (!topicMatch) {
            return;
        }
        const message = utils_1.default.parseJSON(data.message, data.message);
        const ID = (typeof message === 'object' && message['id'] !== undefined ? message.id : message);
        const device = this.zigbee.resolveEntity(ID);
        const type = topicMatch[1];
        const downgrade = Boolean(topicMatch[2]);
        let error;
        let errorStack;
        if (!(device instanceof device_1.default)) {
            error = `Device '${ID}' does not exist`;
        }
        else if (!device.definition || !device.definition.ota) {
            error = `Device '${device.name}' does not support OTA updates`;
        }
        else if (this.inProgress.has(device.ieeeAddr)) {
            error = `Update or check for update already in progress for '${device.name}'`;
        }
        else {
            this.inProgress.add(device.ieeeAddr);
            if (type === 'check') {
                const msg = `Checking if update available for '${device.name}'`;
                logger_1.default.info(msg);
                try {
                    const availableResult = await zigbee_herdsman_converters_1.ota.isUpdateAvailable(device.zh, device.otaExtraMetas, undefined, downgrade);
                    const msg = `${availableResult.available ? 'Update' : 'No update'} available for '${device.name}'`;
                    logger_1.default.info(msg);
                    await this.publishEntityState(device, this.getEntityPublishPayload(device, availableResult));
                    this.lastChecked[device.ieeeAddr] = Date.now();
                    const response = utils_1.default.getResponse(message, {
                        id: ID,
                        update_available: availableResult.available,
                    });
                    await this.mqtt.publish(`bridge/response/device/ota_update/check`, (0, json_stable_stringify_without_jsonify_1.default)(response));
                }
                catch (e) {
                    error = `Failed to check if update available for '${device.name}' (${e.message})`;
                    errorStack = e.stack;
                }
            }
            else {
                // type === 'update'
                const msg = `Updating '${device.name}' to ${downgrade ? 'previous' : 'latest'} firmware`;
                logger_1.default.info(msg);
                try {
                    const firmwareFrom = await this.readSoftwareBuildIDAndDateCode(device, 'immediate');
                    const fileVersion = await zigbee_herdsman_converters_1.ota.update(device.zh, device.otaExtraMetas, downgrade, async (progress, remaining) => {
                        let msg = `Update of '${device.name}' at ${progress.toFixed(2)}%`;
                        if (remaining) {
                            msg += `, ≈ ${Math.round(remaining / 60)} minutes remaining`;
                        }
                        logger_1.default.info(msg);
                        await this.publishEntityState(device, this.getEntityPublishPayload(device, 'updating', progress, remaining ?? undefined));
                    });
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
                    await this.mqtt.publish(`bridge/response/device/ota_update/update`, (0, json_stable_stringify_without_jsonify_1.default)(response));
                }
                catch (e) {
                    logger_1.default.debug(`Update of '${device.name}' failed (${e})`);
                    error = `Update of '${device.name}' failed (${e.message})`;
                    errorStack = e.stack;
                    this.removeProgressAndRemainingFromState(device);
                    await this.publishEntityState(device, this.getEntityPublishPayload(device, 'available'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RhVXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9vdGFVcGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSw4REFBaUM7QUFDakMsMERBQTZCO0FBRTdCLG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFFOUQscURBQW9DO0FBQ3BDLDJFQUErQztBQUUvQyw2REFBcUM7QUFDckMsd0RBQW1DO0FBQ25DLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQWFwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxnRUFBZ0UsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUV2SSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7SUFDcEMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdkIsV0FBVyxHQUEwQixFQUFFLENBQUM7SUFFdkMsS0FBSyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXhELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDdkMsNkRBQTZEO1FBQzdELElBQUkscUJBQXFCLEdBQUcsV0FBVyxDQUFDLGtDQUFrQyxDQUFDO1FBRTNFLHlGQUF5RjtRQUN6RixJQUFJLHFCQUFxQixJQUFJLENBQUMsZ0NBQUcsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLG1CQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztZQUM3RyxxQkFBcUIsR0FBRyxjQUFPLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELHFHQUFxRztRQUNyRyxnQ0FBRyxDQUFDLGdCQUFnQixDQUFDO1lBQ2pCLE9BQU8sRUFBRSxjQUFPLENBQUMsT0FBTyxFQUFFO1lBQzFCLHFCQUFxQjtZQUNyQixxQkFBcUI7WUFDckIsdUJBQXVCLEVBQUUsV0FBVyxDQUFDLDBCQUEwQjtZQUMvRCxzQkFBc0IsRUFBRSxXQUFXLENBQUMseUJBQXlCO1NBQ2hFLENBQUMsQ0FBQztRQUVILG1IQUFtSDtRQUNuSCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQUssQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7WUFDM0UsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWpELDZEQUE2RDtZQUM3RCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLG1DQUFtQyxDQUFDLE1BQWM7UUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckIsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNuQyxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3hDLENBQUM7SUFDTCxDQUFDO0lBRW1CLEFBQU4sS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUE2QjtRQUMzRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssOEJBQThCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUFFLE9BQU87UUFDakksZ0JBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQztRQUUzRCxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUM7UUFFcEYsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQzNELDhGQUE4RjtZQUM5Rix1RkFBdUY7WUFDdkYsOEZBQThGO1lBQzlGLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2pGLE1BQU0sS0FBSyxHQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxTQUFTO2dCQUNoRCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxtQkFBbUI7Z0JBQzNFLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDZixJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBRW5CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDcEQsSUFBSSxlQUFzRCxDQUFDO1lBRTNELElBQUksQ0FBQztnQkFDRCx5REFBeUQ7Z0JBQ3pELGVBQWUsR0FBRyxNQUFNLGdDQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEksQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsZUFBZSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFakgsSUFBSSxlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sT0FBTyxHQUFHLHlCQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUM3RCxnQkFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixDQUFDO1FBQ0wsQ0FBQztRQUVELGtEQUFrRDtRQUNsRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzFHLE1BQU0sUUFBUSxDQUFDLGVBQWUsQ0FDMUIsUUFBUSxFQUNSLHdCQUF3QixFQUN4QixFQUFDLE1BQU0sRUFBRSxxQkFBRyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBQyxFQUN2QyxTQUFTLEVBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FDekMsQ0FBQztRQUNGLGdCQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksNkJBQTZCLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRU8sS0FBSyxDQUFDLDhCQUE4QixDQUN4QyxNQUFjLEVBQ2QsVUFBd0I7UUFFeEIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNyRixJQUFBLHFCQUFNLEVBQUMsUUFBUSxDQUFDLENBQUM7WUFDakIsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDeEYsT0FBTyxFQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFDLENBQUM7UUFDMUUsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNMLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBRU8sdUJBQXVCLENBQzNCLE1BQWMsRUFDZCxLQUE4QyxFQUM5QyxRQUFpQixFQUNqQixTQUFrQjtRQUVsQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN4RCxNQUFNLE9BQU8sR0FBa0I7WUFDM0IsTUFBTSxFQUFFO2dCQUNKLEtBQUssRUFBRSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUNqRixpQkFBaUIsRUFBRSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCO2dCQUM5RyxjQUFjLEVBQUUsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjO2FBQ3ZHO1NBQ0osQ0FBQztRQUVGLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVXLEFBQU4sS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUEyQjtRQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLGVBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUllLENBQUM7UUFDMUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFXLENBQUM7UUFDekcsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0MsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxJQUFJLEtBQXlCLENBQUM7UUFDOUIsSUFBSSxVQUE4QixDQUFDO1FBRW5DLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxnQkFBTSxDQUFDLEVBQUUsQ0FBQztZQUM5QixLQUFLLEdBQUcsV0FBVyxFQUFFLGtCQUFrQixDQUFDO1FBQzVDLENBQUM7YUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEQsS0FBSyxHQUFHLFdBQVcsTUFBTSxDQUFDLElBQUksZ0NBQWdDLENBQUM7UUFDbkUsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDOUMsS0FBSyxHQUFHLHVEQUF1RCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDbEYsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckMsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sR0FBRyxHQUFHLHFDQUFxQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQ2hFLGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVqQixJQUFJLENBQUM7b0JBQ0QsTUFBTSxlQUFlLEdBQUcsTUFBTSxnQ0FBRyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzNHLE1BQU0sR0FBRyxHQUFHLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLG1CQUFtQixNQUFNLENBQUMsSUFBSSxHQUFHLENBQUM7b0JBQ25HLGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUVqQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUU3RixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQy9DLE1BQU0sUUFBUSxHQUFHLGVBQUssQ0FBQyxXQUFXLENBQTRDLE9BQU8sRUFBRTt3QkFDbkYsRUFBRSxFQUFFLEVBQUU7d0JBQ04sZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLFNBQVM7cUJBQzlDLENBQUMsQ0FBQztvQkFFSCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxFQUFFLElBQUEsK0NBQVMsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1RixDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1QsS0FBSyxHQUFHLDRDQUE0QyxNQUFNLENBQUMsSUFBSSxNQUFPLENBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQztvQkFDN0YsVUFBVSxHQUFJLENBQVcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3BDLENBQUM7WUFDTCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osb0JBQW9CO2dCQUNwQixNQUFNLEdBQUcsR0FBRyxhQUFhLE1BQU0sQ0FBQyxJQUFJLFFBQVEsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsV0FBVyxDQUFDO2dCQUN6RixnQkFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFakIsSUFBSSxDQUFDO29CQUNELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDcEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQ0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUU7d0JBQzNHLElBQUksR0FBRyxHQUFHLGNBQWMsTUFBTSxDQUFDLElBQUksUUFBUSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBRWxFLElBQUksU0FBUyxFQUFFLENBQUM7NEJBQ1osR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO3dCQUNqRSxDQUFDO3dCQUVELGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUVqQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUM5SCxDQUFDLENBQUMsQ0FBQztvQkFFSCxnQkFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDakQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQ3pCLE1BQU0sRUFDTixJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQ3pILENBQUM7b0JBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRXJFLGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsTUFBTSxDQUFDLElBQUksdUJBQXVCLElBQUEsK0NBQVMsRUFBQyxZQUFZLENBQUMsU0FBUyxJQUFBLCtDQUFTLEVBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUV6SDs7O3VCQUdHO29CQUNILElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUVuQyxNQUFNLFFBQVEsR0FBRyxlQUFLLENBQUMsV0FBVyxDQUE2QyxPQUFPLEVBQUU7d0JBQ3BGLEVBQUUsRUFBRSxFQUFFO3dCQUNOLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLGVBQWUsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO3dCQUNwSCxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztxQkFDL0csQ0FBQyxDQUFDO29CQUVILE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMENBQTBDLEVBQUUsSUFBQSwrQ0FBUyxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDVCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekQsS0FBSyxHQUFHLGNBQWMsTUFBTSxDQUFDLElBQUksYUFBYyxDQUFXLENBQUMsT0FBTyxHQUFHLENBQUM7b0JBQ3RFLFVBQVUsR0FBSSxDQUFXLENBQUMsS0FBSyxDQUFDO29CQUVoQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2pELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1IsTUFBTSxRQUFRLEdBQUcsZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXZELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUNBQXFDLElBQUksRUFBRSxFQUFFLElBQUEsK0NBQVMsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzFGLGdCQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBCLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2IsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0IsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUEzUEQsNEJBMlBDO0FBN011QjtJQUFuQix3QkFBSTs4Q0E2Q0o7QUEwQ1c7SUFBWCx3QkFBSTs4Q0FxSEoifQ==