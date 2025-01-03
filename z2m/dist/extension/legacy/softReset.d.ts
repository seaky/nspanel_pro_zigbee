import Extension from '../extension';
/**
 * This extensions soft resets the ZNP after a certain timeout.
 */
export default class SoftReset extends Extension {
    private timer?;
    private timeout;
    start(): Promise<void>;
    private clearTimer;
    private resetTimer;
    private handleTimeout;
}
//# sourceMappingURL=softReset.d.ts.map