import { StoryblokAPI, StoryVersion } from '../services/storyblok';
export declare type BuildStaticOptions = {
    folderPath: string;
    pageName: string;
    version: StoryVersion;
    api: StoryblokAPI;
};
export declare function buildStaticPage(options: BuildStaticOptions): Promise<boolean>;
