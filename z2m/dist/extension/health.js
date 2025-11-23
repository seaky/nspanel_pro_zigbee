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
const os = __importStar(require("node:os"));
const process = __importStar(require("node:process"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
/** Round with 2 decimals */
const round2 = (n) => Math.round(n * 100.0) / 100.0;
/** Round with 4 decimals */
const round4 = (n) => Math.round(n * 10000.0) / 10000.0;
class Health extends extension_1.default {
    #checkTimer;
    async start() {
        await super.start();
        this.#checkTimer = setInterval(this.#checkHealth.bind(this), utils_1.default.minutes(settings.get().health.interval));
    }
    async stop() {
        clearInterval(this.#checkTimer);
        await super.stop();
    }
    clearStats() {
        this.eventBus.stats.devices.clear();
        this.eventBus.stats.mqtt.published = 0;
        this.eventBus.stats.mqtt.received = 0;
    }
    async #checkHealth() {
        const sysMemTotalKb = os.totalmem() / 1024;
        const sysMemFreeKb = os.freemem() / 1024;
        const sysMemUsedKb = sysMemTotalKb - sysMemFreeKb;
        const procMemUsedKb = process.memoryUsage().rss / 1024;
        const healthcheck = {
            response_time: Date.now(),
            os: {
                load_average: os.loadavg(), // will be [0,0,0] on Windows (not supported)
                memory_used_mb: round2(sysMemUsedKb / 1024),
                memory_percent: round4((sysMemUsedKb / sysMemTotalKb) * 100.0),
            },
            process: {
                uptime_sec: Math.floor(process.uptime()),
                memory_used_mb: round2(procMemUsedKb / 1024),
                memory_percent: round4((procMemUsedKb / sysMemTotalKb) * 100.0),
            },
            mqtt: { ...this.mqtt.stats, ...this.eventBus.stats.mqtt },
            devices: {},
        };
        for (const [ieeeAddr, device] of this.eventBus.stats.devices) {
            let messages = 0;
            let mps = 0;
            if (device.lastSeenChanges) {
                const timeDiff = Date.now() - device.lastSeenChanges.first;
                messages = device.lastSeenChanges.messages;
                mps = timeDiff > 0 ? round4(messages / (timeDiff / 1000.0)) : 0;
            }
            healthcheck.devices[ieeeAddr] = {
                messages,
                messages_per_sec: mps,
                leave_count: device.leaveCounts,
                network_address_changes: device.networkAddressChanges,
            };
        }
        if (settings.get().health.reset_on_check) {
            this.clearStats();
        }
        await this.mqtt.publish("bridge/health", JSON.stringify(healthcheck), { clientOptions: { retain: true, qos: 1 } });
    }
}
exports.default = Health;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhbHRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9oZWFsdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0Q0FBOEI7QUFDOUIsc0RBQXdDO0FBRXhDLDJEQUE2QztBQUM3QywwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDLDRCQUE0QjtBQUM1QixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ3BFLDRCQUE0QjtBQUM1QixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBRXhFLE1BQXFCLE1BQU8sU0FBUSxtQkFBUztJQUN6QyxXQUFXLENBQTZCO0lBRS9CLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNmLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEMsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFVBQVU7UUFDTixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEMsSUFB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