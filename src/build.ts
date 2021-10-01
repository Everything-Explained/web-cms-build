import { useMockStoryblokAPI }          from "../__fixtures__/sb_mock_api";
import { CMSStory, CMSOptions, useCMS } from "./services/cms_core";
import { writeFile, readFile, unlink }  from 'fs/promises';
import { mkdirSync }                    from 'fs';
import { StorySortString }              from "../services/api_storyblok";
import { createHmac }                   from 'crypto';
import { map, pipe, forEach, anyPass }  from "ramda";
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

type ObjWithID = { id: string|number };





export async function createBuilder(url: string, dir: string) {
  const CMS       = useCMS();
  const mockAPI   = useMockStoryblokAPI();
  const sb        = useStoryblok();
  const buildPath = `../release/${dir}`;
  const stories   = await CMS.getContent(toSBOptions('test/pages', url), mockAPI.get);
  let manifest    = await tryGetJSONFromFile<Manifest>(`${buildPath}/${dir}.json`);

  async function build() {
    // manifest should NOT mutate anywhere else
    if (!manifest) manifest = await initManifest(stories);
    updateManifest(stories);
  }


  function initManifest(stories: CMSStory[]) {
    return pipe(
      createDir,
      forEach(writeBodyToFile),
      createManifest
    )(stories);
  }


  function updateManifest(stories: CMSStory[]) {
    const hasChanged = anyPass([
      tryAddStories,
      tryDeleteStories,
      tryUpdateStories,
    ]);
    if (hasChanged(stories)) createManifest(stories);
  }


  function createManifest(stories: CMSStory[]) {
    return pipe(
      map(toManifestData),
      saveAsJSON(`${dir}.json`),
    )(stories);
  }


  function tryAddStories(stories: CMSStory[]) {
      let hasAdded = false;
      for (const story of stories) {
        if (isPropEq('id', manifest!, story)) continue;
        writeBodyToFile(story);
        console.log(`[ADD]: ${story.title}`), hasAdded = true;
      }
      return hasAdded;
  }


  function tryDeleteStories(stories: CMSStory[]) {
    let hasDeleted = false;
    for (const entry of manifest!) {
      if (isPropEq('id', stories, entry)) continue;
      deleteFile(`${dir}.mdhtml`);
      console.log(`[DEL]: ${entry.title}`), hasDeleted = true;
    }
    return hasDeleted;
  }


  function tryUpdateStories(stories: CMSStory[]) {
    let hasUpdated = false;
    for (const story of stories) {
      if (isPropEq('ver', manifest!, story)) continue;
      writeBodyToFile(story);
      console.log(`[UPD]: ${story.title}`), hasUpdated = true;
    }
    return hasUpdated;
  }


  function writeBodyToFile(story: CMSStory) {
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

  return { build };
}




/**
 * Returns true if **obj2.prop** is found in and equal to any
 * obj within obj1 Array.
 */
export function isPropEq<T>(prop: keyof T, obj1: T[], obj2: any) {
  return !!obj1.find(o => o[prop] == obj2[prop]);
}


export function toManifestData(story: CMSStory) {
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
  if (resp instanceof Error) {
    if (resp.message.includes('ENOENT')) return null;
    throw resp;
  }
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


function toMd4hash(str: string) {
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
    return e as Error;
  }
}


export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/α/g, 'a') // Greek Alpha
    .replace(/β/g, 'b') // Greek Beta
    .replace(/[^a-z0-9-]+/g, '')
  ;
}



