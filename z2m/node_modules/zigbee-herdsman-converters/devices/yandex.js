"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_herdsman_1 = require("zigbee-herdsman");
const exposes_1 = require("../lib/exposes");
const logger_1 = require("../lib/logger");
const modernExtend_1 = require("../lib/modernExtend");
const utils_1 = require("../lib/utils");
const NS = 'zhc:yandex';
const manufacturerCode = 0x140a;
function enumLookupWithSetCommand(args) {
    const { name, lookup, cluster, attribute, zigbeeCommandOptions, setCommand } = args;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const access = exposes_1.access[args.access ?? 'ALL'];
    const mExtend = (0, modernExtend_1.enumLookup)(args);
    const toZigbee = [
        {
            key: [name],
            convertSet: access & exposes_1.access.SET
                ? async (entity, key, value, meta) => {
                    const payloadValue = (0, utils_1.getFromLookup)(value, lookup);
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).command(cluster, setCommand, { value: payloadValue }, zigbeeCommandOptions);
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                    return { state: { [key]: value } };
                }
                : undefined,
            convertGet: access & exposes_1.access.GET
                ? async (entity, key, meta) => {
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                }
                : undefined,
        },
    ];
    return { ...mExtend, toZigbee };
}
function binaryWithSetCommand(args) {
    const { name, valueOn, valueOff, cluster, attribute, zigbeeCommandOptions, setCommand } = args;
    const attributeKey = (0, utils_1.isString)(attribute) ? attribute : attribute.ID;
    const access = exposes_1.access[args.access ?? 'ALL'];
    const mExtend = (0, modernExtend_1.binary)(args);
    const toZigbee = [
        {
            key: [name],
            convertSet: access & exposes_1.access.SET
                ? async (entity, key, value, meta) => {
                    const payloadValue = value === valueOn[0] ? valueOn[1] : valueOff[1];
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).command(cluster, setCommand, { value: payloadValue }, zigbeeCommandOptions);
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                    return { state: { [key]: value } };
                }
                : undefined,
            convertGet: access & exposes_1.access.GET
                ? async (entity, key, meta) => {
                    await (0, modernExtend_1.determineEndpoint)(entity, meta, cluster).read(cluster, [attributeKey], zigbeeCommandOptions);
                }
                : undefined,
        },
    ];
    return { ...mExtend, toZigbee };
}
function YandexCluster() {
    return (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificYandex', {
        ID: 0xfc03,
        manufacturerCode,
        attributes: {
            switchMode: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
            switchType: { ID: 0x0002, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
            powerType: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.ENUM8 },
            ledIndicator: { ID: 0x0005, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
            interlock: { ID: 0x0007, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
        },
        commands: {
            switchMode: {
                ID: 0x01,
                parameters: [{ name: 'value', type: zigbee_herdsman_1.Zcl.DataType.UINT8 }],
            },
            switchType: {
                ID: 0x02,
                parameters: [{ name: 'value', type: zigbee_herdsman_1.Zcl.DataType.UINT8 }],
            },
            powerType: {
                ID: 0x03,
                parameters: [{ name: 'value', type: zigbee_herdsman_1.Zcl.DataType.UINT8 }],
            },
            ledIndicator: {
                ID: 0x05,
                parameters: [{ name: 'value', type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN }],
            },
            interlock: {
                ID: 0x07,
                parameters: [{ name: 'value', type: zigbee_herdsman_1.Zcl.DataType.UINT8 }],
            },
        },
        commandsResponse: {},
    });
}
function reinterview() {
    let coordEnd = 1;
    const configure = [
        async (device, coordinatorEndpoint, definition) => {
            coordEnd = coordinatorEndpoint;
        },
    ];
    const onEvent = async (type, data, device, settings, state, meta) => {
        if (type == 'deviceAnnounce') {
            // reinterview
            try {
                await device.interview(true);
                logger_1.logger.info(`Succesfully interviewed '${device.ieeeAddr}'`, NS);
                // bind extended endpoint to coordinator
                for (const endpoint of device.endpoints) {
                    if (endpoint.supportsOutputCluster('genOnOff')) {
                        await endpoint.bind('genOnOff', coordEnd);
                    }
                }
                // send updates to clients
                if (meta)
                    meta.deviceExposesChanged();
            }
            catch (error) {
                logger_1.logger.error(`Reinterview failed for '${device.ieeeAddr} with error '${error}'`, NS);
            }
        }
    };
    return { onEvent, configure, isModernExtend: true };
}
const definitions = [
    {
        zigbeeModel: ['YNDX-00537'],
        model: 'YNDX_00537',
        vendor: 'Yandex',
        description: 'Single relay',
        extend: [
            reinterview(),
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { '1': 1, '': 2 },
            }),
            (0, modernExtend_1.onOff)({
                endpointNames: ['1'],
            }),
            enumLookupWithSetCommand({
                name: 'power_type',
                cluster: 'manuSpecificYandex',
                attribute: 'powerType',
                setCommand: 'powerType',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Power supply type',
                lookup: {
                    full: 0x03,
                    low: 0x02,
                    medium: 0x01,
                    high: 0x00,
                },
                entityCategory: 'config',
            }),
            enumLookupWithSetCommand({
                name: 'switch_type',
                cluster: 'manuSpecificYandex',
                attribute: 'switchType',
                setCommand: 'switchType',
                zigbeeCommandOptions: { manufacturerCode },
                endpointName: '1',
                description: 'External switch type 1',
                lookup: {
                    rocker: 0x00,
                    button: 0x01,
                    decoupled: 0x02,
                },
                entityCategory: 'config',
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: [''] }),
        ],
    },
    {
        zigbeeModel: ['YNDX-00538'],
        model: 'YNDX_00538',
        vendor: 'Yandex',
        description: 'Double relay',
        extend: [
            reinterview(),
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { '1': 1, '2': 2, b1: 3, b2: 4 },
            }),
            (0, modernExtend_1.onOff)({
                endpointNames: ['1', '2'],
            }),
            enumLookupWithSetCommand({
                name: 'power_type',
                cluster: 'manuSpecificYandex',
                attribute: 'powerType',
                setCommand: 'powerType',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Power supply type',
                lookup: {
                    full: 0x03,
                    low: 0x02,
                    medium: 0x01,
                    high: 0x00,
                },
                entityCategory: 'config',
            }),
            binaryWithSetCommand({
                name: 'interlock',
                cluster: 'manuSpecificYandex',
                attribute: 'interlock',
                valueOn: ['ON', 1],
                valueOff: ['OFF', 0],
                setCommand: 'interlock',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Interlock',
                entityCategory: 'config',
            }),
            enumLookupWithSetCommand({
                name: 'switch_type',
                cluster: 'manuSpecificYandex',
                attribute: 'switchType',
                setCommand: 'switchType',
                zigbeeCommandOptions: { manufacturerCode },
                endpointName: '1',
                description: 'External switch type 1',
                lookup: {
                    rocker: 0x00,
                    button: 0x01,
                    decoupled: 0x02,
                },
                entityCategory: 'config',
            }),
            enumLookupWithSetCommand({
                name: 'switch_type',
                cluster: 'manuSpecificYandex',
                attribute: 'switchType',
                setCommand: 'switchType',
                zigbeeCommandOptions: { manufacturerCode },
                endpointName: '2',
                description: 'External switch type 2',
                lookup: {
                    rocker: 0x00,
                    button: 0x01,
                    decoupled: 0x02,
                },
                entityCategory: 'config',
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['b1', 'b2'] }),
        ],
    },
    {
        zigbeeModel: ['YNDX-00534'],
        model: 'YNDX_00534',
        vendor: 'Yandex',
        description: 'Single gang wireless switch',
        extend: [
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { up: 1, down: 2 },
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['up', 'down'] }),
        ],
    },
    {
        zigbeeModel: ['YNDX-00535'],
        model: 'YNDX_00535',
        vendor: 'Yandex',
        description: 'Double gang wireless switch',
        extend: [
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { b1_down: 1, b2_down: 2, b1_up: 3, b2_up: 4 },
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['b1_up', 'b1_down', 'b2_up', 'b2_down'] }),
        ],
    },
    {
        zigbeeModel: ['YNDX-00531'],
        model: 'YNDX_00531',
        vendor: 'Yandex',
        description: 'Single gang switch',
        extend: [
            reinterview(),
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { '1': 1, up: 2, down: 3 },
            }),
            (0, modernExtend_1.onOff)({
                endpointNames: ['1'],
            }),
            enumLookupWithSetCommand({
                name: 'power_type',
                cluster: 'manuSpecificYandex',
                attribute: 'powerType',
                setCommand: 'powerType',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Power supply type',
                lookup: {
                    full: 0x03,
                    low: 0x02,
                    medium: 0x01,
                    high: 0x00,
                },
                entityCategory: 'config',
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['up', 'down'] }),
            enumLookupWithSetCommand({
                name: 'operation_mode',
                cluster: 'manuSpecificYandex',
                attribute: 'switchMode',
                setCommand: 'switchMode',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Switch mode (control_relay - the button control the relay, decoupled - button send events when pressed)',
                lookup: {
                    control_relay: 0x00,
                    up_decoupled: 0x01,
                    decoupled: 0x02,
                    down_decoupled: 0x03,
                },
                entityCategory: 'config',
                endpointName: '1',
            }),
            binaryWithSetCommand({
                name: 'led_indicator',
                cluster: 'manuSpecificYandex',
                attribute: 'ledIndicator',
                valueOn: ['ON', 1],
                valueOff: ['OFF', 0],
                setCommand: 'ledIndicator',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Led indicator',
                entityCategory: 'config',
            }),
        ],
    },
    {
        zigbeeModel: ['YNDX-00532'],
        model: 'YNDX_00532',
        vendor: 'Yandex',
        description: 'Double gang switch',
        extend: [
            reinterview(),
            YandexCluster(),
            (0, modernExtend_1.deviceEndpoints)({
                endpoints: { '1': 1, '2': 2, b1_down: 3, b2_down: 4, b1_up: 5, b2_up: 6 },
            }),
            (0, modernExtend_1.onOff)({
                endpointNames: ['1', '2'],
            }),
            enumLookupWithSetCommand({
                name: 'power_type',
                cluster: 'manuSpecificYandex',
                attribute: 'powerType',
                setCommand: 'powerType',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Power supply type',
                lookup: {
                    full: 0x03,
                    low: 0x02,
                    medium: 0x01,
                    high: 0x00,
                },
                entityCategory: 'config',
            }),
            (0, modernExtend_1.commandsOnOff)({ endpointNames: ['b1_up', 'b1_down', 'b2_up', 'b2_down'] }),
            enumLookupWithSetCommand({
                name: 'operation_mode',
                cluster: 'manuSpecificYandex',
                attribute: 'switchMode',
                setCommand: 'switchMode',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Switch mode (control_relay - the button control the relay, decoupled - button send events when pressed)',
                lookup: {
                    control_relay: 0x00,
                    up_decoupled: 0x01,
                    decoupled: 0x02,
                    down_decoupled: 0x03,
                },
                entityCategory: 'config',
                endpointName: '1',
            }),
            enumLookupWithSetCommand({
                name: 'operation_mode',
                cluster: 'manuSpecificYandex',
                attribute: 'switchMode',
                setCommand: 'switchMode',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Switch mode (control_relay - the buttons control the relay, decoupled - buttons send events when pressed)',
                lookup: {
                    control_relay: 0x00,
                    up_decoupled: 0x01,
                    decoupled: 0x02,
                    down_decoupled: 0x03,
                },
                entityCategory: 'config',
                endpointName: '2',
            }),
            binaryWithSetCommand({
                name: 'led_indicator',
                cluster: 'manuSpecificYandex',
                attribute: 'ledIndicator',
                valueOn: ['ON', 1],
                valueOff: ['OFF', 0],
                setCommand: 'ledIndicator',
                zigbeeCommandOptions: { manufacturerCode },
                description: 'Led indicator',
                entityCategory: 'config',
            }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=yandex.js.map