import type Extension from './extension';
import ExternalJSExtension from './externalJS';
type ModuleExports = typeof Extension;
export default class ExternalExtensions extends ExternalJSExtension<ModuleExports> {
    constructor(zigbee: Zigbee, mqtt: MQTT, state: State, publishEntityState: PublishEntityState, eventBus: EventBus, enableDisableExtension: (enable: boolean, name: string) => Promise<void>, restartCallback: () => Promise<void>, addExtension: (extension: Extension) => Promise<void>);
    protected removeJS(name: string, module: ModuleExports): Promise<void>;
    protected loadJS(name: string, module: ModuleExports): Promise<void>;
}
export {};
//# sourceMappingURL=externalExtensions.d.ts.map