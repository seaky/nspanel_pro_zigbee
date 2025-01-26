"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Extension {
    zigbee;
    mqtt;
    state;
    publishEntityState;
    eventBus;
    enableDisableExtension;
    restartCallback;
    addExtension;
    /**
     * Besides initializing variables, the constructor should do nothing!
     *
     * @param {Zigbee} zigbee Zigbee controller
     * @param {MQTT} mqtt MQTT controller
     * @param {State} state State controller
     * @param {Function} publishEntityState Method to publish device state to MQTT.
     * @param {EventBus} eventBus The event bus
     * @param {enableDisableExtension} enableDisableExtension Enable/disable extension method
     * @param {restartCallback} restartCallback Restart Zigbee2MQTT
     * @param {addExtension} addExtension Add an extension
     */
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        this.zigbee = zigbee;
        this.mqtt = mqtt;
        this.state = state;
        this.publishEntityState = publishEntityState;
        this.eventBus = eventBus;
        this.enableDisableExtension = enableDisableExtension;
        this.restartCallback = restartCallback;
        this.addExtension = addExtension;
    }
    /**
     * Is called once the extension has to start
     */
    async start() { }
    /**
     * Is called once the extension has to stop
     */
    async stop() {
        this.eventBus.removeListeners(this);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adjustMessageBeforePublish(entity, message) { }
}
exports.default = Extension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFlLFNBQVM7SUFDVixNQUFNLENBQVM7SUFDZixJQUFJLENBQU87SUFDWCxLQUFLLENBQVE7SUFDYixrQkFBa0IsQ0FBcUI7SUFDdkMsUUFBUSxDQUFXO0lBQ25CLHNCQUFzQixDQUFtRDtJQUN6RSxlQUFlLENBQXNCO0lBQ3JDLFlBQVksQ0FBMEM7SUFFaEU7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxZQUNJLE1BQWMsRUFDZCxJQUFVLEVBQ1YsS0FBWSxFQUNaLGtCQUFzQyxFQUN0QyxRQUFrQixFQUNsQixzQkFBd0UsRUFDeEUsZUFBb0MsRUFDcEMsWUFBcUQ7UUFFckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQztRQUNyRCxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsS0FBSyxLQUFtQixDQUFDO0lBRS9COztPQUVHO0lBQ0gsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsNkRBQTZEO0lBQ3RELDBCQUEwQixDQUFDLE1BQXNCLEVBQUUsT0FBaUIsSUFBUyxDQUFDO0NBQ3hGO0FBRUQsa0JBQWUsU0FBUyxDQUFDIn0=