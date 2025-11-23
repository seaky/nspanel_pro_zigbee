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
exports.migrateIfNecessary = migrateIfNecessary;
const node_fs_1 = require("node:fs");
const data_1 = __importDefault(require("./data"));
const settings = __importStar(require("./settings"));
const utils_1 = __importDefault(require("./utils"));
const SUPPORTED_VERSIONS = [undefined, 2, 3, settings.CURRENT_VERSION];
function backupSettings(version) {
    const filePath = data_1.default.joinPath("configuration.yaml");
    (0, node_fs_1.copyFileSync)(filePath, filePath.replace(".yaml", `_backup_v${version}.yaml`));
}
/**
 * Set the given path in given settings to given value. If requested, create path.
 *
 * @param currentSettings
 * @param path
 * @param value
 * @param createPathIfNotExist
 * @returns Returns true if value was set, false if not.
 */
// biome-ignore lint/suspicious/noExplicitAny: auto-parsing
function setValue(currentSettings, path, value, createPathIfNotExist = false) {
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (i === path.length - 1) {
            currentSettings[key] = value;
        }
        else {
            if (!currentSettings[key]) {
                if (createPathIfNotExist) {
                    currentSettings[key] = {};
                    /* v8 ignore start */
                }
                else {
                    // invalid path
                    // ignored in test since currently call is always guarded by get-validated path, so this is never reached
                    return false;
                }
                /* v8 ignore stop */
            }
            currentSettings = currentSettings[key];
        }
    }
    return true;
}
/**
 * Get the value at the given path in given settings.
 *
 * @param currentSettings
 * @param path
 * @returns
 *   - true if path was valid
 *   - the value at path
 */
// biome-ignore lint/suspicious/noExplicitAny: auto-parsing
function getValue(currentSettings, path) {
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        const value = currentSettings[key];
        if (i === path.length - 1) {
            return [value !== undefined, value];
        }
        if (!value) {
            // invalid path
            break;
        }
        currentSettings = value;
    }
    return [false, undefined];
}
/**
 * Add a value at given path, path is created as needed.
 * @param currentSettings
 * @param addition
 */
function addValue(currentSettings, addition) {
    setValue(currentSettings, addition.path, addition.value, true);
}
/**
 * Remove value at given path, if path is valid.
 * Value is actually set to undefined, which triggers removal when `settings.apply` is called.
 * @param currentSettings
 * @param removal
 * @returns
 */
function removeValue(currentSettings, removal) {
    const [validPath, previousValue] = getValue(currentSettings, removal.path);
    if (validPath && previousValue != null) {
        setValue(currentSettings, removal.path, undefined);
    }
    return [validPath, previousValue];
}
/**
 * Change value at given path, if path is valid, and value matched one of the defined values (if any).
 * @param currentSettings
 * @param change
 * @returns
 */
function changeValue(currentSettings, change) {
    const [validPath, previousValue] = getValue(currentSettings, change.path);
    let changed = false;
    if (validPath && previousValue !== change.newValue) {
        if (!change.previousValueAnyOf || change.previousValueAnyOf.includes(previousValue)) {
            setValue(currentSettings, change.path, change.newValue);
            changed = true;
        }
    }
    return [validPath, previousValue, changed];
}
/**
 * Transfer value at given path, to new path.
 * Given path must be valid.
 * New path must not be valid or new path value must be nullish, otherwise given path is removed only.
 * Value at given path is actually set to undefined, which triggers removal when `settings.apply` is called.
 * New path is created as needed.
 * @param currentSettings
 * @param transfer
 * @returns
 */
