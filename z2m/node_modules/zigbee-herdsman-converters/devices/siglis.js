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
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const reporting = __importStar(require("../lib/reporting"));
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const zigfredEndpoint = 5;
const buttonLookup = {
    0: 'button_1',
    1: 'button_2',
    2: 'button_3',
    3: 'button_4',
};
const actionLookup = {
    0: 'release',
    1: 'single',
    2: 'double',
    3: 'hold',
};
const zifgredFromZigbeeButtonEvent = {
    cluster: 'manuSpecificSiglisZigfred',
    type: ['commandSiglisZigfredButtonEvent'],
    convert: (model, msg, publish, options, meta) => {
        const button = msg.data.button;
        const type = msg.data.type;
        const buttonName = utils.getFromLookup(button, buttonLookup);
        const typeName = utils.getFromLookup(type, actionLookup);
        if (buttonName && typeName) {
            const action = `${buttonName}_${typeName}`;
            return { action };
        }
    },
};
const coverAndLightToZigbee = {
    key: ['state', 'brightness', 'brightness_percent', 'on_time', 'position', 'tilt'],
    options: [exposes.options.transition()],
    convertSet: async (entity, key, value, meta) => {
        utils.assertEndpoint(entity);
        const isCover = entity.ID === 0x0b || entity.ID === 0x0c;
        if (isCover) {
            if (key === 'state') {
                return await toZigbee_1.default.cover_state.convertSet(entity, key, value, meta);
            }
            else if (key === 'position' || key === 'tilt') {
                return await toZigbee_1.default.cover_position_tilt.convertSet(entity, key, value, meta);
            }
        }
        else {
            if (key === 'state' || key === 'brightness' || key === 'brightness_percent' || key === 'on_time') {
                return await toZigbee_1.default.light_onoff_brightness.convertSet(entity, key, value, meta);
            }
        }
    },
    convertGet: async (entity, key, meta) => {
        utils.assertEndpoint(entity);
        if (key === 'state' && (entity.ID === 0x0b || entity.ID === 0x0c)) {
            await toZigbee_1.default.cover_position_tilt.convertGet(entity, 'position', meta);
        }
        else if (key === 'brightness') {
            await entity.read('genLevelCtrl', ['currentLevel']);
        }
        else if (key === 'state') {
            await toZigbee_1.default.on_off.convertGet(entity, key, meta);
        }
    },
};
const buttonEventExposes = e.action([
    'button_1_single',
    'button_1_double',
    'button_1_hold',
    'button_1_release',
    'button_2_single',
    'button_2_double',
    'button_2_hold',
    'button_2_release',
    'button_3_single',
    'button_3_double',
    'button_3_hold',
    'button_3_release',
    'button_4_single',
    'button_4_double',
    'button_4_hold',
    'button_4_release',
]);
function checkOption(device, options, key) {
    if (options != null && options[key] !== undefined) {
        if (options[key] === 'true') {
            return true;
        }
        else if (options[key] === 'false') {
            return false;
        }
    }
    return checkMetaOption(device, key);
}
function checkMetaOption(device, key) {
    if (device != null) {
        const enabled = device.meta[key];
        if (enabled === undefined) {
            return false;
        }
        else {
            return !!enabled;
        }
    }
    return false;
}
function setMetaOption(device, key, enabled) {
    if (device != null && key != null) {
        device.meta[key] = enabled;
    }
}
const definitions = [
    {
        zigbeeModel: ['zigfred uno'],
        model: 'ZFU-1D-CH',
        vendor: 'Siglis',
        description: 'zigfred uno smart in-wall switch',
        options: [
            e.enum(`front_surface_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Front Surface LED enabled'),
            e.enum(`relay_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Relay enabled'),
            e.enum(`dimmer_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer enabled'),
            e.enum(`dimmer_dimming_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer dimmable'),
        ],
        exposes: (device, options) => {
            const expose = [];
            expose.push(buttonEventExposes);
            expose.push(e.linkquality());
            if (checkOption(device, options, 'front_surface_enabled')) {
                expose.push(e.light_brightness_colorxy().withEndpoint('l1'));
            }
            if (checkOption(device, options, 'relay_enabled')) {
                expose.push(e.switch().withEndpoint('l2'));
            }
            if (checkOption(device, options, 'dimmer_enabled')) {
                if (checkOption(device, options, 'dimmer_dimming_enabled')) {
                    expose.push(e.light_brightness().withEndpoint('l3'));
                }
                else {
                    expose.push(e.switch().withEndpoint('l3'));
                }
            }
            return expose;
        },
        fromZigbee: [
            zifgredFromZigbeeButtonEvent,
            fromZigbee_1.default.color_colortemp,
            fromZigbee_1.default.on_off,
            fromZigbee_1.default.brightness,
            fromZigbee_1.default.level_config,
            fromZigbee_1.default.power_on_behavior,
            fromZigbee_1.default.ignore_basic_report,
        ],
        toZigbee: [
            toZigbee_1.default.light_onoff_brightness,
            toZigbee_1.default.light_color,
            toZigbee_1.default.ignore_transition,
            toZigbee_1.default.ignore_rate,
            toZigbee_1.default.light_brightness_move,
            toZigbee_1.default.light_brightness_step,
            toZigbee_1.default.level_config,
            toZigbee_1.default.power_on_behavior,
            toZigbee_1.default.light_hue_saturation_move,
            toZigbee_1.default.light_hue_saturation_step,
            toZigbee_1.default.light_color_options,
            toZigbee_1.default.light_color_mode,
        ],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return {
                l1: zigfredEndpoint,
                l2: 6,
                l3: 7,
            };
        },
        configure: async (device, coordinatorEndpoint) => {
            if (device != null) {
                const controlEp = device.getEndpoint(zigfredEndpoint);
                const relayEp = device.getEndpoint(6);
                const dimmerEp = device.getEndpoint(7);
                // Bind Control EP (LED)
                setMetaOption(device, 'front_surface_enabled', (await controlEp.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'front_surface_enabled')) {
                    await reporting.bind(controlEp, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl', 'manuSpecificSiglisZigfred']);
                    await reporting.onOff(controlEp);
                    await reporting.brightness(controlEp);
                }
                // Bind Relay EP
                setMetaOption(device, 'relay_enabled', (await relayEp.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'relay_enabled')) {
                    await reporting.bind(relayEp, coordinatorEndpoint, ['genOnOff']);
                    await reporting.onOff(relayEp);
                }
                // Bind Dimmer EP
                setMetaOption(device, 'dimmer_enabled', (await dimmerEp.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'dimmer_enabled')) {
                    await reporting.bind(dimmerEp, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
                    await reporting.onOff(dimmerEp);
                    await reporting.brightness(dimmerEp);
                }
                setMetaOption(device, 'dimmer_dimming_enabled', true);
                device.save();
            }
        },
    },
    {
        zigbeeModel: ['zigfred plus'],
        model: 'ZFP-1A-CH',
        vendor: 'Siglis',
        description: 'zigfred plus smart in-wall switch',
        options: [
            e.enum(`front_surface_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Front Surface LED enabled'),
            e.enum(`dimmer_1_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 1 enabled'),
            e.enum(`dimmer_1_dimming_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 1 dimmable'),
            e.enum(`dimmer_2_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 2 enabled'),
            e.enum(`dimmer_2_dimming_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 2 dimmable'),
            e.enum(`dimmer_3_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 3 enabled'),
            e.enum(`dimmer_3_dimming_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 3 dimmable'),
            e.enum(`dimmer_4_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 4 enabled'),
            e.enum(`dimmer_4_dimming_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Dimmer 4 dimmable'),
            e.enum(`cover_1_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Cover 1 enabled'),
            e.enum(`cover_1_tilt_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Cover 1 tiltable'),
            e.enum(`cover_2_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Cover 2 enabled'),
            e.enum(`cover_2_tilt_enabled`, ea.SET, ['auto', 'true', 'false']).withDescription('Cover 2 tiltable'),
        ],
        exposes: (device, options) => {
            const expose = [];
            expose.push(buttonEventExposes);
            expose.push(e.linkquality());
            if (checkOption(device, options, 'front_surface_enabled')) {
                expose.push(e.light_brightness_colorxy().withEndpoint('l1'));
            }
            if (checkOption(device, options, 'dimmer_1_enabled')) {
                if (checkOption(device, options, 'dimmer_1_dimming_enabled')) {
                    expose.push(e.light_brightness().withEndpoint('l2'));
                }
                else {
                    expose.push(e.switch().withEndpoint('l2'));
                }
            }
            if (checkOption(device, options, 'dimmer_2_enabled')) {
                if (checkOption(device, options, 'dimmer_2_dimming_enabled')) {
                    expose.push(e.light_brightness().withEndpoint('l3'));
                }
                else {
                    expose.push(e.switch().withEndpoint('l3'));
                }
            }
            if (checkOption(device, options, 'dimmer_3_enabled')) {
                if (checkOption(device, options, 'dimmer_3_dimming_enabled')) {
                    expose.push(e.light_brightness().withEndpoint('l4'));
                }
                else {
                    expose.push(e.switch().withEndpoint('l4'));
                }
            }
            if (checkOption(device, options, 'dimmer_4_enabled')) {
                if (checkOption(device, options, 'dimmer_4_dimming_enabled')) {
                    expose.push(e.light_brightness().withEndpoint('l5'));
                }
                else {
                    expose.push(e.switch().withEndpoint('l5'));
                }
            }
            if (checkOption(device, options, 'cover_1_enabled')) {
                if (checkOption(device, options, 'cover_1_tilt_enabled')) {
                    expose.push(e
                        .cover()
                        .setAccess('state', exposes.access.STATE_SET | exposes.access.STATE_GET)
                        .withPosition()
                        .withTilt()
                        .withEndpoint('l6'));
                }
                else {
                    expose.push(e
                        .cover()
                        .setAccess('state', exposes.access.STATE_SET | exposes.access.STATE_GET)
                        .withPosition()
                        .withEndpoint('l6'));
                }
            }
            if (checkOption(device, options, 'cover_2_enabled')) {
                if (checkOption(device, options, 'cover_2_tilt_enabled')) {
                    expose.push(e
                        .cover()
                        .setAccess('state', exposes.access.STATE_SET | exposes.access.STATE_GET)
                        .withPosition()
                        .withTilt()
                        .withEndpoint('l7'));
                }
                else {
                    expose.push(e
                        .cover()
                        .setAccess('state', exposes.access.STATE_SET | exposes.access.STATE_GET)
                        .withPosition()
                        .withEndpoint('l7'));
                }
            }
            return expose;
        },
        fromZigbee: [
            zifgredFromZigbeeButtonEvent,
            fromZigbee_1.default.color_colortemp,
            fromZigbee_1.default.on_off,
            fromZigbee_1.default.brightness,
            fromZigbee_1.default.level_config,
            fromZigbee_1.default.power_on_behavior,
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.cover_position_tilt,
        ],
        toZigbee: [
            toZigbee_1.default.light_color,
            toZigbee_1.default.ignore_transition,
            toZigbee_1.default.ignore_rate,
            toZigbee_1.default.light_brightness_move,
            toZigbee_1.default.light_brightness_step,
            toZigbee_1.default.level_config,
            toZigbee_1.default.power_on_behavior,
            toZigbee_1.default.light_hue_saturation_move,
            toZigbee_1.default.light_hue_saturation_step,
            toZigbee_1.default.light_color_options,
            toZigbee_1.default.light_color_mode,
            coverAndLightToZigbee,
        ],
        meta: { multiEndpoint: true },
        endpoint: (device) => {
            return {
                l1: zigfredEndpoint,
                l2: 7,
                l3: 8,
                l4: 9,
                l5: 10,
                l6: 11,
                l7: 12,
            };
        },
        configure: async (device, coordinatorEndpoint) => {
            if (device != null) {
                // Bind Control EP (LED)
                const controlEp = device.getEndpoint(zigfredEndpoint);
                setMetaOption(device, 'front_surface_enabled', (await controlEp.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'front_surface_enabled')) {
                    await reporting.bind(controlEp, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl', 'manuSpecificSiglisZigfred']);
                    await reporting.onOff(controlEp);
                    await reporting.brightness(controlEp);
                }
                // Bind Dimmer 1 EP
                const dimmer1Ep = device.getEndpoint(7);
                setMetaOption(device, 'dimmer_1_enabled', (await dimmer1Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'dimmer_1_enabled')) {
                    await reporting.bind(dimmer1Ep, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
                    await reporting.onOff(dimmer1Ep);
                    await reporting.brightness(dimmer1Ep);
                }
                setMetaOption(device, 'dimmer_1_dimming_enabled', true);
                // Bind Dimmer 2 EP
                const dimmer2Ep = device.getEndpoint(8);
                setMetaOption(device, 'dimmer_2_enabled', (await dimmer2Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'dimmer_2_enabled')) {
                    await reporting.bind(dimmer2Ep, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
                    await reporting.onOff(dimmer2Ep);
                    await reporting.brightness(dimmer2Ep);
                }
                setMetaOption(device, 'dimmer_2_dimming_enabled', true);
                // Bind Dimmer 3 EP
                const dimmer3Ep = device.getEndpoint(9);
                setMetaOption(device, 'dimmer_3_enabled', (await dimmer3Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'dimmer_3_enabled')) {
                    await reporting.bind(dimmer3Ep, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
                    await reporting.onOff(dimmer3Ep);
                    await reporting.brightness(dimmer3Ep);
                }
                setMetaOption(device, 'dimmer_3_dimming_enabled', true);
                // Bind Dimmer 4 EP
                const dimmer4Ep = device.getEndpoint(10);
                setMetaOption(device, 'dimmer_4_enabled', (await dimmer4Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'dimmer_4_enabled')) {
                    await reporting.bind(dimmer4Ep, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
                    await reporting.onOff(dimmer4Ep);
                    await reporting.brightness(dimmer4Ep);
                }
                setMetaOption(device, 'dimmer_4_dimming_enabled', true);
                // Bind Cover 1 EP
                const cover1Ep = device.getEndpoint(11);
                setMetaOption(device, 'cover_1_enabled', (await cover1Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'cover_1_enabled')) {
                    await reporting.bind(cover1Ep, coordinatorEndpoint, ['closuresWindowCovering']);
                    await reporting.currentPositionLiftPercentage(cover1Ep);
                    setMetaOption(device, 'cover_1_tilt_enabled', (await cover1Ep.read('closuresWindowCovering', ['windowCoveringType'])).windowCoveringType === 0x08);
                    if (checkMetaOption(device, 'cover_1_tilt_enabled')) {
                        await reporting.currentPositionTiltPercentage(cover1Ep);
                    }
                }
                else {
                    setMetaOption(device, 'cover_1_tilt_enabled', false);
                }
                // Bind Cover 2 EP
                const cover2Ep = device.getEndpoint(12);
                setMetaOption(device, 'cover_2_enabled', (await cover2Ep.read('genBasic', ['deviceEnabled'])).deviceEnabled);
                if (checkMetaOption(device, 'cover_2_enabled')) {
                    await reporting.bind(cover2Ep, coordinatorEndpoint, ['closuresWindowCovering']);
                    await reporting.currentPositionLiftPercentage(cover2Ep);
                    setMetaOption(device, 'cover_2_tilt_enabled', (await cover2Ep.read('closuresWindowCovering', ['windowCoveringType'])).windowCoveringType === 0x08);
                    if (checkMetaOption(device, 'cover_2_tilt_enabled')) {
                        await reporting.currentPositionTiltPercentage(cover2Ep);
                    }
                }
                else {
                    setMetaOption(device, 'cover_2_tilt_enabled', false);
                }
                device.save();
            }
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=siglis.js.map