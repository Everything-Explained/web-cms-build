import { ISODateString } from "../utils/global_interfaces";
import StoryblokClient, { ISbResult } from 'storyblok-js-client';
export declare type StoryVersion = 'published' | 'draft';
export declare type StorySortString = 'created_at:desc' | 'created_at:asc' | 'first_published_at:asc' | 'first_published_at:desc' | 'content.category:asc' | 'content.category:desc' | 'content.timestamp:asc' | 'content.timestamp:desc';
export declare type StoryCategoryTableBody = [
    title: {
        value: string;
    },
    code: {
        value: string;
    },
    description: {
        value: string;
    }
];
export declare type StoryCategory = {
    name: string;
    code: string;
    desc: string;
};
export interface Story {
    id: number;
    name: string;
    slug: string;
    created_at: ISODateString;
    published_at: ISODateString | null;
    first_published_at: ISODateString | null;
}
export interface StoryEntry extends Story {
    content: StoryContent;
}
export interface StoryContent {
    id?: string;
    title: string;
    author: string;
    category?: string;
    summary?: string;
    body?: string;
    categories?: {
        tbody: {
            body: StoryCategoryTableBody;
        }[];
    };
    timestamp?: ISODateString;
}
export interface StoryVideoCategories extends Story {
    content: StoryVideoCategoryTable;
}
export interface StoryVideoCategoryTable {
    categories: {
        tbody: StoryCategoryTableBody;
    };
}
export interface StoryOptions {
    starts_with: string;
    sort_by: StorySortString;
    version: StoryVersion;
    page?: number;
    per_page?: number;
}
export interface CMSOptions extends StoryOptions {
    url: string;
}
export interface PartialCMSEntry {
    id: string | number;
    title: string;
    author: string;
    summary?: string;
    body?: string;
    categoryTable?: StoryCategoryTableBody[];
    category?: string;
    hash?: string;
    date: ISODateString;
}
export interface CMSEntry extends PartialCMSEntry {
    readonly id: string | number;
    readonly title: string;
    readonly author: string;
    readonly summary?: string;
    readonly body?: string;
    category?: string;
    hash: string;
    readonly date: ISODateString;
}
declare type MockStoryBlokAPI = {
    get: (slug: string, params: StoryOptions) => Promise<ISbResult>;
};
export declare type StoryblokAPI = MockStoryBlokAPI | StoryblokClient;
export declare const storyBlokAPI: StoryblokClient;
export declare function useStoryblok(api: StoryblokAPI): {
    getCMSEntries: (options: CMSOptions) => Promise<CMSEntry[]>;
    getCategoryList: (options: CMSOptions) => Promise<StoryCategory[]>;
    getStaticPage: (pageName: string, version: StoryVersion) => Promise<{
        title: string;
        content: string;
    }>;
};
declare function getRawStories(opt: CMSOptions, api: StoryblokAPI): Promise<StoryEntry[]>;
declare function toCMSEntry(story: StoryEntry): CMSEntry;
export declare const _tdd_storyblok: {
    useStoryblok: typeof useStoryblok;
    getRawStories: typeof getRawStories;
    toCMSEntry: typeof toCMSEntry;
} | null;
export {};
