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
exports.Frontend = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_fs_1 = require("node:fs");
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const express_static_gzip_1 = __importDefault(require("express-static-gzip"));
const finalhandler_1 = __importDefault(require("finalhandler"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const ws_1 = __importDefault(require("ws"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
/**
 * This extension servers the frontend
 */
class Frontend extends extension_1.default {
    mqttBaseTopic;
    server;
    wss;
    baseUrl;
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        const frontendSettings = settings.get().frontend;
        (0, node_assert_1.default)(frontendSettings.enabled, `Frontend extension created with setting 'enabled: false'`);
        this.baseUrl = frontendSettings.base_url;
        this.mqttBaseTopic = settings.get().mqtt.base_topic;
    }
    async start() {
        if (settings.get().frontend.disable_ui_serving) {
            const { host, port } = settings.get().frontend;
            this.wss = new ws_1.default.Server({ port, host, path: node_path_1.posix.join(this.baseUrl, "api") });
            logger_1.default.info(
            /* v8 ignore next */
            `Frontend UI serving is disabled. WebSocket at: ${this.wss.options.host ?? "0.0.0.0"}:${this.wss.options.port}${this.wss.options.path}`);
        }
        else {
            const { host, port, ssl_key: sslKey, ssl_cert: sslCert } = settings.get().frontend;
            const hasSSL = (val, key) => {
                if (val) {
                    if ((0, node_fs_1.existsSync)(val)) {
                        return true;
                    }
                    logger_1.default.error(`Defined ${key} '${val}' file path does not exists, server won't be secured.`);
                }
                return false;
            };
            const options = {
                enableBrotli: true,
                serveStatic: {
                    /* v8 ignore start */
                    setHeaders: (res, path) => {
                        if (path.endsWith("index.html")) {
                            res.setHeader("Cache-Control", "no-store");
                        }
                    },
                    /* v8 ignore stop */
                },
            };
            const frontend = (await import(settings.get().frontend.package));
            const fileServer = (0, express_static_gzip_1.default)(frontend.default.getPath(), options);
            const deviceIconsFileServer = (0, express_static_gzip_1.default)(data_1.default.joinPath("device_icons"), options);
            const onRequest = (request, response) => {
                const next = (0, finalhandler_1.default)(request, response);
                // biome-ignore lint/style/noNonNullAssertion: `Only valid for request obtained from Server`
                const newUrl = node_path_1.posix.relative(this.baseUrl, request.url);
                // The request url is not within the frontend base url, so the relative path starts with '..'
                if (newUrl.startsWith(".")) {
                    next();
                    return;
                }
                // Attach originalUrl so that static-server can perform a redirect to '/' when serving the root directory.
                // This is necessary for the browser to resolve relative assets paths correctly.
                request.originalUrl = request.url;
                request.url = `/${newUrl}`;
                request.path = request.url;
                if (newUrl.startsWith("device_icons/")) {
                    request.path = request.path.replace("device_icons/", "");
                    request.url = request.url.replace("/device_icons", "");
                    deviceIconsFileServer(request, response, next);
                }
                else {
                    fileServer(request, response, next);
                }
            };
            if (hasSSL(sslKey, "ssl_key") && hasSSL(sslCert, "ssl_cert")) {
                const serverOptions = { key: (0, node_fs_1.readFileSync)(sslKey), cert: (0, node_fs_1.readFileSync)(sslCert) };
                this.server = (0, node_https_1.createServer)(serverOptions, onRequest);
            }
            else {
                this.server = (0, node_http_1.createServer)(onRequest);
            }
            this.server.on("upgrade", this.onUpgrade);
            if (!host) {
                this.server.listen(port);
                logger_1.default.info(`Started frontend on port ${port}`);
            }
            else if (host.startsWith("/")) {
                this.server.listen(host);
                logger_1.default.info(`Started frontend on socket ${host}`);
            }
            else {
                this.server.listen(port, host);
                logger_1.default.info(`Started frontend on port ${host}:${port}`);
            }
            this.wss = new ws_1.default.Server({ noServer: true, path: node_path_1.posix.join(this.baseUrl, "api") });
        }
        this.wss.on("connection", this.onWebSocketConnection);
        this.eventBus.onMQTTMessagePublished(this, this.onMQTTPublishMessageOrEntityState);
        this.eventBus.onPublishEntityState(this, this.onMQTTPublishMessageOrEntityState);
    }
    async stop() {
        await super.stop();
        if (this.wss) {
            for (const client of this.wss.clients) {
                client.send((0, json_stable_stringify_without_jsonify_1.default)({ topic: "bridge/state", payload: { state: "offline" } }));
                client.terminate();
            }
            this.wss.close();
        }
        await new Promise((resolve) => (this.server ? this.server.close(resolve) : resolve(undefined)));
    }
    onUpgrade(request, socket, head) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            // biome-ignore lint/style/noNonNullAssertion: `Only valid for request obtained from Server`
            const { query } = (0, node_url_1.parse)(request.url, true);
            const authToken = settings.get().frontend.auth_token;
            if (!authToken || authToken === query.token) {
                this.wss.emit("connection", ws, request);
            }
            else {
                ws.close(4401, "Unauthorized");
            }
        });
    }
    onWebSocketConnection(ws) {
        ws.on("error", (msg) => logger_1.default.error(`WebSocket error: ${msg.message}`));
        ws.on("message", (data, isBinary) => {
            if (!isBinary && data) {
                const message = data.toString();
                const { topic, payload } = JSON.parse(message);
                this.mqtt.onMessage(`${this.mqttBaseTopic}/${topic}`, Buffer.from((0, json_stable_stringify_without_jsonify_1.default)(payload)));
            }
        });
        for (const [topic, payload] of Object.entries(this.mqtt.retainedMessages)) {
            if (topic.startsWith(`${this.mqttBaseTopic}/`)) {
                ws.send((0, json_stable_stringify_without_jsonify_1.default)({
                    // Send topic without base_topic
                    topic: topic.substring(this.mqttBaseTopic.length + 1),
                    payload: utils_1.default.parseJSON(payload.payload, payload.payload),
                }));
            }
        }
        for (const device of this.zigbee.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            const payload = this.state.get(device);
            const lastSeen = settings.get().advanced.last_seen;
            if (lastSeen !== "disable") {
                payload.last_seen = utils_1.default.formatDate(device.zh.lastSeen ?? /* v8 ignore next */ 0, lastSeen);
            }
            if (device.zh.linkquality !== undefined) {
                payload.linkquality = device.zh.linkquality;
            }
            ws.send((0, json_stable_stringify_without_jsonify_1.default)({ topic: device.name, payload }));
        }
    }
    onMQTTPublishMessageOrEntityState(data) {
        let topic;
        let payload;
        if ("topic" in data) {
            // MQTTMessagePublished
            if (data.options.meta.isEntityState || !data.topic.startsWith(`${this.mqttBaseTopic}/`)) {
                // Don't send entity state to frontend on `MQTTMessagePublished` event, this is handled by
                // `PublishEntityState` instead. Reason for this is to skip attribute messages when `output` is
                // set to `attribute` or `attribute_and_json`, we only want to send JSON entity states to the
                // frontend.
                return;
            }
            // Send topic without base_topic
            topic = data.topic.substring(this.mqttBaseTopic.length + 1);
            payload = utils_1.default.parseJSON(data.payload, data.payload);
        }
        else {
            // PublishEntityState
            topic = data.entity.name;
            payload = data.message;
        }
        for (const client of this.wss.clients) {
            if (client.readyState === ws_1.default.OPEN) {
                client.send((0, json_stable_stringify_without_jsonify_1.default)({ topic, payload }));
            }
        }
    }
}
exports.Frontend = Frontend;
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onUpgrade", null);
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onWebSocketConnection", null);
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onMQTTPublishMessageOrEntityState", null);
exports.default = Frontend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvZXh0ZW5zaW9uL2Zyb250ZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUNqQyxxQ0FBaUQ7QUFFakQseUNBQXVDO0FBQ3ZDLDJDQUE4RDtBQUU5RCx5Q0FBZ0M7QUFDaEMsdUNBQStCO0FBQy9CLG9FQUFrQztBQUNsQyw4RUFBb0Q7QUFDcEQsZ0VBQXdDO0FBQ3hDLGtIQUE4RDtBQUM5RCw0Q0FBMkI7QUFFM0Isd0RBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQUVwQzs7R0FFRztBQUNILE1BQWEsUUFBUyxTQUFRLG1CQUFTO0lBQzNCLGFBQWEsQ0FBUztJQUN0QixNQUFNLENBQXFCO0lBQzNCLEdBQUcsQ0FBb0I7SUFDdkIsT0FBTyxDQUFTO0lBRXhCLFlBQ0ksTUFBYyxFQUNkLElBQVUsRUFDVixLQUFZLEVBQ1osa0JBQXNDLEVBQ3RDLFFBQWtCLEVBQ2xCLHNCQUF3RSxFQUN4RSxlQUFvQyxFQUNwQyxZQUFxRDtRQUVyRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVoSCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7UUFDakQsSUFBQSxxQkFBTSxFQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSwwREFBMEQsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUks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