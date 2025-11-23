"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
function setPath() {
    return process.env.ZIGBEE2MQTT_DATA ? process.env.ZIGBEE2MQTT_DATA : node_path_1.default.normalize(node_path_1.default.join(__dirname, "..", "..", "data"));
}
let dataPath = setPath();
function joinPath(file) {
    return node_path_1.default.resolve(dataPath, file);
}
function getPath() {
    return dataPath;
}
function _testReload() {
    dataPath = setPath();
}
// biome-ignore lint/style/useNamingConvention: test
exports.default = { joinPath, getPath, _testReload };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlsL2RhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwREFBNkI7QUFFN0IsU0FBUyxPQUFPO0lBQ1osT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxtQkFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2xJLENBQUM7QUFFRCxJQUFJLFFBQVEsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUV6QixTQUFTLFFBQVEsQ0FBQyxJQUFZO0lBQzFCLE9BQU8sbUJBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxTQUFTLE9BQU87SUFDWixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBRUQsU0FBUyxXQUFXO0lBQ2hCLFFBQVEsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELGtCQUFlLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUMsQ0FBQyJ9