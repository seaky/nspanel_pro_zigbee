"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSdNotify = initSdNotify;
const node_os_1 = require("node:os");
const logger_1 = __importDefault(require("./logger"));
/**
 * Handle sd_notify protocol, @see https://www.freedesktop.org/software/systemd/man/latest/sd_notify.html
 * No-op if running on unsupported platforms or without Type=notify
 * Soft-fails if improperly setup (this is not necessary for Zigbee2MQTT to function properly)
 */
async function initSdNotify() {
    if (!process.env.NOTIFY_SOCKET) {
        return;
    }
    let socket;
    try {
        const { createSocket } = await import("unix-dgram");
        socket = createSocket("unix_dgram");
    }
    catch (error) {
        if ((0, node_os_1.platform)() !== "win32" || process.env.WSL_DISTRO_NAME) {
            // not on plain Windows
            logger_1.default.error(`Could not init sd_notify: ${error.message}`);
            // biome-ignore lint/style/noNonNullAssertion: always Error
            logger_1.default.debug(error.stack);
        }
        else {
            // this should not happen
            logger_1.default.warning(`NOTIFY_SOCKET env is set: ${error.message}`);
        }
        return;
    }
    const sendToSystemd = (msg) => {
        const buffer = Buffer.from(msg);
        // biome-ignore lint/style/noNonNullAssertion: valid from start of function
        socket.send(buffer, 0, buffer.byteLength, process.env.NOTIFY_SOCKET, (err) => {
            if (err) {
                logger_1.default.warning(`Failed to send "${msg}" to systemd: ${err.message}`);
            }
        });
    };
    const notifyStopping = () => sendToSystemd("STOPPING=1");
    sendToSystemd("READY=1");
    const wdUSec = process.env.WATCHDOG_USEC !== undefined ? Math.max(0, Number.parseInt(process.env.WATCHDOG_USEC, 10)) : -1;
    if (wdUSec > 0) {
        // Convert us to ms, send twice as frequently as the timeout
        const watchdogInterval = setInterval(() => sendToSystemd("WATCHDOG=1"), wdUSec / 1000 / 2);
        return {
            notifyStopping,
            stop: () => clearInterval(watchdogInterval),
        };
    }
    if (wdUSec !== -1) {
        logger_1.default.warning(`WATCHDOG_USEC invalid: "${process.env.WATCHDOG_USEC}", parsed to "${wdUSec}"`);
    }
    return {
        notifyStopping,
        stop: () => { },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Qtbm90aWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWwvc2Qtbm90aWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBVUEsb0NBMERDO0FBcEVELHFDQUFpQztBQUdqQyxzREFBOEI7QUFFOUI7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxZQUFZO0lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdCLE9BQU87SUFDWCxDQUFDO0lBRUQsSUFBSSxNQUFtQyxDQUFDO0lBRXhDLElBQUksQ0FBQztRQUNELE1BQU0sRUFBQyxZQUFZLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxJQUFBLGtCQUFRLEdBQUUsS0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4RCx1QkFBdUI7WUFDdkIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsNkJBQThCLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLDJEQUEyRDtZQUMzRCxnQkFBTSxDQUFDLEtBQUssQ0FBRSxLQUFlLENBQUMsS0FBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQzthQUFNLENBQUM7WUFDSix5QkFBeUI7WUFDekIsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsNkJBQThCLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxPQUFPO0lBQ1gsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBVyxFQUFRLEVBQUU7UUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoQywyRUFBMkU7UUFDM0UsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFjLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUMxRSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNOLGdCQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLGlCQUFpQixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN6RSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBRyxHQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFL0QsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXpCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxSCxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNiLDREQUE0RDtRQUM1RCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUzRixPQUFPO1lBQ0gsY0FBYztZQUNkLElBQUksRUFBRSxHQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7U0FDcEQsQ0FBQztJQUNOLENBQUM7SUFFRCxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hCLGdCQUFNLENBQUMsT0FBTyxDQUFDLDJCQUEyQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsaUJBQWlCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVELE9BQU87UUFDSCxjQUFjO1FBQ2QsSUFBSSxFQUFFLEdBQVMsRUFBRSxHQUFFLENBQUM7S0FDdkIsQ0FBQztBQUNOLENBQUMifQ==