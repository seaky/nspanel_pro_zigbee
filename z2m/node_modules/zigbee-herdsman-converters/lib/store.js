"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValue = hasValue;
exports.getValue = getValue;
exports.putValue = putValue;
exports.clearValue = clearValue;
exports.clear = clear;
const utils_1 = require("./utils");
let store = new Map();
function getEntityKey(entity) {
    if ((0, utils_1.isGroup)(entity)) {
        return entity.groupID;
    }
    else if ((0, utils_1.isEndpoint)(entity)) {
        return `${entity.deviceIeeeAddress}_${entity.ID}`;
    }
    else if ((0, utils_1.isDevice)(entity)) {
        return `${entity.ieeeAddr}`;
    }
    else {
        throw new Error(`Invalid entity type`);
    }
}
function hasValue(entity, key) {
    const entityKey = getEntityKey(entity);
    return store.has(entityKey) && store.get(entityKey)[key] !== undefined;
}
function getValue(entity, key, default_ = undefined) {
    const entityKey = getEntityKey(entity);
    if (store.has(entityKey) && store.get(entityKey)[key] !== undefined) {
        return store.get(entityKey)[key];
    }
    return default_;
}
function putValue(entity, key, value) {
    const entityKey = getEntityKey(entity);
    if (!store.has(entityKey)) {
        store.set(entityKey, {});
    }
    store.get(entityKey)[key] = value;
}
function clearValue(entity, key) {
    if (hasValue(entity, key)) {
        const entityKey = getEntityKey(entity);
        delete store.get(entityKey)[key];
    }
}
function clear() {
    store = new Map();
}
exports.hasValue = hasValue;
exports.getValue = getValue;
exports.putValue = putValue;
exports.clearValue = clearValue;
exports.clear = clear;
//# sourceMappingURL=store.js.map