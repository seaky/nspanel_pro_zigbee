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
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension, "converter", "external_converters");
    }
    async removeJS(name, _mod) {
        (0, zigbee_herdsman_converters_1.removeExternalDefinitions)(name);
        await this.zigbee.resolveDevicesDefinitions(true);
    }
    async loadJS(name, mod, newName) {
        try {
            (0, zigbee_herdsman_converters_1.removeExternalDefinitions)(name);
            const definitions = Array.isArray(mod) ? mod : [mod];
            for (const definition of definitions) {
                definition.externalConverterName = newName ?? name;
                (0, zigbee_herdsman_converters_1.addExternalDefinition)(definition);
                logger_1.default.info(`Loaded external converter '${newName ?? name}'.`);
            }
            await this.zigbee.resolveDevicesDefinitions(true);
        }
        catch (error) {
            logger_1.default.error(
            /* v8 ignore next */
            `Failed to load external converter '${newName ?? name}'. Check the code for syntax error and make sure it is up to date with the current Zigbee2MQTT version.`);
            logger_1.default.warning("External converters are not meant for long term usage, but for local testing after which a pull request should be created to add out-of-the-box support for the device");
            throw error;
        }
    }
}
exports.default = ExternalConverters;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxDb252ZXJ0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlcm5hbENvbnZlcnRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSwyRUFBNEY7QUFFNUYsNERBQW9DO0FBQ3BDLDhEQUErQztBQUkvQyxNQUFxQixrQkFBbUIsU0FBUSxvQkFBNEI7SUFDeEUsWUFDSSxNQUFjLEVBQ2QsSUFBVSxFQUNWLEtBQVksRUFDWixrQkFBc0MsRUFDdEMsUUFBa0IsRUFDbEIsc0JBQXdFLEVBQ3hFLGVBQW9DLEVBQ3BDLFlBQXFEO1FBRXJELEtBQUssQ0FDRCxNQUFNLEVBQ04sSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLHNCQUFzQixFQUN0QixlQUFlLEVBQ2YsWUFBWSxFQUNaLFdBQVcsRUFDWCxxQkFBcUIsQ0FDeEIsQ0FBQztJQUNOLENBQUM7SUFFUyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQVksRUFBRSxJQUFhO1FBQ2hELElBQUEsc0RBQXlCLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFUyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVksRUFBRSxHQUFZLEVBQUUsT0FBZ0I7UUFDL0QsSUFBSSxDQUFDO1lBQ0QsSUFBQSxzREFBeUIsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFckQsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsVUFBVSxDQUFDLHFCQUFxQixHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUM7Z0JBRW5ELElBQUEsa0RBQXFCLEVBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLGdCQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsZ0JBQU0sQ0FBQyxLQUFLO1lBQ1Isb0JBQW9CO1lBQ3BCLHNDQUFzQyxPQUFPLElBQUksSUFBSSx5R0FBeUcsQ0FDakssQ0FBQztZQUNGLGdCQUFNLENBQUMsT0FBTyxDQUNWLHdLQUF3SyxDQUMzSyxDQUFDO1lBRUYsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXpERCxxQ0F5REMifQ==