import * as zhc from 'zigbee-herdsman-converters';
import Device from '../model/device';
import Group from '../model/group';
import Extension from './extension';
type DefinitionPayload = {
    model: string;
    vendor: string;
    description: string;
    exposes: zhc.Expose[];
    supports_ota: boolean;
    icon: string;
    options: zhc.Option[];
};
export default class Bridge extends Extension {
    private zigbee2mqttVersion;
    private zigbeeHerdsmanVersion;
    private zigbeeHerdsmanConvertersVersion;
    private coordinatorVersion;
    private restartRequired;
    private lastJoinedDeviceIeeeAddr?;
    private lastBridgeLoggingPayload?;
    private logTransport;
    private requestLookup;
    start(): Promise<void>;
    stop(): Promise<void>;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
    /**
     * Requests
     */
    deviceOptions(message: KeyValue | string): Promise<MQTTResponse>;
    groupOptions(message: KeyValue | string): Promise<MQTTResponse>;
    bridgeOptions(message: KeyValue | string): Promise<MQTTResponse>;
    deviceRemove(message: string | KeyValue): Promise<MQTTResponse>;
    groupRemove(message: string | KeyValue): Promise<MQTTResponse>;
    healthCheck(message: string | KeyValue): Promise<MQTTResponse>;
    coordinatorCheck(message: string | KeyValue): Promise<MQTTResponse>;
    groupAdd(message: string | KeyValue): Promise<MQTTResponse>;
    deviceRename(message: string | KeyValue): Promise<MQTTResponse>;
    groupRename(message: string | KeyValue): Promise<MQTTResponse>;
    restart(message: string | KeyValue): Promise<MQTTResponse>;
    backup(message: string | KeyValue): Promise<MQTTResponse>;
    installCodeAdd(message: KeyValue | string): Promise<MQTTResponse>;
    permitJoin(message: KeyValue | string): Promise<MQTTResponse>;
    configLastSeen(message: KeyValue | string): Promise<MQTTResponse>;
    configHomeAssistant(message: string | KeyValue): Promise<MQTTResponse>;
    configElapsed(message: KeyValue | string): Promise<MQTTResponse>;
    configLogLevel(message: KeyValue | string): Promise<MQTTResponse>;
    touchlinkIdentify(message: KeyValue | string): Promise<MQTTResponse>;
    touchlinkFactoryReset(message: KeyValue | string): Promise<MQTTResponse>;
    touchlinkScan(message: KeyValue | string): Promise<MQTTResponse>;
    /**
     * Utils
     */
    getValue(message: KeyValue | string): string | boolean | number;
    changeEntityOptions(entityType: 'device' | 'group', message: KeyValue | string): Promise<MQTTResponse>;
    deviceConfigureReporting(message: string | KeyValue): Promise<MQTTResponse>;
    deviceInterview(message: string | KeyValue): Promise<MQTTResponse>;
    deviceGenerateExternalDefinition(message: string | KeyValue): Promise<MQTTResponse>;
    renameEntity(entityType: 'group' | 'device', message: string | KeyValue): Promise<MQTTResponse>;
    removeEntity(entityType: 'group' | 'device', message: string | KeyValue): Promise<MQTTResponse>;
    getEntity(type: 'group' | 'device', ID: string): Device | Group;
    publishInfo(): Promise<void>;
    publishDevices(): Promise<void>;
    publishGroups(): Promise<void>;
    publishDefinitions(): Promise<void>;
    getDefinitionPayload(device: Device): DefinitionPayload | undefined;
}
export {};
//# sourceMappingURL=bridge.d.ts.map