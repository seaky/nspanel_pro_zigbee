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
const bind_decorator_1 = __importDefault(require("bind-decorator"));
const json_stable_stringify_without_jsonify_1 = __importDefault(require("json-stable-stringify-without-jsonify"));
const logger_1 = __importDefault(require("../util/logger"));
const settings = __importStar(require("../util/settings"));
const utils_1 = __importDefault(require("../util/utils"));
const extension_1 = __importDefault(require("./extension"));
const SUPPORTED_FORMATS = ["raw", "graphviz", "plantuml"];
/**
 * This extension creates a network map
 */
class NetworkMap extends extension_1.default {
    #topic = `${settings.get().mqtt.base_topic}/bridge/request/networkmap`;
    // biome-ignore lint/suspicious/useAwait: API
    async start() {
        this.eventBus.onMQTTMessage(this, this.onMQTTMessage);
    }
    async onMQTTMessage(data) {
        if (data.topic === this.#topic) {
            const message = utils_1.default.parseJSON(data.message, data.message);
            try {
                const type = typeof message === "object" ? message.type : message;
                if (!SUPPORTED_FORMATS.includes(type)) {
                    throw new Error(`Type '${type}' not supported, allowed are: ${SUPPORTED_FORMATS.join(",")}`);
                }
                const routes = typeof message === "object" && message.routes;
                const topology = await this.networkScan(routes);
                let responseData;
                switch (type) {
                    case "raw": {
                        responseData = { type, routes, value: this.raw(topology) };
                        break;
                    }
                    case "graphviz": {
                        responseData = { type, routes, value: this.graphviz(topology) };
                        break;
                    }
                    case "plantuml": {
                        responseData = { type, routes, value: this.plantuml(topology) };
                        break;
                    }
                }
                await this.mqtt.publish("bridge/response/networkmap", (0, json_stable_stringify_without_jsonify_1.default)(utils_1.default.getResponse(message, responseData)));
            }
            catch (error) {
                await this.mqtt.publish("bridge/response/networkmap", (0, json_stable_stringify_without_jsonify_1.default)(utils_1.default.getResponse(message, {}, error.message)));
            }
        }
    }
    raw(topology) {
        return topology;
    }
    graphviz(topology) {
        const colors = settings.get().map_options.graphviz.colors;
        let text = "digraph G {\nnode[shape=record];\n";
        let style = "";
        for (const node of topology.nodes) {
            const labels = [];
            // Add friendly name
            labels.push(`${node.friendlyName}`);
            // Add the device short network address, ieeaddr and scan note (if any)
            labels.push(`${node.ieeeAddr} (${utils_1.default.toNetworkAddressHex(node.networkAddress)})${node.failed?.length ? `failed: ${node.failed.join(",")}` : ""}`);
            // Add the device model
            if (node.type !== "Coordinator") {
                labels.push(`${node.definition?.vendor} ${node.definition?.description} (${node.definition?.model})`);
            }
            // Add the device last_seen timestamp
            let lastSeen = "unknown";
            const date = node.type === "Coordinator" ? Date.now() : node.lastSeen;
            if (date) {
                lastSeen = utils_1.default.formatDate(date, "relative");
            }
            labels.push(lastSeen);
            // Shape the record according to device type
            if (node.type === "Coordinator") {
                style = `style="bold, filled", fillcolor="${colors.fill.coordinator}", fontcolor="${colors.font.coordinator}"`;
            }
            else if (node.type === "Router") {
                style = `style="rounded, filled", fillcolor="${colors.fill.router}", fontcolor="${colors.font.router}"`;
            }
            else {
                style = `style="rounded, dashed, filled", fillcolor="${colors.fill.enddevice}", fontcolor="${colors.font.enddevice}"`;
            }
            // Add the device with its labels to the graph as a node.
            text += `  "${node.ieeeAddr}" [${style}, label="{${labels.join("|")}}"];\n`;
            /**
             * Add an edge between the device and its child to the graph
             * NOTE: There are situations where a device is NOT in the topology, this can be e.g.
             * due to not responded to the lqi scan. In that case we do not add an edge for this device.
             */
            for (const link of topology.links) {
                if (link.source.ieeeAddr === node.ieeeAddr) {
                    const lineStyle = node.type === "EndDevice" ? "penwidth=1, " : !link.routes.length ? "penwidth=0.5, " : "penwidth=2, ";
                    const lineWeight = !link.routes.length
                        ? `weight=0, color="${colors.line.inactive}", `
                        : `weight=1, color="${colors.line.active}", `;
                    const textRoutes = link.routes.map((r) => utils_1.default.toNetworkAddressHex(r.destinationAddress));
                    const lineLabels = !link.routes.length
                        ? `label="${link.linkquality}"`
                        : `label="${link.linkquality} (routes: ${textRoutes.join(",")})"`;
                    text += `  "${node.ieeeAddr}" -> "${link.target.ieeeAddr}"`;
                    text += ` [${lineStyle}${lineWeight}${lineLabels}]\n`;
                }
            }
        }
        text += "}";
        return text.replace(/\0/g, "");
    }
    plantuml(topology) {
        const text = [];
        text.push(`' paste into: https://www.planttext.com/`);
        text.push("");
        text.push("@startuml");
        for (const node of topology.nodes.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName))) {
            // Add friendly name
            text.push(`card ${node.ieeeAddr} [`);
            text.push(`${node.friendlyName}`);
            text.push("---");
            // Add the device short network address, ieeaddr and scan note (if any)
            text.push(`${node.ieeeAddr} (${utils_1.default.toNetworkAddressHex(node.networkAddress)})${node.failed?.length ? ` failed: ${node.failed.join(",")}` : ""}`);
            // Add the device model
            if (node.type !== "Coordinator") {
                text.push("---");
                const definition = this.zigbee.resolveEntity(node.ieeeAddr).definition;
                text.push(`${definition?.vendor} ${definition?.description} (${definition?.model})`);
            }
            // Add the device last_seen timestamp
            let lastSeen = "unknown";
            const date = node.type === "Coordinator" ? Date.now() : node.lastSeen;
            if (date) {
                lastSeen = utils_1.default.formatDate(date, "relative");
            }
            text.push("---");
            text.push(lastSeen);
            text.push("]");
            text.push("");
        }
        /**
         * Add edges between the devices
         * NOTE: There are situations where a device is NOT in the topology, this can be e.g.
         * due to not responded to the lqi scan. In that case we do not add an edge for this device.
         */
        for (const link of topology.links) {
            text.push(`${link.sourceIeeeAddr} --> ${link.targetIeeeAddr}: ${link.lqi}`);
        }
        text.push("");
        text.push("@enduml");
        return text.join("\n");
    }
    async networkScan(includeRoutes) {
        logger_1.default.info(`Starting network scan (includeRoutes '${includeRoutes}')`);
        const lqis = new Map();
        const routingTables = new Map();
        const failed = new Map();
        const requestWithRetry = async (request) => {
            try {
                const result = await request();
                return result;
            }
            catch {
                // Network is possibly congested, sleep 5 seconds to let the network settle.
                await utils_1.default.sleep(5);
                return await request();
            }
        };
        for (const device of this.zigbee.devicesIterator((d) => d.type !== "GreenPower" && d.type !== "EndDevice")) {
            if (device.options.disabled) {
                continue;
            }
            const deviceFailures = [];
            failed.set(device, deviceFailures);
            await utils_1.default.sleep(1); // sleep 1 second between each scan to reduce stress on network.
            try {
                const result = await requestWithRetry(async () => await device.zh.lqi());
                lqis.set(device, result);
                logger_1.default.debug(`LQI succeeded for '${device.name}'`);
            }
            catch (error) {
                deviceFailures.push("lqi"); // set above
                logger_1.default.error(`Failed to execute LQI for '${device.name}'`);
                // biome-ignore lint/style/noNonNullAssertion: always Error
                logger_1.default.debug(error.stack);
            }
            if (includeRoutes) {
                try {
                    const result = await requestWithRetry(async () => await device.zh.routingTable());
                    routingTables.set(device, result);
                    logger_1.default.debug(`Routing table succeeded for '${device.name}'`);
                }
                catch (error) {
                    deviceFailures.push("routingTable"); // set above
                    logger_1.default.error(`Failed to execute routing table for '${device.name}'`);
                    // biome-ignore lint/style/noNonNullAssertion: always Error
                    logger_1.default.debug(error.stack);
                }
            }
        }
        logger_1.default.info("Network scan finished");
        const topology = { nodes: [], links: [] };
        // XXX: display GP/disabled devices in the map, better feedback than just hiding them?
        for (const device of this.zigbee.devicesIterator((d) => d.type !== "GreenPower")) {
            if (device.options.disabled) {
                continue;
            }
            // Add nodes
            const definition = device.definition
                ? {
                    model: device.definition.model,
                    vendor: device.definition.vendor,
                    description: device.definition.description,
                    supports: Array.from(new Set(device.exposes().map((e) => {
                        return e.name ?? `${e.type} (${e.features?.map((f) => f.name).join(", ")})`;
                    }))).join(", "),
                }
                : undefined;
            topology.nodes.push({
                ieeeAddr: device.ieeeAddr,
                friendlyName: device.name,
                type: device.zh.type,
                networkAddress: device.zh.networkAddress,
                manufacturerName: device.zh.manufacturerName,
                modelID: device.zh.modelID,
                failed: failed.get(device),
                lastSeen: device.zh.lastSeen,
                definition,
            });
        }
        // Add links
        for (const [device, table] of lqis) {
            for (const neighbor of table) {
                if (neighbor.relationship > 3) {
                    // Relationship is not active, skip it
                    continue;
                }
                let neighborEui64 = neighbor.eui64;
                // Some Xiaomi devices return 0x00 as the neighbor ieeeAddr (obviously not correct).
                // Determine the correct ieeeAddr based on the networkAddress.
                if (neighborEui64 === "0x0000000000000000") {
                    const neighborDevice = this.zigbee.deviceByNetworkAddress(neighbor.nwkAddress);
                    if (neighborDevice) {
                        neighborEui64 = neighborDevice.ieeeAddr;
                    }
                }
                const link = {
                    source: { ieeeAddr: neighborEui64, networkAddress: neighbor.nwkAddress },
                    target: { ieeeAddr: device.ieeeAddr, networkAddress: device.zh.networkAddress },
                    deviceType: neighbor.deviceType,
                    rxOnWhenIdle: neighbor.rxOnWhenIdle,
                    relationship: neighbor.relationship,
                    permitJoining: neighbor.permitJoining,
                    depth: neighbor.depth,
                    lqi: neighbor.lqi,
                    routes: [],
                    // below are @deprecated
                    sourceIeeeAddr: neighborEui64,
                    targetIeeeAddr: device.ieeeAddr,
                    sourceNwkAddr: neighbor.nwkAddress,
                    linkquality: neighbor.lqi,
                };
                const routingTable = routingTables.get(device);
                if (routingTable) {
                    for (const entry of routingTable) {
                        if (entry.nextHopAddress === neighbor.nwkAddress) {
                            link.routes.push(entry);
                        }
                    }
                }
                topology.links.push(link);
            }
        }
        return topology;
    }
}
exports.default = NetworkMap;
__decorate([
    bind_decorator_1.default
], NetworkMap.prototype, "onMQTTMessage", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya01hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9leHRlbnNpb24vbmV0d29ya01hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9FQUFrQztBQUNsQyxrSEFBOEQ7QUFJOUQsNERBQW9DO0FBQ3BDLDJEQUE2QztBQUM3QywwREFBa0M7QUFDbEMsNERBQW9DO0FBRXBDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRTFEOztHQUVHO0FBQ0gsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO0lBQzdDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSw0QkFBNEIsQ0FBQztJQUV2RSw2Q0FBNkM7SUFDcEMsS0FBSyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRVcsQUFBTixLQUFLLENBQUMsYUFBYSxDQUFDLElBQTJCO1FBQ2pELElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQWdELENBQUM7WUFFM0csSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxHQUFHLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUVsRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3BDLE1BQU0sSUFB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