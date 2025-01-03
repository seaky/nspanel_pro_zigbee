"use strict";
/* istanbul ignore file */
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
const assert_1 = __importDefault(require("assert"));
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const device_1 = __importDefault(require("../../model/device"));
const logger_1 = __importDefault(require("../../util/logger"));
const settings = __importStar(require("../../util/settings"));
const extension_1 = __importDefault(require("../extension"));
const topicRegex = new RegExp(`^${settings.get().mqtt.base_topic}/bridge/device/(.+)/get_group_membership$`);
class DeviceGroupMembership extends extension_1.default {
    async start() {
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    async onMQTTMessage(data) {
        const match = data.topic.match(topicRegex);
        if (!match) {
            return;
        }
        const parsed = this.zigbee.resolveEntityAndEndpoint(match[1]);
        const device = parsed?.entity;
        if (!device || !(device instanceof device_1.default)) {
            logger_1.default.error(`Device '${match[1]}' does not exist`);
            return;
        }
        const endpoint = parsed.endpoint;
        if (parsed.endpointID && !endpoint) {
            logger_1.default.error(`Device '${parsed.ID}' does not have endpoint '${parsed.endpointID}'`);
            return;
        }
        (0, assert_1.default)(endpoint !== undefined);
        const response = await endpoint.command(`genGroups`, 'getMembership', { groupcount: 0, grouplist: [] }, {});
        if (!response) {
            logger_1.default.warning(`Couldn't get group membership of ${device.ieeeAddr}`);
            return;
        }
        let { grouplist } = response;
        grouplist = grouplist.map((gid) => {
            const g = settings.getGroup(gid);
            return g ? g.friendly_name : gid;
        });
        const msgGroupList = `${device.ieeeAddr} is in groups [${grouplist}]`;
        let msgCapacity;
        if (response.capacity === 254) {
            msgCapacity = 'it can be a part of at least 1 more group';
        }
        else {
            msgCapacity = `its remaining group capacity is ${response.capacity === 255 ? 'unknown' : response.capacity}`;
        }
        logger_1.default.info(`${msgGroupList} and ${msgCapacity}`);
        await this.publishEntityState(device, { group_list: grouplist, group_capacity: response.capacity });
    }
}
exports.default = DeviceGroupMembership;
__decorate([
    bind_decorator_1.default
], DeviceGroupMembership.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlR3JvdXBNZW1iZXJzaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2V4dGVuc2lvbi9sZWdhY3kvZGV2aWNlR3JvdXBNZW1iZXJzaGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwwQkFBMEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRTFCLG9EQUE0QjtBQUU1QixvRUFBa0M7QUFFbEMsZ0VBQXdDO0FBQ3hDLCtEQUF1QztBQUN2Qyw4REFBZ0Q7QUFDaEQsNkRBQXFDO0FBRXJDLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLDJDQUEyQyxDQUFDLENBQUM7QUFFN0csTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7SUFDL0MsS0FBSyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRVcsQUFBTixLQUFLLENBQUMsYUFBYSxDQUFDLElBQTJCO1FBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNULE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsTUFBZ0IsQ0FBQztRQUV4QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksZ0JBQU0sQ0FBQyxFQUFFLENBQUM7WUFDekMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDcEQsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBRWpDLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLGdCQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsTUFBTSxDQUFDLEVBQUUsNkJBQTZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3BGLE9BQU87UUFDWCxDQUFDO1FBRUQsSUFBQSxnQkFBTSxFQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNaLGdCQUFNLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN0RSxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksRUFBQyxTQUFTLEVBQUMsR0FBRyxRQUFRLENBQUM7UUFFM0IsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtZQUN0QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLGtCQUFrQixTQUFTLEdBQUcsQ0FBQztRQUN0RSxJQUFJLFdBQVcsQ0FBQztRQUNoQixJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDNUIsV0FBVyxHQUFHLDJDQUEyQyxDQUFDO1FBQzlELENBQUM7YUFBTSxDQUFDO1lBQ0osV0FBVyxHQUFHLG1DQUFtQyxRQUFRLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakgsQ0FBQztRQUNELGdCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxRQUFRLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFbEQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDdEcsQ0FBQztDQUNKO0FBckRELHdDQXFEQztBQWhEZTtJQUFYLHdCQUFJOzBEQStDSiJ9