


import { buildManifest, BuildOptions, BuildResult } from "./build_manifest";
import {
  CMSEntry, StoryblokAPI, StoryCategory,
  StorySortString, StoryVersion,
  useStoryblok
} from "../lib/services/storyblok";
import { saveAsJSON, setIfInDev } from "./utilities";
import { dirname as pathDirname } from "path";







export interface VideoBuildOptions {
  fileName            : string;
  /** Entries location in Storyblok */
  starts_with         : string;
  /** Category List location in Storyblok */
  catList_starts_with?: string;
  version             : StoryVersion;
  sort_by             : StorySortString;
  /** Path to manifest */
  buildPath           : string;
  /** Storyblok API Object or Mock API Object */
  api                 : StoryblokAPI;
}

type VideoEntry = {
  id       : string|number;
  title    : string;
  author   : string;
  summary? : string;
  date     : string;
}

export type VideoCategories = {
  [key: string]: {
    desc: string;
    videos: VideoEntry[]
  }
}

export type VideoCategoryArray = Array<{
  name: string[];
  desc: string;
  videos: VideoEntry[]
}>;







export async function buildVideos(options: VideoBuildOptions): BuildResult {
  const buildOptions: BuildOptions = {
    ...options,
    url            : 'cdn/stories',
    manifestName   : `${options.fileName}Manifest`,
    isHashManifest : true,
  };

  const [filePath, entries, isUpdated] = await buildManifest(buildOptions);
  const saveVideos = saveAsJSON(pathDirname(filePath), options.fileName);

  if (!isUpdated) return [filePath, entries, false];

  if (options.catList_starts_with) {
    const sb = useStoryblok(options.api);
    buildOptions.starts_with = options.catList_starts_with;
    // Category list is not published
    buildOptions.version = 'draft';
    const categoryList = await sb.getCategoryList(buildOptions);
    saveVideos(createVideoCategories(entries, categoryList));
  } else {
    saveVideos(entries.map(toVideoEntry));
  }
  return [filePath, entries, true];
}



function createVideoCategories(videos: CMSEntry[], categoryList: StoryCategory[]) {
  const categories: VideoCategories = {};
  let processedVideoCount = 0;

  for (const cat of categoryList) {
    const filteredVideos = videos.filter(v => v.category == cat.code);
    if (!filteredVideos.length) continue;

    const { name, desc } = cat;
    if (!categories[name]) {
      categories[name] = { desc, videos: [] };
    }

    processedVideoCount += filteredVideos.length;
    categories[name].videos.push(...filteredVideos.map(toVideoEntry));
  }

  if (processedVideoCount != videos.length) {
    throw Error('Detected Unknown or Missing Categories');
  }

  return objectToArray(categories);
}


function objectToArray(obj: { [key: string]: any }): VideoCategoryArray {
  const objArray = [];

  for (const key in obj) {
    objArray.push({ name: key, ...obj[key] });
  }

  return objArray;
}



function toVideoEntry(entry: CMSEntry) {
  const {id, title, author, summary, date} = entry;
  return {
    id, title, author, summary, date
  };
}







export const _tdd_buildVideos = setIfInDev({
  buildVideos,
  createVideoCategories,
  toVideoEntry,
});





