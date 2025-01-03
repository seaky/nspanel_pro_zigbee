import Extension from './extension';
export default class Availability extends Extension {
    private timers;
    private availabilityCache;
    private retrieveStateDebouncers;
    private pingQueue;
    private pingQueueExecuting;
    private stopped;
    private getTimeout;
    private isActiveDevice;
    private isAvailable;
    private resetTimer;
    private addToPingQueue;
    private removeFromPingQueue;
    private pingQueueExecuteNext;
    start(): Promise<void>;
    private publishAvailabilityForAllEntities;
    private publishAvailability;
    private onLastSeenChanged;
    stop(): Promise<void>;
    private retrieveState;
}
//# sourceMappingURL=availability.d.ts.map