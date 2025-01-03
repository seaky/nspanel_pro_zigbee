import Extension from '../extension';
export default class DeviceGroupMembership extends Extension {
    start(): Promise<void>;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
}
//# sourceMappingURL=deviceGroupMembership.d.ts.map