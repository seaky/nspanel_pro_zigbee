import { Zcl } from 'zigbee-herdsman';
import { LightArgs, NumericArgs } from '../lib/modernExtend';
import { Fz, KeyValue, ModernExtend, Range } from '../lib/types';
export declare const manufacturerOptions: {
    manufacturerCode: Zcl.ManufacturerCode;
};
export declare function ikeaLight(args?: Omit<LightArgs, 'colorTemp'> & {
    colorTemp?: true | {
        range: Range;
        viaColor: true;
    };
}): ModernExtend;
export declare function ikeaOta(): ModernExtend;
export declare function ikeaBattery(): ModernExtend;
export declare function ikeaConfigureStyrbar(): ModernExtend;
export declare function ikeaConfigureRemote(): ModernExtend;
export declare function ikeaAirPurifier(): ModernExtend;
export declare function ikeaVoc(args?: Partial<NumericArgs>): ModernExtend;
export declare function ikeaConfigureGenPollCtrl(args?: {
    endpointId: number;
}): ModernExtend;
export declare function tradfriOccupancy(): ModernExtend;
export declare function tradfriRequestedBrightness(): ModernExtend;
export declare function tradfriCommandsOnOff(): ModernExtend;
export declare function tradfriCommandsLevelCtrl(): ModernExtend;
export declare function styrbarCommandOn(): ModernExtend;
export declare function ikeaDotsClick(args: {
    actionLookup?: KeyValue;
    dotsPrefix?: boolean;
    endpointNames: string[];
}): ModernExtend;
export declare function ikeaArrowClick(args?: {
    styrbar?: boolean;
    bind?: boolean;
}): ModernExtend;
export declare function ikeaMediaCommands(): ModernExtend;
export declare function addCustomClusterManuSpecificIkeaAirPurifier(): ModernExtend;
export declare function addCustomClusterManuSpecificIkeaVocIndexMeasurement(): ModernExtend;
export declare function addCustomClusterManuSpecificIkeaUnknown(): ModernExtend;
export declare const legacy: {
    fromZigbee: {
        E1744_play_pause: {
            cluster: string;
            type: string;
            options: import("../lib/exposes").Binary[];
            convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
                action: string;
            };
        };
        E1744_skip: {
            cluster: string;
            type: string;
            options: import("../lib/exposes").Binary[];
            convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
                action: string;
                step_size: any;
                transition_time: any;
            };
        };
        E1743_brightness_down: {
            cluster: string;
            type: string;
            options: import("../lib/exposes").Binary[];
            convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
                click: string;
            };
        };
        E1743_brightness_up: {
            cluster: string;
            type: string;
            options: import("../lib/exposes").Binary[];
            convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
                click: string;
            };
        };
        E1743_brightness_stop: {
            cluster: string;
            type: string;
            options: import("../lib/exposes").Binary[];
            convert: (model: import("../lib/types").Definition, msg: Fz.Message, publish: import("../lib/types").Publish, options: KeyValue, meta: Fz.Meta) => {
                click: string;
            };
        };
    };
    toZigbee: {};
};
//# sourceMappingURL=ikea.d.ts.map