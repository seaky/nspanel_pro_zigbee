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
const node_fs_1 = __importDefault(require("node:fs"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const mqtt_1 = require("mqtt");
const logger_1 = __importDefault(require("./util/logger"));
const settings = __importStar(require("./util/settings"));
const utils_1 = __importDefault(require("./util/utils"));
const NS = "z2m:mqtt";
class Mqtt {
    publishedTopics = new Set();
    connectionTimer;
    client;
    eventBus;
    republishRetainedTimer;
    defaultPublishOptions;
    retainedMessages = {};
    get info() {
        return {
            version: this.client.options.protocolVersion,
            server: `${this.client.options.protocol}://${this.client.options.host}:${this.client.options.port}`,
        };
    }
    get stats() {
        return {
            connected: this.isConnected(),
            queued: this.client.queue.length,
        };
    }
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.defaultPublishOptions = {
            clientOptions: {},
            baseTopic: settings.get().mqtt.base_topic,
            skipLog: false,
            skipReceive: true,
            meta: {},
        };
    }
    async connect() {
        const mqttSettings = settings.get().mqtt;
        logger_1.default.info(`Connecting to MQTT server at ${mqttSettings.server}`);
        const options = {
            will: {
                topic: `${settings.get().mqtt.base_topic}/bridge/state`,
                payload: Buffer.from(JSON.stringify({ state: "offline" })),
                retain: !settings.get().mqtt.force_disable_retain,
                qos: 1,
            },
            properties: { maximumPacketSize: mqttSettings.maximum_packet_size },
        };
        if (mqttSettings.version) {
            options.protocolVersion = mqttSettings.version;
        }
        if (mqttSettings.keepalive) {
            logger_1.default.debug(`Using MQTT keepalive: ${mqttSettings.keepalive}`);
            options.keepalive = mqttSettings.keepalive;
        }
        if (mqttSettings.ca) {
            logger_1.default.debug(`MQTT SSL/TLS: Path to CA certificate = ${mqttSettings.ca}`);
            options.ca = node_fs_1.default.readFileSync(mqttSettings.ca);
        }
        if (mqttSettings.key && mqttSettings.cert) {
            logger_1.default.debug(`MQTT SSL/TLS: Path to client key = ${mqttSettings.key}`);
            logger_1.default.debug(`MQTT SSL/TLS: Path to client certificate = ${mqttSettings.cert}`);
            options.key = node_fs_1.default.readFileSync(mqttSettings.key);
            options.cert = node_fs_1.default.readFileSync(mqttSettings.cert);
        }
        if (mqttSettings.user && mqttSettings.password) {
            logger_1.default.debug(`Using MQTT login with username: ${mqttSettings.user}`);
            options.username = mqttSettings.user;
            options.password = mqttSettings.password;
        }
        else if (mqttSettings.user) {
            logger_1.default.debug(`Using MQTT login with username only: ${mqttSettings.user}`);
            options.username = mqttSettings.user;
        }
        else {
            logger_1.default.debug("Using MQTT anonymous login");
        }
        if (mqttSettings.client_id) {
            logger_1.default.debug(`Using MQTT client ID: '${mqttSettings.client_id}'`);
            options.clientId = mqttSettings.client_id;
        }
        if (mqttSettings.reject_unauthorized !== undefined && !mqttSettings.reject_unauthorized) {
            logger_1.default.debug("MQTT reject_unauthorized set false, ignoring certificate warnings.");
            options.rejectUnauthorized = false;
        }
        this.client = await (0, mqtt_1.connectAsync)(mqttSettings.server, options);
        // https://github.com/Koenkk/zigbee2mqtt/issues/9822
        this.client.stream.setMaxListeners(0);
        this.client.on("error", (err) => {
            logger_1.default.error(`MQTT error: ${err.message}`);
        });
        if (mqttSettings.version != null && mqttSettings.version >= 5) {
            this.client.on("disconnect", (packet) => {
                logger_1.default.error(`MQTT disconnect: reason ${packet.reasonCode} (${packet.properties?.reasonString})`);
            });
        }
        this.client.on("message", this.onMessage);
        await this.onConnect();
        this.client.on("connect", this.onConnect);
        this.republishRetainedTimer = setTimeout(async () => {
            // Republish retained messages in case MQTT broker does not persist them.
            // https://github.com/Koenkk/zigbee2mqtt/issues/9629
            for (const msg of Object.values(this.retainedMessages)) {
                await this.publish(msg.topic, msg.payload, msg.options);
            }
        }, 2000);
        // Set timer at interval to check if connected to MQTT server.
        this.connectionTimer = setInterval(() => {
            if (!this.isConnected()) {
                logger_1.default.error("Not connected to MQTT server!");
            }
        }, utils_1.default.seconds(10));
    }
    async disconnect() {
        clearTimeout(this.connectionTimer);
        clearTimeout(this.republishRetainedTimer);
        const stateData = { state: "offline" };
        await this.publish("bridge/state", JSON.stringify(stateData), { clientOptions: { retain: true } });
        this.eventBus.removeListeners(this);
        logger_1.default.info("Disconnecting from MQTT server");
        await this.client?.endAsync();
    }
    async subscribe(topic) {
        await this.client.subscribeAsync(topic);
    }
    async unsubscribe(topic) {
        await this.client.unsubscribeAsync(topic);
    }
    async onConnect() {
        logger_1.default.info("Connected to MQTT server");
        const stateData = { state: "online" };
        await this.publish("bridge/state", JSON.stringify(stateData), { clientOptions: { retain: true, qos: 1 } });
        await this.subscribe(`${settings.get().mqtt.base_topic}/#`);
    }
    onMessage(topic, message) {
        // Since we subscribe to zigbee2mqtt/# we also receive the message we send ourselves, skip these.
        if (!this.publishedTopics.has(topic)) {
            logger_1.default.debug(() => `Received MQTT message on '${topic}' with data '${message.toString()}'`, NS);
            this.eventBus.emitMQTTMessage({ topic, message: message.toString() });
        }
        if (this.republishRetainedTimer && topic === `${settings.get().mqtt.base_topic}/bridge/info`) {
            clearTimeout(this.republishRetainedTimer);
            this.republishRetainedTimer = undefined;
        }
    }
    isConnected() {
        return this.client && !this.client.reconnecting && !this.client.disconnecting && !this.client.disconnected;
    }
    async publish(topic, payload, options = {}) {
        if (topic.includes("+") || topic.includes("#")) {
            // https://github.com/Koenkk/zigbee2mqtt/issues/26939#issuecomment-2772309646
            logger_1.default.error(`Topic '${topic}' includes wildcard characters, skipping publish.`);
            return;
        }
        const finalOptions = { ...this.defaultPublishOptions, ...options };
        topic = `${finalOptions.baseTopic}/${topic}`;
        if (finalOptions.skipReceive) {
            this.publishedTopics.add(topic);
        }
        if (finalOptions.clientOptions.retain) {
            if (payload) {
                this.retainedMessages[topic] = { payload, options: finalOptions, topic: topic.substring(finalOptions.baseTopic.length + 1) };
            }
            else {
                delete this.retainedMessages[topic];
            }
        }
        this.eventBus.emitMQTTMessagePublished({ topic, payload, options: finalOptions });
        if (!this.isConnected()) {
            if (!finalOptions.skipLog) {
                logger_1.default.error("Not connected to MQTT server!");
                logger_1.default.error(`Cannot send message: topic: '${topic}', payload: '${payload}`);
            }
            return;
        }
        let clientOptions = finalOptions.clientOptions;
        if (settings.get().mqtt.force_disable_retain) {
            clientOptions = { ...finalOptions.clientOptions, retain: false };
        }
        if (!finalOptions.skipLog) {
            logger_1.default.info(() => `MQTT publish: topic '${topic}', payload '${payload}'`, NS);
        }
        try {
            await this.client.publishAsync(topic, payload, clientOptions);
        }
        catch (error) {
            if (!finalOptions.skipLog) {
                logger_1.default.error(`MQTT server error: ${error.message}`);
                logger_1.default.error(`Could not send message: topic: '${topic}', payload: '${payload}`);
            }
        }
    }
}
exports.default = Mqtt;
__decorate([
    bind_decorator_1.default
], Mqtt.prototype, "onConnect", null);
__decorate([
    bind_decorator_1.default
], Mqtt.prototype, "onMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXF0dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9tcXR0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXlCO0FBQ3pCLG9FQUFrQztBQUVsQywrQkFBa0M7QUFHbEMsMkRBQW1DO0FBQ25DLDBEQUE0QztBQUM1Qyx5REFBaUM7QUFFakMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0FBVXRCLE1BQXFCLElBQUk7SUFDYixlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUNwQyxlQUFlLENBQWtCO0lBQ2pDLE1BQU0sQ0FBYztJQUNwQixRQUFRLENBQVc7SUFDbkIsc0JBQXNCLENBQWtCO0lBQ3hDLHFCQUFxQixDQUFxQjtJQUMzQyxnQkFBZ0IsR0FBaUYsRUFBRSxDQUFDO0lBRTNHLElBQUksSUFBSTtRQUNKLE9BQU87WUFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZTtZQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtTQUN0RyxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU87WUFDSCxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM3QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTTtTQUNuQyxDQUFDO0lBQ04sQ0FBQztJQUVELFlBQVksUUFBa0I7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLHFCQUFxQixHQUFHO1lBQ3pCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFNBQVMs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