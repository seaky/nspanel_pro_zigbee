"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const logger_1 = __importDefault(require("./util/logger"));
class EventBus {
    callbacksByExtension = {};
    emitter = new events_1.default.EventEmitter();
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
    emitPublishAvailability() {
        this.emitter.emit('publishAvailability');
    }
    onPublishAvailability(key, callback) {
        this.on('publishAvailability', callback, key);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRCdXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvZXZlbnRCdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBNEI7QUFFNUIsMkRBQW1DO0FBa0NuQyxNQUFxQixRQUFRO0lBQ2pCLG9CQUFvQixHQUErRixFQUFFLENBQUM7SUFDdEgsT0FBTyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxZQUFZLEVBQWUsQ0FBQztJQUV6RDtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSx1QkFBdUI7UUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ00scUJBQXFCLENBQUMsR0FBZ0IsRUFBRSxRQUFvQjtRQUMvRCxJQUFJLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0scUJBQXFCLENBQUMsSUFBaUM7UUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNNLG1CQUFtQixDQUFDLEdBQWdCLEVBQUUsUUFBcUQ7UUFDOUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLHVCQUF1QjtRQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFDTSxxQkFBcUIsQ0FBQyxHQUFnQixFQUFFLFFBQW9CO1FBQy9ELElBQUksQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxJQUE2QjtRQUNsRCxJ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