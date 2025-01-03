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
const legacy = __importStar(require("../lib/legacy"));
const modernExtend_1 = require("../lib/modernExtend");
const reporting = __importStar(require("../lib/reporting"));
const utils = __importStar(require("../lib/utils"));
const e = exposes.presets;
const ea = exposes.access;
const definitions = [
    {
        zigbeeModel: ['PU01'],
        model: '6717-84',
        vendor: 'Busch-Jaeger',
        description: 'Adaptor plug',
        extend: [(0, modernExtend_1.onOff)()],
    },
    {
        // Busch-Jaeger 6735, 6736 and 6737 have been tested with the 6710 U (Power Adapter),
        // 6711 U (Relay) and 6715 U (dimmer) back-ends. Unfortunately both the relay and the dimmer
        // report as model 'RM01' with genLevelCtrl clusters, so we need to set up both of them
        // as dimmable lights.
        //
        // The battery-powered version of the device ('RB01') is supported as well. These devices are
        // sold as Busch-Jaeger 6735/01, 6736/01 and 6737/01.
        //
        // In order to manually capture scenes as described in the devices manual, the endpoint
        // corresponding to the row needs to be unbound (https://www.zigbee2mqtt.io/information/binding.html)
        // If that operation was successful, the switch will respond to button presses on that
        // by blinking multiple times (vs. just blinking once if it's bound).
        zigbeeModel: ['RM01', 'RB01'],
        model: '6735/6736/6737',
        vendor: 'Busch-Jaeger',
        description: 'Zigbee Light Link power supply/relay/dimmer/wall-switch',
        endpoint: (device) => {
            return { row_1: 0x0a, row_2: 0x0b, row_3: 0x0c, row_4: 0x0d, relay: 0x12 };
        },
        exposes: (device, options) => {
            const expose = [];
            // If endpoint 0x12 (18) is present this means the following two things:
            //  1. The device is connected to a relay or dimmer and needs to be exposed as a dimmable light
            //  2. The top rocker will not be usable (not emit any events) as it's hardwired to the relay/dimmer
            if (!device || device.getEndpoint(0x12) != null) {
                expose.push(e.light_brightness().withEndpoint('relay'));
                // Exposing the device as a switch without endpoint is actually wrong, but this is the historic
                // definition and we are keeping it for compatibility reasons.
                // DEPRECATED and should be removed in the future
                expose.push(e.switch());
            }
            // Not all devices support all actions (depends on number of rocker rows and if relay/dimmer is installed),
            // but defining all possible actions here won't do any harm.
            expose.push(e.action([
                'row_1_on',
                'row_1_off',
                'row_1_up',
                'row_1_down',
                'row_1_stop',
                'row_2_on',
                'row_2_off',
                'row_2_up',
                'row_2_down',
                'row_2_stop',
                'row_3_on',
                'row_3_off',
                'row_3_up',
                'row_3_down',
                'row_3_stop',
                'row_4_on',
                'row_4_off',
                'row_4_up',
                'row_4_down',
                'row_4_stop',
            ]));
            expose.push(e.linkquality());
            return expose;
        },
        meta: { multiEndpoint: true },
        configure: async (device, coordinatorEndpoint) => {
            // Depending on the actual devices - 6735, 6736, or 6737 - there are 1, 2, or 4 endpoints for
            // the rockers. If the module is installed on a dimmer or relay, there is an additional endpoint (18).
            const endpoint18 = device.getEndpoint(0x12);
            if (endpoint18 != null) {
                await reporting.bind(endpoint18, coordinatorEndpoint, ['genOnOff', 'genLevelCtrl']);
            }
            else {
                // We only need to bind endpoint 10 (top rocker) if endpoint 18 (relay/dimmer) is not present.
                // Otherwise the top rocker is hard-wired to the relay/dimmer and cannot be used anyways.
                const endpoint10 = device.getEndpoint(0x0a);
                if (endpoint10 != null) {
                    await reporting.bind(endpoint10, coordinatorEndpoint, ['genLevelCtrl']);
                }
            }
            // The total number of bindings seems to be severely limited with some of these devices.
            // In order to be able to toggle groups, we need to remove the scenes cluster from RM01.
            const dropScenesCluster = device.modelID == 'RM01';
            const endpoint11 = device.getEndpoint(0x0b);
            if (endpoint11 != null) {
                if (dropScenesCluster) {
                    const index = endpoint11.outputClusters.indexOf(5);
                    if (index > -1) {
                        endpoint11.outputClusters.splice(index, 1);
                    }
                }
                await reporting.bind(endpoint11, coordinatorEndpoint, ['genLevelCtrl']);
            }
            const endpoint12 = device.getEndpoint(0x0c);
            if (endpoint12 != null) {
                if (dropScenesCluster) {
                    const index = endpoint12.outputClusters.indexOf(5);
                    if (index > -1) {
                        endpoint12.outputClusters.splice(index, 1);
                    }
                }
                await reporting.bind(endpoint12, coordinatorEndpoint, ['genLevelCtrl']);
            }
            const endpoint13 = device.getEndpoint(0x0d);
            if (endpoint13 != null) {
                if (dropScenesCluster) {
                    const index = endpoint13.outputClusters.indexOf(5);
                    if (index > -1) {
                        endpoint13.outputClusters.splice(index, 1);
                    }
                }
                await reporting.bind(endpoint13, coordinatorEndpoint, ['genLevelCtrl']);
            }
        },
        fromZigbee: [
            fromZigbee_1.default.ignore_basic_report,
            fromZigbee_1.default.on_off,
            fromZigbee_1.default.brightness,
            legacy.fz.RM01_on_click,
            legacy.fz.RM01_off_click,
            legacy.fz.RM01_up_hold,
            legacy.fz.RM01_down_hold,
            legacy.fz.RM01_stop,
        ],
        options: [
            e
                .numeric('state_poll_interval', ea.SET)
                .withValueMin(-1)
                .withDescription(`This device does not support state reporting so it is polled instead. The default poll interval is 60 seconds, set to -1 to disable.`),
        ],
        toZigbee: [toZigbee_1.default.RM01_light_onoff_brightness, toZigbee_1.default.RM01_light_brightness_step, toZigbee_1.default.RM01_light_brightness_move],
        onEvent: async (type, data, device, options) => {
            const switchEndpoint = device.getEndpoint(0x12);
            if (switchEndpoint == null) {
                return;
            }
            // This device doesn't support reporting.
            // Therefore we read the on/off state every 60 seconds.
            // This is the same way as the Hue bridge does it.
            const poll = async () => {
                await switchEndpoint.read('genOnOff', ['onOff']);
                await switchEndpoint.read('genLevelCtrl', ['currentLevel']);
            };
            utils.onEventPoll(type, data, device, options, 'state', 60, poll);
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=busch_jaeger.js.map