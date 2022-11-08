import { ISODateString } from "./utils/global_interfaces";
declare type VersionTypes = 'build' | 'pubBlog' | 'r3dBlog' | 'chglog' | 'home' | 'pubLit' | 'pubVid' | 'r3dLit' | 'r3dVid';
declare type CMSDataVersions = Record<VersionTypes, {
    v: string;
    n: ISODateString;
}>;
export declare function buildCMSData(rootDir: string): Promise<void>;
export declare function tryGetCMSVersionFile(rootDir: string): Promise<CMSDataVersions>;
export declare function tryCreateCMSDataVersionFile(rootDir: string): void;
export declare function tryVersionPropertyUpdates(versionData: CMSDataVersions, rootDir: string): void;
export declare function saveCMSDataVersionFile(versionData: CMSDataVersions, rootDir: string): void;
export {};
