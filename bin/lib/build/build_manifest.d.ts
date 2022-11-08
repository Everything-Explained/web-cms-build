import { ISODateString } from "../utils/global_interfaces";
import { saveAsJSON, tryCreateDir } from "../utils/utilities";
import { CMSEntry, StoryblokAPI, StorySortString, StoryVersion } from '../services/storyblok';
declare type ManifestEntry = {
    id: number | string;
    title: string;
    author: string;
    category?: string;
    summary?: string;
    date: ISODateString;
    hash: string;
};
export declare type HashManifestEntry = {
    id: number | string;
    title: string;
    hash: string;
};
declare type Manifest = ManifestEntry[];
declare type HashManifest = HashManifestEntry[];
export interface BuildOptions {
    url: string;
    starts_with: string;
    version: StoryVersion;
    sort_by: StorySortString;
    buildPath: string;
    manifestName?: string;
    api: StoryblokAPI;
    canSave?: boolean;
    isHashManifest?: boolean;
    onDelete?: (entry: CMSEntry | HashManifestEntry) => void;
    onUpdate?: (entry: CMSEntry) => void;
    onAdd?: (entry: CMSEntry) => void;
}
export interface BuildOptionsInternal extends BuildOptions {
    manifestName: string;
    canSave: boolean;
    isHashManifest: boolean;
    isInit: boolean;
}
export declare type BuildResult = Promise<[filePath: string, latestEntries: CMSEntry[], hasUpdated: boolean]>;
export declare function buildManifest(opts: BuildOptions): BuildResult;
declare function getManifestEntries(latestEntries: CMSEntry[], opts: BuildOptionsInternal): Promise<HashManifestEntry[]>;
declare function initManifest(entries: CMSEntry[], opts: BuildOptionsInternal): Promise<HashManifestEntry[]>;
declare function readManifestFile(path: string, fileName: string): Promise<Manifest>;
declare function toManifestEntry(newEntry: CMSEntry): ManifestEntry;
declare function toHashManifestEntry(newEntry: CMSEntry): HashManifestEntry;
declare function detectAddedEntries(onAddEntries?: (entry: CMSEntry) => void): (oldEntries: Manifest | HashManifest, latestEntries: CMSEntry[]) => boolean;
declare function detectDeletedEntries(onDelete?: (oldEntry: CMSEntry | HashManifestEntry) => void): (oldEntries: Manifest | HashManifest, latestEntries: CMSEntry[]) => boolean;
declare function detectUpdatedEntries(onUpdate?: (updatedEntry: CMSEntry) => void): (oldEntries: Manifest | HashManifest, latestEntries: CMSEntry[]) => boolean;
export declare const _tdd_buildManifest: {
    buildManifest: typeof buildManifest;
    getManifestEntries: typeof getManifestEntries;
    initManifest: typeof initManifest;
    readManifestFile: typeof readManifestFile;
    tryCreateDir: typeof tryCreateDir;
    toManifestEntry: typeof toManifestEntry;
    toHashManifestEntry: typeof toHashManifestEntry;
    saveAsJSON: typeof saveAsJSON;
    detectAddedEntries: typeof detectAddedEntries;
    detectDeletedEntries: typeof detectDeletedEntries;
    detectUpdatedEntries: typeof detectUpdatedEntries;
} | null;
export {};
