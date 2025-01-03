import { Driver } from './driver';
import { EmberStatus } from './types/named';
export declare class Multicast {
    TABLE_SIZE: number;
    private driver;
    private _multicast;
    private _available;
    constructor(driver: Driver);
    private _initialize;
    startup(enpoints: Array<any>): Promise<void>;
    subscribe(group_id: number, endpoint: number): Promise<EmberStatus>;
}
//# sourceMappingURL=multicast.d.ts.map