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
exports.onboard = onboard;
const node_fs_1 = require("node:fs");
const node_http_1 = require("node:http");
const node_querystring_1 = require("node:querystring");
const adapterDiscovery_1 = require("zigbee-herdsman/dist/adapter/adapterDiscovery");
const data_1 = __importDefault(require("./data"));
const settings = __importStar(require("./settings"));
const yaml_1 = require("./yaml");
function escapeHtml(s) {
    return s.replace(/[^0-9A-Za-z \-_.]/g, (c) => `&#${c.charCodeAt(0)};`);
}
function generateHtmlDone(frontendUrl) {
    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Zigbee2MQTT Onboarding</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css">
</head>
<body>
    <main>
        <h1>Zigbee2MQTT Onboarding</h1>
        <p>Settings saved.</p>
        <p>Zigbee2MQTT is now starting...</p>
        <small>${frontendUrl ? `Redirecting to Zigbee2MQTT frontend at <a href="${frontendUrl}">${frontendUrl}</a> in 30 seconds.` : "You can close this page."}</small>
    </main>
    ${frontendUrl ? `<script>setTimeout(() => { window.location.replace("${frontendUrl}"); }, 30000);</script>` : ""}
</body>
</html>
`;
}
function generateHtmlForm(currentSettings, devices) {
    let devicesSelect = "";
    if (devices.length > 0) {
        devicesSelect += '<select id="found_device" onchange="setFoundDevice(this)">';
        devicesSelect += '<option value="">Select a device</option>';
        for (const device of devices) {
            // just in case name has commas, remove them to not mess with `split` logic
            const deviceStr = `${device.name.replaceAll(",", "")}, ${device.path}, ${device.adapter ?? "unknown"}`;
            devicesSelect += `<option value="${deviceStr}">${deviceStr}</option>`;
        }
        devicesSelect += "</select>";
        devicesSelect += "<small>Optionally allows to configure coordinator port and type (if known) automatically.</small>";
    }
    else {
        devicesSelect = "<small>No device found</small>";
    }
    let generateCheckbox = "";
    if (Array.isArray(currentSettings.advanced?.network_key) ||
        typeof currentSettings.advanced?.pan_id === "number" ||
        Array.isArray(currentSettings.advanced?.ext_pan_id)) {
        generateCheckbox = `
<label for="generate_network">
    <input
        type="checkbox"
        id="generate_network"
        onclick="setGenerate(this)"
        ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_NETWORK_KEY || process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_PAN_ID || process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_EXT_PAN_ID ? "disabled" : ""}>
    Generate network?
