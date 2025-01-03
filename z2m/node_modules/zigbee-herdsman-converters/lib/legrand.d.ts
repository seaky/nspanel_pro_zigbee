import { Zcl } from 'zigbee-herdsman';
import { Fz, KeyValueAny, OnEvent, Tz, Zh } from '../lib/types';
import * as exposes from './exposes';
export declare const legrandOptions: {
    manufacturerCode: Zcl.ManufacturerCode;
    disableDefaultResponse: boolean;
};
export declare const eLegrand: {
    identify: () => exposes.Enum;
    ledInDark: () => exposes.Binary;
    ledIfOn: () => exposes.Binary;
    getCover: (device: Zh.Device) => exposes.Cover;
    getCalibrationModes: (isNLLVSwitch: boolean) => exposes.Enum;
};
export declare const readInitialBatteryState: OnEvent;
export declare const tzLegrand: {
    auto_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                auto_mode: unknown;
            };
        }>;
    };
    calibration_mode: (isNLLVSwitch: boolean) => {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    led_mode: {
        key: string[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<{
            state: {
                [x: string]: unknown;
            };
        }>;
        convertGet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, meta: Tz.Meta) => Promise<void>;
    };
    identify: {
        key: string[];
        options: exposes.Composite[];
        convertSet: (entity: import("zigbee-herdsman/dist/controller/model").Endpoint | import("zigbee-herdsman/dist/controller/model").Group, key: string, value: unknown, meta: Tz.Meta) => Promise<void>;
    };
};
export declare const fzLegrand: {
    calibration_mode: (isNLLVSwitch: boolean) => {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: import("../lib/types").KeyValue, meta: Fz.Meta) => {
            calibration_mode: string;
        };
    };
    cluster_fc01: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: import("../lib/types").KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    command_cover: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: import("../lib/types").KeyValue, meta: Fz.Meta) => KeyValueAny;
    };
    identify: {
        cluster: string;
        type: string[];
        convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: import("../lib/types").KeyValue, meta: Fz.Meta) => {};
    };
};
//# sourceMappingURL=legrand.d.ts.map