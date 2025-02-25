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
const node_assert_1 = __importDefault(require("node:assert"));
const zhc = __importStar(require("zigbee-herdsman-converters"));
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const settings = __importStar(require("../util/settings"));
const LINKQUALITY = new zigbee_herdsman_converters_1.Numeric('linkquality', zigbee_herdsman_converters_1.access.STATE)
    .withUnit('lqi')
    .withDescription('Link quality (signal strength)')
    .withValueMin(0)
    .withValueMax(255)
    .withCategory('diagnostic');
class Device {
    zh;
    definition;
    _definitionModelID;
    get ieeeAddr() {
        return this.zh.ieeeAddr;
    }
    get ID() {
        return this.zh.ieeeAddr;
    }
    get options() {
        const deviceOptions = settings.getDevice(this.ieeeAddr) ?? { friendly_name: this.ieeeAddr, ID: this.ieeeAddr };
        return { ...settings.get().device_options, ...deviceOptions };
    }
    get name() {
        return this.zh.type === 'Coordinator' ? 'Coordinator' : this.options?.friendly_name;
    }
    get isSupported() {
        return this.zh.type === 'Coordinator' || Boolean(this.definition && !this.definition.generated);
    }
    get customClusters() {
        return this.zh.customClusters;
    }
    get otaExtraMetas() {
        return typeof this.definition?.ota === 'object' ? this.definition.ota : {};
    }
    constructor(device) {
        this.zh = device;
    }
    exposes() {
        const exposes = [];
        (0, node_assert_1.default)(this.definition, 'Cannot retreive exposes before definition is resolved');
        if (typeof this.definition.exposes == 'function') {
            const options = this.options;
            exposes.push(...this.definition.exposes(this.zh, options));
        }
        else {
            exposes.push(...this.definition.exposes);
        }
        exposes.push(LINKQUALITY);
        return exposes;
    }
    async resolveDefinition(ignoreCache = false) {
        if (!this.zh.interviewing && (!this.definition || this._definitionModelID !== this.zh.modelID || ignoreCache)) {
            this.definition = await zhc.findByDevice(this.zh, true);
            this._definitionModelID = this.zh.modelID;
        }
    }
    ensureInSettings() {
        if (this.zh.type !== 'Coordinator' && !settings.getDevice(this.zh.ieeeAddr)) {
            settings.addDevice(this.zh.ieeeAddr);
        }
    }
    endpoint(key) {
        let endpoint;
        if (key == null || key == '') {
            key = 'default';
        }
        if (!isNaN(Number(key))) {
            endpoint = this.zh.getEndpoint(Number(key));
        }
        else if (this.definition?.endpoint) {
            const ID = this.definition?.endpoint?.(this.zh)[key];
            if (ID) {
                endpoint = this.zh.getEndpoint(ID);
            }
            else if (key === 'default') {
                endpoint = this.zh.endpoints[0];
            }
            else {
                return undefined;
            }
        }
        else {
            if (key !== 'default') {
                return undefined;
            }
            endpoint = this.zh.endpoints[0];
        }
        return endpoint;
    }
    endpointName(endpoint) {
        let epName = undefined;
        if (this.definition?.endpoint) {
            const mapping = this.definition?.endpoint(this.zh);
            for (const [name, id] of Object.entries(mapping)) {
                if (id == endpoint.ID) {
                    epName = name;
                }
            }
        }
        /* v8 ignore next */
        return epName === 'default' ? undefined : epName;
    }
    getEndpointNames() {
        const names = [];
        for (const name in this.definition?.endpoint?.(this.zh) ?? {}) {
            if (name !== 'default') {
                names.push(name);
            }
        }
        return names;
    }
    isDevice() {
        return true;
    }
    isGroup() {
        return false;
    }
}
exports.default = Device;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL21vZGVsL2RldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhEQUFpQztBQUVqQyxnRUFBa0Q7QUFDbEQsMkVBQTJEO0FBRzNELDJEQUE2QztBQUU3QyxNQUFNLFdBQVcsR0FBRyxJQUFJLG9DQUFPLENBQUMsYUFBYSxFQUFFLG1DQUFNLENBQUMsS0FBSyxDQUFDO0tBQ3ZELFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDZixlQUFlLENBQUMsZ0NBQWdDLENBQUM7S0FDakQsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUNmLFlBQVksQ0FBQyxHQUFHLENBQUM7S0FDakIsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRWhDLE1BQXFCLE1BQU07SUFDaEIsRUFBRSxDQUFZO0lBQ2QsVUFBVSxDQUFrQjtJQUMzQixrQkFBa0IsQ0FBVTtJQUVwQyxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFJLEVBQUU7UUFDRixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQzVCLENBQUM7SUFDRCxJQUFJLE9BQU87UUFDUCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUM7UUFDN0csT0FBTyxFQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQWMsRUFBRSxHQUFHLGFBQWEsRUFBQyxDQUFDO0lBQ2hFLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQztJQUN4RixDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxhQUFhLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BHLENBQUM7SUFDRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxJQUFJLGFBQWE7UUFDYixPQUFPLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9FLENBQUM7SUFFRCxZQUFZLE1BQWlCO1FBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxPQUFPO1FBQ0gsTUFBTSxPQUFPLEdBQWlCLEVBQUUsQ0FBQztRQUNqQyxJQUFBLHFCQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSx1REFBdUQsQ0FBQyxDQUFDO1FBQ2pGLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUMvQyxNQUFNLE9BQU8sR0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLGNBQXVCLEtBQUs7UUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQzVHLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQzlDLENBQUM7SUFDTCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxhQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMxRSxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBcUI7UUFDMUIsSUFBSSxRQUFpQyxDQUFDO1FBRXRDLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7WUFDM0IsR0FBRyxHQUFHLFNBQVMsQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELElBQUksRUFBRSxFQUFFLENBQUM7Z0JBQ0wsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7aUJBQU0sSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzNCLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxZQUFZLENBQUMsUUFBcUI7UUFDOUIsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBRXZCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkQsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNwQixNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxvQkFBb0I7UUFDcEIsT0FBTyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNyRCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBRTNCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDNUQsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBM0hELHlCQTJIQyJ9