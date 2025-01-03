import Extension from './extension';
export default class ExternalExtension extends Extension {
    private requestLookup;
    start(): Promise<void>;
    private getExtensionsBasePath;
    private getListOfUserDefinedExtensions;
    private removeExtension;
    private saveExtension;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
    private loadExtension;
    private loadUserDefinedExtensions;
    private publishExtensions;
}
//# sourceMappingURL=externalExtension.d.ts.map