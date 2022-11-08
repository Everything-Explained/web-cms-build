import { BuildResult } from "./build_manifest";
import { CMSEntry, StoryblokAPI, StoryCategory, StorySortString, StoryVersion } from "../services/storyblok";
export interface VideoBuildOptions {
    fileName: string;
    starts_with: string;
    catList_starts_with?: string;
    version: StoryVersion;
    sort_by: StorySortString;
    buildPath: string;
    api: StoryblokAPI;
}
declare type VideoEntry = {
    id: string | number;
    title: string;
    author: string;
    summary?: string;
    date: string;
};
export declare type VideoCategories = {
    [key: string]: {
        desc: string;
        videos: VideoEntry[];
    };
};
export declare type VideoCategoryArray = Array<{
    name: string[];
    desc: string;
    videos: VideoEntry[];
}>;
export declare function buildVideos(options: VideoBuildOptions): BuildResult;
declare function createVideoCategories(videos: CMSEntry[], categoryList: StoryCategory[]): VideoCategoryArray;
declare function toVideoEntry(entry: CMSEntry): {
    id: string | number;
    title: string;
    author: string;
    summary: string | undefined;
    date: string;
};
export declare const _tdd_buildVideos: {
    buildVideos: typeof buildVideos;
    createVideoCategories: typeof createVideoCategories;
    toVideoEntry: typeof toVideoEntry;
} | null;
export {};
