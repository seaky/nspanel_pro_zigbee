declare class State {
    private readonly eventBus;
    private readonly zigbee;
    private state;
    private file;
    private timer?;
    constructor(eventBus: EventBus, zigbee: Zigbee);
    start(): void;
    stop(): void;
    private load;
    private save;
    exists(entity: Device | Group): boolean;
    get(entity: Group | Device): KeyValue;
    set(entity: Group | Device, update: KeyValue, reason?: string): KeyValue;
    remove(ID: string | number): void;
}
export default State;
//# sourceMappingURL=state.d.ts.map