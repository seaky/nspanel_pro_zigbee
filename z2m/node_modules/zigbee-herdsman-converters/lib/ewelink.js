"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modernExtend = exports.ewelinkModernExtend = void 0;
const exposes_1 = require("./exposes");
const modernExtend_1 = require("./modernExtend");
exports.ewelinkModernExtend = {
    ewelinkAction: () => {
        const exposes = [exposes_1.presets.action(['single', 'double', 'long'])];
        const fromZigbee = [
            {
                cluster: 'genOnOff',
                type: ['commandOn', 'commandOff', 'commandToggle'],
                convert: (model, msg, publish, options, meta) => {
                    const lookup = { commandToggle: 'single', commandOn: 'double', commandOff: 'long' };
                    return { action: lookup[msg.type] };
                },
            },
        ];
        const configure = [(0, modernExtend_1.setupConfigureForBinding)('genOnOff', 'output')];
        return { exposes, fromZigbee, configure, isModernExtend: true };
    },
    ewelinkBattery: () => {
        // 3600/7200 prevents disconnect
        // https://github.com/Koenkk/zigbee2mqtt/issues/13600#issuecomment-1283827935
        return (0, modernExtend_1.battery)({
            voltage: true,
            voltageReporting: true,
            percentageReportingConfig: { min: 3600, max: 7200, change: 10 },
            voltageReportingConfig: { min: 3600, max: 7200, change: 10 },
        });
    },
};
exports.modernExtend = exports.ewelinkModernExtend;
//# sourceMappingURL=ewelink.js.map