import * as zhc from 'zigbee-herdsman-converters';
import Device from '../model/device';
import Group from '../model/group';
import Extension from './extension';
export declare const loadTopicGetSetRegex: () => void;
interface ParsedTopic {
    ID: string;
    endpoint: string | undefined;
    attribute: string;
    type: 'get' | 'set';
}
export default class Publish extends Extension {
    start(): Promise<void>;
    parseTopic(topic: string): ParsedTopic | undefined;
    parseMessage(parsedTopic: ParsedTopic, data: eventdata.MQTTMessage): KeyValue | undefined;
    legacyLog(payload: KeyValue): Promise<void>;
    legacyRetrieveState(re: Device | Group, converter: zhc.Tz.Converter, result: zhc.Tz.ConvertSetResult, target: zh.Endpoint | zh.Group, key: string, meta: zhc.Tz.Meta): void;
    updateMessageHomeAssistant(message: KeyValue, entityState: KeyValue): void;
    onMQTTMessage(data: eventdata.MQTTMessage): Promise<void>;
}
export {};
//# sourceMappingURL=publish.d.ts.map