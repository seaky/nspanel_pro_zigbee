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
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const SUPPORTED_OPERATIONS = ["save", "remove"];
const TMP_PREFIX = ".tmp-ed42d4f2-";
class ExternalJSExtension extends extension_1.default {
    folderName;
    mqttTopic;
    requestRegex;
    basePath;
    nodeModulesSymlinked = false;
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, mqttTopic, folderName) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        this.folderName = folderName;
        this.mqttTopic = mqttTopic;
        this.requestRegex = new RegExp(`${settings.get().mqtt.base_topic}/bridge/request/${mqttTopic}/(save|remove)`);
        this.basePath = data_1.default.joinPath(folderName);
    }
    /**
     * In case the external JS is not in the Z2M install dir (e.g. when `ZIGBEE2MQTT_DATA` is used), the external
     * JS cannot import from `node_modules`.
     * To workaround this create a symlink to `node_modules` in the external JS dir.
     * https://nodejs.org/api/esm.html#no-node_path
     */
    symlinkNodeModulesIfNecessary() {
        if (!this.nodeModulesSymlinked) {
            this.nodeModulesSymlinked = true;
            const nodeModulesPath = node_path_1.default.join(__dirname, "..", "..", "node_modules");
            const z2mDirNormalized = `${node_path_1.default.resolve(node_path_1.default.join(nodeModulesPath, ".."))}${node_path_1.default.sep}`;
            const basePathNormalized = `${node_path_1.default.resolve(this.basePath)}${node_path_1.default.sep}`;
            const basePathInZ2mDir = basePathNormalized.startsWith(z2mDirNormalized);
            if (!basePathInZ2mDir) {
                logger_1.default.debug(`External JS folder '${this.folderName}' is outside the Z2M install dir, creating a symlink to 'node_modules'`);
                const nodeModulesSymlink = node_path_1.default.join(this.basePath, "node_modules");
                /* v8 ignore start */
                if (node_fs_1.default.existsSync(nodeModulesSymlink)) {
                    node_fs_1.default.unlinkSync(nodeModulesSymlink);
                }
                /* v8 ignore stop */
                // Type `junction` is required on Windows.
                // https://github.com/nodejs/node/issues/18518#issuecomment-513866491
                node_fs_1.default.symlinkSync(nodeModulesPath, nodeModulesSymlink, /* v8 ignore next */ node_os_1.default.platform() === "win32" ? "junction" : "dir");
            }
        }
    }
    async start() {
        await super.start();
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        await this.loadFiles();
        await this.publishExternalJS();
    }
    async stop() {
        await super.stop();
        // ensure "node_modules" is never followed & included in 3rd-party backup systems
        const nodeModulesSymlink = node_path_1.default.join(this.basePath, "node_modules");
        if (node_fs_1.default.existsSync(nodeModulesSymlink)) {
            node_fs_1.default.unlinkSync(nodeModulesSymlink);
        }
    }
    getFilePath(name, mkBasePath = false) {
        if (mkBasePath && !node_fs_1.default.existsSync(this.basePath)) {
            node_fs_1.default.mkdirSync(this.basePath, { recursive: true });
        }
        return node_path_1.default.join(this.basePath, name);
    }
    getFileCode(name) {
        return node_fs_1.default.readFileSync(this.getFilePath(name), "utf8");
    }
    *getFiles() {
        if (node_fs_1.default.existsSync(this.basePath)) {
            for (const fileName of node_fs_1.default.readdirSync(this.basePath)) {
                if (!fileName.startsWith(TMP_PREFIX) && (fileName.endsWith(".js") || fileName.endsWith(".cjs") || fileName.endsWith(".mjs"))) {
                    yield { name: fileName, code: this.getFileCode(fileName) };
                }
            }
        }
    }
    async onMQTTMessage(data) {
        const match = data.topic.match(this.requestRegex);
        if (match && SUPPORTED_OPERATIONS.includes(match[1].toLowerCase())) {
            const message = utils_1.default.parseJSON(data.message, data.message);
            try {
                let response;
                if (match[1].toLowerCase() === "save") {
                    response = await this.save(message);
                }
                else {
                    response = await this.remove(message);
                }
                await this.mqtt.publish(`bridge/response/${this.mqttTopic}/${match[1]}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
            }
            catch (error) {
                logger_1.default.error(`Request '${data.topic}' failed with error: '${error.message}'`);
                const response = utils_1.default.getResponse(message, {}, `${error.message}`);
                await this.mqtt.publish(`bridge/response/${this.mqttTopic}/${match[1]}`, (0, json_stable_stringify_without_jsonify_1.default)(response));
            }
        }
    }
    async remove(message) {
        if (!message.name) {
            return utils_1.default.getResponse(message, {}, "Invalid payload");
        }
        const { name } = message;
        const toBeRemoved = this.getFilePath(name);
        if (node_fs_1.default.existsSync(toBeRemoved)) {
            const mod = await this.importFile(toBeRemoved);
            await this.removeJS(name, mod.default);
            node_fs_1.default.rmSync(toBeRemoved, { force: true });
            logger_1.default.info(`${name} (${toBeRemoved}) removed.`);
            await this.publishExternalJS();
            return utils_1.default.getResponse(message, {});
        }
        return utils_1.default.getResponse(message, {}, `${name} (${toBeRemoved}) doesn't exists`);
    }
    async save(message) {
        if (!message.name || !message.code) {
            return utils_1.default.getResponse(message, {}, "Invalid payload");
        }
        const { name, code } = message;
        const filePath = this.getFilePath(name, true);
        try {
            node_fs_1.default.writeFileSync(filePath, code, "utf8");
            this.symlinkNodeModulesIfNecessary();
            const mod = await this.importFile(filePath);
            await this.loadJS(name, mod.default, name);
            logger_1.default.info(`${name} loaded. Contents written to '${filePath}'.`);
            await this.publishExternalJS();
            return utils_1.default.getResponse(message, {});
        }
        catch (error) {
            return utils_1.default.getResponse(message, {}, `${name} contains invalid code: ${error.message}`);
        }
    }
    async loadFiles() {
        for (const extension of this.getFiles()) {
            this.symlinkNodeModulesIfNecessary();
            const filePath = this.getFilePath(extension.name);
            try {
                const mod = await this.importFile(filePath);
                await this.loadJS(extension.name, mod.default);
            }
            catch (error) {
                // change ext so Z2M doesn't try to load it again and again
                node_fs_1.default.renameSync(filePath, `${filePath}.invalid`);
                logger_1.default.error(`Invalid external ${this.mqttTopic} '${extension.name}' was ignored and renamed to prevent interference with Zigbee2MQTT. (${error.message})`);
                // biome-ignore lint/style/noNonNullAssertion: always Error
                logger_1.default.debug(error.stack);
            }
        }
    }
    async publishExternalJS() {
        await this.mqtt.publish(`bridge/${this.mqttTopic}s`, (0, json_stable_stringify_without_jsonify_1.default)(Array.from(this.getFiles())), {
            clientOptions: { retain: true },
            skipLog: true,
        });
    }
    // biome-ignore lint/suspicious/noExplicitAny: dynamic module
    async importFile(file) {
        const ext = node_path_1.default.extname(file);
        // Create the file in a temp path to bypass node module cache when importing multiple times.
        const tmpFile = node_path_1.default.join(this.basePath, `${TMP_PREFIX}${node_path_1.default.basename(file, ext)}-${crypto.randomUUID()}${ext}`);
        node_fs_1.default.copyFileSync(file, tmpFile);
        try {
            // Do `replaceAll("\\", "/")` to prevent issues on Windows
            /* v8 ignore next */
            const mod = await import(node_os_1.default.platform() === "win32" ? `file:///${tmpFile.replaceAll("\\", "/")}` : tmpFile);
            return mod;
        }
        finally {
            node_fs_1.default.rmSync(tmpFile);
        }
    }
}
exports.default = ExternalJSExtension;
__decorate([
    bind_decorator_1.default
], ExternalJSExtension.prototype, "onMQTTMessage", null);
__decorate([
    bind_decorator_1.default
], ExternalJSExtension.prototype, "remove", null);
__decorate([
    bind_decorator_1.default
], ExternalJSExtension.prototype, "save", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxKUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vZXh0ZXJuYWxKUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUF5QjtBQUN6QixzREFBeUI7QUFDekIsMERBQTZCO0FBQzdCLG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFHOUQsd0RBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQUVwQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDO0FBRXBDLE1BQThCLG1CQUF1QixTQUFRLG1CQUFTO0lBQ3hELFVBQVUsQ0FBUztJQUNuQixTQUFTLENBQVM7SUFDbEIsWUFBWSxDQUFTO0lBQ3JCLFFBQVEsQ0FBUztJQUNqQixvQkFBb0IsR0FBRyxLQUFLLENBQUM7SUFFdkMsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFELEVBQ3JELFNBQWlCLEVBQ2pCLFVBQWtCO1FBRWxCLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWhILElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsbUJBQW1CLFNBQVMs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