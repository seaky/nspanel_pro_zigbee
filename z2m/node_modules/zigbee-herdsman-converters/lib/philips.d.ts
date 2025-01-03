import * as exposes from './exposes';
import * as modernExtend from './modernExtend';
import { Fz, KeyValue, ModernExtend, Tz } from './types';
export declare function philipsLight(args?: modernExtend.LightArgs & {
    hueEffect?: boolean;
    gradient?: true | {
        extraEffects: string[];
    };
}): ModernExtend;
export declare function philipsOnOff(args?: modernExtend.OnOffArgs): ModernExtend;
export declare function philipsTwilightOnOff(): ModernExtend;
export declare const philipsTz: {
    gradient_scene: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    gradient: (opts?: {
        reverse: boolean;
    }) => {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    effect: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    hue_power_on_behavior: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                hue_power_on_behavior: unknown;
            };
        }>;
    };
    hue_power_on_error: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
    hue_motion_sensitivity: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                motion_sensitivity: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    hue_motion_led_indication: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                led_indication: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
};
export { philipsTz as tz };
export declare const philipsFz: {
    philips_contact: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            contact: boolean;
        };
    };
    hue_tap_dial: {
        cluster: string;
        type: string;
        options: exposes.Composite[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => KeyValue;
    };
    gradient: {
        cluster: string;
        type: string[];
        convert: (model: import("./types").Definition, msg: Fz.Message, publish: import("./types").Publish, options: KeyValue, meta: Fz.Meta) => {
            gradient: string[];
        } | {
            gradient?: undefined;
        };
    };
};
//# sourceMappingURL=philips.d.ts.map