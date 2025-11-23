"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
/**
 * This extension calls the zigbee-herdsman-converters onEvent.
 */
class OnEvent extends extension_1.default {
    #startCalled = new Set();
    #getOnEventBaseData(device) {
        const deviceExposesChanged = () => this.eventBus.emitExposesAndDevicesChanged(device);
        const state = this.state.get(device);
        const options = device.options;
        return { deviceExposesChanged, device: device.zh, state, options };
    }
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            // don't await, in case of repeated failures this would hold startup
            this.callOnEvent(device, { type: "start", data: this.#getOnEventBaseData(device) }).catch(utils_1.default.noop);
        }
        this.eventBus.onDeviceJoined(this, async (data) => {
            await this.callOnEvent(data.device, { type: "deviceJoined", data: this.#getOnEventBaseData(data.device) });
        });
        this.eventBus.onDeviceLeave(this, async (data) => {
            if (data.device) {
                await this.callOnEvent(data.device, { type: "stop", data: { ieeeAddr: data.device.ieeeAddr } });
            }
        });
        this.eventBus.onEntityRemoved(this, async (data) => {
            if (data.entity.isDevice()) {
                await this.callOnEvent(data.entity, { type: "stop", data: { ieeeAddr: data.entity.ieeeAddr } });
            }
        });
        this.eventBus.onDeviceInterview(this, async (data) => {
            await this.callOnEvent(data.device, { type: "deviceInterview", data: { ...this.#getOnEventBaseData(data.device), status: data.status } });
        });
        this.eventBus.onDeviceAnnounce(this, async (data) => {
            await this.callOnEvent(data.device, { type: "deviceAnnounce", data: this.#getOnEventBaseData(data.device) });
        });
        this.eventBus.onDeviceNetworkAddressChanged(this, async (data) => {
            await this.callOnEvent(data.device, { type: "deviceNetworkAddressChanged", data: this.#getOnEventBaseData(data.device) });
        });
        this.eventBus.onEntityOptionsChanged(this, async (data) => {
            if (data.entity.isDevice()) {
                await this.callOnEvent(data.entity, {
                    type: "deviceOptionsChanged",
                    data: { ...this.#getOnEventBaseData(data.entity), from: data.from, to: data.to },
                });
                this.eventBus.emitDevicesChanged();
            }
        });
    }
    async stop() {
        await super.stop();
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            await this.callOnEvent(device, { type: "stop", data: { ieeeAddr: device.ieeeAddr } });
        }
    }
    async callOnEvent(device, event) {
        if (device.options.disabled) {
            return;
        }
        if (event.type === "start") {
            this.#startCalled.add(device.ieeeAddr);
        }
        else if (event.type !== "stop" && !this.#startCalled.has(device.ieeeAddr) && device.definition?.onEvent) {
            this.#startCalled.add(device.ieeeAddr);
            await device.definition.onEvent({ type: "start", data: this.#getOnEventBaseData(device) });
        }
        await (0, zigbee_herdsman_converters_1.onEvent)(event);
        await device.definition?.onEvent?.(event);
        if (event.type === "stop") {
            this.#startCalled.delete(device.ieeeAddr);
        }
    }
}
exports.default = OnEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25FdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vb25FdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJFQUErRTtBQUUvRSwwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDOztHQUVHO0FBQ0gsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO0lBQ2pDLFlBQVksR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUUvQyxtQkFBbUIsQ0FBQyxNQUFjO1FBQzlCLE1BQU0sb0JBQW9CLEdBQUcsR0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBbUIsQ0FBQztRQUMzQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCw2Q0FBNkM7SUFDcEMsS0FBSyxDQUFDLEtBQUs7UUFDaEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFLLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDO1lBQzNFLG9FQUFvRTtZQUNwRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJ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