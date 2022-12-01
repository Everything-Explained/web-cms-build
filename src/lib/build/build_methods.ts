import { storyBlokAPI, StoryVersion } from "../services/storyblok";
import { isDev } from "../utils/utilities";
import { buildLiterature } from "./build_literature";
import { buildStaticPage } from "./build_static";
import { buildVideos } from "./build_videos";







export const storyBlokVersion: StoryVersion = (isDev() ? 'draft' : 'published');

const partialBuildOptions = {
  version: storyBlokVersion,
  api: storyBlokAPI
};







export const buildPublicBlog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'page-data/blog/public/',
  sort_by: 'first_published_at:asc',
  ...partialBuildOptions,
});

export const buildRed33mBlog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'page-data/blog/red33m/',
  sort_by: 'first_published_at:asc',
  ...partialBuildOptions,
});

export const buildChangelog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'page-data/changelog/',
  sort_by: 'created_at:desc',
  ...partialBuildOptions,
});

export const buildPublicLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'page-data/literature/public/',
  sort_by: 'first_published_at:asc',
  ...partialBuildOptions,
});

export const buildRed33mLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'page-data/literature/red33m/',
  sort_by: 'first_published_at:asc',
  ...partialBuildOptions,
});

export const buildPublicVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'public',
  starts_with: 'page-data/videos/public/',
  sort_by: 'content.timestamp:asc',
  catList_starts_with: 'utils/category-list',
  ...partialBuildOptions
});

export const buildRed33mVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'red33m',
  starts_with: 'page-data/videos/red33m/',
  sort_by: 'content.timestamp:asc',
  ...partialBuildOptions
});

export const buildHomePage = async (path: string) => {
  return buildStaticPage({
    folderPath: path,
    pageName: 'home',
    ...partialBuildOptions
  });
};













