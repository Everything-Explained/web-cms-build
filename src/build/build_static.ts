

import { readFile, writeFile } from 'fs/promises';
import { resolve as pathResolve } from 'path';
import { console_colors, lact } from '../lib/logger';
import { useMarkdown } from '../services/markdown/md_core';
import { StoryblokAPI, StoryVersion, useStoryblok } from '../services/storyblok';
import { isENOENT, isError, toShortHash, tryCatchAsync } from '../utilities';







type StaticPage = {
  title   : string;
  content : string;
  hash    : string;
}

type BuildStaticOptions = {
  folderPath : string;
  pageName : string;
  version: StoryVersion;
  api: StoryblokAPI;
}





const cc = console_colors;
const md = useMarkdown();


export async function buildStatic(options: BuildStaticOptions) {
  const path             = pathResolve(options.folderPath);
  const filePath         = pathResolve(`${path}/static/${options.pageName}.json`);
  const cmsStaticContent = await useStoryblok(options.api).getStaticPage(options.pageName, 'draft');
  const fileResponse     = await tryCatchAsync(readFile(filePath, { encoding: 'utf-8'}));

  if (isError(fileResponse) && !isENOENT(fileResponse)) {
    throw Error(`buildStatic::ERROR ACCESSING FILE::"${fileResponse.message}"`);
  }

  const cmsContentHash = toShortHash(cmsStaticContent);
  const newStaticContent: StaticPage = {
    title   : cmsStaticContent.title,
    content : md.render(cmsStaticContent.content),
    hash    : cmsContentHash
  };

  if (isError(fileResponse)) {
    lact('create', `${filePath}`);
    writeFile(filePath, JSON.stringify(newStaticContent));
    return true;
  }

  const page: StaticPage = JSON.parse(fileResponse);
  if (cmsContentHash != page.hash) {
    lact('upd', `Static ${cc.gn(options.pageName.toUpperCase())} page`);
    writeFile(filePath, JSON.stringify(newStaticContent));
    return true;
  }

  return false;
}