function transferValue(currentSettings, transfer) {
    const [validPath, previousValue] = getValue(currentSettings, transfer.path);
    const [destValidPath, destValue] = getValue(currentSettings, transfer.newPath);
    const transfered = validPath && previousValue != null && (!destValidPath || destValue == null || Array.isArray(destValue));
    // no point in set if already undefined
    if (validPath && previousValue != null) {
        setValue(currentSettings, transfer.path, undefined);
    }
    if (transfered) {
        if (Array.isArray(previousValue) && Array.isArray(destValue)) {
            setValue(currentSettings, transfer.newPath, [...previousValue, ...destValue], true);
        }
        else {
            setValue(currentSettings, transfer.newPath, previousValue, true);
        }
    }
    return [validPath, previousValue, transfered];
}
const noteIfWasTrue = (previousValue) => previousValue === true;
const noteIfWasDefined = (previousValue) => previousValue != null;
const noteIfWasNonEmptyArray = (previousValue) => Array.isArray(previousValue) && previousValue.length > 0;
function migrateToTwo(currentSettings, transfers, changes, additions, removals, customHandlers) {
    transfers.push({
        path: ["advanced", "homeassistant_discovery_topic"],
        note: "HA discovery_topic was moved from advanced.homeassistant_discovery_topic to homeassistant.discovery_topic.",
        noteIf: noteIfWasDefined,
        newPath: ["homeassistant", "discovery_topic"],
    }, {
        path: ["advanced", "homeassistant_status_topic"],
        note: "HA status_topic was moved from advanced.homeassistant_status_topic to homeassistant.status_topic.",
        noteIf: noteIfWasDefined,
        newPath: ["homeassistant", "status_topic"],
    }, {
        path: ["advanced", "baudrate"],
        note: "Baudrate was moved from advanced.baudrate to serial.baudrate.",
        noteIf: noteIfWasDefined,
        newPath: ["serial", "baudrate"],
    }, {
        path: ["advanced", "rtscts"],
        note: "RTSCTS was moved from advanced.rtscts to serial.rtscts.",
        noteIf: noteIfWasDefined,
        newPath: ["serial", "rtscts"],
    }, {
        path: ["experimental", "transmit_power"],
        note: "Transmit power was moved from experimental.transmit_power to advanced.transmit_power.",
        noteIf: noteIfWasDefined,
        newPath: ["advanced", "transmit_power"],
    }, {
        path: ["experimental", "output"],
        note: "Output was moved from experimental.output to advanced.output.",
        noteIf: noteIfWasDefined,
        newPath: ["advanced", "output"],
    }, {
        path: ["ban"],
        note: "ban was renamed to passlist.",
        noteIf: noteIfWasDefined,
        newPath: ["blocklist"],
    }, {
        path: ["whitelist"],
        note: "whitelist was renamed to passlist.",
        noteIf: noteIfWasDefined,
        newPath: ["passlist"],
    });
    changes.push({
        path: ["advanced", "log_level"],
        note: `Log level 'warn' has been renamed to 'warning'.`,
        noteIf: (previousValue) => previousValue === "warn",
        previousValueAnyOf: ["warn"],
        newValue: "warning",
    });
    additions.push({
        path: ["version"],
        note: "Migrated settings to version 2",
        value: 2,
    });
    const haLegacyTriggers = {
        path: ["homeassistant", "legacy_triggers"],
        note: "Action and click sensors have been removed (homeassistant.legacy_triggers setting). This means all sensor.*_action and sensor.*_click entities are removed. Use the MQTT device trigger instead.",
        noteIf: noteIfWasTrue,
    };
    const haLegacyEntityAttrs = {
        path: ["homeassistant", "legacy_entity_attributes"],
        note: "Entity attributes (homeassistant.legacy_entity_attributes setting) has been removed. This means that entities discovered by Zigbee2MQTT will no longer have entity attributes (Home Assistant entity attributes are accessed via e.g. states.binary_sensor.my_sensor.attributes).",
        noteIf: noteIfWasTrue,
    };
    const otaIkeaUseTestUrl = {
        path: ["ota", "ikea_ota_use_test_url"],
        note: "Due to the OTA rework, the ota.ikea_ota_use_test_url option has been removed.",
        noteIf: noteIfWasTrue,
    };
    removals.push(haLegacyTriggers, haLegacyEntityAttrs, {
        path: ["advanced", "homeassistant_legacy_triggers"],
        note: haLegacyTriggers.note,
        noteIf: haLegacyTriggers.noteIf,
    }, {
        path: ["advanced", "homeassistant_legacy_entity_attributes"],
        note: haLegacyEntityAttrs.note,
        noteIf: haLegacyEntityAttrs.noteIf,
    }, {
        path: ["permit_join"],
        note: "The permit_join setting has been removed, use the frontend or MQTT to permit joining.",
        noteIf: noteIfWasTrue,
    }, otaIkeaUseTestUrl, {
        path: ["advanced", "ikea_ota_use_test_url"],
        note: otaIkeaUseTestUrl.note,
        noteIf: otaIkeaUseTestUrl.noteIf,
    }, {
        path: ["advanced", "legacy_api"],
        note: "The MQTT legacy API has been removed (advanced.legacy_api setting). See link below for affected topics.",
        noteIf: noteIfWasTrue,
    }, {
        path: ["advanced", "legacy_availability_payload"],
        note: 'Due to the removal of advanced.legacy_availability_payload, zigbee2mqtt/bridge/state will now always be a JSON object ({"state":"online"} or {"state":"offline"})',
        noteIf: noteIfWasTrue,
    }, {
        path: ["advanced", "soft_reset_timeout"],
        note: "Removed deprecated: Soft reset feature (advanced.soft_reset_timeout setting)",
        noteIf: noteIfWasDefined,
    }, {
        path: ["advanced", "report"],
        note: "Removed deprecated: Report feature (advanced.report setting)",
        noteIf: noteIfWasTrue,
    }, {
        path: ["advanced", "availability_timeout"],
        note: "Removed deprecated: advanced.availability_timeout availability settings",
        noteIf: noteIfWasDefined,
    }, {
        path: ["advanced", "availability_blocklist"],
        note: "Removed deprecated: advanced.availability_blocklist availability settings",
        noteIf: noteIfWasNonEmptyArray,
    }, {
        path: ["advanced", "availability_passlist"],
        note: "Removed deprecated: advanced.availability_passlist availability settings",
        noteIf: noteIfWasNonEmptyArray,
    }, {
        path: ["advanced", "availability_blacklist"],
        note: "Removed deprecated: advanced.availability_blacklist availability settings",
        noteIf: noteIfWasNonEmptyArray,
    }, {
        path: ["advanced", "availability_whitelist"],
        note: "Removed deprecated: advanced.availability_whitelist availability settings",
        noteIf: noteIfWasNonEmptyArray,
    }, {
        path: ["device_options", "legacy"],
        note: "Removed everything that was enabled through device_options.legacy. See link below for affected devices.",
        noteIf: noteIfWasTrue,
    }, {
        path: ["experimental"],
        note: "The entire experimental section was removed.",
        noteIf: noteIfWasDefined,
    }, {
        path: ["external_converters"],
        note: "External converters are now automatically loaded from the 'data/external_converters' directory without requiring settings to be set. Make sure your external converters are still needed (might be supported out-of-the-box now), and if so, move them to that directory.",
        noteIf: noteIfWasNonEmptyArray,
    });
    // note only once
    const noteEntityOptionsRetrieveState = "Retrieve state option ((devices|groups).xyz.retrieve_state setting)";
    for (const deviceKey in currentSettings.devices) {
        removals.push({
            path: ["devices", deviceKey, "retrieve_state"],
            note: noteEntityOptionsRetrieveState,
            noteIf: noteIfWasTrue,
        });
    }
    for (const groupKey in currentSettings.groups) {
        removals.push({
            path: ["groups", groupKey, "retrieve_state"],
            note: noteEntityOptionsRetrieveState,
            noteIf: noteIfWasTrue,
        });
        removals.push({
            path: ["groups", groupKey, "devices"],
            note: "Removed configuring group members through configuration.yaml (groups.xyz.devices setting). This will not impact current group members; however, you will no longer be able to add or remove devices from a group through the configuration.yaml.",
            noteIf: noteIfWasDefined,
        });
    }
    customHandlers.push();
}
function migrateToThree(_currentSettings, transfers, changes, additions, removals, customHandlers) {
    transfers.push();
    changes.push({
        path: ["version"],
        note: "Migrated settings to version 3",
        newValue: 3,
    });
    additions.push();
    removals.push();
    const changeToObject = (currentSettings, path) => {
        const [validPath, previousValue] = getValue(currentSettings, path);
        if (validPath) {
            if (typeof previousValue === "boolean") {
                setValue(currentSettings, path, { enabled: previousValue });
            }
            else {
                setValue(currentSettings, path, { enabled: true, ...previousValue });
            }
        }
        return [validPath, previousValue, validPath];
    };
    customHandlers.push({
        note: `Property 'homeassistant' is now always an object.`,
        noteIf: () => true,
        execute: (currentSettings) => changeToObject(currentSettings, ["homeassistant"]),
    }, {
        note: `Property 'frontend' is now always an object.`,
        noteIf: () => true,
        execute: (currentSettings) => changeToObject(currentSettings, ["frontend"]),
    }, {
        note: `Property 'availability' is now always an object.`,
        noteIf: () => true,
        execute: (currentSettings) => changeToObject(currentSettings, ["availability"]),
    });
}
function migrateToFour(_currentSettings, transfers, changes, additions, removals, customHandlers) {
    transfers.push();
    changes.push({
        path: ["version"],
        note: "Migrated settings to version 4",
        newValue: 4,
    });
    additions.push();
    removals.push();
    const saveBase64DeviceIconsAsImage = (currentSettings) => {
        const [validPath, previousValue] = getValue(currentSettings, ["devices"]);
        let changed = false;
        if (validPath) {
            for (const deviceKey in currentSettings.devices) {
                const base64Match = utils_1.default.matchBase64File(currentSettings.devices[deviceKey].icon);
                if (base64Match) {
                    changed = true;
                    currentSettings.devices[deviceKey].icon = utils_1.default.saveBase64DeviceIcon(base64Match);
                }
            }
        }
        return [validPath, previousValue, changed];
    };
    customHandlers.push({
        note: "Device icons are now saved as images.",
        noteIf: () => true,
        execute: (currentSettings) => saveBase64DeviceIconsAsImage(currentSettings),
    });
}
/**
 * Order of execution:
 * - Transfer
 * - Change
 * - Add
 * - Remove
 *
 * Should allow the most flexibility whenever combination of migrations is necessary (e.g. Transfer + Change)
 */
