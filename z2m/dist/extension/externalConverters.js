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
const zhc = __importStar(require("zigbee-herdsman-converters"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = require("../util/utils");
const extension_1 = __importDefault(require("./extension"));
class ExternalConverters extends extension_1.default {
    constructor(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension) {
        super(zigbee, mqtt, state, publishEntityState, eventBus, enableDisableExtension, restartCallback, addExtension);
        for (const file of settings.get().external_converters) {
            try {
                for (const definition of (0, utils_1.loadExternalConverter)(file)) {
                    const toAdd = { ...definition };
                    delete toAdd['homeassistant'];
                    zhc.addDefinition(toAdd);
                }
                logger_1.default.info(`Loaded external converter '${file}'`);
            }
            catch (error) {
                logger_1.default.error(`Failed to load external converter file '${file}' (${error.message})`);
                logger_1.default.error(`Probably there is a syntax error in the file or the external converter is not ` +
                    `compatible with the current Zigbee2MQTT version`);
                logger_1.default.error(`Note that external converters are not meant for long term usage, it's meant for local ` +
                    `testing after which a pull request should be created to add out-of-the-box support for the device`);
            }
        }
    }
}
exports.default = ExternalConverters;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxDb252ZXJ0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2V4dGVuc2lvbi9leHRlcm5hbENvbnZlcnRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnRUFBa0Q7QUFFbEQsNERBQW9DO0FBQ3BDLDJEQUE2QztBQUM3Qyx5Q0FBb0Q7QUFDcEQsNERBQW9DO0FBRXBDLE1BQXFCLGtCQUFtQixTQUFRLG1CQUFTO0lBQ3JELFlBQ0ksTUFBYyxFQUNkLElBQVUsRUFDVixLQUFZLEVBQ1osa0JBQXNDLEVBQ3RDLFFBQWtCLEVBQ2xCLHNCQUF3RSxFQUN4RSxlQUFvQyxFQUNwQyxZQUFxRDtRQUVyRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLHNCQUFzQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVoSCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQztnQkFDRCxLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUEsNkJBQXFCLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbkQsTUFBTSxLQUFLLEdBQUcsRUFBQyxHQUFHLFVBQVUsRUFBQyxDQUFDO29CQUM5QixPQUFPLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDOUIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztnQkFDRCxnQkFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixnQkFBTSxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsSUFBSSxNQUFPLEtBQWUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRixnQkFBTSxDQUFDLEtBQUssQ0FDUixnRkFBZ0Y7b0JBQzVFLGlEQUFpRCxDQUN4RCxDQUFDO2dCQUNGLGdCQUFNLENBQUMsS0FBSyxDQUNSLHdGQUF3RjtvQkFDcEYsbUdBQW1HLENBQzFHLENBQUM7WUFDTixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQWxDRCxxQ0FrQ0MifQ==