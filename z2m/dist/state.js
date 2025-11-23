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
const node_fs_1 = require("node:fs");
const object_assign_deep_1 = __importDefault(require("object-assign-deep"));
const data_1 = __importDefault(require("./util/data"));
const logger_1 = __importDefault(require("./util/logger"));
const settings = __importStar(require("./util/settings"));
const utils_1 = __importDefault(require("./util/utils"));
const SAVE_INTERVAL = 1000 * 60 * 5; // 5 minutes
const CACHE_IGNORE_PROPERTIES = [
    "action",
    "action_.*",
    "button",
    "button_left",
    "button_right",
    "forgotten",
    "keyerror",
    "step_size",
    "transition_time",
    "group_list",
    "group_capacity",
    "no_occupancy_since",
    "step_mode",
    "transition_time",
    "duration",
    "elapsed",
    "from_side",
    "to_side",
    "illuminance_lux", // removed in z2m 2.0.0
];
class State {
    eventBus;
    zigbee;
    state = new Map();
    file = data_1.default.joinPath("state.json");
    timer;
    constructor(eventBus, zigbee) {
        this.eventBus = eventBus;
        this.zigbee = zigbee;
        this.eventBus = eventBus;
        this.zigbee = zigbee;
    }
    start() {
        this.load();
        // Save the state on every interval
        this.timer = setInterval(() => this.save(), SAVE_INTERVAL);
    }
    stop() {
        // Remove any invalid states (ie when the device has left the network) when the system is stopped
        for (const [key] of this.state) {
            if (typeof key === "string" && key.startsWith("0x") && !this.zigbee.resolveEntity(key)) {
                // string key = ieeeAddr
                this.state.delete(key);
            }
        }
        clearTimeout(this.timer);
        this.save();
    }
    clear() {
        this.state.clear();
    }
    load() {
        this.state.clear();
        if ((0, node_fs_1.existsSync)(this.file)) {
            try {
                const stateObj = JSON.parse((0, node_fs_1.readFileSync)(this.file, "utf8"));
                for (const key in stateObj) {
                    this.state.set(key.startsWith("0x") ? key : Number.parseInt(key, 10), stateObj[key]);
                }
                logger_1.default.debug(`Loaded state from file ${this.file}`);
            }
            catch (error) {
                logger_1.default.debug(`Failed to load state from file ${this.file} (corrupt file?) (${error.message})`);
            }
        }
        else {
            logger_1.default.debug(`Can't load state from file ${this.file} (doesn't exist)`);
        }
    }
    save() {
        if (settings.get().advanced.cache_state_persistent) {
            logger_1.default.debug(`Saving state to file ${this.file}`);
            const json = JSON.stringify(Object.fromEntries(this.state), null, 4);
            try {
                (0, node_fs_1.writeFileSync)(this.file, json, "utf8");
            }
            catch (error) {
                logger_1.default.error(`Failed to write state to '${this.file}' (${error})`);
            }
        }
        else {
            logger_1.default.debug("Not saving state");
        }
    }
    exists(entity) {
        return this.state.has(entity.ID);
    }
    get(entity) {
        return this.state.get(entity.ID) || {};
    }
    set(entity, update, reason) {
        const fromState = this.state.get(entity.ID) || {};
        const toState = (0, object_assign_deep_1.default)({}, fromState, update);
        const newCache = { ...toState };
        const entityDontCacheProperties = entity.options.filtered_cache || [];
        utils_1.default.filterProperties(CACHE_IGNORE_PROPERTIES.concat(entityDontCacheProperties), newCache);
        this.state.set(entity.ID, newCache);
        this.eventBus.emitStateChange({ entity, from: fromState, to: toState, reason, update });
        return toState;
    }
    remove(id) {
        return this.state.delete(id);
    }
}
exports.default = State;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBZ0U7QUFFaEUsNEVBQWtEO0FBRWxELHVEQUErQjtBQUMvQiwyREFBbUM7QUFDbkMsMERBQTRDO0FBQzVDLHlEQUFpQztBQUVqQyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVk7QUFDakQsTUFBTSx1QkFBdUIsR0FBRztJQUM1QixRQUFRO0lBQ1IsV0FBVztJQUNYLFFBQVE7SUFDUixhQUFhO0lBQ2IsY0FBYztJQUNkLFdBQVc7SUFDWCxVQUFVO0lBQ1YsV0FBVztJQUNYLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osZ0JBQWdCO0lBQ2hCLG9CQUFvQjtJQUNwQixXQUFXO0lBQ1gsaUJBQWlCO0lBQ2pCLFVBQVU7SUFDVixTQUFTO0lBQ1QsV0FBVztJQUNYLFNBQVM7SUFDVCxpQkFBaUIsRUFBRSx1QkFBdUI7Q0FDN0MsQ0FBQztBQUVGLE1BQU0sS0FBSztJQU1jO0lBQ0E7SUFOSixLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7SUFDN0MsSUFBSSxHQUFHLGNBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsS0FBSyxDQUFrQjtJQUUvQixZQUNxQixRQUFrQixFQUNsQixNQUFjO1FBRGQsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNsQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRS9CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FB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