function migrateIfNecessary() {
    const currentSettings = settings.getPersistedSettings();
    if (!SUPPORTED_VERSIONS.includes(currentSettings.version)) {
        throw new Error(`Your configuration.yaml has an unsupported version ${currentSettings.version}, expected one of ${SUPPORTED_VERSIONS.map((v) => String(v)).join(",")}.`);
    }
    /* v8 ignore next */
    const finalVersion = process.env.VITEST_WORKER_ID ? settings.testing.CURRENT_VERSION : settings.CURRENT_VERSION;
    if (currentSettings.version === finalVersion) {
        // when same version as current, nothing to do
        return;
    }
    while (currentSettings.version !== finalVersion) {
        let migrationNotesFileName;
        // don't duplicate outputs
        const migrationNotes = new Set();
        const transfers = [];
        const changes = [];
        const additions = [];
        const removals = [];
        const customHandlers = [];
        backupSettings(currentSettings.version || 1);
        // each version should only bump to the next version so as to gradually migrate if necessary
        if (currentSettings.version == null) {
            // migrating from 1 (`version` did not exist) to 2
            migrationNotesFileName = "migration-1-to-2.log";
            migrateToTwo(currentSettings, transfers, changes, additions, removals, customHandlers);
        }
        else if (currentSettings.version === 2) {
            migrationNotesFileName = "migration-2-to-3.log";
            migrateToThree(currentSettings, transfers, changes, additions, removals, customHandlers);
        }
        else if (currentSettings.version === 3) {
            migrationNotesFileName = "migration-3-to-4.log";
            migrateToFour(currentSettings, transfers, changes, additions, removals, customHandlers);
        }
        for (const transfer of transfers) {
            const [validPath, previousValue, transfered] = transferValue(currentSettings, transfer);
            if (validPath && (!transfer.noteIf || transfer.noteIf(previousValue))) {
                migrationNotes.add(`[${transfered ? "TRANSFER" : "REMOVAL"}] ${transfer.note}`);
            }
        }
        for (const change of changes) {
            const [validPath, previousValue, changed] = changeValue(currentSettings, change);
            if (validPath && changed && (!change.noteIf || change.noteIf(previousValue))) {
                migrationNotes.add(`[CHANGE] ${change.note}`);
            }
        }
        for (const addition of additions) {
            addValue(currentSettings, addition);
            migrationNotes.add(`[ADDITION] ${addition.note}`);
        }
        for (const removal of removals) {
            const [validPath, previousValue] = removeValue(currentSettings, removal);
            if (validPath && (!removal.noteIf || removal.noteIf(previousValue))) {
                migrationNotes.add(`[REMOVAL] ${removal.note}`);
            }
        }
        for (const customHandler of customHandlers) {
            const [validPath, previousValue, changed] = customHandler.execute(currentSettings);
            if (validPath && changed && (!customHandler.noteIf || customHandler.noteIf(previousValue))) {
                migrationNotes.add(`[SPECIAL] ${customHandler.note}`);
            }
        }
        if (migrationNotesFileName && migrationNotes.size > 0) {
            migrationNotes.add("For more details, see https://github.com/Koenkk/zigbee2mqtt/discussions/24198");
            const migrationNotesFilePath = data_1.default.joinPath(migrationNotesFileName);
            (0, node_fs_1.writeFileSync)(migrationNotesFilePath, Array.from(migrationNotes).join("\r\n\r\n"), "utf8");
            console.log(`Migration notes written in ${migrationNotesFilePath}`);
        }
    }
    // don't throw, onboarding will validate at end of process
    settings.apply(currentSettings, false);
    settings.reRead();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NNaWdyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbC9zZXR0aW5nc01pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRlQSxnREFnR0M7QUE1a0JELHFDQUFvRDtBQUVwRCxrREFBMEI7QUFDMUIscURBQXVDO0FBQ3ZDLG9EQUE0QjtBQTJCNUIsTUFBTSxrQkFBa0IsR0FBMEIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFOUYsU0FBUyxjQUFjLENBQUMsT0FBZTtJQUNuQyxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFFckQsSUFBQSxzQkFBWSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFZLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCwyREFBMkQ7QUFDM0QsU0FBUyxRQUFRLENBQUMsZUFBb0IsRUFBRSxJQUFjLEVBQUUsS0FBYyxFQUFFLG9CQUFvQixHQUFHLEtBQUs7SUFDaEcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN4QixlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUM7YUFBTSxDQUFDO1lBQ0osSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFD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