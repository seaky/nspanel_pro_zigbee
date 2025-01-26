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
const node_path_1 = __importDefault(require("node:path"));
const node_vm_1 = require("node:vm");
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const data_1 = __importDefault(require("../util/data"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const SUPPORTED_OPERATIONS = ['save', 'remove'];
class ExternalJSExtension extends extension_1.default {
    mqttTopic;
    requestRegex;
    basePath;
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, mqttTopic, folderName) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        this.mqttTopic = mqttTopic;
        this.requestRegex = new RegExp(`${settings.get().mqtt.base_topic}/bridge/request/${mqttTopic}/(save|remove)`);
        this.basePath = data_1.default.joinPath(folderName);
    }
    async start() {
        await super.start();
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
        await this.loadFiles();
        await this.publishExternalJS();
    }
    getFilePath(name, mkBasePath = false) {
        if (mkBasePath && !node_fs_1.default.existsSync(this.basePath)) {
            node_fs_1.default.mkdirSync(this.basePath, { recursive: true });
        }
        return node_path_1.default.join(this.basePath, name);
    }
    getFileCode(name) {
        return node_fs_1.default.readFileSync(node_path_1.default.join(this.basePath, name), 'utf8');
    }
    *getFiles() {
        if (!node_fs_1.default.existsSync(this.basePath)) {
            return;
        }
        for (const fileName of node_fs_1.default.readdirSync(this.basePath)) {
            if (fileName.endsWith('.js')) {
                yield { name: fileName, code: this.getFileCode(fileName) };
            }
        }
    }
    async onMQTTMessage(data) {
        const match = data.topic.match(this.requestRegex);
        if (match && SUPPORTED_OPERATIONS.includes(match[1].toLowerCase())) {
            const message = utils_1.default.parseJSON(data.message, data.message);
            try {
                let response;
                if (match[1].toLowerCase() === 'save') {
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
            return utils_1.default.getResponse(message, {}, `Invalid payload`);
        }
        const { name } = message;
        const toBeRemoved = this.getFilePath(name);
        if (node_fs_1.default.existsSync(toBeRemoved)) {
            await this.removeJS(name, this.loadModuleFromText(this.getFileCode(name), name));
            node_fs_1.default.rmSync(toBeRemoved, { force: true });
            logger_1.default.info(`${name} (${toBeRemoved}) removed.`);
            await this.publishExternalJS();
            return utils_1.default.getResponse(message, {});
        }
        else {
            return utils_1.default.getResponse(message, {}, `${name} (${toBeRemoved}) doesn't exists`);
        }
    }
    async save(message) {
        if (!message.name || !message.code) {
            return utils_1.default.getResponse(message, {}, `Invalid payload`);
        }
        const { name, code } = message;
        try {
            await this.loadJS(name, this.loadModuleFromText(code, name));
            const filePath = this.getFilePath(name, true);
            node_fs_1.default.writeFileSync(filePath, code, 'utf8');
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
            await this.loadJS(extension.name, this.loadModuleFromText(extension.code, extension.name));
        }
    }
    async publishExternalJS() {
        await this.mqtt.publish(`bridge/${this.mqttTopic}s`, (0, json_stable_stringify_without_jsonify_1.default)(Array.from(this.getFiles())), {
            retain: true,
            qos: 0,
        }, settings.get().mqtt.base_topic, true);
    }
    loadModuleFromText(moduleCode, name) {
        const moduleFakePath = node_path_1.default.join(__dirname, '..', '..', 'data', 'extension', name);
        const sandbox = {
            require: require,
            module: {},
            console,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            setImmediate,
            clearImmediate,
        };
        (0, node_vm_1.runInNewContext)(moduleCode, sandbox, moduleFakePath);
        return sandbox.module.exports;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxKUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vZXh0ZXJuYWxKUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHNEQUF5QjtBQUN6QiwwREFBNkI7QUFDN0IscUNBQWlEO0FBRWpELG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFFOUQsd0RBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywyREFBNkM7QUFDN0MsMERBQWtDO0FBQ2xDLDREQUFvQztBQUVwQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBRWhELE1BQThCLG1CQUF1QixTQUFRLG1CQUFTO0lBQ3hELFNBQVMsQ0FBUztJQUNsQixZQUFZLENBQVM7SUFDckIsUUFBUSxDQUFTO0lBRTNCLFlBQ0ksTUFBYyxFQUNkLElBQVUsRUFDVixLQUFZLEVBQ1osa0JBQXNDLEVBQ3RDLFFBQWtCLEVBQ2xCLHNCQUF3RSxFQUN4RSxlQUFvQyxFQUNwQyxZQUFxRCxFQUNyRCxTQUFpQixFQUNqQixVQUFrQjtRQUVsQixLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVoSCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLG1CQUFtQixTQUFTLGdCQUFnQixDQUFDLENBQUM7UUFDOUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFUSxLQUFLLENBQUMsS0FBSztRQUNoQixNQUFNLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVPLFdBQVcsQ0FBQyxJQUFZLEVBQUUsYUFBc0IsS0FBSztRQUN6RCxJQUFJLFVBQVUsSUFBSSxDQUFDLGlCQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzlDLGlCQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsT0FBTyxtQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFUyxXQUFXLENBQUMsSUFBWTtRQUM5QixPQUFPLGlCQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVTLENBQUMsUUFBUTtRQUNmLElBQUksQ0FBQyxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxPQUFPO1FBQ1gsQ0FBQztRQUVELEtBQUssTUFBTSxRQUFRLElBQUksaUJBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbkQsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUM7WUFDN0QsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRVcsQUFBTixLQUFLLENBQUMsYUFBYSxDQUFDLElBQTJCO1FBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVsRCxJQUFJLEtBQUssSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNqRSxNQUFNLE9BQU8sR0FBRyxlQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQztnQkFDRCxJQUFJLFFBQVEsQ0FBQztnQkFFYixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDcEMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FDdEIsT0FBNEcsQ0FDL0csQ0FBQztnQkFDTixDQUFDO3FCQUFNLENBQUM7b0JBQ0osUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FDeEIsT0FBZ0gsQ0FDbkgsQ0FBQztnQkFDTixDQUFDO2dCQUVELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBQSwrQ0FBUyxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbEcsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsS0FBSyx5QkFBMEIsS0FBZSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBRXpGLE1BQU0sUUFBUSxHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFJLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUUvRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixJQUFJLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUEsK0NBQVMsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQU1tQixBQUFOLEtBQUssQ0FBQyxNQUFNLENBQ3RCLE9BQThHO1FBRTlHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTyxlQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNDLElBQUksaUJBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFakYsaUJBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDdEMsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssV0FBVyxZQUFZLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRS9CLE9BQU8sZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLGVBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxXQUFXLGtCQUFrQixDQUFDLENBQUM7UUFDckYsQ0FBQztJQUNMLENBQUM7SUFFbUIsQUFBTixLQUFLLENBQUMsSUFBSSxDQUNwQixPQUEwRztRQUUxRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQyxPQUFPLGVBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxNQUFNLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUU3QixJQUFJLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU3RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU5QyxpQkFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQ0FBaUMsUUFBUSxJQUFJLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRS9CLE9BQU8sZUFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLGVBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksMkJBQTRCLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3hHLENBQUM7SUFDTCxDQUFDO0lBRU8sS0FBSyxDQUFDLFNBQVM7UUFDbkIsS0FBSyxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztZQUN0QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRixDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxpQkFBaUI7UUFDM0IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDbkIsVUFBVSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQzNCLElBQUEsK0NBQVMsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQ3RDO1lBQ0ksTUFBTSxFQUFFLElBQUk7WUFDWixHQUFHLEVBQUUsQ0FBQztTQUNULEVBQ0QsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQzlCLElBQUksQ0FDUCxDQUFDO0lBQ04sQ0FBQztJQUVPLGtCQUFrQixDQUFDLFVBQWtCLEVBQUUsSUFBWTtRQUN2RCxNQUFNLGNBQWMsR0FBRyxtQkFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25GLE1BQU0sT0FBTyxHQUFZO1lBQ3JCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsT0FBTztZQUNQLFVBQVU7WUFDVixZQUFZO1lBQ1osV0FBVztZQUNYLGFBQWE7WUFDYixZQUFZO1lBQ1osY0FBYztTQUNqQixDQUFDO1FBRUYsSUFBQSx5QkFBZSxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFckQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUE3S0Qsc0NBNktDO0FBdEhlO0lBQVgsd0JBQUk7d0RBNEJKO0FBTW1CO0lBQW5CLHdCQUFJO2lEQXFCSjtBQUVtQjtJQUFuQix3QkFBSTsrQ0FzQkoifQ==