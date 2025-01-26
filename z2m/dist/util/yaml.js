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
exports.YAMLFileException = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_fs_1 = __importDefault(require("node:fs"));
const es6_1 = __importDefault(require("fast-deep-equal/es6"));
const js_yaml_1 = __importStar(require("js-yaml"));
class YAMLFileException extends js_yaml_1.YAMLException {
    file;
    constructor(error, file) {
        super(error.reason, error.mark);
        this.name = 'YAMLFileException';
        this.cause = error.cause;
        this.message = error.message;
        this.stack = error.stack;
        this.file = file;
    }
}
exports.YAMLFileException = YAMLFileException;
function read(file) {
    try {
        const result = js_yaml_1.default.load(node_fs_1.default.readFileSync(file, 'utf8'));
        (0, node_assert_1.default)(result instanceof Object);
        return result;
    }
    catch (error) {
        if (error instanceof js_yaml_1.YAMLException) {
            throw new YAMLFileException(error, file);
        }
        throw error;
    }
}
function readIfExists(file, fallback = {}) {
    return node_fs_1.default.existsSync(file) ? read(file) : fallback;
}
function writeIfChanged(file, content) {
    const before = readIfExists(file);
    if (!(0, es6_1.default)(before, content)) {
        node_fs_1.default.writeFileSync(file, js_yaml_1.default.dump(content));
    }
}
function updateIfChanged(file, key, value) {
    const content = read(file);
    if (content[key] !== value) {
        content[key] = value;
        writeIfChanged(file, content);
    }
}
exports.default = { read, readIfExists, updateIfChanged, writeIfChanged };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlsL3lhbWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOERBQWlDO0FBQ2pDLHNEQUF5QjtBQUV6Qiw4REFBeUM7QUFDekMsbURBQTRDO0FBRTVDLE1BQWEsaUJBQWtCLFNBQVEsdUJBQWE7SUFDaEQsSUFBSSxDQUFTO0lBRWIsWUFBWSxLQUFvQixFQUFFLElBQVk7UUFDMUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBWkQsOENBWUM7QUFFRCxTQUFTLElBQUksQ0FBQyxJQUFZO0lBQ3RCLElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLGlCQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hELElBQUEscUJBQU0sRUFBQyxNQUFNLFlBQVksTUFBTSxDQUFDLENBQUM7UUFDakMsT0FBTyxNQUFrQixDQUFDO0lBQzlCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxLQUFLLFlBQVksdUJBQWEsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELE1BQU0sS0FBSyxDQUFDO0lBQ2hCLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBWSxFQUFFLFdBQXFCLEVBQUU7SUFDdkQsT0FBTyxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdkQsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLElBQVksRUFBRSxPQUFpQjtJQUNuRCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEMsSUFBSSxDQUFDLElBQUEsYUFBTSxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzNCLGlCQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsSUFBWSxFQUFFLEdBQVcsRUFBRSxLQUFlO0lBQy9ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztBQUNMLENBQUM7QUFFRCxrQkFBZSxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBQyxDQUFDIn0=