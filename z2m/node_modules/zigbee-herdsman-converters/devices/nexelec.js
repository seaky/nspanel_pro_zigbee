"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modernExtend_1 = require("../lib/modernExtend");
const definitions = [
    {
        zigbeeModel: ['Air Quality Sensor Nexelec'],
        model: "Open'R",
        vendor: 'Nexelec',
        description: "Open'R CO2, Temperature and Humidity sensor",
        extend: [(0, modernExtend_1.temperature)(), (0, modernExtend_1.humidity)(), (0, modernExtend_1.co2)(), (0, modernExtend_1.battery)(), (0, modernExtend_1.identify)()],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=nexelec.js.map