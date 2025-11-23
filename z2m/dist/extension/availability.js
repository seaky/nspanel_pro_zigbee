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
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const debounce_1 = __importDefault(require("debounce"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const RETRIEVE_ON_RECONNECT = [
    { keys: ["state"] },
    { keys: ["brightness"], condition: (state) => state.state === "ON" },
    { keys: ["color", "color_temp"], condition: (state) => state.state === "ON" },
];
class Availability extends extension_1.default {
    /** Mapped by IEEE address */
    timers = new Map();
    /** Mapped by IEEE address or Group ID */
    lastPublishedAvailabilities = new Map();
    /** Mapped by IEEE address */
    pingBackoffs = new Map();
    /** IEEE addresses, waiting for last seen changes to take them out of "availability sleep" */
    backoffPausedDevices = new Set();
    /** Mapped by IEEE address */
    retrieveStateDebouncers = new Map();
    pingQueue = [];
    pingQueueExecuting = false;
    stopped = false;
    getTimeout(device) {
        if (typeof device.options.availability === "object" && device.options.availability?.timeout != null) {
            return utils_1.default.minutes(device.options.availability.timeout);
        }
        return utils_1.default.minutes(this.isActiveDevice(device) ? settings.get().availability.active.timeout : settings.get().availability.passive.timeout);
    }
    getMaxJitter(device) {
        if (typeof device.options.availability === "object" && device.options.availability?.max_jitter != null) {
            return device.options.availability.max_jitter;
        }
        return settings.get().availability.active.max_jitter;
    }
    getBackoff(device) {
        if (typeof device.options.availability === "object" && device.options.availability?.backoff != null) {
            return device.options.availability.backoff;
        }
        return settings.get().availability.active.backoff;
    }
    getPauseOnBackoffGt(device) {
        if (typeof device.options.availability === "object" && device.options.availability?.pause_on_backoff_gt != null) {
            return device.options.availability.pause_on_backoff_gt;
        }
        return settings.get().availability.active.pause_on_backoff_gt;
    }
    isActiveDevice(device) {
        return ((device.zh.type === "Router" && device.zh.powerSource !== "Battery") ||
            (device.zh.powerSource !== undefined && device.zh.powerSource !== "Unknown" && device.zh.powerSource !== "Battery"));
    }
    isAvailable(entity) {
        if (entity.isDevice()) {
            const lastSeen = entity.zh.lastSeen ?? /* v8 ignore next */ 0;
            return Date.now() - lastSeen < this.getTimeout(entity);
        }
        for (const memberDevice of entity.membersDevices()) {
            if (this.lastPublishedAvailabilities.get(memberDevice.ieeeAddr) === true) {
                return true;
            }
        }
        return false;
    }
    resetTimer(device, resetBackoff = false) {
        clearTimeout(this.timers.get(device.ieeeAddr));
        this.removeFromPingQueue(device);
        // If the timer triggers, the device is not available anymore otherwise resetTimer already has been called
        if (this.isActiveDevice(device)) {
            const backoffEnabled = this.getBackoff(device);
            const jitter = Math.random() * this.getMaxJitter(device);
            let backoff = 1;
            if (resetBackoff) {
                // always cleanup even if backoff disabled (ensures proper state if changed at runtime)
                this.backoffPausedDevices.delete(device.ieeeAddr);
                this.pingBackoffs.delete(device.ieeeAddr);
            }
            else if (backoffEnabled) {
                backoff = this.pingBackoffs.get(device.ieeeAddr) ?? 1;
            }
            // never paused if was reset (just deleted) or backoff disabled, might as well skip the Set lookup
            if (!backoffEnabled || resetBackoff || !this.backoffPausedDevices.has(device.ieeeAddr)) {
                // If device did not check in, ping it, if that fails it will be marked as offline
                this.timers.set(device.ieeeAddr, setTimeout(this.addToPingQueue.bind(this, device), (this.getTimeout(device) + utils_1.default.seconds(1) + jitter) * backoff));
            }
        }
        else {
            this.timers.set(device.ieeeAddr, setTimeout(this.publishAvailability.bind(this, device, true), this.getTimeout(device) + utils_1.default.seconds(1)));
        }
    }
    clearTimer(ieeeAddress) {
        clearTimeout(this.timers.get(ieeeAddress));
        this.timers.delete(ieeeAddress);
    }
    addToPingQueue(device) {
        this.pingQueue.push(device);
        this.pingQueueExecuteNext().catch(utils_1.default.noop);
    }
    removeFromPingQueue(device) {
        const index = this.pingQueue.findIndex((d) => d.ieeeAddr === device.ieeeAddr);
        if (index !== -1) {
            this.pingQueue.splice(index, 1);
        }
    }
    async pingQueueExecuteNext() {
        if (this.pingQueue.length === 0 || this.pingQueueExecuting) {
            return;
        }
        this.pingQueueExecuting = true;
        const device = this.pingQueue[0];
        let pingSuccess = false;
        const available = this.lastPublishedAvailabilities.get(device.ieeeAddr) || this.isAvailable(device);
        const attempts = available ? 2 : 1;
        for (let i = 1; i <= attempts; i++) {
            try {
                // Enable recovery if device is marked as available and first ping fails.
                await device.zh.ping(!available || i !== 2);
                pingSuccess = true;
                logger_1.default.debug(`Successfully pinged '${device.name}' (attempt ${i}/${attempts})`);
                break;
            }
            catch (error) {
                logger_1.default.warning(`Failed to ping '${device.name}' (attempt ${i}/${attempts}, ${error.message})`);
                // Try again in 3 seconds.
                if (i !== attempts) {
                    await utils_1.default.sleep(3);
                }
            }
        }
        if (this.stopped) {
            // Exit here to avoid triggering any follow-up activity (e.g., re-queuing another ping attempt).
            return;
        }
        if (!pingSuccess && this.getBackoff(device)) {
            const currentBackoff = this.pingBackoffs.get(device.ieeeAddr) ?? 1;
            // setting is "greater than" but since we already did the ping, we use ">=" for comparison below (pause next)
            const pauseOnBackoff = this.getPauseOnBackoffGt(device);
            if (pauseOnBackoff > 0 && currentBackoff >= pauseOnBackoff) {
                this.backoffPausedDevices.add(device.ieeeAddr);
            }
            else {
                // results in backoffs: *1.5, *3, *6, *12... (with default timeout: 10, 15, 30, 60, 120)
                this.pingBackoffs.set(device.ieeeAddr, currentBackoff * (available ? 1.5 : 2));
            }
        }
        await this.publishAvailability(device, !pingSuccess);
        this.resetTimer(device, pingSuccess);
        this.removeFromPingQueue(device);
        // Sleep 2 seconds before executing next ping
        await utils_1.default.sleep(2);
        this.pingQueueExecuting = false;
        await this.pingQueueExecuteNext();
    }
    async start() {
        if (this.stopped) {
            throw new Error("This extension cannot be restarted.");
        }
        this.eventBus.onEntityRenamed(this, async (data) => {
            if (utils_1.default.isAvailabilityEnabledForEntity(data.entity, settings.get())) {
                await this.mqtt.publish(`${data.from}/availability`, "", { clientOptions: { retain: true, qos: 1 } });
                await this.publishAvailability(data.entity, false, true);
            }
        });
        this.eventBus.onEntityRemoved(this, (data) => data.entity.isDevice() && this.clearTimer(data.entity.ID));
        this.eventBus.onDeviceLeave(this, (data) => this.clearTimer(data.ieeeAddr));
        this.eventBus.onDeviceAnnounce(this, (data) => this.retrieveState(data.device));
        this.eventBus.onLastSeenChanged(this, this.onLastSeenChanged);
        this.eventBus.onGroupMembersChanged(this, (data) => this.publishAvailability(data.group, false));
        // Publish initial availability
        await this.publishAvailabilityForAllEntities();
        // Start availability for the devices
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            if (utils_1.default.isAvailabilityEnabledForEntity(device, settings.get())) {
                this.resetTimer(device);
                // If an active device is unavailable on start, add it to the pingqueue immediately.
                if (this.isActiveDevice(device) && !this.isAvailable(device)) {
                    this.addToPingQueue(device);
                }
            }
        }
    }
    async publishAvailabilityForAllEntities() {
        for (const entity of this.zigbee.devicesAndGroupsIterator(utils_1.default.deviceNotCoordinator)) {
            if (utils_1.default.isAvailabilityEnabledForEntity(entity, settings.get())) {
                await this.publishAvailability(entity, true, false, true);
            }
        }
    }
    async publishAvailability(entity, logLastSeen, forcePublish = false, skipGroups = false) {
        if (logLastSeen && entity.isDevice()) {
            const ago = Date.now() - (entity.zh.lastSeen ?? /* v8 ignore next */ 0);
            if (this.isActiveDevice(entity)) {
                logger_1.default.debug(`Active device '${entity.name}' was last seen '${(ago / utils_1.default.minutes(1)).toFixed(2)}' minutes ago.`);
            }
            else {
                logger_1.default.debug(`Passive device '${entity.name}' was last seen '${(ago / utils_1.default.hours(1)).toFixed(2)}' hours ago.`);
            }
        }
        const available = this.isAvailable(entity);
        if (!forcePublish && this.lastPublishedAvailabilities.get(entity.ID) === available) {
            return;
        }
        if (entity.isDevice() && available && this.lastPublishedAvailabilities.get(entity.ieeeAddr) === false) {
            logger_1.default.debug(`Device '${entity.name}' reconnected`);
            this.retrieveState(entity);
        }
        const topic = `${entity.name}/availability`;
        const payload = { state: available ? "online" : "offline" };
        this.lastPublishedAvailabilities.set(entity.ID, available);
        await this.mqtt.publish(topic, JSON.stringify(payload), { clientOptions: { retain: true, qos: 1 } });
        if (!skipGroups && entity.isDevice()) {
            for (const group of this.zigbee.groupsIterator()) {
                if (group.hasMember(entity) && utils_1.default.isAvailabilityEnabledForEntity(group, settings.get())) {
                    await this.publishAvailability(group, false, forcePublish);
                }
            }
        }
    }
    async onLastSeenChanged(data) {
        if (utils_1.default.isAvailabilityEnabledForEntity(data.device, settings.get())) {
            // Remove from ping queue, not necessary anymore since we know the device is online.
            this.removeFromPingQueue(data.device);
            this.resetTimer(data.device, true);
            await this.publishAvailability(data.device, false);
        }
    }
    async stop() {
        this.stopped = true;
        this.pingQueue = [];
        for (const [, t] of this.timers) {
            clearTimeout(t);
        }
        await super.stop();
    }
    retrieveState(device) {
        /**
         * Retrieve state of a device in a debounced manner, this function is called on a 'deviceAnnounce' which a
         * device can send multiple times after each other.
         */
        if (device.definition && device.interviewed && !this.retrieveStateDebouncers.get(device.ieeeAddr)) {
            this.retrieveStateDebouncers.set(device.ieeeAddr, (0, debounce_1.default)(async () => {
                logger_1.default.debug(`Retrieving state of '${device.name}' after reconnect`);
                // Color and color temperature converters do both, only needs to be called once.
                for (const item of RETRIEVE_ON_RECONNECT) {
                    if (item.condition && this.state.get(device) && !item.condition(this.state.get(device))) {
                        continue;
                    }
                    // biome-ignore lint/style/noNonNullAssertion: doesn't change once valid
                    const converter = device.definition.toZigbee.find((c) => !c.key || c.key.find((k) => item.keys.includes(k)));
                    const options = device.options;
                    const state = this.state.get(device);
                    const meta = {
                        message: this.state.get(device),
                        // biome-ignore lint/style/noNonNullAssertion: doesn't change once valid
                        mapped: device.definition,
                        endpoint_name: undefined,
                        options,
                        state,
                        device: device.zh,
                        /* v8 ignore next */
                        publish: (payload) => this.publishEntityState(device, payload),
                    };
                    try {
                        const endpoint = device.endpoint();
                        (0, node_assert_1.default)(endpoint);
                        await converter?.convertGet?.(endpoint, item.keys[0], meta);
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to read state of '${device.name}' after reconnect (${error.message})`);
                    }
                    await utils_1.default.sleep(500);
                }
            }, utils_1.default.seconds(2)));
        }
        this.retrieveStateDebouncers.get(device.ieeeAddr)?.();
    }
}
exports.default = Availability;
__decorate([
    bind_decorator_1.default
], Availability.prototype, "onLastSeenChanged", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhaWxhYmlsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9hdmFpbGFiaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4REFBaUM7QUFDakMsb0VBQWtDO0FBQ2xDLHdEQUFnQztBQUloQyw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLDBEQUFrQztBQUNsQyw0REFBb0M7QUFFcEMsTUFBTSxxQkFBcUIsR0FBMEU7SUFDakcsRUFBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBQztJQUNqQixFQUFDLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQWUsRUFBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUM7SUFDckYsRUFBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBZSxFQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksRUFBQztDQUNqRyxDQUFDO0FBRUYsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO0lBQy9DLDZCQUE2QjtJQUNaLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztJQUM1RCx5Q0FBeUM7SUFDeEIsMkJBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7SUFDbkYsNkJBQTZCO0lBQ1osWUFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQzFELDZGQUE2RjtJQUM1RSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQzFELDZCQUE2QjtJQUNaLHVCQUF1QixHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO0lBQ2pFLFNBQVMsR0FBYSxFQUFFLENBQUM7SUFDekIsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBQzNCLE9B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