import { HashManifestEntry } from "./build_manifest";
import { CMSEntry, StoryblokAPI, StorySortString, StoryVersion } from "../services/storyblok";
export interface LiteratureBuildOptions {
    buildPath: string;
    starts_with: string;
    version: StoryVersion;
    sort_by: StorySortString;
    api: StoryblokAPI;
}
export declare function buildLiterature(options: LiteratureBuildOptions): () => import("./build_manifest").BuildResult;
declare function saveLiterature(folderPath: string): (litEntry: CMSEntry) => Promise<void>;
declare function deleteLiterature(folderPath: string): (litEntry: CMSEntry | HashManifestEntry) => Promise<void>;
declare function fitTitle(maxLen: number): (title: string) => string;
export declare const _tdd_buildLiterature: {
    buildLiterature: typeof buildLiterature;
    saveLiterature: typeof saveLiterature;
    deleteLiterature: typeof deleteLiterature;
    fitTitle: typeof fitTitle;
} | null;
export {};
