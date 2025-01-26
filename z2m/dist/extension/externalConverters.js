"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_herdsman_converters_1 = require("zigbee-herdsman-converters");
const logger_1 = __importDefault(require("../util/logger"));
const externalJS_1 = __importDefault(require("./externalJS"));
class ExternalConverters extends externalJS_1.default {
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, 'converter', 'external_converters');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeJS(name, module) {
        (0, zigbee_herdsman_converters_1.removeExternalDefinitions)(name);
        await this.zigbee.resolveDevicesDefinitions(true);
    }
    async loadJS(name, module) {
        try {
            (0, zigbee_herdsman_converters_1.removeExternalDefinitions)(name);
            for (const definition of this.getDefinitions(module)) {
                definition.externalConverterName = name;
                (0, zigbee_herdsman_converters_1.addDefinition)(definition);
                logger_1.default.info(`Loaded external converter '${name}'.`);
            }
            await this.zigbee.resolveDevicesDefinitions(true);
        }
        catch (error) {
            logger_1.default.error(`Failed to load external converter '${name}'`);
            logger_1.default.error(`Check the code for syntax error and make sure it is up to date with the current Zigbee2MQTT version.`);
            logger_1.default.error(`External converters are not meant for long term usage, but for local testing after which a pull request should be created to add out-of-the-box support for the device`);
            throw error;
        }
    }
    getDefinitions(module) {
        return Array.isArray(module) ? module : [module];
    }
}
exports.default = ExternalConverters;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxDb252ZXJ0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlcm5hbENvbnZlcnRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSwyRUFBb0Y7QUFFcEYsNERBQW9DO0FBQ3BDLDhEQUErQztBQUkvQyxNQUFxQixrQkFBbUIsU0FBUSxvQkFBa0M7SUFDOUUsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFEO1FBRXJELEtBQUssQ0FDRCxNQUFNLEVBQ04sSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLHNCQUFzQixFQUN0QixlQUFlLEVBQ2YsWUFBWSxFQUNaLFdBQVcsRUFDWCxxQkFBcUIsQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFRCw2REFBNkQ7SUFDbkQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBcUI7UUFDeEQsSUFBQSxzREFBeUIsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUVoQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVTLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBWSxFQUFFLE1BQXFCO1FBQ3RELElBQUksQ0FBQztZQUNELElBQUEsc0RBQXlCLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ25ELFVBQVUsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7Z0JBRXhDLElBQUEsMENBQWEsRUFBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUIsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDeEQsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLGdCQUFNLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQzVELGdCQUFNLENBQUMsS0FBSyxDQUFDLHNHQUFzRyxDQUFDLENBQUM7WUFDckgsZ0JBQU0sQ0FBQyxLQUFLLENBQ1Isd0tBQXdLLENBQzNLLENBQUM7WUFFRixNQUFNLEtBQUssQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxNQUFxQjtRQUN4QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0o7QUExREQscUNBMERDIn0=