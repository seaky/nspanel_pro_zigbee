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
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const throttleit_1 = __importDefault(require("throttleit"));
const zhc = __importStar(require("zigbee-herdsman-converters"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
class Receive extends extension_1.default {
    // TODO: move all to `Map`
    elapsed = {};
    debouncers = {};
    throttlers = {};
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        this.eventBus.onPublishEntityState(this, this.onPublishEntityState);
        this.eventBus.onDeviceMessage(this, this.onDeviceMessage);
    }
    onPublishEntityState(data) {
        /**
         * Prevent that outdated properties are being published.
         * In case that e.g. the state is currently held back by a debounce and a new state is published
         * remove it from the to be send debounced message.
         */
        if (data.entity.isDevice() &&
            this.debouncers[data.entity.ieeeAddr] &&
            data.stateChangeReason !== "publishDebounce" &&
            data.stateChangeReason !== "lastSeenChanged") {
            for (const key of Object.keys(data.payload)) {
                delete this.debouncers[data.entity.ieeeAddr].payload[key];
            }
        }
    }
    publishDebounce(device, payload, time, debounceIgnore) {
        if (!this.debouncers[device.ieeeAddr]) {
            this.debouncers[device.ieeeAddr] = {
                payload: {},
                publish: (0, debounce_1.default)(async () => {
                    await this.publishEntityState(device, this.debouncers[device.ieeeAddr].payload, "publishDebounce");
                    this.debouncers[device.ieeeAddr].payload = {};
                }, time * 1000),
            };
        }
        if (this.isPayloadConflicted(payload, this.debouncers[device.ieeeAddr].payload, debounceIgnore)) {
            // publish previous payload immediately
            this.debouncers[device.ieeeAddr].publish.flush();
        }
        // extend debounced payload with current
        this.debouncers[device.ieeeAddr].payload = { ...this.debouncers[device.ieeeAddr].payload, ...payload };
        // Update state cache right away. This makes sure that during debouncing cached state is always up to date.
        // ( Update right away as "lastSeenChanged" event might occur while debouncer is still active.
        //  And if that happens it would cause old message to be published from cache.
        // By updating cache we make sure that state cache is always up-to-date.
        this.state.set(device, this.debouncers[device.ieeeAddr].payload);
        this.debouncers[device.ieeeAddr].publish();
    }
    async publishThrottle(device, payload, time) {
        if (!this.throttlers[device.ieeeAddr]) {
            this.throttlers[device.ieeeAddr] = {
                publish: (0, throttleit_1.default)(this.publishEntityState, time * 1000),
            };
        }
        // Update state cache right away. This makes sure that during throttling cached state is always up to date.
        // By updating cache we make sure that state cache is always up-to-date.
        this.state.set(device, payload);
        await this.throttlers[device.ieeeAddr].publish(device, payload, "publishThrottle");
    }
    // if debounce_ignore are specified (Array of strings)
    // then all newPayload values with key present in debounce_ignore
    // should equal or be undefined in oldPayload
    // otherwise payload is conflicted
    isPayloadConflicted(newPayload, oldPayload, debounceIgnore) {
        let result = false;
        for (const key in oldPayload) {
            if (debounceIgnore?.includes(key) && typeof newPayload[key] !== "undefined" && newPayload[key] !== oldPayload[key]) {
                result = true;
            }
        }
        return result;
    }
    async onDeviceMessage(data) {
        /* v8 ignore next */
        if (!data.device)
            return;
        if (!data.device.definition || !data.device.interviewed) {
            logger_1.default.debug("Skipping message, still interviewing");
            await utils_1.default.publishLastSeen({ device: data.device, reason: "messageEmitted" }, settings.get(), true, this.publishEntityState);
            return;
        }
        const converters = data.device.definition.fromZigbee.filter((c) => {
            const type = Array.isArray(c.type) ? c.type.includes(data.type) : c.type === data.type;
            return c.cluster === data.cluster && type;
        });
        // Check if there is an available converter, genOta messages are not interesting.
        const ignoreClusters = ["genOta", "genTime", "genBasic", "genPollCtrl"];
        if (converters.length === 0 && !ignoreClusters.includes(data.cluster)) {
            logger_1.default.debug(`No converter available for '${data.device.definition.model}' with ` +
                `cluster '${data.cluster}' and type '${data.type}' and data '${(0, json_stable_stringify_without_jsonify_1.default)(data.data)}'`);
            await utils_1.default.publishLastSeen({ device: data.device, reason: "messageEmitted" }, settings.get(), true, this.publishEntityState);
            return;
        }
        // Convert this Zigbee message to a MQTT message.
        // Get payload for the message.
        // - If a payload is returned publish it to the MQTT broker
        // - If NO payload is returned do nothing. This is for non-standard behaviour
        //   for e.g. click switches where we need to count number of clicks and detect long presses.
        const publish = async (payload) => {
            (0, node_assert_1.default)(data.device.definition);
            const options = data.device.options;
            zhc.postProcessConvertedFromZigbeeMessage(data.device.definition, payload, options, data.device.zh);
            if (settings.get().advanced.elapsed) {
                const now = Date.now();
                if (this.elapsed[data.device.ieeeAddr]) {
                    payload.elapsed = now - this.elapsed[data.device.ieeeAddr];
                }
                this.elapsed[data.device.ieeeAddr] = now;
            }
            // Check if we have to debounce or throttle
            if (data.device.options.debounce) {
                this.publishDebounce(data.device, payload, data.device.options.debounce, data.device.options.debounce_ignore);
            }
            else if (data.device.options.throttle) {
                await this.publishThrottle(data.device, payload, data.device.options.throttle);
            }
            else {
                await this.publishEntityState(data.device, payload);
            }
        };
        const meta = {
            device: data.device.zh,
            logger: logger_1.default,
            state: this.state.get(data.device),
            deviceExposesChanged: () => this.eventBus.emitExposesAndDevicesChanged(data.device),
        };
        let payload = {};
        for (const converter of converters) {
            try {
                const convertData = { ...data, device: data.device.zh };
                const options = data.device.options;
                const converted = await converter.convert(data.device.definition, convertData, publish, options, meta);
                if (converted) {
                    payload = { ...payload, ...converted };
                }
                /* v8 ignore start */
            }
            catch (error) {
                logger_1.default.error(`Exception while calling fromZigbee converter: ${error.message}}`);
                // biome-ignore lint/style/noNonNullAssertion: always Error
                logger_1.default.debug(error.stack);
            }
            /* v8 ignore stop */
        }
        if (!utils_1.default.objectIsEmpty(payload)) {
            await publish(payload);
        }
        else {
            await utils_1.default.publishLastSeen({ device: data.device, reason: "messageEmitted" }, settings.get(), true, this.publishEntityState);
        }
    }
}
exports.default = Receive;
__decorate([
    bind_decorator_1.default
], Receive.prototype, "onPublishEntityState", null);
__decorate([
    bind_decorator_1.default
], Receive.prototype, "onDeviceMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjZWl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vcmVjZWl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUVqQyxvRUFBa0M7QUFDbEMsd0RBQWdDO0FBQ2hDLGtIQUE4RDtBQUM5RCw0REFBa0M7QUFFbEMsZ0VBQWtEO0FBRWxELDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQUlwQyxNQUFxQixPQUFRLFNBQVEsbUJBQVM7SUFDMUMsMEJBQTBCO0lBQ2xCLE9BQU8sR0FBMEIsRUFBRSxDQUFDO0lBQ3BDLFVBQVUsR0FBa0UsRUFBRSxDQUFDO0lBQy9FLFVBQVUsR0FBaUQsRUFBRSxDQUFDO0lBRXRFLDZDQUE2QztJQUNwQyxLQUFLLENBQUMsS0FBSztRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFSyxvQkFBb0IsQ0FBQyxJQUFrQztRQUN6RDs7OztXQUlHO1FBQ0gsSUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxpQkFBaUI7WUFDNUMsSUFBSSxDQUFDLGlCQUFpQixLQUFLLGlCQUFpQixFQUM5QyxDQUFDO1lBQ0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxP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