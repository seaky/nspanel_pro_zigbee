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
const NS = 'z2m:mqtt';
class MQTT {
    publishedTopics = new Set();
    connectionTimer;
    client;
    eventBus;
    republishRetainedTimer;
    retainedMessages = {};
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async connect() {
        const mqttSettings = settings.get().mqtt;
        logger_1.default.info(`Connecting to MQTT server at ${mqttSettings.server}`);
        const options = {
            will: {
                topic: `${settings.get().mqtt.base_topic}/bridge/state`,
                payload: Buffer.from(JSON.stringify({ state: 'offline' })),
                retain: settings.get().mqtt.force_disable_retain ? false : true,
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
            logger_1.default.debug(`Using MQTT anonymous login`);
        }
        if (mqttSettings.client_id) {
            logger_1.default.debug(`Using MQTT client ID: '${mqttSettings.client_id}'`);
            options.clientId = mqttSettings.client_id;
        }
        if (mqttSettings.reject_unauthorized !== undefined && !mqttSettings.reject_unauthorized) {
            logger_1.default.debug(`MQTT reject_unauthorized set false, ignoring certificate warnings.`);
            options.rejectUnauthorized = false;
        }
        this.client = await (0, mqtt_1.connectAsync)(mqttSettings.server, options);
        // https://github.com/Koenkk/zigbee2mqtt/issues/9822
        this.client.stream.setMaxListeners(0);
        this.client.on('error', (err) => {
            logger_1.default.error(`MQTT error: ${err.message}`);
        });
        if (mqttSettings.version != undefined && mqttSettings.version >= 5) {
            this.client.on('disconnect', (packet) => {
                logger_1.default.error(`MQTT disconnect: reason ${packet.reasonCode} (${packet.properties?.reasonString})`);
            });
        }
        this.client.on('message', this.onMessage);
        await this.onConnect();
        this.client.on('connect', this.onConnect);
        this.republishRetainedTimer = setTimeout(async () => {
            // Republish retained messages in case MQTT broker does not persist them.
            // https://github.com/Koenkk/zigbee2mqtt/issues/9629
            for (const msg of Object.values(this.retainedMessages)) {
                await this.publish(msg.topic, msg.payload, msg.options, msg.base, msg.skipLog, msg.skipReceive);
            }
        }, 2000);
        // Set timer at interval to check if connected to MQTT server.
        this.connectionTimer = setInterval(() => {
            if (!this.isConnected()) {
                logger_1.default.error('Not connected to MQTT server!');
            }
        }, utils_1.default.seconds(10));
    }
    async disconnect() {
        clearTimeout(this.connectionTimer);
        clearTimeout(this.republishRetainedTimer);
        const stateData = { state: 'offline' };
        await this.publish('bridge/state', JSON.stringify(stateData), { retain: true, qos: 0 });
        this.eventBus.removeListeners(this);
        logger_1.default.info('Disconnecting from MQTT server');
        await this.client?.endAsync();
    }
    async subscribe(topic) {
        await this.client.subscribeAsync(topic);
    }
    async unsubscribe(topic) {
        await this.client.unsubscribeAsync(topic);
    }
    async onConnect() {
        logger_1.default.info('Connected to MQTT server');
        const stateData = { state: 'online' };
        await this.publish('bridge/state', JSON.stringify(stateData), { retain: true, qos: 0 });
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
    async publish(topic, payload, options = {}, base = settings.get().mqtt.base_topic, skipLog = false, skipReceive = true) {
        const defaultOptions = { qos: 0, retain: false };
        topic = `${base}/${topic}`;
        if (skipReceive) {
            this.publishedTopics.add(topic);
        }
        if (options.retain) {
            if (payload) {
                this.retainedMessages[topic] = { payload, options, skipReceive, skipLog, topic: topic.substring(base.length + 1), base };
            }
            else {
                delete this.retainedMessages[topic];
            }
        }
        this.eventBus.emitMQTTMessagePublished({ topic, payload, options: { ...defaultOptions, ...options } });
        if (!this.isConnected()) {
            if (!skipLog) {
                logger_1.default.error(`Not connected to MQTT server!`);
                logger_1.default.error(`Cannot send message: topic: '${topic}', payload: '${payload}`);
            }
            return;
        }
        if (!skipLog) {
            logger_1.default.info(() => `MQTT publish: topic '${topic}', payload '${payload}'`, NS);
        }
        const actualOptions = { ...defaultOptions, ...options };
        if (settings.get().mqtt.force_disable_retain) {
            actualOptions.retain = false;
        }
        try {
            await this.client.publishAsync(topic, payload, actualOptions);
        }
        catch (error) {
            if (!skipLog) {
                logger_1.default.error(`MQTT server error: ${error.message}`);
                logger_1.default.error(`Could not send message: topic: '${topic}', payload: '${payload}`);
            }
        }
    }
}
exports.default = MQTT;
__decorate([
    bind_decorator_1.default
], MQTT.prototype, "onConnect", null);
__decorate([
    bind_decorator_1.default
], MQTT.prototype, "onMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXF0dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9tcXR0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUEsc0RBQXlCO0FBRXpCLG9FQUFrQztBQUNsQywrQkFBa0M7QUFFbEMsMkRBQW1DO0FBQ25DLDBEQUE0QztBQUM1Qyx5REFBaUM7QUFFakMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0FBRXRCLE1BQXFCLElBQUk7SUFDYixlQUFlLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7SUFDekMsZUFBZSxDQUFrQjtJQUNqQyxNQUFNLENBQWM7SUFDcEIsUUFBUSxDQUFXO0lBQ25CLHNCQUFzQixDQUFrQjtJQUN6QyxnQkFBZ0IsR0FFbkIsRUFBRSxDQUFDO0lBRVAsWUFBWSxRQUFrQjtRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBRXpDLGdCQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUVuRSxNQUFNLE9BQU8sR0FBbUI7WUFDNUIsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxlQUFlO2dCQUN2RCxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7Z0JBQ3hELE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JB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