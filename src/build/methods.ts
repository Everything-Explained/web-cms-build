import { storyBlokAPI, StoryVersion } from "../services/storyblok";
import { isDev } from "../utilities";
import { buildLiterature } from "./build_literature";
import { buildStatic as buildStaticPage } from "./build_static";
import { buildVideos } from "./build_videos";







const storyBlokVersion: StoryVersion = (isDev() ? 'draft' : 'published');

const partialBuildOptions = {
  version: storyBlokVersion,
  api: storyBlokAPI
};







export const buildBlog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'blog',
  sort_by: 'created_at:desc',
  ...partialBuildOptions,
});

export const buildChangelog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'changelog',
  sort_by: 'created_at:desc',
  ...partialBuildOptions,
});

export const buildLibraryLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'library/literature',
  sort_by: 'created_at:asc',
  ...partialBuildOptions,
});

export const buildRed33mLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'red33m/literature',
  sort_by: 'created_at:asc',
  ...partialBuildOptions,
});

export const buildLibraryVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'videos',
  starts_with: 'test/tlit',
  sort_by: 'content.timestamp:asc',
  catList_starts_with: 'library/category-list',
  ...partialBuildOptions
});

export const buildRed33mVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'videos',
  starts_with: 'testred33m/red33m/videos',
  sort_by: 'content.timestamp:asc',
  ...partialBuildOptions
});

export const buildHomePage = async (path: string, version: StoryVersion = storyBlokVersion) => {
  return buildStaticPage({
    folderPath: path,
    pageName: 'home',
    version,
  });
};













