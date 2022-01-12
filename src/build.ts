import { CMSEntry, CMSGetFunc, slugify, toCMSOptions, useCMS } from "./services/cms_core";
import { writeFile, readFile, unlink, access }  from 'fs/promises';
import { mkdirSync }                    from 'fs';
import { createHmac }                   from 'crypto';
import { map, pipe, forEach, is, both }  from "ramda";
import { ISODateString }                from "./global_interfaces";
import { basename as pathBasename, resolve as pathResolve } from 'path';
import { console_colors, lact, lnfo, lwarn } from "./lib/logger";




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

  state.logger.active = logging ?? true;

  lnfo('init', `Setting up Builder for ${cc.gy(buildPath)}`);

  const stories          = await useCMS().getContent(toCMSOptions(url, starts_with), exec);
  const resp             = await tryCatch(access(`${buildPath}/${manifestFileName}.json`));
  const manifest         =
    both(is(Error), isENOENT)(resp)
      ? await initManifest(stories)
      : await getManifest()
  ;

  function updateManifest() {
    const hasChanged = (stories: CMSEntry[]) => {
      const funcArray = [
        tryAddEntries,
        tryDeleteEntries,
        tryUpdateEntries
      ];
      return funcArray.map(func => func(stories)).includes(true);
    };
    if (hasChanged(stories)) saveAsManifest(stories);
  }

  async function getManifest() {
    const file = await readFile(`${buildPath}/${manifestFileName}.json`, 'utf-8');
    return JSON.parse(file) as Manifest;
  }

  function initManifest(stories: CMSEntry[]) {
    return pipe(
      createDir,
      forEach(saveBodyToFile),
      saveAsManifest
    )(stories);
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
      lnfo('add', `${cc.gy(toShortHash(story))}/${story.title}`);
      hasAdded = true;
      saveBodyToFile(story);
    }
    return hasAdded;
  }

  function tryDeleteEntries(stories: CMSEntry[]) {
    let hasDeleted = false;
    for (const entry of manifest!) {
      if (stories.find(hasSameID(entry))) continue;
      lwarn('omit', `${cc.gy(entry.hash)}/${entry.title}`);
      hasDeleted = true;
      deleteFile(`${slugify(entry.title)}.mdhtml`);
    }
    return hasDeleted;
  }

  function tryUpdateEntries(stories: CMSEntry[]) {
    let hasUpdated = false;
    for (const story of stories) {
      const entry = manifest.find(hasSameID(story));
      if (!entry) continue;
      if (entry.ver == toShortHash(story)) continue;
      lnfo('upd', `${cc.yw('(')}${cc.gy(`${entry.hash} ${cc.yw('=>')} ${story.hash}`)}${cc.yw(')')}/${story.title}`);
      hasUpdated = true;
      // We don't know if body changed
      saveBodyToFile(story);
    }
    return hasUpdated;
  }

  async function saveBodyToFile(entry: CMSEntry) {
    const fileNameWithExt = `${slugify(entry.title)}.mdhtml`;
    lact('create', `${cc.gy(`/${pathBasename(buildPath)}/`)}${fileNameWithExt}`);
    await writeFile(`${buildPath}/${fileNameWithExt}`, entry.body!);
  }

  function deleteFile(filename: string) {
    lwarn('delete', `${cc.gy(`/${pathBasename(buildPath)}/`)}${filename}`);
    return unlink(`${buildPath}/${filename}`);
  }

  function saveAsJSON(fileName: string) {
    return async <T>(data: T) => {
      const filePath = `${buildPath}/${fileName}`;
      lact('create', `${cc.gy(`/${pathBasename(buildPath)}/`)}${fileName}`);
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
      lact('create', cc.gy(`/${pathBasename(buildPath)}`));
      return data;
    }
    catch (e) {
      if ((e as Error).message.includes('EEXIST'))
        return data
      ;
      throw e;
    }
  }

  function hasSameID(o1: ObjWithID) {
    return (o2: ObjWithID) => o1.id == o2.id;
  }

  function log(...msg: any[]) {
    if (logging ?? true) console.log(...msg);
  }

  return {
    updateManifest,
    _tdd: {
      buildPath,
      manifestFileName,
      manifest,
      stories,
      logging,
      tryAddEntries,
      tryDeleteEntries,
      tryUpdateEntries,
      saveBodyToFile,
      deleteFile,
      saveAsJSON,
      hasSameID,
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







