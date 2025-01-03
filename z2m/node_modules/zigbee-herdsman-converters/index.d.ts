import type { Binary, Climate, Composite, Cover, Enum, Fan, Feature, Light, List, Lock, Numeric, Switch, Text } from './lib/exposes';
import fromZigbee from './converters/fromZigbee';
import toZigbee from './converters/toZigbee';
import * as configureKey from './lib/configureKey';
import * as logger from './lib/logger';
import * as ota from './lib/ota';
import { Definition, DefinitionWithExtend, Expose, KeyValue, OnEventData, OnEventMeta, OnEventType, Option, OtaUpdateAvailableResult, Tz, Zh } from './lib/types';
export { Definition as Definition, OnEventType as OnEventType, Feature as Feature, Expose as Expose, Option as Option, Numeric as Numeric, Binary as Binary, Enum as Enum, Text as Text, Composite as Composite, List as List, Light as Light, Climate as Climate, Switch as Switch, Lock as Lock, Cover as Cover, Fan as Fan, toZigbee as toZigbee, fromZigbee as fromZigbee, Tz as Tz, OtaUpdateAvailableResult as OtaUpdateAvailableResult, ota as ota, };
export declare const getConfigureKey: typeof configureKey.getConfigureKey;
export declare const definitions: Definition[];
export declare function postProcessConvertedFromZigbeeMessage(definition: Definition, payload: KeyValue, options: KeyValue): void;
export declare function addDefinition(definition: DefinitionWithExtend): void;
export declare function findByDevice(device: Zh.Device, generateForUnknown?: boolean): Promise<Definition>;
export declare function findDefinition(device: Zh.Device, generateForUnknown?: boolean): Promise<Definition>;
export declare function generateExternalDefinitionSource(device: Zh.Device): Promise<string>;
export declare function findByModel(model: string): Definition;
export declare function onEvent(type: OnEventType, data: OnEventData, device: Zh.Device, meta: OnEventMeta): Promise<void>;
export declare const setLogger: typeof logger.setLogger;
//# sourceMappingURL=index.d.ts.map