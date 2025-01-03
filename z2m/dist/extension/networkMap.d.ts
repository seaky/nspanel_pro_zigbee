import Extension from './extension';
interface Link {
    source: {
        ieeeAddr: string;
        networkAddress: number;
    };
    target: {
        ieeeAddr: string;
        networkAddress: number;
    };
    linkquality: number;
    depth: number;
    routes: zh.RoutingTableEntry[];
    sourceIeeeAddr: string;
    targetIeeeAddr: string;
    sourceNwkAddr: number;
    lqi: number;
    relationship: number;
}
interface Topology {
    nodes: {
        ieeeAddr: string;
        friendlyName: string;
        type: string;
        networkAddress: number;
        manufacturerName: string | undefined;
        modelID: string | undefined;
        failed: string[];
        lastSeen: number | undefined;
        definition?: {
            model: string;
            vendor: string;
            supports: string;
            description: string;
        };
    }[];
    links: Link[];
}
/**
 * This extension creates a network map
 */
export default class NetworkMap extends Extension {
    private legacyApi;
    private legacyTopic;
    private legacyTopicRoutes;
    private topic;
    private supportedFormats;
    start(): Promise<void>;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
    raw(topology: Topology): KeyValue;
    graphviz(topology: Topology): string;
    plantuml(topology: Topology): string;
    networkScan(includeRoutes: boolean): Promise<Topology>;
}
export {};
//# sourceMappingURL=networkMap.d.ts.map