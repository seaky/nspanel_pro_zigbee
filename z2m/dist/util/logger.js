"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const rimraf_1 = require("rimraf");
const winston_1 = __importDefault(require("winston"));
const settings = __importStar(require("./settings"));
const NAMESPACE_SEPARATOR = ":";
class Logger {
    // @ts-expect-error initalized in `init`
    level;
    // @ts-expect-error initalized in `init`
    output;
    // @ts-expect-error initalized in `init`
    directory;
    // @ts-expect-error initalized in `init`
    logger;
    // @ts-expect-error initalized in `init`
    fileTransport;
    debugNamespaceIgnoreRegex;
    // @ts-expect-error initalized in `init`
    namespacedLevels;
    // @ts-expect-error initalized in `init`
    cachedNamespacedLevels;
    init() {
        // What transports to enable
        this.output = settings.get().advanced.log_output;
        // Directory to log to
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", ".").replace(/:/g, "-");
        this.directory = settings.get().advanced.log_directory.replace("%TIMESTAMP%", timestamp);
        const logFilename = settings.get().advanced.log_file.replace("%TIMESTAMP%", timestamp);
        this.level = settings.get().advanced.log_level;
        this.namespacedLevels = settings.get().advanced.log_namespaced_levels;
        this.cachedNamespacedLevels = Object.assign({}, this.namespacedLevels);
        (0, node_assert_1.default)(settings.LOG_LEVELS.includes(this.level), `'${this.level}' is not valid log_level, use one of '${settings.LOG_LEVELS.join(", ")}'`);
        this.logger = winston_1.default.createLogger({
            level: "debug",
            format: winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.timestamp({ format: settings.get().advanced.timestamp_format })),
            levels: winston_1.default.config.syslog.levels,
        });
        const consoleSilenced = !this.output.includes("console");
        // Print to user what logging is active
        let logging = `Logging to console${consoleSilenced ? " (silenced)" : ""}`;
        // Setup default console logger
        this.logger.add(new winston_1.default.transports.Console({
            silent: consoleSilenced,
            format: settings.get().advanced.log_console_json
                ? winston_1.default.format.json()
                : winston_1.default.format.combine(
                // winston.config.syslog.levels sets 'warning' as 'red'
                winston_1.default.format.colorize({ colors: { debug: "blue", info: "green", warning: "yellow", error: "red" } }), winston_1.default.format.printf((info) => {
                    return `[${info.timestamp}] ${info.level}: \t${info.message}`;
                })),
        }));
        if (this.output.includes("file")) {
            logging += `, file (filename: ${logFilename})`;
            // Make sure that log directory exists when not logging to stdout only
            node_fs_1.default.mkdirSync(this.directory, { recursive: true });
            if (settings.get().advanced.log_symlink_current) {
                const current = settings.get().advanced.log_directory.replace("%TIMESTAMP%", "current");
                const actual = `./${timestamp}`;
                /* v8 ignore start */
                if (node_fs_1.default.existsSync(current)) {
                    node_fs_1.default.unlinkSync(current);
                }
                /* v8 ignore stop */
                node_fs_1.default.symlinkSync(actual, current);
            }
            // Add file logger when enabled
            // NOTE: the initiation of the logger even when not added as transport tries to create the logging directory
            const transportFileOptions = {
                filename: node_path_1.default.join(this.directory, logFilename),
                format: winston_1.default.format.printf((info) => {
                    return `[${info.timestamp}] ${info.level}: \t${info.message}`;
                }),
            };
            if (settings.get().advanced.log_rotation) {
                transportFileOptions.tailable = true;
                transportFileOptions.maxFiles = 3; // Keep last 3 files
                transportFileOptions.maxsize = 10000000; // 10MB
            }
            this.fileTransport = new winston_1.default.transports.File(transportFileOptions);
            this.logger.add(this.fileTransport);
            this.cleanup();
        }
        /* v8 ignore start */
        if (this.output.includes("syslog")) {
            logging += ", syslog";
            require("winston-syslog").Syslog;
            const options = {
                app_name: "Zigbee2MQTT",
                format: winston_1.default.format.printf((info) => info.message),
                ...settings.get().advanced.log_syslog,
            };
            if (options.type !== undefined) {
                options.type = options.type.toString();
            }
            // @ts-expect-error untyped transport
            this.logger.add(new winston_1.default.transports.Syslog(options));
        }
        /* v8 ignore stop */
        this.setDebugNamespaceIgnore(settings.get().advanced.log_debug_namespace_ignore);
        this.info(logging);
    }
    get winston() {
        return this.logger;
    }
    addTransport(transport) {
        this.logger.add(transport);
    }
    removeTransport(transport) {
        this.logger.remove(transport);
    }
    getDebugNamespaceIgnore() {
        return (this.debugNamespaceIgnoreRegex
            ?.toString()
            .slice(1, -1) /* remove slashes */ ?? "");
    }
    setDebugNamespaceIgnore(value) {
        this.debugNamespaceIgnoreRegex = value !== "" ? new RegExp(value) : undefined;
    }
    getLevel() {
        return this.level;
    }
    setLevel(level) {
        this.level = level;
        this.resetCachedNamespacedLevels();
    }
    getNamespacedLevels() {
        return this.namespacedLevels;
    }
    setNamespacedLevels(nsLevels) {
        this.namespacedLevels = nsLevels;
        this.resetCachedNamespacedLevels();
    }
    resetCachedNamespacedLevels() {
        this.cachedNamespacedLevels = Object.assign({}, this.namespacedLevels);
    }
    cacheNamespacedLevel(namespace) {
        let cached = namespace;
        while (this.cachedNamespacedLevels[namespace] === undefined) {
            const sep = cached.lastIndexOf(NAMESPACE_SEPARATOR);
            if (sep === -1) {
                this.cachedNamespacedLevels[namespace] = this.level;
                return this.level;
            }
            cached = cached.slice(0, sep);
            this.cachedNamespacedLevels[namespace] = this.cachedNamespacedLevels[cached];
        }
        return this.cachedNamespacedLevels[namespace];
    }
    log(level, messageOrLambda, namespace) {
        const nsLevel = this.cacheNamespacedLevel(namespace);
        if (settings.LOG_LEVELS.indexOf(level) <= settings.LOG_LEVELS.indexOf(nsLevel)) {
            const message = messageOrLambda instanceof Function ? messageOrLambda() : messageOrLambda;
            this.logger.log(level, `${namespace}: ${message}`);
        }
    }
    error(messageOrLambda, namespace = "z2m") {
        this.log("error", messageOrLambda, namespace);
    }
    warning(messageOrLambda, namespace = "z2m") {
        this.log("warning", messageOrLambda, namespace);
    }
    info(messageOrLambda, namespace = "z2m") {
        this.log("info", messageOrLambda, namespace);
    }
    debug(messageOrLambda, namespace = "z2m") {
        if (this.debugNamespaceIgnoreRegex?.test(namespace)) {
            return;
        }
        this.log("debug", messageOrLambda, namespace);
    }
    // Cleanup any old log directory.
    cleanup() {
        if (settings.get().advanced.log_directory.includes("%TIMESTAMP%")) {
            const rootDirectory = node_path_1.default.join(this.directory, "..");
            let directories = node_fs_1.default.readdirSync(rootDirectory).map((d) => {
                d = node_path_1.default.join(rootDirectory, d);
                return { path: d, birth: node_fs_1.default.statSync(d).mtime };
            });
            directories.sort((a, b) => b.birth - a.birth);
            directories = directories.slice(settings.get().advanced.log_directories_to_keep, directories.length);
            for (const dir of directories) {
                this.debug(`Removing old log directory '${dir.path}'`);
                (0, rimraf_1.rimrafSync)(dir.path);
            }
        }
    }
    // Workaround for https://github.com/winstonjs/winston/issues/1629.
    // https://github.com/Koenkk/zigbee2mqtt/pull/10905
    /* v8 ignore start */
    async end() {
        // Only flush the file transport, don't end logger itself as log() might still be called
        // causing a UnhandledPromiseRejection (`Error: write after end`). Flushing the file transport
        // ensures the log files are written before stopping.
        if (this.fileTransport) {
            await new Promise((resolve) => {
                // @ts-expect-error workaround
                if (this.fileTransport._dest) {
                    // @ts-expect-error workaround
                    this.fileTransport._dest.on("finish", resolve);
                }
                else {
                    // @ts-expect-error workaround
                    this.fileTransport.on("open", () => this.fileTransport._dest.on("finish", resolve));
                }
                this.fileTransport.end();
            });
        }
    }
}
exports.default = new Logger();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWwvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOERBQWlDO0FBQ2pDLHNEQUF5QjtBQUN6QiwwREFBNkI7QUFFN0IsbUNBQWtDO0FBQ2xDLHNEQUE4QjtBQUM5QixxREFBdUM7QUFFdkMsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUM7QUFFaEMsTUFBTSxNQUFNO0lBQ1Isd0NBQXdDO0lBQ2hDLEtBQUssQ0FBb0I7SUFDakMsd0NBQXdDO0lBQ2hDLE1BQU0sQ0FBVztJQUN6Qix3Q0FBd0M7SUFDaEMsU0FBUyxDQUFTO0lBQzFCLHdDQUF3QztJQUNoQyxNQUFNLENBQWlCO0lBQy9CLHdDQUF3QztJQUNoQyxhQUFhLENBQTJDO0lBQ3hELHlCQUF5QixDQUFVO0lBQzNDLHdDQUF3QztJQUNoQyxnQkFBZ0IsQ0FBb0M7SUFDNUQsd0NBQXdDO0lBQ2hDLHNCQUFzQixDQUFvQztJQUUzRCxJQUFJO1FBQ1AsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDakQsc0JBQXNCO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sV0FBVyxHQUFHLFFB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