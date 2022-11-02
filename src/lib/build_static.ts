

import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { console_colors, lact } from '../lib/logger';
import { useMarkdown } from '../lib/services/markdown/md_core';
import { StoryblokAPI, StoryVersion, useStoryblok } from '../lib/services/storyblok';
import { isError, pathDirname, pathResolve, toShortHash, tryCatchAsync } from './utilities';







type StaticPage = {
  title   : string;
  content : string;
  hash    : string;
}

export type BuildStaticOptions = {
  folderPath : string;
  pageName : string;
  version: StoryVersion;
  api: StoryblokAPI;
}





const cc = console_colors;
const md = useMarkdown();


export async function buildStaticPage(options: BuildStaticOptions) {
  const path             = pathResolve(options.folderPath);
  const filePath         = pathResolve(`${path}/standalone/${options.pageName}.json`);
  const cmsStaticContent = await useStoryblok(options.api).getStaticPage(options.pageName, 'draft');
  const fileResponse     = await tryCatchAsync(readFile(filePath, { encoding: 'utf-8'}));

  const cmsContentHash = toShortHash(cmsStaticContent);
  const newStaticContent: StaticPage = {
    title   : cmsStaticContent.title,
    content : md.render(cmsStaticContent.content),
    hash    : cmsContentHash
  };

  if (isError(fileResponse)) {
    const dirPath = pathDirname(filePath);
    if (!existsSync(pathDirname(dirPath))) {
      throw Error(`buildStatic::CANNOT FIND PATH::${pathDirname(dirPath)}`);
    }

    lact('create', `${filePath}`);
    await writeFile(filePath, JSON.stringify(newStaticContent));
    return true;
  }

  const page: StaticPage = JSON.parse(fileResponse);
  if (cmsContentHash != page.hash) {
    lact('upd', `Static ${cc.gn(options.pageName.toUpperCase())} page`);
    await writeFile(filePath, JSON.stringify(newStaticContent));
    return true;
  }

  return false;
}








