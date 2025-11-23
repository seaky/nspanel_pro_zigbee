"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = __importDefault(require("node:events"));
const logger_1 = __importDefault(require("./util/logger"));
class EventBus {
    callbacksByExtension = new Map();
    emitter = new node_events_1.default.EventEmitter();
    stats = { devices: new Map(), mqtt: { published: 0, received: 0 } };
    constructor() {
        this.emitter.setMaxListeners(100);
    }
    emitAdapterDisconnected() {
        this.emitter.emit("adapterDisconnected");
    }
    onAdapterDisconnected(key, callback) {
        this.on("adapterDisconnected", callback, key);
    }
    emitPermitJoinChanged(data) {
        this.emitter.emit("permitJoinChanged", data);
    }
    onPermitJoinChanged(key, callback) {
        this.on("permitJoinChanged", callback, key);
    }
    emitEntityRenamed(data) {
        this.emitter.emit("entityRenamed", data);
    }
    onEntityRenamed(key, callback) {
        this.on("entityRenamed", callback, key);
    }
    emitEntityRemoved(data) {
        this.emitter.emit("entityRemoved", data);
    }
    onEntityRemoved(key, callback) {
        this.on("entityRemoved", callback, key);
    }
    emitLastSeenChanged(data) {
        this.emitter.emit("lastSeenChanged", data);
        const device = this.stats.devices.get(data.device.ieeeAddr);
        if (device?.lastSeenChanges) {
            device.lastSeenChanges.messages += 1;
        }
        else {
            this.stats.devices.set(data.device.ieeeAddr, {
                lastSeenChanges: { messages: 1, first: Date.now() },
                leaveCounts: 0,
                networkAddressChanges: 0,
            });
        }
    }
    onLastSeenChanged(key, callback) {
        this.on("lastSeenChanged", callback, key);
    }
    emitDeviceNetworkAddressChanged(data) {
        this.emitter.emit("deviceNetworkAddressChanged", data);
        const device = this.stats.devices.get(data.device.ieeeAddr);
        if (device) {
            device.networkAddressChanges += 1;
        }
        else {
            this.stats.devices.set(data.device.ieeeAddr, { leaveCounts: 0, networkAddressChanges: 1 });
        }
    }
    onDeviceNetworkAddressChanged(key, callback) {
        this.on("deviceNetworkAddressChanged", callback, key);
    }
    emitDeviceAnnounce(data) {
        this.emitter.emit("deviceAnnounce", data);
    }
    onDeviceAnnounce(key, callback) {
        this.on("deviceAnnounce", callback, key);
    }
    emitDeviceInterview(data) {
        this.emitter.emit("deviceInterview", data);
    }
    onDeviceInterview(key, callback) {
        this.on("deviceInterview", callback, key);
    }
    emitDeviceJoined(data) {
        this.emitter.emit("deviceJoined", data);
    }
    onDeviceJoined(key, callback) {
        this.on("deviceJoined", callback, key);
    }
    emitEntityOptionsChanged(data) {
        this.emitter.emit("entityOptionsChanged", data);
    }
    onEntityOptionsChanged(key, callback) {
        this.on("entityOptionsChanged", callback, key);
    }
    emitExposesChanged(data) {
        this.emitter.emit("exposesChanged", data);
    }
    onExposesChanged(key, callback) {
        this.on("exposesChanged", callback, key);
    }
    emitDeviceLeave(data) {
        this.emitter.emit("deviceLeave", data);
        const device = this.stats.devices.get(data.ieeeAddr);
        if (device) {
            device.leaveCounts += 1;
        }
        else {
            this.stats.devices.set(data.ieeeAddr, { leaveCounts: 1, networkAddressChanges: 0 });
        }
    }
    onDeviceLeave(key, callback) {
        this.on("deviceLeave", callback, key);
    }
    emitDeviceMessage(data) {
        this.emitter.emit("deviceMessage", data);
    }
    onDeviceMessage(key, callback) {
        this.on("deviceMessage", callback, key);
    }
    emitMQTTMessage(data) {
        this.emitter.emit("mqttMessage", data);
        this.stats.mqtt.received += 1;
    }
    onMQTTMessage(key, callback) {
        this.on("mqttMessage", callback, key);
    }
    emitMQTTMessagePublished(data) {
        this.emitter.emit("mqttMessagePublished", data);
        this.stats.mqtt.published += 1;
    }
    onMQTTMessagePublished(key, callback) {
        this.on("mqttMessagePublished", callback, key);
    }
    emitPublishEntityState(data) {
        this.emitter.emit("publishEntityState", data);
    }
    onPublishEntityState(key, callback) {
        this.on("publishEntityState", callback, key);
    }
    emitGroupMembersChanged(data) {
        this.emitter.emit("groupMembersChanged", data);
    }
    onGroupMembersChanged(key, callback) {
        this.on("groupMembersChanged", callback, key);
    }
    emitDevicesChanged() {
        this.emitter.emit("devicesChanged");
    }
    onDevicesChanged(key, callback) {
        this.on("devicesChanged", callback, key);
    }
    emitScenesChanged(data) {
        this.emitter.emit("scenesChanged", data);
    }
    onScenesChanged(key, callback) {
        this.on("scenesChanged", callback, key);
    }
    emitReconfigure(data) {
        this.emitter.emit("reconfigure", data);
    }
    onReconfigure(key, callback) {
        this.on("reconfigure", callback, key);
    }
    emitStateChange(data) {
        this.emitter.emit("stateChange", data);
    }
    onStateChange(key, callback) {
        this.on("stateChange", callback, key);
    }
    emitExposesAndDevicesChanged(device) {
        this.emitDevicesChanged();
        this.emitExposesChanged({ device });
    }
    on(event, callback, key) {
        if (!this.callbacksByExtension.has(key.constructor.name)) {
            this.callbacksByExtension.set(key.constructor.name, []);
        }
        const wrappedCallback = async (...args) => {
            try {
                await callback(...args);
            }
            catch (error) {
                logger_1.default.error(`EventBus error '${key.constructor.name}/${event}': ${error.message}`);
                // biome-ignore lint/style/noNonNullAssertion: always Error
                logger_1.default.debug(error.stack);
            }
        };
        // biome-ignore lint/style/noNonNullAssertion: just created if wasn't valid
        this.callbacksByExtension.get(key.constructor.name).push({ event, callback: wrappedCallback });
        this.emitter.on(event, wrappedCallback);
    }
    removeListeners(key) {
        const callbacks = this.callbacksByExtension.get(key.constructor.name);
        if (callbacks) {
            for (const cb of callbacks) {
                this.emitter.removeListener(cb.event, cb.callback);
            }
        }
    }
}
exports.default = EventBus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRCdXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvZXZlbnRCdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw4REFBaUM7QUFFakMsMkRBQW1DO0FBaURuQyxNQUFxQixRQUFRO0lBQ2pCLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUF1RixDQUFDO0lBQ3RILE9BQU8sR0FBRyxJQUFJLHFCQUFNLENBQUMsWUFBWSxFQUFlLENBQUM7SUFDaEQsS0FBSyxHQUFVLEVBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQztJQUVoRjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx1QkFBdUI7UUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ00scUJBQXFCLENBQUMsR0FBZ0IsRUFBRSxRQUFvQjtRQUMvRCxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0scUJBQXFCLENBQUMsSUFBaUM7UUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNNLG1CQUFtQixDQUFDLEdBQWdCLEVBQUUsUUFBcUQ7UUFDOUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLGlCQUFpQixDQUFDLElBQTZCO1FBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3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