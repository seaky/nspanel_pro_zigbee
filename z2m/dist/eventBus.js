"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = __importDefault(require("node:events"));
const logger_1 = __importDefault(require("./util/logger"));
class EventBus {
    callbacksByExtension = {};
    emitter = new node_events_1.default.EventEmitter();
    constructor() {
        this.emitter.setMaxListeners(100);
    }
    emitAdapterDisconnected() {
        this.emitter.emit('adapterDisconnected');
    }
    onAdapterDisconnected(key, callback) {
        this.on('adapterDisconnected', callback, key);
    }
    emitPermitJoinChanged(data) {
        this.emitter.emit('permitJoinChanged', data);
    }
    onPermitJoinChanged(key, callback) {
        this.on('permitJoinChanged', callback, key);
    }
    emitEntityRenamed(data) {
        this.emitter.emit('deviceRenamed', data);
    }
    onEntityRenamed(key, callback) {
        this.on('deviceRenamed', callback, key);
    }
    emitEntityRemoved(data) {
        this.emitter.emit('deviceRemoved', data);
    }
    onEntityRemoved(key, callback) {
        this.on('deviceRemoved', callback, key);
    }
    emitLastSeenChanged(data) {
        this.emitter.emit('lastSeenChanged', data);
    }
    onLastSeenChanged(key, callback) {
        this.on('lastSeenChanged', callback, key);
    }
    emitDeviceNetworkAddressChanged(data) {
        this.emitter.emit('deviceNetworkAddressChanged', data);
    }
    onDeviceNetworkAddressChanged(key, callback) {
        this.on('deviceNetworkAddressChanged', callback, key);
    }
    emitDeviceAnnounce(data) {
        this.emitter.emit('deviceAnnounce', data);
    }
    onDeviceAnnounce(key, callback) {
        this.on('deviceAnnounce', callback, key);
    }
    emitDeviceInterview(data) {
        this.emitter.emit('deviceInterview', data);
    }
    onDeviceInterview(key, callback) {
        this.on('deviceInterview', callback, key);
    }
    emitDeviceJoined(data) {
        this.emitter.emit('deviceJoined', data);
    }
    onDeviceJoined(key, callback) {
        this.on('deviceJoined', callback, key);
    }
    emitEntityOptionsChanged(data) {
        this.emitter.emit('entityOptionsChanged', data);
    }
    onEntityOptionsChanged(key, callback) {
        this.on('entityOptionsChanged', callback, key);
    }
    emitExposesChanged(data) {
        this.emitter.emit('exposesChanged', data);
    }
    onExposesChanged(key, callback) {
        this.on('exposesChanged', callback, key);
    }
    emitDeviceLeave(data) {
        this.emitter.emit('deviceLeave', data);
    }
    onDeviceLeave(key, callback) {
        this.on('deviceLeave', callback, key);
    }
    emitDeviceMessage(data) {
        this.emitter.emit('deviceMessage', data);
    }
    onDeviceMessage(key, callback) {
        this.on('deviceMessage', callback, key);
    }
    emitMQTTMessage(data) {
        this.emitter.emit('mqttMessage', data);
    }
    onMQTTMessage(key, callback) {
        this.on('mqttMessage', callback, key);
    }
    emitMQTTMessagePublished(data) {
        this.emitter.emit('mqttMessagePublished', data);
    }
    onMQTTMessagePublished(key, callback) {
        this.on('mqttMessagePublished', callback, key);
    }
    emitPublishEntityState(data) {
        this.emitter.emit('publishEntityState', data);
    }
    onPublishEntityState(key, callback) {
        this.on('publishEntityState', callback, key);
    }
    emitGroupMembersChanged(data) {
        this.emitter.emit('groupMembersChanged', data);
    }
    onGroupMembersChanged(key, callback) {
        this.on('groupMembersChanged', callback, key);
    }
    emitDevicesChanged() {
        this.emitter.emit('devicesChanged');
    }
    onDevicesChanged(key, callback) {
        this.on('devicesChanged', callback, key);
    }
    emitScenesChanged(data) {
        this.emitter.emit('scenesChanged', data);
    }
    onScenesChanged(key, callback) {
        this.on('scenesChanged', callback, key);
    }
    emitReconfigure(data) {
        this.emitter.emit('reconfigure', data);
    }
    onReconfigure(key, callback) {
        this.on('reconfigure', callback, key);
    }
    emitStateChange(data) {
        this.emitter.emit('stateChange', data);
    }
    onStateChange(key, callback) {
        this.on('stateChange', callback, key);
    }
    emitExposesAndDevicesChanged(device) {
        this.emitDevicesChanged();
        this.emitExposesChanged({ device });
    }
    on(event, callback, key) {
        if (!this.callbacksByExtension[key.constructor.name]) {
            this.callbacksByExtension[key.constructor.name] = [];
        }
        const wrappedCallback = async (...args) => {
            try {
                await callback(...args);
            }
            catch (error) {
                logger_1.default.error(`EventBus error '${key.constructor.name}/${event}': ${error.message}`);
                logger_1.default.debug(error.stack);
            }
        };
        this.callbacksByExtension[key.constructor.name].push({ event, callback: wrappedCallback });
        this.emitter.on(event, wrappedCallback);
    }
    removeListeners(key) {
        this.callbacksByExtension[key.constructor.name]?.forEach((e) => this.emitter.removeListener(e.event, e.callback));
    }
}
exports.default = EventBus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRCdXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvZXZlbnRCdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw4REFBaUM7QUFFakMsMkRBQW1DO0FBa0NuQyxNQUFxQixRQUFRO0lBQ2pCLG9CQUFvQixHQUErRixFQUFFLENBQUM7SUFDdEgsT0FBTyxHQUFHLElBQUkscUJBQU0sQ0FBQyxZQUFZLEVBQWUsQ0FBQztJQUV6RDtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx1QkFBdUI7UUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ00scUJBQXFCLENBQUMsR0FBZ0IsRUFBRSxRQUFvQjtRQUMvRCxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0scUJBQXFCLENBQUMsSUFBaUM7UUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNNLG1CQUFtQixDQUFDLEdBQWdCLEVBQUUsUUFBcUQ7UUFDOUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLGlCQUFpQixDQUFDLElBQTZCO1FBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ00sZUFBZSxDQUFDLEdBQWdCLEVBQUUsUUFBaUQ7UUFDdEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSxpQkFBaUIsQ0FB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