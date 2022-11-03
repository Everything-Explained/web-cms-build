import { buildManifest, BuildOptions, HashManifestEntry } from "./build_manifest";
import { CMSEntry, StoryblokAPI, StorySortString, StoryVersion } from "../services/storyblok";
import { resolve as pathResolve, basename as pathBasename } from 'path';
import { lact } from "../utils/logger";
import { console_colors as cc } from "../utils/logger";
import { writeFile, rm } from "fs/promises";
import { setIfInDev, truncateStr } from "../utils/utilities";





export interface LiteratureBuildOptions {
  /** Path to manifest */
  buildPath   : string;
  /** Entries location in Storyblok */
  starts_with : string;
  version     : StoryVersion;
  sort_by     : StorySortString;
  /** Storyblok API Object or Mock API Object */
  api         : StoryblokAPI;
}





export function buildLiterature(options: LiteratureBuildOptions) {
  const buildOptions: BuildOptions = {
    ...options,
    url: 'cdn/stories',
  };
  const folderPath      = pathResolve(buildOptions.buildPath);
  buildOptions.onUpdate = saveLiterature(folderPath);
  buildOptions.onAdd    = saveLiterature(folderPath);
  buildOptions.onDelete = deleteLiterature(folderPath);
  return () => buildManifest(buildOptions);
}


function saveLiterature(folderPath: string) {
  return (litEntry: CMSEntry) => {
    lact(
      'create',
      `${cc.gy('/')}` +
      `${cc.gy(pathBasename(folderPath))}` +
      `${cc.gy('/')}${litEntry.id}.mdhtml ${cc.gy(`(${fitTitle(30)(litEntry.title)})`)}`
    );

    if (!litEntry.body) {
      throw Error('Literature Missing Body');
    }

    return writeFile(`${folderPath}/${litEntry.id}.mdhtml`, litEntry.body);
  };
}


function deleteLiterature(folderPath: string) {
  return (litEntry: CMSEntry|HashManifestEntry) => {
    return rm(`${folderPath}/${litEntry.id}.mdhtml`);
  };
}


function fitTitle(maxLen: number) {
  return (title: string) => {
    return (
      (title.length > maxLen)
        ? truncateStr(maxLen)(title).trim() + '...'
        : title
    );
  };
}







export const _tdd_buildLiterature = setIfInDev({
  buildLiterature,
  saveLiterature,
  deleteLiterature,
  fitTitle,
});

















