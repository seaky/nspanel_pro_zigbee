import Extension from '../extension';
export default class BridgeLegacy extends Extension {
    private lastJoinedDeviceName?;
    private supportedOptions;
    start(): Promise<void>;
    whitelist(topic: string, message: string): Promise<void>;
    deviceOptions(topic: string, message: string): void;
    permitJoin(topic: string, message: string): Promise<void>;
    reset(): Promise<void>;
    lastSeen(topic: string, message: string): void;
    elapsed(topic: string, message: string): void;
    logLevel(topic: string, message: string): Promise<void>;
    devices(topic: string): Promise<void>;
    groups(): Promise<void>;
    rename(topic: string, message: string): Promise<void>;
    renameLast(topic: string, message: string): Promise<void>;
    _renameInternal(from: string, to: string): Promise<void>;
    addGroup(topic: string, message: string): Promise<void>;
    removeGroup(topic: string, message: string): Promise<void>;
    forceRemove(topic: string, message: string): Promise<void>;
    remove(topic: string, message: string): Promise<void>;
    ban(topic: string, message: string): Promise<void>;
    removeForceRemoveOrBan(action: string, message: string): Promise<void>;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
    publish(): Promise<void>;
    onZigbeeEvent_(type: string, data: KeyValue, resolvedEntity: Device | undefined): Promise<void>;
    touchlinkFactoryReset(): Promise<void>;
}
//# sourceMappingURL=bridgeLegacy.d.ts.map