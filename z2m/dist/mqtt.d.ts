import type { IClientPublishOptions } from 'mqtt';
export default class MQTT {
    private publishedTopics;
    private connectionTimer?;
    private client;
    private eventBus;
    private republishRetainedTimer?;
    retainedMessages: {
        [s: string]: {
            payload: string;
            options: IClientPublishOptions;
            skipLog: boolean;
            skipReceive: boolean;
            topic: string;
            base: string;
        };
    };
    constructor(eventBus: EventBus);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    subscribe(topic: string): Promise<void>;
    unsubscribe(topic: string): Promise<void>;
    private onConnect;
    onMessage(topic: string, message: Buffer): void;
    isConnected(): boolean;
    publish(topic: string, payload: string, options?: IClientPublishOptions, base?: string, skipLog?: boolean, skipReceive?: boolean): Promise<void>;
}
//# sourceMappingURL=mqtt.d.ts.map