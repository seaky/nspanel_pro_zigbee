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
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const externalJS_1 = __importDefault(require("./externalJS"));
class ExternalExtensions extends externalJS_1.default {
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, 'extension', 'external_extensions');
    }
    async removeJS(name, module) {
        await this.enableDisableExtension(false, module.name);
    }
    async loadJS(name, module) {
        // stop if already started
        await this.enableDisableExtension(false, module.name);
        await this.addExtension(
        // @ts-expect-error `module` is the interface, not the actual passed class
        new module(this.zigbee, this.mqtt, this.state, this.publishEntityState, this.eventBus, this.enableDisableExtension, this.restartCallback, this.addExtension, settings, logger_1.default));
        logger_1.default.info(`Loaded external extension '${name}'.`);
    }
}
exports.default = ExternalExtensions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxFeHRlbnNpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlcm5hbEV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSw0REFBb0M7QUFDcEMsMkRBQTZDO0FBQzdDLDhEQUErQztBQUkvQyxNQUFxQixrQkFBbUIsU0FBUSxvQkFBa0M7SUFDOUUsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFEO1FBRXJELEtBQUssQ0FDRCxNQUFNLEVBQ04sSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLHNCQUFzQixFQUN0QixlQUFlLEVBQ2YsWUFBWSxFQUNaLFdBQVcsRUFDWCxxQkFBcUIsQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFUyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQVksRUFBRSxNQUFxQjtRQUN4RCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFUyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVksRUFBRSxNQUFxQjtRQUN0RCwwQkFBMEI7UUFDMUIsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLElBQUksQ0FBQyxZQUFZO1FBQ25CLDBFQUEwRTtRQUMxRSxJQUFJLE1BQU0sQ0FDTixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLHNCQUFzQixFQUMzQixJQUFJLENBQUMsZUFBZSxFQUNwQixJQUFJLENBQUMsWUFBWSxFQUNqQixRQUFRLEVBQ1IsZ0JBQU0sQ0FDVCxDQUNKLENBQUM7UUFFRixnQkFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDO0NBQ0o7QUFsREQscUNBa0RDIn0=