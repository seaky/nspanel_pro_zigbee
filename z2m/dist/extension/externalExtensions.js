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
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, "extension", "external_extensions");
    }
    async removeJS(_name, mod) {
        await this.enableDisableExtension(false, mod.name);
    }
    async loadJS(name, mod, newName) {
        try {
            // stop if already started
            await this.enableDisableExtension(false, mod.name);
            await this.addExtension(new mod(this.zigbee, this.mqtt, this.state, this.publishEntityState, this.eventBus, this.enableDisableExtension, this.restartCallback, this.addExtension, 
            // @ts-expect-error additional params that don't fit the internal `Extension` type
            settings, logger_1.default));
            /* v8 ignore start */
            logger_1.default.info(`Loaded external extension '${newName ?? name}'.`);
        }
        catch (error) {
            logger_1.default.error(
            /* v8 ignore next */
            `Failed to load external extension '${newName ?? name}'. Check the code for syntax error and make sure it is up to date with the current Zigbee2MQTT version.`);
            throw error;
        }
        /* v8 ignore stop */
    }
}
exports.default = ExternalExtensions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxFeHRlbnNpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlcm5hbEV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBb0M7QUFDcEMsMkRBQTZDO0FBRTdDLDhEQUErQztBQUkvQyxNQUFxQixrQkFBbUIsU0FBUSxvQkFBNEI7SUFDeEUsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFEO1FBRXJELEtBQUssQ0FDRCxNQUFNLEVBQ04sSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLHNCQUFzQixFQUN0QixlQUFlLEVBQ2YsWUFBWSxFQUNaLFdBQVcsRUFDWCxxQkFBcUIsQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFUyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxHQUFZO1FBQ2hELE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVTLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBWSxFQUFFLEdBQVksRUFBRSxPQUFnQjtRQUMvRCxJQUFJLENBQUM7WUFDRCwwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQ25CLElBQUksR0FBRyxDQUNILElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxrQkFBa0IsRUFDdkIsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsc0JBQXNCLEVBQzNCLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxZQUFZO1lBQ2pCLGtGQUFrRjtZQUNsRixRQUFRLEVBQ1IsZ0JBQU0sQ0FDVCxDQUNKLENBQUM7WUFFRixxQkFBcUI7WUFDckIsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsZ0JBQU0sQ0FBQyxLQUFLO1lBQ1Isb0JBQW9CO1lBQ3BCLHNDQUFzQyxPQUFPLElBQUksSUFBSSx5R0FBeUcsQ0FDakssQ0FBQztZQUVGLE1BQU0sS0FBSyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxvQkFBb0I7SUFDeEIsQ0FBQztDQUNKO0FBN0RELHFDQTZEQyJ9