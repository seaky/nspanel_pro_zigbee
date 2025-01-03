import { Adapter } from '../adapter';
declare class Touchlink {
    private adapter;
    private locked;
    constructor(adapter: Adapter);
    private lock;
    private transactionNumber;
    scan(): Promise<{
        ieeeAddr: string;
        channel: number;
    }[]>;
    identify(ieeeAddr: string, channel: number): Promise<void>;
    factoryReset(ieeeAddr: string, channel: number): Promise<boolean>;
    factoryResetFirst(): Promise<boolean>;
    private createScanRequestFrame;
    private createIdentifyRequestFrame;
    private createResetFactoryNewRequestFrame;
}
export default Touchlink;
//# sourceMappingURL=touchlink.d.ts.map