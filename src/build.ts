import { useMockStoryblokAPI } from "../__fixtures__/sb_mock_api";
import { CMSStory, CMSOptions, useCMS } from "./services/cms_core";
import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import { StorySortString } from "../services/api_storyblok";
import { createHmac } from 'crypto';
import { map, pipe, ifElse, always, forEach, composeWith, andThen, pick } from "ramda";
import { dirname } from 'path';
import { useStoryblok } from "./services/sb_core";
import { ISODateString } from "./global_interfaces";


type Manifest = {
	id        : number|string   // content.id || id
	title     : string;
	author    : string;
	category ?: string;         // AA, AB, AC...
	summary  ?: string;
	date      : ISODateString;  // content.timestamp || first_published_at || created_at
	ver       : string;
}[];


const CMS     = useCMS();
const mockAPI = useMockStoryblokAPI();
const sb = useStoryblok();
const rootDir = '../release';


export async function buildCMSFiles(url: string, dir: string) {
  const stories  = await CMS.getContent(toSBOptions('test/pages', url), mockAPI.get);
  const manifest = await tryGetManifest(`${dir}/${dir}.json`);
  if (!manifest) return createManifest(dir)(stories);
  compareManifest(stories, manifest);
}


export function createManifest(dir: string) {
  return pipe(
    forEach(toStaticResource(dir, 'mdhtml')),
    map(toManifestData),
    saveAsJSON(dir, `${dir}.json`),
  );
}

export function compareManifest(stories: CMSStory[], manifest: Manifest) {
  throw new Error('Not Implemented');
}


export function toStaticResource(dir: string, ext: string) {
  return async (data: CMSStory) => {
    await saveAsString(dir, `${data.slug}.${ext}`)(data.body!);
  };
}


export function toManifestData(story: CMSStory) {
  const { summary, title, author, date, id } = story;
  return {
    id,
    summary,
    title,
    author,
    date,
    ver: toMd5(JSON.stringify(story)).substring(0, 10)
  };
}


export async function tryGetManifest(path: string) {
  const [file, error] = await tryCatch(readFile(`${rootDir}/${path}`, { encoding: 'utf-8' }));
  if (error) {
    if (error.message.includes('ENOENT')) return null;
    throw error;
  }
  return JSON.parse(file!) as Manifest;
}


export function saveAsJSON(dir: string, fileName: string) {
  return async <T>(data: T) => {
    await writeFile(
      `${rootDir}/${dir}/${fileName}`,
      JSON.stringify(data, null, 2), { encoding: 'utf-8' }
    );
    return data;
  };
}


export function saveAsString(dir: string, fileName: string) {
  return async (data: string) => {
    await writeFile(
      `${rootDir}/${dir}/${fileName}`,
      data
    );
  };
}


export function toMd5(str: string) {
  const secret = 'EvEx1337';
  return createHmac('sha1', secret).update(str).digest('hex');
}


export async function createDir(dir: string) {
  try { await mkdir(dir); return true; }
  catch (e) {
    if ((e as Error).message.includes('EEXIST')) return true;
    return false;
  }
}


export function toSBOptions(url: string, starts_with: string, sort_by?: StorySortString) {
  const options = {
    url,
    starts_with,
    version: 'draft',
    sort_by: sort_by ?? 'created_at:asc',
    per_page: 100,
  } as CMSOptions;
  return options;
}



export async function tryCatch<T>(p: Promise<T>): Promise<[T|null, Error|null]> {
  try {
    const data = await p;
    return [data, null];
  }
  catch (e) {
    return [null, e as Error];
  }
}



