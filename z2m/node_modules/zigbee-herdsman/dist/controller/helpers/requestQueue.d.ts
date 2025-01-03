import { Endpoint } from '../model';
import Request from './request';
declare class RequestQueue extends Set<Request> {
    private sendInProgress;
    private ID;
    private deviceIeeeAddress;
    constructor(endpoint: Endpoint);
    send(fastPolling: boolean): Promise<void>;
    queue<Type>(request: Request<Type>): Promise<Type>;
    filter(newRequest: Request): void;
}
export default RequestQueue;
//# sourceMappingURL=requestQueue.d.ts.map