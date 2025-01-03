export default class MQTT {
    private publishedTopics;
    private connectionTimer?;
    private client;
    private eventBus;
    private initialConnect;
    private republishRetainedTimer?;
    retainedMessages: {
        [s: string]: {
            payload: string;
            options: MQTTOptions;
            skipLog: boolean;
            skipReceive: boolean;
            topic: string;
            base: string;
        };
    };
    constructor(eventBus: EventBus);
    connect(): Promise<void>;
    publishStateOnline(): Promise<void>;
    disconnect(): Promise<void>;
    subscribe(topic: string): void;
    unsubscribe(topic: string): void;
    onMessage(topic: string, message: Buffer): void;
    isConnected(): boolean;
    publish(topic: string, payload: string, options?: MQTTOptions, base?: string, skipLog?: boolean, skipReceive?: boolean): Promise<void>;
}
//# sourceMappingURL=mqtt.d.ts.map