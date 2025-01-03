import Extension from './extension';
export default class Groups extends Extension {
    private legacyApi;
    private lastOptimisticState;
    start(): Promise<void>;
    private syncGroupsWithSettings;
    onStateChange(data: eventdata.StateChange): Promise<void>;
    private shouldPublishPayloadForGroup;
    private areAllMembersOffOrClosed;
    private parseMQTTMessage;
    private onMQTTMessage;
}
//# sourceMappingURL=groups.d.ts.map