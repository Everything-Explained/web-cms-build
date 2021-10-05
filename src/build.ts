import { useMockStoryblokAPI }          from "../__fixtures__/sb_mock_api";
import { CMSEntry, CMSOptions, slugify, useCMS } from "./services/cms_core";
import { writeFile, readFile, unlink, access }  from 'fs/promises';
import { mkdirSync }                    from 'fs';
import { StorySortString }              from "../services/api_storyblok";
import { createHmac }                   from 'crypto';
import { map, pipe, forEach, anyPass, cond, andThen, always, equals, ifElse, is, and, both }  from "ramda";
import { useStoryblok }                 from "./services/sb_core";
import { ISODateString }                from "./global_interfaces";




type ManifestEntry = {
	id        : number|string   // content.id || id
	title     : string;
	author    : string;
	category ?: string;         // AA, AB, AC...
	summary  ?: string;
	date      : ISODateString;  // content.timestamp || first_published_at || created_at
	ver       : string;
}

type Manifest = ManifestEntry[];





export async function createBuilder(url: string, dir: string) {
  const CMS       = useCMS();
  const mockAPI   = useMockStoryblokAPI();
  const sb        = useStoryblok();
  const buildPath = `../release/${dir}`;
  const stories   = await CMS.getContent(toSBOptions('test/pages', url), mockAPI.get);
  const resp      = await tryCatch(access(`${buildPath}/${dir}.json`));
  const isENOENT  = (e: Error) => e.message.includes('ENOENT');
  const manifest  =
    both(is(Error), isENOENT)(resp)
      ? await initManifest(stories)
      : await getManifest()
  ;

  async function getManifest() {
     const file = await readFile(`${buildPath}/${dir}.json`, 'utf-8');
     return JSON.parse(file) as Manifest;
  }

  function initManifest(stories: CMSEntry[]) {
    return pipe(createDir, forEach(writeBodyToFile), createManifest)(stories);
  }

  function updateManifest() {
    const hasChanged = anyPass([
      tryAddStories,
      tryDeleteStories,
      tryUpdateStories,
    ]);
    if (hasChanged(stories)) createManifest(stories);
  }

  function createManifest(stories: CMSEntry[]) {
    return pipe(
      map(toManifestEntry),
      saveAsJSON(`${dir}.json`),
    )(stories);
  }

  function tryAddStories(stories: CMSEntry[]) {
      let hasAdded = false;
      for (const story of stories) {
        if (isPropEq('id', manifest!, story)) continue;
        writeBodyToFile(story);
        console.log(`[ADD]: ${story.title}`), hasAdded = true;
      }
      return hasAdded;
  }

  function tryDeleteStories(stories: CMSEntry[]) {
    let hasDeleted = false;
    for (const entry of manifest!) {
      if (isPropEq('id', stories, entry)) continue;
      deleteFile(`${slugify(entry.title)}.mdhtml`);
      console.log(`[DEL]: ${entry.title}`), hasDeleted = true;
    }
    return hasDeleted;
  }

  function tryUpdateStories(stories: CMSEntry[]) {
    let hasUpdated = false;
    for (const story of stories) {
      const storyVer = toShortHash(story);
      const entry = manifest.find(entry => entry.id == story.id);
      if (!entry) continue; // Skip added/deleted entries
      if (entry.ver == storyVer) continue;
      writeBodyToFile(story);
      console.log(`[UPD]: ${story.title}`), hasUpdated = true;
    }
    return hasUpdated;
  }

  function writeBodyToFile(story: CMSEntry) {
    return writeFile(`${buildPath}/${story.slug}.mdhtml`, story.body);
  }

  function deleteFile(filename: string) {
    return unlink(`${buildPath}/${filename}`);
  }

  function saveAsJSON(fileName: string) {
    return async <T>(data: T) => {
      await writeFile(
        `${buildPath}/${fileName}`,
        JSON.stringify(data, null, 2), { encoding: 'utf-8' }
      );
      return data;
    };
  }

  function createDir(data: any) {
    try {
      mkdirSync(buildPath);
      return data;
    }
    catch (e) {
      if ((e as Error).message.includes('EEXIST')) return data;
      throw e;
    }
  }

  return { updateManifest, };
}




/**
 * Returns true if **prop** is found in **obj2** and any
 * objs in **obj1[]**.
 */
export function isPropEq<T>(prop: keyof T, objArray: T[], obj: any) {
  return !!objArray.find(o => o[prop] == obj[prop]);
}


export function toManifestEntry(story: CMSEntry) {
  const { summary, title, author, date, id } = story;
  const entry: ManifestEntry = {
    id,
    summary,
    title,
    author,
    date,
    ver: toShortHash(story)
  };
  return entry;
}


export async function tryGetJSONFromFile<T>(path: string) {
  const resp = await tryCatch(readFile(path, { encoding: 'utf-8' }));
  if (resp instanceof Error) throw resp;
  return JSON.parse(resp) as T;
}


export function toShortHash(data: any) {
  const truncateTo10Chars = (str: string) => str.substring(0, 10);
  return pipe(
    JSON.stringify,
    toMd4hash,
    truncateTo10Chars,
  )(data);
}


export function toMd4hash(str: string) {
  const secret = 'EvEx1337';
  return createHmac('md4', secret).update(str).digest('hex');
}


export function toSBOptions(url: string, starts_with: string, sort_by?: StorySortString) {
  return {
    url,
    starts_with,
    version: 'draft',
    sort_by: sort_by ?? 'created_at:asc',
    per_page: 100,
  } as CMSOptions;
}


export async function tryCatch<T>(p: Promise<T>): Promise<T|Error> {
  try {
    const data = await p;
    return data;
  }
  catch (e) {
    return Error((e as Error).message);
  }
}




