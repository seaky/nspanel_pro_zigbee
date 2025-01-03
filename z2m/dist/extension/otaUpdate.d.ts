import Extension from './extension';
export default class OTAUpdate extends Extension {
    private inProgress;
    private lastChecked;
    private legacyApi;
    start(): Promise<void>;
    private removeProgressAndRemainingFromState;
    private onZigbeeEvent;
    private readSoftwareBuildIDAndDateCode;
    private getEntityPublishPayload;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
}
//# sourceMappingURL=otaUpdate.d.ts.map