</label>
`;
    }
    /* v8 ignore start */
    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Zigbee2MQTT Onboarding</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css">
</head>
<body>
    <main>
        <h1>Zigbee2MQTT Onboarding</h1>
        <p>Set the base configuration to start Zigbee2MQTT.</p>
        <p>Optional fields will either be ignored or fallback to defaults if not set (see appropriate documentation page for more details).</p>
        <p>If a field is disabled, it means <a href="https://www.zigbee2mqtt.io/guide/configuration/#environment-variables" target="_blank">environment variables</a> are being used to override specific values (for example, through the Home Assistant add-on configuration page).</p>
        <hr>
        <form method="post">
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL || process.env.ZIGBEE2MQTT_CONFIG_SERIAL_PORT || process.env.ZIGBEE2MQTT_CONFIG_SERIAL_ADAPTER ? "disabled" : ""}>
                <label for="found_device">Found Devices</label>
                ${devicesSelect}
            </fieldset>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL ? "disabled" : ""}>
                <label for="serial_port">Coordinator/Adapter Port/Path</label>
                <input
                    type="text"
                    id="serial_port"
                    name="serial_port"
                    value="${currentSettings.serial?.port ?? ""}"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL_PORT ? "disabled" : ""}>
                <label for="serial_adapter">Coordinator/Adapter Type/Stack/Driver</label>
                <select id="serial_adapter" name="serial_adapter" required ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL_ADAPTER ? "disabled" : ""}>
                    <option value="zstack" ${currentSettings.serial?.adapter === "zstack" ? "selected" : ""}>zstack</option>
                    <option value="ember" ${currentSettings.serial?.adapter === "ember" ? "selected" : ""}>ember</option>
                    <option value="deconz" ${currentSettings.serial?.adapter === "deconz" ? "selected" : ""}>deconz</option>
                    <option value="zigate" ${currentSettings.serial?.adapter === "zigate" ? "selected" : ""}>zigate</option>
                    <option value="zboss" ${currentSettings.serial?.adapter === "zboss" ? "selected" : ""}>zboss</option>
                </select>
                <label for="serial_baudrate">Coordinator/Adapter Baudrate</label>
                <select id="serial_baudrate" name="serial_baudrate" ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL_BAUDRATE ? "disabled" : ""}>
                    <option value="38400" ${currentSettings.serial?.baudrate === 38400 ? "selected" : ""}>38400</option>
                    <option value="57600" ${currentSettings.serial?.baudrate === 57600 ? "selected" : ""}>57600</option>
                    <option value="115200" ${!currentSettings.serial?.baudrate || currentSettings.serial?.baudrate === 115200 ? "selected" : ""}>115200</option>
                    <option value="230400" ${currentSettings.serial?.baudrate === 230400 ? "selected" : ""}>230400</option>
                    <option value="460800" ${currentSettings.serial?.baudrate === 460800 ? "selected" : ""}>460800</option>
                    <option value="921600" ${currentSettings.serial?.baudrate === 921600 ? "selected" : ""}>921600</option>
                </select>
                <small>Can be ignored for networked coordinators (TCP).</small>
                <label for="serial_rtscts">Coordinator/Adapter Hardware Flow Control ("rtscts: true")</label>
                <input
                    type="checkbox"
                    id="serial_rtscts"
                    name="serial_rtscts"
                    ${currentSettings.serial?.rtscts ? "checked" : ""}
                    ${process.env.ZIGBEE2MQTT_CONFIG_SERIAL_RTSCTS ? "disabled" : ""}>
                    style="margin-bottom: 1rem;">
                <small>Can be ignored for networked coordinators (TCP).</small>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/adapter-settings.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/adapter-settings.html</a>
            </small>
            <hr>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED ? "disabled" : ""}>
                <label for="closest_wifi_channel">Closest WiFi Channel</label>
                <input
                    type="number"
                    min="0"
                    max="14"
                    id="closest_wifi_channel"
                    value="0"
                    onclick="setBestZigbeeChannel(this)"
                    ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_CHANNEL ? "disabled" : ""}>
                <small>Optionally set to your closest WiFi channel to pick the best value for "Network channel" below.</small>
                <label for="network_channel">Network Channel</label>
                <input
                    type="number"
                    min="11"
                    max="26"
                    id="network_channel"
                    name="network_channel"
                    value="${currentSettings.advanced?.channel ?? "25"}"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_CHANNEL ? "disabled" : ""}>
            </fieldset>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED ? "disabled" : ""}>
                ${generateCheckbox}
                <label for="network_key">Network Key</label>
                <input
                    type="text"
                    id="network_key"
                    name="network_key"
                    value="${currentSettings.advanced?.network_key ?? "GENERATE"}"
                    pattern="^([0-9]+(,[0-9]+){15})|GENERATE$"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_NETWORK_KEY ? "disabled" : ""}>
                <label for="network_pan_id">Network PAN ID</label>
                <input
                    type="text"
                    id="network_pan_id"
                    name="network_pan_id"
                    value="${currentSettings.advanced?.pan_id ?? "GENERATE"}"
                    pattern="^([0-9]{1,5})|GENERATE$"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_PAN_ID ? "disabled" : ""}>
                <label for="network_ext_pan_id">Network Extended PAN ID</label>
                <input
                    type="text"
                    id="network_ext_pan_id"
                    name="network_ext_pan_id"
                    value="${currentSettings.advanced?.ext_pan_id ?? "GENERATE"}"
                    pattern="^([0-9]+(,[0-9]+){7})|GENERATE$"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_EXT_PAN_ID ? "disabled" : ""}>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/zigbee-network.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/zigbee-network.html</a>
            </small>
            <hr>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_MQTT ? "disabled" : ""}>
                <label for="mqtt_base_topic">MQTT Base Topic</label>
                <input
                    type="text"
                    id="mqtt_base_topic"
                    name="mqtt_base_topic"
                    value="${currentSettings.mqtt?.base_topic ?? "zigbee2mqtt"}"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_MQTT_BASE_TOPIC ? "disabled" : ""}>
                <label for="mqtt_server">MQTT Server</label>
                <input
                    type="text"
                    id="mqtt_server"
                    name="mqtt_server"
                    value="${currentSettings.mqtt?.server ?? "mqtt://localhost:1883"}"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_MQTT_SERVER ? "disabled" : ""}>
                <label for="mqtt_user">MQTT User</label>
                <input
                    type="text"
                    id="mqtt_user"
                    name="mqtt_user"
                    value="${currentSettings.mqtt?.user ?? ""}"
                    ${process.env.ZIGBEE2MQTT_CONFIG_MQTT_USER ? "disabled" : ""}>
                <small>Optional. Set only if using authentication.</small>
                <label for="mqtt_password">MQTT Password</label>
                <input
                    type="password"
                    id="mqtt_password"
                    name="mqtt_password"
                    value="${currentSettings.mqtt?.password ?? ""}"
                    ${process.env.ZIGBEE2MQTT_CONFIG_MQTT_PASSWORD ? "disabled" : ""}>
                <small>Optional. Set only if using authentication.</small>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/mqtt.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/mqtt.html</a>
            </small>
            <hr>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_FRONTEND ? "disabled" : ""}>
                <label for="frontend_enabled">
                    <input
                        type="checkbox"
                        id="frontend_enabled"
                        name="frontend_enabled"
                        ${currentSettings.frontend?.enabled ? "checked" : ""}
                        ${process.env.ZIGBEE2MQTT_CONFIG_FRONTEND_ENABLED ? "disabled" : ""}>
                    Frontend enabled?
                </label>
                <label for="frontend_port">Frontend Port</label>
                <input
                    type="number"
                    min="0"
                    max="65535"
                    id="frontend_port"
                    name="frontend_port"
                    value="${currentSettings.frontend?.port ?? "8080"}"
                    required
                    ${process.env.ZIGBEE2MQTT_CONFIG_FRONTEND_PORT ? "disabled" : ""}>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/frontend.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/frontend.html</a>
            </small>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_HOMEASSISTANT ? "disabled" : ""}>
                <label for="homeassistant_enabled">
                    <input
                        type="checkbox"
                        id="homeassistant_enabled"
                        name="homeassistant_enabled"
                        ${currentSettings.homeassistant?.enabled ? "checked" : ""}
                        ${process.env.ZIGBEE2MQTT_CONFIG_HOMEASSISTANT_ENABLED ? "disabled" : ""}>
                    Home Assistant enabled?
                </label>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/homeassistant.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/homeassistant.html</a>
            </small>
            <hr>
            <fieldset ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED ? "disabled" : ""}>
                <label for="log_level">Log Level</label>
                <select id="log_level" name="log_level" ${process.env.ZIGBEE2MQTT_CONFIG_ADVANCED_LOG_LEVEL ? "disabled" : ""}>
                    <option value="error" ${currentSettings.advanced?.log_level === "error" ? "selected" : ""}>error</option>
                    <option value="warning" ${currentSettings.advanced?.log_level === "warning" ? "selected" : ""}>warning</option>
                    <option value="info" ${!currentSettings.advanced?.log_level || currentSettings.advanced?.log_level === "info" ? "selected" : ""}>info</option>
                    <option value="debug" ${currentSettings.advanced?.log_level === "debug" ? "selected" : ""}>debug</option>
                </select>
            </fieldset>
            <small>
                <a href="https://www.zigbee2mqtt.io/guide/configuration/logging.html" target="_blank">https://www.zigbee2mqtt.io/guide/configuration/logging.html</a>
            </small>
            <hr>
            <input type="submit" value="Submit">
        </form>
    </main>
    <script>
        function setFoundDevice(e) {
            if (!e.value) {
                return;
            }

            const [, path, adapter] = e.value.split(", ");
            const serialPortEl = document.querySelector("#serial_port");
            serialPortEl.value = path;
            const serialAdapterEl = document.querySelector("#serial_adapter");

            if (['zstack', 'ember', 'deconz', 'zigate', 'zboss'].includes(adapter)) {
                serialAdapterEl.value = adapter;
            } else {
                serialAdapterEl.value = '';
            }
        }

        function setBestZigbeeChannel(e) {
            const wifiChannel = parseInt(e.value, 10);
            const networkChannelEl = document.querySelector("#network_channel");

            if (wifiChannel >= 11) {
                // WiFi 11-14
                networkChannelEl.value = 15;
            } else if (wifiChannel >= 6) {
                // WiFi 6-10
                networkChannelEl.value = 11;
            } else {
                // WiFi 1-5
                networkChannelEl.value = 25;
            }
        }

        function setGenerate(e) {
            document.querySelector("#network_key").value = e.checked ? "GENERATE" : "${currentSettings.advanced?.network_key ?? "GENERATE"}";
            document.querySelector("#network_pan_id").value = e.checked ? "GENERATE" : "${currentSettings.advanced?.pan_id ?? "GENERATE"}";
            document.querySelector("#network_ext_pan_id").value = e.checked ? "GENERATE" : "${currentSettings.advanced?.ext_pan_id ?? "GENERATE"}";
        }
    </script>
</body>
</html>
`;
    /* v8 ignore stop */
}
function generateHtmlError(errors) {
    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Zigbee2MQTT Onboarding</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css">
</head>
<body>
    <main>
        <h1>Zigbee2MQTT configuration is not valid</h1>
        <p style="color: #F00;">Found the following errors:</p>
        ${errors}
        <hr>
        <p>If you don't know how to solve this, read <a href="https://www.zigbee2mqtt.io/guide/configuration" target="_blank">https://www.zigbee2mqtt.io/guide/configuration</a></p>
        <form method="post" action="/">
            <input type="submit" value="Close">
        </form>
    </main>
</body>
</html>
`;
}
function getServerUrl() {
    return new URL(process.env.Z2M_ONBOARD_URL ?? "http://0.0.0.0:8080");
}
async function startOnboardingServer() {
    const currentSettings = settings.get();
    const serverUrl = getServerUrl();
    let server;
    let failed = false;
    const success = await new Promise((resolve) => {
        server = (0, node_http_1.createServer)(async (req, res) => {
            if (req.method === "POST") {
                if (failed) {
                    res.end(() => {
                        resolve(false);
                    });
                }
                else {
                    let body = "";
                    req.on("data", (chunk) => {
                        body += chunk;
                    });
                    req.on("end", () => {
                        const result = (0, node_querystring_1.parse)(body);
                        const frontendEnabled = result.frontend_enabled === "on";
                        const updatedSettings = {
                            mqtt: {
                                base_topic: result.mqtt_base_topic,
                                server: result.mqtt_server,
                                user: result.mqtt_user || undefined, // empty string => removed
                                password: result.mqtt_password || undefined, // empty string => removed
                            },
                            serial: {
                                port: result.serial_port,
                                adapter: result.serial_adapter,
                                baudrate: result.serial_baudrate ? Number.parseInt(result.serial_baudrate, 10) : undefined,
                                rtscts: result.serial_rtscts === "on",
                            },
                            advanced: {
                                log_level: result.log_level,
                                channel: result.network_channel ? Number.parseInt(result.network_channel, 10) : undefined,
                                network_key: result.network_key
                                    ? result.network_key === "GENERATE"
                                        ? result.network_key
                                        : result.network_key.split(",").map((v) => Number.parseInt(v, 10))
                                    : undefined,
                                pan_id: result.network_pan_id
                                    ? result.network_pan_id === "GENERATE"
                                        ? result.network_pan_id
                                        : Number.parseInt(result.network_pan_id, 10)
                                    : undefined,
                                ext_pan_id: result.network_ext_pan_id
                                    ? result.network_ext_pan_id === "GENERATE"
                                        ? result.network_ext_pan_id
                                        : result.network_ext_pan_id.split(",").map((v) => Number.parseInt(v, 10))
                                    : undefined,
                            },
                            frontend: {
                                enabled: frontendEnabled,
                                port: result.frontend_port ? Number.parseInt(result.frontend_port, 10) : undefined,
                            },
                            homeassistant: {
                                enabled: result.homeassistant_enabled === "on",
                            },
                        };
                        try {
                            settings.apply(updatedSettings);
                            // to redirect, make sure frontend "will be" enabled, and host isn't socket
                            const redirect = !process.env.Z2M_ONBOARD_NO_REDIRECT &&
                                frontendEnabled &&
                                (!currentSettings.frontend?.host || !currentSettings.frontend.host.startsWith("/"));
                            const protocol = currentSettings.frontend?.ssl_cert && currentSettings.frontend.ssl_key ? "https" : "http";
                            res.setHeader("Content-Type", "text/html");
                            res.writeHead(200);
                            res.end(generateHtmlDone(redirect
                                ? /* v8 ignore next */ `${protocol}://${currentSettings.frontend?.host ?? "localhost"}:${currentSettings.frontend?.port ?? "8080"}${currentSettings.frontend?.base_url ?? "/"}`
                                : undefined), () => {
                                resolve(true);
                            });
                        }
                        catch (error) {
                            console.error(`Failed to apply configuration: ${error.message}`);
                            failed = true;
                            if (process.env.Z2M_ONBOARD_NO_FAILURE_PAGE) {
                                res.end(() => {
                                    resolve(false);
                                });
                            }
                            else {
                                res.setHeader("Content-Type", "text/html");
                                res.writeHead(406);
                                res.end(generateHtmlError(`<p>${escapeHtml(error.message)}</p>`));
                            }
                        }
                    });
                }
            }
            else {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(generateHtmlForm(currentSettings, await (0, adapterDiscovery_1.findAllDevices)()));
            }
        });
        server.listen(Number.parseInt(serverUrl.port), serverUrl.hostname, () => {
            console.log(`Onboarding page is available at ${serverUrl.href}`);
        });
    });
    await new Promise((resolve) => server?.close(resolve));
    return success;
}
async function startFailureServer(errors) {
    const serverUrl = getServerUrl();
    let server;
    await new Promise((resolve) => {
        server = (0, node_http_1.createServer)((req, res) => {
            if (req.method === "POST") {
                res.end(() => {
                    resolve();
                });
            }
            else {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(406);
                res.end(generateHtmlError(errors));
            }
        });
        server.listen(Number.parseInt(serverUrl.port), serverUrl.hostname, () => {
            console.error(`Failure page is available at ${serverUrl.href}`);
        });
    });
    await new Promise((resolve) => server?.close(resolve));
}
async function onSettingsErrors(errors) {
    let pErrors = "";
    console.error("\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("            READ THIS CAREFULLY\n");
    console.error("Refusing to start because configuration is not valid, found the following errors:");
    for (const error of errors) {
        console.error(`- ${error}`);
        pErrors += `<p>- ${escapeHtml(error)}</p>`;
    }
    console.error("\nIf you don't know how to solve this, read https://www.zigbee2mqtt.io/guide/configuration");
    console.error("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n");
    if (!process.env.Z2M_ONBOARD_NO_SERVER && !process.env.Z2M_ONBOARD_NO_FAILURE_PAGE) {
        await startFailureServer(pErrors);
    }
}
async function onboard() {
    if (!(0, node_fs_1.existsSync)(data_1.default.getPath())) {
        (0, node_fs_1.mkdirSync)(data_1.default.getPath(), { recursive: true });
    }
    const confExists = (0, node_fs_1.existsSync)(data_1.default.joinPath("configuration.yaml"));
    if (confExists) {
        // initial caching, ensure file is valid yaml first
        try {
            settings.getPersistedSettings();
        }
        catch (error) {
            await onSettingsErrors(error instanceof yaml_1.YAMLFileException
                ? [`Your configuration file: '${error.file}' is invalid (use https://jsonformatter.org/yaml-validator to find and fix the issue)`]
                : [`${error}`]);
            return false;
        }
        // migrate first
        const { migrateIfNecessary } = await import("./settingsMigration.js");
        migrateIfNecessary();
        // make sure existing settings are valid before applying envs
        const errors = settings.validateNonRequired();
        if (errors.length > 0) {
            await onSettingsErrors(errors);
            return false;
        }
        // trigger initial writing of `ZIGBEE2MQTT_CONFIG_*` ENVs
        settings.write();
    }
    else {
        settings.writeMinimalDefaults();
    }
    // use `configuration.yaml` file to detect "brand new install"
    // env allows to re-run onboard even with existing install
    if (!process.env.Z2M_ONBOARD_NO_SERVER && (process.env.Z2M_ONBOARD_FORCE_RUN || !confExists || settings.get().onboarding)) {
        settings.setOnboarding(true);
        const success = await startOnboardingServer();
        if (!success) {
            return false;
        }
    }
    settings.reRead();
    const errors = settings.validate();
    if (errors.length > 0) {
        await onSettingsErrors(errors);
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25ib2FyZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlsL29uYm9hcmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFraUJBLDBCQWdFQztBQWxtQkQscUNBQThDO0FBQzlDLHlDQUF1QztBQUN2Qyx1REFBdUM7QUFDdkMsb0ZBQTZFO0FBQzdFLGtEQUEwQjtBQUMxQixxREFBdUM7QUFDdkMsaUNBQXlDO0FBcUJ6QyxTQUFTLFVBQVUsQ0FBQyxDQUFTO0lBQ3pCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxXQUErQjtJQUNyRCxPQUFPOzs7Ozs7Ozs7Ozs7OztpQkFjTSxXQUFXLENBQUMsQ0FBQyxDQUFDLG1EQUFtRCxXQUFXLEtBQUssV0FBVyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsMEJBQTBCOztNQUV6SixXQUFXLENBQUMsQ0FBQyxDQUFDLHVEQUF1RCxXQUFXLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Q0FHbkgsQ0FBQztBQUNGLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLGVBQTJDLEVBQUUsT0FBbUQ7SUFDdEgsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXZCLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNyQixhQUFhLElBQUksNERBQTRELENBQUM7UUFDOUUsYUFBYSxJQUFJLDJDQUEyQyxDQUFDO1FBRTdELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7WUFDM0IsMkVBQTJFO1lBQzNFLE1BQU0sU0FBUyxHQUFHLEdBQUcsTUFBTSxDQUFDLElB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