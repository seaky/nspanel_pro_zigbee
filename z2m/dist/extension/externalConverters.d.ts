import type * as zhc from 'zigbee-herdsman-converters';
import ExternalJSExtension from './externalJS';
type ModuleExports = zhc.Definition | zhc.Definition[];
export default class ExternalConverters extends ExternalJSExtension<ModuleExports> {
    constructor(zigbee: Zigbee, mqtt: MQTT, state: State, publishEntityState: PublishEntityState, eventBus: EventBus, enableDisableExtension: (enable: boolean, name: string) => Promise<void>, restartCallback: () => Promise<void>, addExtension: (extension: Extension) => Promise<void>);
    protected removeJS(name: string, module: ModuleExports): Promise<void>;
    protected loadJS(name: string, module: ModuleExports): Promise<void>;
    private getDefinitions;
}
export {};
//# sourceMappingURL=externalConverters.d.ts.map