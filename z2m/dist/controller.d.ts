import type { IClientPublishOptions } from 'mqtt';
export declare class Controller {
    private eventBus;
    private zigbee;
    private state;
    private mqtt;
    private restartCallback;
    private exitCallback;
    private extensions;
    private extensionArgs;
    private sdNotify;
    constructor(restartCallback: () => Promise<void>, exitCallback: (code: number, restart: boolean) => Promise<void>);
    start(): Promise<void>;
    enableDisableExtension(enable: boolean, name: string): Promise<void>;
    addExtension(extension: Extension): Promise<void>;
    stop(restart?: boolean): Promise<void>;
    exit(code: number, restart?: boolean): Promise<void>;
    onZigbeeAdapterDisconnected(): Promise<void>;
    publishEntityState(entity: Group | Device, payload: KeyValue, stateChangeReason?: StateChangeReason): Promise<void>;
    iteratePayloadAttributeOutput(topicRoot: string, payload: KeyValue, options: IClientPublishOptions): Promise<void>;
    private callExtensions;
}
//# sourceMappingURL=controller.d.ts.map