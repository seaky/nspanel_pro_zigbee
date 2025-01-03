import * as zhc from 'zigbee-herdsman-converters';
export default class Group {
    zh: zh.Group;
    private resolveDevice;
    get ID(): number;
    get options(): GroupOptions;
    get name(): string;
    constructor(group: zh.Group, resolveDevice: (ieeeAddr: string) => Device | undefined);
    hasMember(device: Device): boolean;
    membersDevices(): Device[];
    membersDefinitions(): zhc.Definition[];
    isDevice(): this is Device;
    isGroup(): this is Group;
}
//# sourceMappingURL=group.d.ts.map