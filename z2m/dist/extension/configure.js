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
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zhc = __importStar(require("zigbee-herdsman-converters"));
const device_1 = __importDefault(require("../model/device"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
/**
 * This extension calls the zigbee-herdsman-converters definition configure() method
 */
class Configure extends extension_1.default {
    configuring = new Set();
    attempts = {};
    topic = `${settings.get().mqtt.base_topic}/bridge/request/device/configure`;
    async onReconfigure(data) {
        // Disabling reporting unbinds some cluster which could be bound by configure, re-setup.
        if (data.device.zh.meta?.configured !== undefined) {
            delete data.device.zh.meta.configured;
            data.device.zh.save();
        }
        await this.configure(data.device, "reporting_disabled");
    }
    async onMQTTMessage(data) {
        if (data.topic === this.topic) {
            const message = utils_1.default.parseJSON(data.message, data.message);
            const ID = typeof message === "object" ? message.id : message;
            let error;
            if (ID === undefined) {
                error = "Invalid payload";
            }
            else {
                const device = this.zigbee.resolveEntity(ID);
                if (!device || !(device instanceof device_1.default)) {
                    error = `Device '${ID}' does not exist`;
                }
                else if (!device.definition || !device.definition.configure) {
                    error = `Device '${device.name}' cannot be configured`;
                }
                else {
                    try {
                        await this.configure(device, "mqtt_message", true, true);
                    }
                    catch (e) {
                        error = `Failed to configure (${e.message})`;
                    }
                }
            }
            const response = utils_1.default.getResponse(message, { id: ID }, error);
            await this.mqtt.publish("bridge/response/device/configure", (0, json_stable_stringify_without_jsonify_1.default)(response));
        }
    }
    start() {
        setImmediate(async () => {
            // Only configure routers on startup, end devices are likely sleeping and
            // will reconfigure once they send a message
            for (const device of this.zigbee.devicesIterator((d) => d.type === "Router")) {
                // Sleep 10 seconds between configuring on startup to not DDoS the coordinator when many devices have to be configured.
                await utils_1.default.sleep(10);
                await this.configure(device, "started");
            }
        });
        this.eventBus.onDeviceJoined(this, async (data) => {
            if (data.device.zh.meta.configured !== undefined) {
                delete data.device.zh.meta.configured;
                data.device.zh.save();
            }
            await this.configure(data.device, "zigbee_event");
        });
        this.eventBus.onDeviceInterview(this, (data) => this.configure(data.device, "zigbee_event"));
        this.eventBus.onLastSeenChanged(this, (data) => this.configure(data.device, "zigbee_event"));
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        this.eventBus.onReconfigure(this, this.onReconfigure);
        return Promise.resolve();
    }
    async configure(device, event, force = false, throwError = false) {
        if (!device.definition?.configure) {
            return;
        }
        if (!force) {
            if (device.options.disabled || !device.interviewed) {
                return;
            }
            if (device.zh.meta?.configured !== undefined) {
                return;
            }
            // Only configure end devices when it is active, otherwise it will likely fails as they are sleeping.
            if (device.zh.type === "EndDevice" && event !== "zigbee_event") {
                return;
            }
        }
        if (this.configuring.has(device.ieeeAddr) || (this.attempts[device.ieeeAddr] >= 3 && !force)) {
            return;
        }
        this.configuring.add(device.ieeeAddr);
        if (this.attempts[device.ieeeAddr] === undefined) {
            this.attempts[device.ieeeAddr] = 0;
        }
        logger_1.default.info(`Configuring '${device.name}'`);
        try {
            await device.definition.configure(device.zh, this.zigbee.firstCoordinatorEndpoint(), device.definition);
            logger_1.default.info(`Successfully configured '${device.name}'`);
            device.zh.meta.configured = zhc.getConfigureKey(device.definition);
            device.zh.save();
            this.eventBus.emitDevicesChanged();
        }
        catch (error) {
            this.attempts[device.ieeeAddr]++;
            const attempt = this.attempts[device.ieeeAddr];
            const msg = `Failed to configure '${device.name}', attempt ${attempt} (${error.stack})`;
            logger_1.default.error(msg);
            if (throwError) {
                throw error;
            }
        }
        finally {
            this.configuring.delete(device.ieeeAddr);
        }
    }
}
exports.default = Configure;
__decorate([
    bind_decorator_1.default
], Configure.prototype, "onReconfigure", null);
__decorate([
    bind_decorator_1.default
], Configure.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9jb25maWd1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvRUFBa0M7QUFDbEMsa0hBQThEO0FBQzlELGdFQUFrRDtBQUNsRCw2REFBcUM7QUFFckMsNERBQW9DO0FBQ3BDLDJEQUE2QztBQUM3QywwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDOztHQUVHO0FBQ0gsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO0lBQ3BDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLFFBQVEsR0FBMEIsRUFBRSxDQUFDO0lBQ3JDLEtBQUssR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxrQ0FBa0MsQ0FBQztJQUVoRSxBQUFOLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBMkI7UUFDekQsd0ZBQXdGO1FBQ3hGLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVtQixBQUFOLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBMkI7UUFDekQsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixNQUFNLE9BQU8sR0FBRyxlQUFLLENBQUMsU0FBUyxD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