import { BinaryArgs, NumericArgs } from './modernExtend';
import { ModernExtend } from './types';
export declare const ubisysModernExtend: {
    addCustomClusterHvacThermostat: () => ModernExtend;
    addCustomClusterGenLevelCtrl: () => ModernExtend;
    addCustomClusterClosuresWindowCovering: () => ModernExtend;
    addCustomClusterManuSpecificUbisysDeviceSetup: () => ModernExtend;
    addCustomClusterManuSpecificUbisysDimmerSetup: () => ModernExtend;
    localTemperatureOffset: (args?: Partial<NumericArgs>) => ModernExtend;
    occupiedHeatingSetpointDefault: (args?: Partial<NumericArgs>) => ModernExtend;
    remoteTemperatureDuration: (args?: Partial<NumericArgs>) => ModernExtend;
    vacationMode: () => ModernExtend;
    openWindowState: (args?: Partial<BinaryArgs>) => ModernExtend;
    openWindowDetect: (args?: Partial<BinaryArgs>) => ModernExtend;
    openWindowTimeout: (args?: Partial<NumericArgs>) => ModernExtend;
    openWindowDetectionPeriod: (args?: Partial<NumericArgs>) => ModernExtend;
    openWindowSensitivity: (args?: Partial<NumericArgs>) => ModernExtend;
};
//# sourceMappingURL=ubisys.d.ts.map