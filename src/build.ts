import { CMSEntry, CMSGetFunc, slugify, toCMSOptions, useCMS } from "./services/cms_core";
import { writeFile, readFile, unlink, access }  from 'fs/promises';
import { mkdirSync }                    from 'fs';
import { createHmac }                   from 'crypto';
import { map, pipe, forEach, anyPass, is, both }  from "ramda";
import { ISODateString }                from "./global_interfaces";
import { basename as pathBasename, resolve as pathResolve } from 'path';




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

type ObjWithID = {
  id: string|number;
  [key: string]: any;
}

interface BuildOptions {
  url         : string;
  starts_with : string;
  filesPath   : string;
  logging?    : boolean;
  exec        : CMSGetFunc;
}


export async function createBuilder(options: BuildOptions) {
  const { url, filesPath, exec, logging, starts_with } = options;
  const buildPath        = pathResolve(filesPath);
  const manifestFileName = pathBasename(buildPath);
  const stories          = await useCMS().getContent(toCMSOptions(url, starts_with), exec);
  const resp             = await tryCatch(access(`${buildPath}/${manifestFileName}.json`));
  const manifest         =
    both(is(Error), isENOENT)(resp)
      ? await initManifest(stories)
      : await getManifest()
  ;

  async function getManifest() {
     const file = await readFile(`${buildPath}/${manifestFileName}.json`, 'utf-8');
     return JSON.parse(file) as Manifest;
  }

  function initManifest(stories: CMSEntry[]) {
    return pipe(createDir, forEach(saveBodyToFile), saveAsManifest)(stories);
  }

  function updateManifest() {
    const hasChanged = anyPass([
      tryAddEntries,
      tryDeleteEntries,
      tryUpdateEntries,
    ]);
    if (hasChanged(stories)) saveAsManifest(stories);
  }

  function saveAsManifest(stories: CMSEntry[]) {
    return pipe(
      map(toManifestEntry),
      saveAsJSON(`${manifestFileName}.json`),
    )(stories);
  }

  function tryAddEntries(stories: CMSEntry[]) {
    let hasAdded = false;
    for (const story of stories) {
      if (manifest.find(hasSameID(story))) continue;
      log(`[ADD]: ${story.title}`), hasAdded = true;
      saveBodyToFile(story);
    }
    return hasAdded;
  }

  function tryDeleteEntries(stories: CMSEntry[]) {
    let hasDeleted = false;
    for (const entry of manifest!) {
      if (stories.find(hasSameID(entry))) continue;
      deleteFile(`${slugify(entry.title)}.mdhtml`);
      log(`[DEL]: ${entry.title}`), hasDeleted = true;
    }
    return hasDeleted;
  }

  function tryUpdateEntries(stories: CMSEntry[]) {
    let hasUpdated = false;
    for (const story of stories) {
      const entry = manifest.find(hasSameID(story));
      if (!entry) continue;
      if (entry.ver == toShortHash(story)) continue;
      // We don't know if body changed
      saveBodyToFile(story);
      log(`[UPD]: ${story.title}`), hasUpdated = true;
    }
    return hasUpdated;
  }

  async function saveBodyToFile(story: CMSEntry) {
    log(`[CREATE]: ${story.slug}`);
    await writeFile(`${buildPath}/${story.slug}.mdhtml`, story.body);
  }

  function deleteFile(filename: string) {
    return unlink(`${buildPath}/${filename}`);
  }

  function saveAsJSON(fileName: string) {
    return async <T>(data: T) => {
      const filePath = `${buildPath}/${fileName}`;
      log(`[SAVE]: ${fileName}`);
      await writeFile(
        filePath,
        JSON.stringify(data, null, 2), { encoding: 'utf-8' }
      );
      return data;
    };
  }

  function createDir(data: any) {
    try {
      mkdirSync(buildPath);
      log(`[DIR]: /${pathBasename(buildPath)}`);
      return data;
    }
    catch (e) {
      if ((e as Error).message.includes('EEXIST'))
        return data
      ;
      throw e;
    }
  }

  function isENOENT(e: Error) {
    return e.message.includes('ENOENT');
  }

  function hasSameID(o1: ObjWithID) {
    return (o2: ObjWithID) => o1.id == o2.id;
  }

  function log(...msg: any[]) {
    if (logging ?? true) console.log(...msg);
  }

  return {
    updateManifest,
    _exportedForTesting: {
      tryAddEntries,
      tryDeleteEntries,
      tryUpdateEntries,
      saveBodyToFile,
      saveAsJSON,
      createDir,
    }
  };
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


export async function tryCatch<T>(p: Promise<T>): Promise<T|Error> {
  try {
    const data = await p;
    return data;
  }
  catch (e) {
    return Error((e as Error).message);
  }
}




