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
const zigbee2mqtt_frontend_1 = __importDefault(require("zigbee2mqtt-frontend"));
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
    host;
    port;
    sslCert;
    sslKey;
    authToken;
    server;
    fileServer;
    deviceIconsFileServer;
    wss;
    baseUrl;
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        const frontendSettings = settings.get().frontend;
        (0, node_assert_1.default)(frontendSettings.enabled, `Frontend extension created with setting 'enabled: false'`);
        this.host = frontendSettings.host;
        this.port = frontendSettings.port;
        this.sslCert = frontendSettings.ssl_cert;
        this.sslKey = frontendSettings.ssl_key;
        this.authToken = frontendSettings.auth_token;
        this.baseUrl = frontendSettings.base_url;
        this.mqttBaseTopic = settings.get().mqtt.base_topic;
    }
    isHttpsConfigured() {
        if (this.sslCert && this.sslKey) {
            if (!(0, node_fs_1.existsSync)(this.sslCert) || !(0, node_fs_1.existsSync)(this.sslKey)) {
                logger_1.default.error(`defined ssl_cert '${this.sslCert}' or ssl_key '${this.sslKey}' file path does not exists, server won't be secured.`);
                return false;
            }
            return true;
        }
        return false;
    }
    async start() {
        const options = {
            enableBrotli: true,
            // TODO: https://github.com/Koenkk/zigbee2mqtt/issues/24654 - enable compressed index serving when express-static-gzip is fixed.
            index: false,
            serveStatic: {
                index: 'index.html',
                /* v8 ignore start */
                setHeaders: (res, path) => {
                    if (path.endsWith('index.html')) {
                        res.setHeader('Cache-Control', 'no-store');
                    }
                },
                /* v8 ignore stop */
            },
        };
        this.fileServer = (0, express_static_gzip_1.default)(zigbee2mqtt_frontend_1.default.getPath(), options);
        this.deviceIconsFileServer = (0, express_static_gzip_1.default)(data_1.default.joinPath('device_icons'), options);
        this.wss = new ws_1.default.Server({ noServer: true, path: node_path_1.posix.join(this.baseUrl, 'api') });
        this.wss.on('connection', this.onWebSocketConnection);
        if (this.isHttpsConfigured()) {
            const serverOptions = {
                key: (0, node_fs_1.readFileSync)(this.sslKey), // valid from `isHttpsConfigured`
                cert: (0, node_fs_1.readFileSync)(this.sslCert), // valid from `isHttpsConfigured`
            };
            this.server = (0, node_https_1.createServer)(serverOptions, this.onRequest);
        }
        else {
            this.server = (0, node_http_1.createServer)(this.onRequest);
        }
        this.server.on('upgrade', this.onUpgrade);
        this.eventBus.onMQTTMessagePublished(this, this.onMQTTPublishMessage);
        if (!this.host) {
            this.server.listen(this.port);
            logger_1.default.info(`Started frontend on port ${this.port}`);
        }
        else if (this.host.startsWith('/')) {
            this.server.listen(this.host);
            logger_1.default.info(`Started frontend on socket ${this.host}`);
        }
        else {
            this.server.listen(this.port, this.host);
            logger_1.default.info(`Started frontend on port ${this.host}:${this.port}`);
        }
    }
    async stop() {
        await super.stop();
        this.wss?.clients.forEach((client) => {
            client.send((0, json_stable_stringify_without_jsonify_1.default)({ topic: 'bridge/state', payload: 'offline' }));
            client.terminate();
        });
        this.wss?.close();
        await new Promise((resolve) => this.server?.close(resolve));
    }
    onRequest(request, response) {
        const fin = (0, finalhandler_1.default)(request, response);
        const newUrl = node_path_1.posix.relative(this.baseUrl, request.url);
        // The request url is not within the frontend base url, so the relative path starts with '..'
        if (newUrl.startsWith('.')) {
            return fin();
        }
        // Attach originalUrl so that static-server can perform a redirect to '/' when serving the root directory.
        // This is necessary for the browser to resolve relative assets paths correctly.
        request.originalUrl = request.url;
        request.url = '/' + newUrl;
        request.path = request.url;
        if (newUrl.startsWith('device_icons/')) {
            request.path = request.path.replace('device_icons/', '');
            request.url = request.url.replace('/device_icons', '');
            this.deviceIconsFileServer(request, response, fin);
        }
        else {
            this.fileServer(request, response, fin);
        }
    }
    authenticate(request, cb) {
        const { query } = (0, node_url_1.parse)(request.url, true);
        cb(!this.authToken || this.authToken === query.token);
    }
    onUpgrade(request, socket, head) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.authenticate(request, (isAuthenticated) => {
                if (isAuthenticated) {
                    this.wss.emit('connection', ws, request);
                }
                else {
                    ws.close(4401, 'Unauthorized');
                }
            });
        });
    }
    onWebSocketConnection(ws) {
        ws.on('error', (msg) => logger_1.default.error(`WebSocket error: ${msg.message}`));
        ws.on('message', (data, isBinary) => {
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
            if (lastSeen !== 'disable') {
                payload.last_seen = utils_1.default.formatDate(device.zh.lastSeen ?? /* v8 ignore next */ 0, lastSeen);
            }
            if (device.zh.linkquality !== undefined) {
                payload.linkquality = device.zh.linkquality;
            }
            ws.send((0, json_stable_stringify_without_jsonify_1.default)({ topic: device.name, payload }));
        }
    }
    onMQTTPublishMessage(data) {
        if (data.topic.startsWith(`${this.mqttBaseTopic}/`)) {
            // Send topic without base_topic
            const topic = data.topic.substring(this.mqttBaseTopic.length + 1);
            const payload = utils_1.default.parseJSON(data.payload, data.payload);
            for (const client of this.wss.clients) {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send((0, json_stable_stringify_without_jsonify_1.default)({ topic, payload }));
                }
            }
        }
    }
}
exports.default = Frontend;
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onRequest", null);
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onUpgrade", null);
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onWebSocketConnection", null);
__decorate([
    bind_decorator_1.default
], Frontend.prototype, "onMQTTPublishMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvZXh0ZW5zaW9uL2Zyb250ZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsOERBQWlDO0FBQ2pDLHFDQUFpRDtBQUNqRCx5Q0FBdUM7QUFDdkMsMkNBQThEO0FBQzlELHlDQUFnQztBQUNoQyx1Q0FBK0I7QUFFL0Isb0VBQWtDO0FBQ2xDLDhFQUFvRDtBQUNwRCxnRUFBd0M7QUFDeEMsa0hBQThEO0FBQzlELDRDQUEyQjtBQUUzQixnRkFBNEM7QUFFNUMsd0RBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQUVwQzs7R0FFRztBQUNILE1BQXFCLFFBQVMsU0FBUSxtQkFBUztJQUNuQyxhQUFhLENBQVM7SUFDdEIsSUFBSSxDQUFxQjtJQUN6QixJQUFJLENBQVM7SUFDYixPQUFPLENBQXFCO0lBQzVCLE1BQU0sQ0FBcUI7SUFDM0IsU0FBUyxDQUFxQjtJQUM5QixNQUFNLENBQVU7SUFDaEIsVUFBVSxDQUFrQjtJQUM1QixxQkFBcUIsQ0FBa0I7SUFDdkMsR0FBRyxDQUFvQjtJQUN2QixPQUFPLENBQVM7SUFFeEIsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFEO1FBRXJELEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWhILE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztRQUNqRCxJQUFBLHFCQUFNLEVBQUMsZ0JBQWdCLENBQUMs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