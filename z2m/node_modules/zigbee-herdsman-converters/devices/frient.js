"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const develco_1 = require("../lib/develco");
const modernExtend_1 = require("../lib/modernExtend");
// NOTE! Develco and Frient is the same company, therefore we use develco specific things in here.
const definitions = [
    {
        zigbeeModel: ['EMIZB-141'],
        model: 'EMIZB-141',
        vendor: 'Frient',
        description: 'Electricity meter interface 2 LED',
        extend: [
            (0, modernExtend_1.ota)(),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering', power: { divisor: 1000, multiplier: 1 }, energy: { divisor: 1000, multiplier: 1 } }),
            (0, modernExtend_1.battery)(),
            develco_1.develcoModernExtend.addCustomClusterManuSpecificDevelcoGenBasic(),
            develco_1.develcoModernExtend.readGenBasicPrimaryVersions(),
            develco_1.develcoModernExtend.pulseConfiguration(),
            develco_1.develcoModernExtend.currentSummation(),
        ],
    },
    {
        zigbeeModel: ['SMRZB-153'],
        model: 'SMRZB-153',
        vendor: 'Frient',
        description: 'Smart Cable - Power switch with power measurement',
        extend: [(0, modernExtend_1.onOff)({ configureReporting: false }), (0, modernExtend_1.electricityMeter)()],
        endpoint: () => {
            return { default: 2 };
        },
    },
    {
        zigbeeModel: ['EMIZB-151'],
        model: 'EMIZB-151',
        vendor: 'Frient',
        description: 'HAN P1 power-meter sensor',
        extend: [(0, modernExtend_1.electricityMeter)({ threePhase: true })],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=frient.js.map