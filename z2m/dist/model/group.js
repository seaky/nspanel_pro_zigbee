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
Object.defineProperty(exports, "__esModule", { value: true });
const settings = __importStar(require("../util/settings"));
const utils_1 = require("../util/utils");
class Group {
    zh;
    resolveDevice;
    // biome-ignore lint/style/useNamingConvention: API
    get ID() {
        return this.zh.groupID;
    }
    get options() {
        // biome-ignore lint/style/noNonNullAssertion: Group always exists in settings
        return { ...settings.getGroup(this.ID) };
    }
    get name() {
        return this.options?.friendly_name || this.ID.toString();
    }
    constructor(group, resolveDevice) {
        this.zh = group;
        this.resolveDevice = resolveDevice;
    }
    ensureInSettings() {
        if (this.ID !== utils_1.DEFAULT_BIND_GROUP_ID && !settings.getGroup(this.ID)) {
            settings.addGroup(this.name, this.ID.toString());
        }
    }
    hasMember(device) {
        return !!device.zh.endpoints.find((e) => this.zh.members.includes(e));
    }
    *membersDevices() {
        for (const member of this.zh.members) {
            const resolvedDevice = this.resolveDevice(member.deviceIeeeAddress);
            if (resolvedDevice) {
                yield resolvedDevice;
            }
        }
    }
    membersDefinitions() {
        const definitions = [];
        for (const member of this.membersDevices()) {
            if (member.definition) {
                definitions.push(member.definition);
            }
        }
        return definitions;
    }
    isDevice() {
        return false;
    }
    isGroup() {
        return true;
    }
}
exports.default = Group;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvbW9kZWwvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwyREFBNkM7QUFDN0MseUNBQW9EO0FBRXBELE1BQXFCLEtBQUs7SUFDZixFQUFFLENBQVc7SUFDWixhQUFhLENBQTJDO0lBRWhFLG1EQUFtRDtJQUNuRCxJQUFJLEVBQUU7UUFDRixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFDRCxJQUFJLE9BQU87UUFDUCw4RUFBOEU7UUFDOUUsT0FBTyxFQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFFLEVBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdELENBQUM7SUFFRCxZQUFZLEtBQWUsRUFBRSxhQUF1RDtRQUNoRixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUNoQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLDZCQUFxQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNuRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFDTCxDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQWM7UUFDcEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQsQ0FBQyxjQUFjO1FBQ1gsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFcEUsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxjQUFjLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsTUFBTSxXQUFXLEdBQXFCLEVBQUUsQ0FBQztRQUV6QyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNwQixXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUEzREQsd0JBMkRDIn0=