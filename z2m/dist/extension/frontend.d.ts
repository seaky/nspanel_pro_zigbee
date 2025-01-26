import Extension from './extension';
/**
 * This extension servers the frontend
 */
export default class Frontend extends Extension {
    private mqttBaseTopic;
    private host;
    private port;
    private sslCert;
    private sslKey;
    private authToken;
    private server;
    private fileServer;
    private deviceIconsFileServer;
    private wss;
    private baseUrl;
    constructor(zigbee: Zigbee, mqtt: MQTT, state: State, publishEntityState: PublishEntityState, eventBus: EventBus, enableDisableExtension: (enable: boolean, name: string) => Promise<void>, restartCallback: () => Promise<void>, addExtension: (extension: Extension) => Promise<void>);
    private isHttpsConfigured;
    start(): Promise<void>;
    stop(): Promise<void>;
    private onRequest;
    private authenticate;
    private onUpgrade;
    private onWebSocketConnection;
    private onMQTTPublishMessage;
}
//# sourceMappingURL=frontend.d.ts.map