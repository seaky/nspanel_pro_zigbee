"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function setPath() {
    return process.env.ZIGBEE2MQTT_DATA ? process.env.ZIGBEE2MQTT_DATA : path_1.default.normalize(path_1.default.join(__dirname, '..', '..', 'data'));
}
let dataPath = setPath();
function joinPath(file) {
    return path_1.default.resolve(dataPath, file);
}
function getPath() {
    return dataPath;
}
function _testReload() {
    dataPath = setPath();
}
exports.default = { joinPath, getPath, _testReload };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlsL2RhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBd0I7QUFFeEIsU0FBUyxPQUFPO0lBQ1osT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsSSxDQUFDO0FBRUQsSUFBSSxRQUFRLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFFekIsU0FBUyxRQUFRLENBQUMsSUFBWTtJQUMxQixPQUFPLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxTQUFTLE9BQU87SUFDWixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBRUQsU0FBUyxXQUFXO0lBQ2hCLFFBQVEsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRUQsa0JBQWUsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxDQUFDIn0=