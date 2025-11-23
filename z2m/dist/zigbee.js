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
    herdsman;
    eventBus;
    groupLookup = new Map();
    deviceLookup = new Map();
    coordinatorIeeeAddr;
    constructor(eventBus) {
        this.eventBus = eventBus;
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
            this.herdsman = new zigbee_herdsman_1.Controller(herdsmanSettings);
            startResult = await this.herdsman.start();
        }
        catch (error) {
            logger_1.default.error("Error while starting zigbee-herdsman");
            throw error;
        }
        this.coordinatorIeeeAddr = this.herdsman.getDevicesByType("Coordinator")[0].ieeeAddr;
        await this.resolveDevicesDefinitions();
        this.herdsman.on("adapterDisconnected", () => this.eventBus.emitAdapterDisconnected());
        this.herdsman.on("lastSeenChanged", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            this.eventBus.emitLastSeenChanged({ device: this.resolveDevice(data.device.ieeeAddr), reason: data.reason });
        });
        this.herdsman.on("permitJoinChanged", (data) => {
            this.eventBus.emitPermitJoinChanged(data);
        });
        this.herdsman.on("deviceNetworkAddressChanged", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            const device = this.resolveDevice(data.device.ieeeAddr);
            logger_1.default.debug(`Device '${device.name}' changed network address`);
            this.eventBus.emitDeviceNetworkAddressChanged({ device });
        });
        this.herdsman.on("deviceAnnounce", (data) => {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            const device = this.resolveDevice(data.device.ieeeAddr);
            logger_1.default.debug(`Device '${device.name}' announced itself`);
            this.eventBus.emitDeviceAnnounce({ device });
        });
        this.herdsman.on("deviceInterview", async (data) => {
            const device = this.resolveDevice(data.device.ieeeAddr);
            /* v8 ignore next */ if (!device)
                return; // Prevent potential race
            await device.resolveDefinition();
            const d = { device, status: data.status };
            this.logDeviceInterview(d);
            this.eventBus.emitDeviceInterview(d);
        });
        this.herdsman.on("deviceJoined", async (data) => {
            const device = this.resolveDevice(data.device.ieeeAddr);
            /* v8 ignore next */ if (!device)
                return; // Prevent potential race
            await device.resolveDefinition();
            logger_1.default.info(`Device '${device.name}' joined`);
            this.eventBus.emitDeviceJoined({ device });
        });
        this.herdsman.on("deviceLeave", (data) => {
            const name = settings.getDevice(data.ieeeAddr)?.friendly_name || data.ieeeAddr;
            logger_1.default.warning(`Device '${name}' left the network`);
            this.eventBus.emitDeviceLeave({ ieeeAddr: data.ieeeAddr, name, device: this.deviceLookup.get(data.ieeeAddr) });
        });
        this.herdsman.on("message", async (data) => {
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
        logger_1.default.debug(`Zigbee network parameters: ${(0, json_stable_stringify_without_jsonify_1.default)(await this.herdsman.getNetworkParameters())}`);
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
        return await this.herdsman.getCoordinatorVersion();
    }
    isStopping() {
        return this.herdsman.isStopping();
    }
    async backup() {
        return await this.herdsman.backup();
    }
    async coordinatorCheck() {
        const check = await this.herdsman.coordinatorCheck();
        // biome-ignore lint/style/noNonNullAssertion: assumed valid
        return { missingRouters: check.missingRouters.map((d) => this.resolveDevice(d.ieeeAddr)) };
    }
    async getNetworkParameters() {
        return await this.herdsman.getNetworkParameters();
    }
    async stop() {
        logger_1.default.info("Stopping zigbee-herdsman...");
        await this.herdsman.stop();
        logger_1.default.info("Stopped zigbee-herdsman");
    }
    getPermitJoin() {
        return this.herdsman.getPermitJoin();
    }
    getPermitJoinEnd() {
        return this.herdsman.getPermitJoinEnd();
    }
    async permitJoin(time, device) {
        if (time > 0) {
            logger_1.default.info(`Zigbee: allowing new devices to join${device ? ` via ${device.name}` : ""}.`);
        }
        else {
            logger_1.default.info("Zigbee: disabling joining new devices.");
        }
        await this.herdsman.permitJoin(time, device?.zh);
    }
    async resolveDevicesDefinitions(ignoreCache = false) {
        for (const device of this.devicesIterator(utils_1.default.deviceNotCoordinator)) {
            await device.resolveDefinition(ignoreCache);
        }
    }
    resolveDevice(ieeeAddr) {
        if (!this.deviceLookup.has(ieeeAddr)) {
            const device = this.herdsman.getDeviceByIeeeAddr(ieeeAddr);
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
            const group = this.herdsman.getGroupByID(groupID);
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
        return this.herdsman.getDevicesByType("Coordinator")[0].endpoints[0];
    }
    *devicesAndGroupsIterator(devicePredicate, groupPredicate) {
        for (const device of this.herdsman.getDevicesIterator(devicePredicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveDevice(device.ieeeAddr);
        }
        for (const group of this.herdsman.getGroupsIterator(groupPredicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveGroup(group.groupID);
        }
    }
    *groupsIterator(predicate) {
        for (const group of this.herdsman.getGroupsIterator(predicate)) {
            // biome-ignore lint/style/noNonNullAssertion: assumed valid
            yield this.resolveGroup(group.groupID);
        }
    }
    *devicesIterator(predicate) {
        for (const device of this.herdsman.getDevicesIterator(predicate)) {
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
        return await this.herdsman.touchlinkFactoryResetFirst();
    }
    async touchlinkFactoryReset(ieeeAddr, channel) {
        return await this.herdsman.touchlinkFactoryReset(ieeeAddr, channel);
    }
    async addInstallCode(installCode) {
        await this.herdsman.addInstallCode(installCode);
    }
    async touchlinkIdentify(ieeeAddr, channel) {
        await this.herdsman.touchlinkIdentify(ieeeAddr, channel);
    }
    async touchlinkScan() {
        return await this.herdsman.touchlinkScan();
    }
    createGroup(id) {
        this.herdsman.createGroup(id);
        // biome-ignore lint/style/noNonNullAssertion: just created
        return this.resolveGroup(id);
    }
    deviceByNetworkAddress(networkAddress) {
        const device = this.herdsman.getDeviceByNetworkAddress(networkAddress);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlnYmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliL3ppZ2JlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUFzQztBQUN0QyxvRUFBa0M7QUFDbEMsa0hBQThEO0FBRTlELHFEQUEyQztBQUczQyw0REFBb0M7QUFDcEMsMERBQWtDO0FBQ2xDLHVEQUErQjtBQUMvQiwyREFBbUM7QUFDbkMsMERBQTRDO0FBQzVDLHlEQUFpQztBQUVqQyxNQUFNLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQztBQUU5QyxNQUFxQixNQUFNO0lBQ2YsUUFBUSxDQUFjO0lBQ3RCLFFBQVEsQ0FBVztJQUNuQixXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7SUFDdEQsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO0lBQzVELG1CQUFtQixDQUFVO0lBRXJDLFlBQVksUUFBa0I7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1AsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFLLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RSxnQkFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsWUFBWSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDbEUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDN0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDcEQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDdkQsTUFBTSxnQkFBZ0IsR0FBRztZQUNyQixPQUFPLEVBQUU7Z0JB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