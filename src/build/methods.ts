import { storyBlokAPI, StoryVersion, useStoryblok } from "../services/storyblok";
import { buildLiterature } from "./build_literature";
import { buildVideos } from "./build_videos";







const sb = useStoryblok(storyBlokAPI);

const partialBuildOptions = {
  version: 'draft' as StoryVersion,
  api: storyBlokAPI
};







export const buildBlog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'blog',
  sort_by: 'content.category:desc',
  ...partialBuildOptions,
});

export const buildChangelog = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'changelog',
  sort_by: 'content.category:desc',
  ...partialBuildOptions,
});

export const buildLibraryLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'library/literature',
  sort_by: 'content.category:desc',
  ...partialBuildOptions,
});

export const buildRed33mLit = (buildPath: string) => buildLiterature({
  buildPath,
  starts_with: 'red33m/literature',
  sort_by: 'content.category:desc',
  ...partialBuildOptions,
});

export const buildLibraryVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'libraryVideos',
  starts_with: 'test/tlit',
  sort_by: 'content.timestamp:asc',
  catList_starts_with: 'library/category-list',
  ...partialBuildOptions
});

export const buildRed33mVideos = (buildPath: string) => buildVideos({
  buildPath,
  fileName: 'red33mVideos',
  starts_with: 'testred33m/red33m/videos',
  sort_by: 'content.timestamp:asc',
  ...partialBuildOptions
});

export const buildHomePage = (version: StoryVersion) => {
  return sb.getStaticPage('home', version);
};













