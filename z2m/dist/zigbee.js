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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const node_crypto_1 = require("node:crypto");
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const zigbee_herdsman_1 = require("zigbee-herdsman");
const device_1 = __importDefault(require("./model/device"));
const group_1 = __importDefault(require("./model/group"));
const data_1 = __importDefault(require("./util/data"));
const logger_1 = __importDefault(require("./util/logger"));
const settings = __importStar(require("./util/settings"));
const utils_1 = __importDefault(require("./util/utils"));
const entityIDRegex = /^(.+?)(?:\/([^/]+))?$/;
class Zigbee {
    #herdsman;
    eventBus;
    groupLookup = new Map();
    deviceLookup = new Map();
    coordinatorIeeeAddr;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    get zhController() {
        return this.#herdsman;
    }
    async start() {
        const infoHerdsman = await utils_1.default.getDependencyVersion("zigbee-herdsman");
        logger_1.default.info(`Starting zigbee-herdsman (${infoHerdsman.version})`);
        const panId = settings.get().advanced.pan_id;
        const extPanId = settings.get().advanced.ext_pan_id;
        const networkKey = settings.get().advanced.network_key;
        const herdsmanSettings = {
            network: {
                panID: panId === "GENERATE" ? this.generatePanID() : panId,
                extendedPanID: extPanId === "GENERATE" ? this.generateExtPanID() : extPanId,
                channelList: [settings.get().advanced.channel],
                networkKey: networkKey === "GENERATE" ? this.generateNetworkKey() : networkKey,
            },
            databasePath: data_1.default.joinPath("database.db"),
            databaseBackupPath: data_1.default.joinPath("database.db.backup"),
            backupPath: data_1.default.joinPath("coordinator_backup.json"),
            serialPort: {
                baudRate: settings.get().serial.baudrate,
                rtscts: settings.get().serial.rtscts,
                path: settings.get().serial.port,
                adapter: settings.get().serial.adapter,
            },
            adapter: {
                concurrent: settings.get().advanced.adapter_concurrent,
                delay: settings.get().advanced.adapter_delay,
                disableLED: settings.get().serial.disable_led,
                transmitPower: settings.get().advanced.transmit_power,
            },
            acceptJoiningDeviceHandler: this.acceptJoiningDeviceHandler,
        };
        logger_1.default.debug(() => `Using zigbee-herdsman with settings: '${(0, json_stable_stringify_without_jsonify_1.default)(JSON.stringify(herdsmanSettings).replaceAll(JSON.stringify(herdsmanSettings.network.networkKey), '"HIDDEN"'))}'`);
        let startResult;
        try {
            this.#herdsman = new zigbee_herdsman_1.Controller(herdsmanSettings);
            startResult = await this.#herdsman.start();
        }
        catch (error) {
            logger_1.default.error("Error while starting zigbee-herdsman");
            throw error;
        }
        this.coordinatorIeeeAddr = this.#herdsman.getDevicesByType("Coordinator")[0].ieeeAddr;
        await this.resolveDevicesDefinitions();
        this.#herdsman.on("adapterDisconnected", () => this.eventBus.emitAdapterDisconnected());
        this.#herdsman.on("lastSeenChanged", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            this.eventBus.emitLastSeenChanged({ device: this.resolveDevice(data.device.ieeeAddr), reason: data.reason });
        });
        this.#herdsman.on("permitJoinChanged", (data) => {
            this.eventBus.emitPermitJoinChanged(data);
        });
        this.#herdsman.on("deviceNetworkAddressChanged", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            const device = this.resolveDevice(data.device.ieeeAddr);
            logger_1.default.debug(`Device '${device.name}' changed network address`);
            this.eventBus.emitDeviceNetworkAddressChanged({ device });
        });
        this.#herdsman.on("deviceAnnounce", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            const device = this.resolveDevice(data.device.ieeeAddr);
            logger_1.default.debug(`Device '${device.name}' announced itself`);
            this.eventBus.emitDeviceAnnounce({ device });
        });
        this.#herdsman.on("deviceInterview", async (data) => {
            const device = this.resolveDevice(data.device.ieeeAddr);
            /* v8 ignore next */ if (!device)
                return; // Prevent potential race
            await device.resolveDefinition();
            const d = { device, status: data.status };
            this.logDeviceInterview(d);
            this.eventBus.emitDeviceInterview(d);
        });
        this.#herdsman.on("deviceJoined", async (data) => {
            const device = this.resolveDevice(data.device.ieeeAddr);
            /* v8 ignore next */ if (!device)
                return; // Prevent potential race
            await device.resolveDefinition();
            logger_1.default.info(`Device '${device.name}' joined`);
            this.eventBus.emitDeviceJoined({ device });
        });
        this.#herdsman.on("deviceLeave", (data) => {
            const name = settings.getDevice(data.ieeeAddr)?.friendly_name || data.ieeeAddr;
            logger_1.default.warning(`Device '${name}' left the network`);
            this.eventBus.emitDeviceLeave({ ieeeAddr: data.ieeeAddr, name, device: this.deviceLookup.get(data.ieeeAddr) });
        });
        this.#herdsman.on("message", async (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            const device = this.resolveDevice(data.device.ieeeAddr);
            await device.resolveDefinition();
            logger_1.default.debug(() => {
                const groupId = data.groupID !== undefined ? ` with groupID ${data.groupID}` : "";
                const fromCoord = device.zh.type === "Coordinator" ? ", ignoring since it is from coordinator" : "";
                return `Received Zigbee message from '${device.name}', type '${data.type}', cluster '${data.cluster}', data '${(0, json_stable_stringify_without_jsonify_1.default)(data.data)}' from endpoint ${data.endpoint.ID}${groupId}${fromCoord}`;
            });
            if (device.zh.type === "Coordinator")
                return;
            this.eventBus.emitDeviceMessage({ ...data, device });
        });
        logger_1.default.info(`zigbee-herdsman started (${startResult})`);
        logger_1.default.info(`Coordinator firmware version: '${(0, json_stable_stringify_without_jsonify_1.default)(await this.getCoordinatorVersion())}'`);
        logger_1.default.debug(`Zigbee network parameters: ${(0, json_stable_stringify_without_jsonify_1.default)(await this.#herdsman.getNetworkParameters())}`);
        for (const device of this.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            // If a passlist is used, all other device will be removed from the network.
            const passlist = settings.get().passlist;
            const blocklist = settings.get().blocklist;
            const remove = async (device) => {
                try {
                    await device.zh.removeFromNetwork();
                }
                catch (error) {
                    logger_1.default.error(`Failed to remove '${device.ieeeAddr}' (${error.message})`);
                }
            };
            if (passlist.length > 0) {
                if (!passlist.includes(device.ieeeAddr)) {
                    logger_1.default.warning(`Device not on passlist currently connected (${device.ieeeAddr}), removing...`);
                    await remove(device);
                }
            }
            else if (blocklist.includes(device.ieeeAddr)) {
                logger_1.default.warning(`Device on blocklist currently connected (${device.ieeeAddr}), removing...`);
                await remove(device);
            }
        }
        return startResult;
    }
    logDeviceInterview(data) {
        const name = data.device.name;
        if (data.status === "successful") {
            logger_1.default.info(`Successfully interviewed '${name}', device has successfully been paired`);
            if (data.device.isSupported) {
                // biome-ignore lint/style/noNonNullAssertion: valid from `isSupported`
                const { vendor, description, model } = data.device.definition;
                logger_1.default.info(`Device '${name}' is supported, identified as: ${vendor} ${description} (${model})`);
            }
            else {
                logger_1.default.warning(`Device '${name}' with Zigbee model '${data.device.zh.modelID}' and manufacturer name '${data.device.zh.manufacturerName}' is NOT supported, please follow https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html`);
            }
        }
        else if (data.status === "failed") {
            logger_1.default.error(`Failed to interview '${name}', device has not successfully been paired`);
        }
        else {
            // data.status === 'started'
            logger_1.default.info(`Starting interview of '${name}'`);
        }
    }
    generateNetworkKey() {
        const key = Array.from({ length: 16 }, () => (0, node_crypto_1.randomInt)(256));
        settings.set(["advanced", "network_key"], key);
        return key;
    }
    generateExtPanID() {
        const key = Array.from({ length: 8 }, () => (0, node_crypto_1.randomInt)(256));
        settings.set(["advanced", "ext_pan_id"], key);
        return key;
    }
    generatePanID() {
        const panID = (0, node_crypto_1.randomInt)(1, 0xffff - 1);
        settings.set(["advanced", "pan_id"], panID);
        return panID;
    }
    async getCoordinatorVersion() {
        return await this.#herdsman.getCoordinatorVersion();
    }
    isStopping() {
        return this.#herdsman.isStopping();
    }
    async backup() {
        return await this.#herdsman.backup();
    }
    async coordinatorCheck() {
        const check = await this.#herdsman.coordinatorCheck();
        // biome-ignore lint/style/noNonNullAssertion: assumed valid
        return { missingRouters: check.missingRouters.map((d) => this.resolveDevice(d.ieeeAddr)) };
    }
    async getNetworkParameters() {
        return await this.#herdsman.getNetworkParameters();
    }
    async stop() {
        logger_1.default.info("Stopping zigbee-herdsman...");
        await this.#herdsman.stop();
        logger_1.default.info("Stopped zigbee-herdsman");
    }
    getPermitJoin() {
        return this.#herdsman.getPermitJoin();
    }
    getPermitJoinEnd() {
        return this.#herdsman.getPermitJoinEnd();
    }
    async permitJoin(time, device) {
        if (time > 0) {
            logger_1.default.info(`Zigbee: allowing new devices to join${device ? ` via ${device.name}` : ""}.`);
        }
        else {
            logger_1.default.info("Zigbee: disabling joining new devices.");
        }
        await this.#herdsman.permitJoin(time, device?.zh);
    }
    async resolveDevicesDefinitions(ignoreCache = false) {
        for (const device of this.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            await device.resolveDefinition(ignoreCache);
        }
    }
    resolveDevice(ieeeAddr) {
        if (!this.deviceLookup.has(ieeeAddr)) {
            const device = this.#herdsman.getDeviceByIeeeAddr(ieeeAddr);
            if (device) {
                this.deviceLookup.set(ieeeAddr, new device_1.default(device));
            }
        }
        const device = this.deviceLookup.get(ieeeAddr);
        if (device && !device.zh.isDeleted) {
            device.ensureInSettings();
            return device;
        }
    }
    resolveGroup(groupID) {
        if (!this.groupLookup.has(groupID)) {
            const group = this.#herdsman.getGroupByID(groupID);
            if (group) {
                this.groupLookup.set(groupID, new group_1.default(group, this.resolveDevice));
            }
        }
        const group = this.groupLookup.get(groupID);
        if (group) {
            group.ensureInSettings();
            return group;
        }
    }
    resolveEntity(key) {
        if (typeof key === "object") {
            return this.resolveDevice(key.ieeeAddr);
        }
        if (typeof key === "string" && (key.toLowerCase() === "coordinator" || key === this.coordinatorIeeeAddr)) {
            return this.resolveDevice(this.coordinatorIeeeAddr);
        }
        const settingsDevice = settings.getDevice(key.toString());
        if (settingsDevice) {
            return this.resolveDevice(settingsDevice.ID);
        }
        const groupSettings = settings.getGroup(key);
        if (groupSettings) {
            const group = this.resolveGroup(groupSettings.ID);
            // If group does not exist, create it (since it's already in configuration.yaml)
            return group ? group : this.createGroup(groupSettings.ID);
        }
    }
    resolveEntityAndEndpoint(id) {
        // This function matches the following entity formats:
        // device_name          (just device name)
        // device_name/ep_name  (device name and endpoint numeric ID or name)
        // device/name          (device name with slashes)
        // device/name/ep_name  (device name with slashes, and endpoint numeric ID or name)
        // The function tries to find an exact match first
        let entityName = id;
        let deviceOrGroup = this.resolveEntity(id);
        let endpointNameOrID;
        // If exact match did not happen, try matching a device_name/endpoint pattern
        if (!deviceOrGroup) {
            // First split the input token by the latest slash
            const match = id.match(entityIDRegex);
            if (match) {
                // Get the resulting IDs from the match
                entityName = match[1];
                deviceOrGroup = this.resolveEntity(entityName);
                endpointNameOrID = match[2];
            }
        }
        // If the function returns non-null endpoint name, but the endpoint field is null, then
        // it means that endpoint was not matched because there is no such endpoint on the device
        // (or the entity is a group)
        const endpoint = deviceOrGroup?.isDevice() ? deviceOrGroup.endpoint(endpointNameOrID) : undefined;
        return { ID: entityName, entity: deviceOrGroup, endpointID: endpointNameOrID, endpoint };
    }
    firstCoordinatorEndpoint() {
        return this.#herdsman.getDevicesByType("Coordinator")[0].endpoints[0];
    }
    *devicesAndGroupsIterator(devicePredicate, groupPredicate) {
        for (const device of this.#herdsman.getDevicesIterator(devicePredicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveDevice(device.ieeeAddr);
        }
        for (const group of this.#herdsman.getGroupsIterator(groupPredicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveGroup(group.groupID);
        }
    }
    *groupsIterator(predicate) {
        for (const group of this.#herdsman.getGroupsIterator(predicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveGroup(group.groupID);
        }
    }
    *devicesIterator(predicate) {
        for (const device of this.#herdsman.getDevicesIterator(predicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveDevice(device.ieeeAddr);
        }
    }
    // biome-ignore lint/suspicious/useAwait: API
    async acceptJoiningDeviceHandler(ieeeAddr) {
        // If passlist is set, all devices not on passlist will be rejected to join the network
        const passlist = settings.get().passlist;
        const blocklist = settings.get().blocklist;
        if (passlist.length > 0) {
            if (passlist.includes(ieeeAddr)) {
                logger_1.default.info(`Accepting joining device which is on passlist '${ieeeAddr}'`);
                return true;
            }
            logger_1.default.info(`Rejecting joining not in passlist device '${ieeeAddr}'`);
            return false;
        }
        if (blocklist.length > 0) {
            if (blocklist.includes(ieeeAddr)) {
                logger_1.default.info(`Rejecting joining device which is on blocklist '${ieeeAddr}'`);
                return false;
            }
            logger_1.default.info(`Accepting joining not in blocklist device '${ieeeAddr}'`);
        }
        return true;
    }
    async touchlinkFactoryResetFirst() {
        return await this.#herdsman.touchlink.factoryResetFirst();
    }
    async touchlinkFactoryReset(ieeeAddr, channel) {
        return await this.#herdsman.touchlink.factoryReset(ieeeAddr, channel);
    }
    async addInstallCode(installCode) {
        await this.#herdsman.addInstallCode(installCode);
    }
    async touchlinkIdentify(ieeeAddr, channel) {
        await this.#herdsman.touchlink.identify(ieeeAddr, channel);
    }
    async touchlinkScan() {
        return await this.#herdsman.touchlink.scan();
    }
    createGroup(id) {
        this.#herdsman.createGroup(id);
        // biome-ignore lint/style/noNonNullAssertion: just created
        return this.resolveGroup(id);
    }
    deviceByNetworkAddress(networkAddress) {
        const device = this.#herdsman.getDeviceByNetworkAddress(networkAddress);
        return device && this.resolveDevice(device.ieeeAddr);
    }
    groupByID(id) {
        return this.resolveGroup(id);
    }
    removeGroupFromLookup(id) {
        this.groupLookup.delete(id);
    }
}
exports.default = Zigbee;
__decorate([
    bind_decorator_1.default
], Zigbee.prototype, "resolveDevice", null);
__decorate([
    bind_decorator_1.default
], Zigbee.prototype, "acceptJoiningDeviceHandler", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlnYmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliL3ppZ2JlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUFzQztBQUN0QyxvRUFBa0M7QUFDbEMsa0hBQThEO0FBRTlELHFEQUEyQztBQUUzQyw0REFBb0M7QUFDcEMsMERBQWtDO0FBQ2xDLHVEQUErQjtBQUMvQiwyREFBbUM7QUFDbkMsMERBQTRDO0FBQzVDLHlEQUFpQztBQUVqQyxNQUFNLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQztBQUU5QyxNQUFxQixNQUFNO0lBQ3ZCLFNBQVMsQ0FBYztJQUNmLFFBQVEsQ0FBVztJQUNuQixXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7SUFDdEQsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO0lBQzVELG1CQUFtQixDQUFVO0lBRXJDLFlBQVksUUFBa0I7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFDUCxNQUFNLFlBQVksR0FBRyxNQUFNLGVBQUssQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLGdCQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixZQUFZLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNsRSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM3QyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUNwRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxD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