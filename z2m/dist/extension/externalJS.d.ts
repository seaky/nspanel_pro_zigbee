import Extension from './extension';
export default abstract class ExternalJSExtension<M> extends Extension {
    protected mqttTopic: string;
    protected requestRegex: RegExp;
    protected basePath: string;
    constructor(zigbee: Zigbee, mqtt: MQTT, state: State, publishEntityState: PublishEntityState, eventBus: EventBus, enableDisableExtension: (enable: boolean, name: string) => Promise<void>, restartCallback: () => Promise<void>, addExtension: (extension: Extension) => Promise<void>, mqttTopic: string, folderName: string);
    start(): Promise<void>;
    private getFilePath;
    protected getFileCode(name: string): string;
    protected getFiles(): Generator<{
        name: string;
        code: string;
    }>;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
    protected abstract removeJS(name: string, module: M): Promise<void>;
    protected abstract loadJS(name: string, module: M): Promise<void>;
    private remove;
    private save;
    private loadFiles;
    private publishExternalJS;
    private loadModuleFromText;
}
//# sourceMappingURL=externalJS.d.ts.map