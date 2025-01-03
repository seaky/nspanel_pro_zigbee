"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ZclTransactionSequenceNumber {
    static number = 1;
    static next() {
        this.number++;
        if (this.number > 255) {
            this.number = 1;
        }
        return this.number;
    }
}
exports.default = ZclTransactionSequenceNumber;
//# sourceMappingURL=zclTransactionSequenceNumber.js.map