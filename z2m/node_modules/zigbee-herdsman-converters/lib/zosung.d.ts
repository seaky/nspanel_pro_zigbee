import * as exposes from './exposes';
import { Fz, Tz } from './types';
export declare const fzZosung: {
    zosung_send_ir_code_01: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => void;
    };
    zosung_send_ir_code_02: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => Promise<void>;
    };
    zosung_send_ir_code_04: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => Promise<void>;
    };
    zosung_send_ir_code_00: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => Promise<void>;
    };
    zosung_send_ir_code_03: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => Promise<void>;
    };
    zosung_send_ir_code_05: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: import("./types").KeyValue, meta: Fz.Meta) => Promise<{
            learned_ir_code: any;
        }>;
    };
};
export declare const tzZosung: {
    zosung_ir_code_to_send: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    zosung_learn_ir_code: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
};
export declare const presetsZosung: {
    learn_ir_code: () => exposes.Binary;
    learned_ir_code: () => exposes.Text;
    ir_code_to_send: () => exposes.Text;
};
//# sourceMappingURL=zosung.d.ts.map