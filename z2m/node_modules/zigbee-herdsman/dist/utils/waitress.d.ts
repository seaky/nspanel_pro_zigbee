type Validator<TPayload, TMatcher> = (payload: TPayload, matcher: TMatcher) => boolean;
type TimeoutFormatter<TMatcher> = (matcher: TMatcher, timeout: number) => string;
declare class Waitress<TPayload, TMatcher> {
    private waiters;
    private readonly validator;
    private readonly timeoutFormatter;
    private currentID;
    constructor(validator: Validator<TPayload, TMatcher>, timeoutFormatter: TimeoutFormatter<TMatcher>);
    resolve(payload: TPayload): boolean;
    reject(payload: TPayload, message: string): boolean;
    remove(ID: number): void;
    waitFor(matcher: TMatcher, timeout: number): {
        ID: number;
        start: () => {
            promise: Promise<TPayload>;
            ID: number;
        };
    };
    private forEachMatching;
}
export default Waitress;
//# sourceMappingURL=waitress.d.ts.map