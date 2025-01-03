"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const es6_1 = __importDefault(require("fast-deep-equal/es6"));
function equalsPartial(object, expected) {
    const entries = Object.entries(expected);
    return entries.every(([key, value]) => (0, es6_1.default)(object[key], value));
}
exports.default = equalsPartial;
//# sourceMappingURL=equalsPartial.js.map