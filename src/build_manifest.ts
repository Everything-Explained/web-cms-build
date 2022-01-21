import { CMSEntry, CMSGetFunc, toCMSOptions, useCMS } from "./services/cms_core";
import { writeFile, readFile, access }  from 'fs/promises';
import { mkdirSync }                    from 'fs';
import { pipe, is, both }  from "ramda";
import { ISODateString }                from "./global_interfaces";
import { basename as pathBasename, resolve as pathResolve } from 'path';
import { console_colors, lact, lnfo, lwarn } from "./lib/logger";
import { hasSameID, isENOENT, setIfInDev, tryCatchAsync } from "./utilities";



type ManifestEntry = {
	id        : number|string   // content.id || id
	title     : string;
	author    : string;
	category ?: string;         // AA, AB, AC...
	summary  ?: string;
	date      : ISODateString;  // content.timestamp || first_published_at || created_at
	hash      : string;
}

type Manifest = ManifestEntry[];


// TODO - add sort_by option
export interface BuildOptions {
  /** CDN Root Slug */
  url           : string;
  /** CDN Resource Name */
  starts_with   : string;
  /** Path to build manifest */
  filesPath     : string;
  /** Will overwrite default manifest file name. */
  manifestName? : string;
  /** CMS get function to use */
  exec          : CMSGetFunc;
  /** Callback when an entry has been deleted. */
  onDelete?     : (entry: CMSEntry) => void;
  /** Callback when an entry has been updated. */
  onUpdate?     : (entry: CMSEntry) => void;
  /** Callback when an entry has been Added. */
  onAdd?        : (entry: CMSEntry) => void;
}

/** Console Colors */
const cc = console_colors;


export async function buildManifest(options: BuildOptions) {
  const { url, filesPath, exec, starts_with } = options;
  const buildPath = pathResolve(filesPath);
  const fileName = options.manifestName ?? pathBasename(buildPath);

  const latestEntries  = await useCMS().getContent(toCMSOptions(url, starts_with), exec);
  const oldEntries     = await getManifestEntries(latestEntries, buildPath, fileName);
  const detectionFuncs = [
    detectAddedEntries(options.onAdd),
    detectUpdatedEntries(options.onUpdate),
    detectDeletedEntries(options.onDelete),
  ];
  const hasUpdatedEntries =
    detectionFuncs.map(f => f(oldEntries, latestEntries)).includes(true)
  ;
  if (hasUpdatedEntries) saveAsManifest(buildPath, fileName)(latestEntries);
}


export const _tdd_buildManifest = setIfInDev({
  getManifestEntries,
  initManifest,
  readManifestFile,
  tryCreateDir,
  saveAsManifest,
  toManifestEntry,
  saveAsJSON,
  detectAddedEntries,
  detectDeletedEntries,
  detectUpdatedEntries,
});


async function getManifestEntries(latestEntries: CMSEntry[], path: string, fileName: string) {
  const accessResponse = await tryCatchAsync(access(`${path}/${fileName}.json`));
  return both(is(Error), isENOENT)(accessResponse)
    ? await initManifest(latestEntries, path, fileName)
    : await readManifestFile(path, fileName)
  ;
}


function initManifest(entries: CMSEntry[], path: string, fileName: string) {
  return pipe(
    tryCreateDir(path),
    // forEach(saveBodyToFile),
    saveAsManifest(path, fileName)
  )(entries);
}

async function readManifestFile(path: string, fileName: string) {
  const file = await readFile(`${path}/${fileName}.json`, 'utf-8');
  return JSON.parse(file) as Manifest;
}


function tryCreateDir(path: string) {
  try {
    mkdirSync(path);
    lact('create', cc.gy(`/${pathBasename(path)}`));
    return (data: any) => data;
  }
  catch (e) {
    if ((e as Error).message.includes('EEXIST'))
      return (data: any) => data
    ;
    throw e;
  }
}


function saveAsManifest(path: string, fileName: string) {
  return (entries: CMSEntry[]) =>
    saveAsJSON(path, fileName)(entries.map(toManifestEntry))
  ;
}

export function toManifestEntry(newEntry: CMSEntry) {
  const { id, title, author, date, hash, summary } = newEntry;
  const entry: ManifestEntry = { id, title, author, summary, hash, date, };
  if (!summary) delete entry.summary;
  return entry;
}


function saveAsJSON(path: string, fileName: string) {
  return async <T>(data: T) => {
    const filePath = `${path}/${fileName}.json`;
    lact('create', `${cc.gy(`/${pathBasename(path)}/`)}${fileName}.json`);
    await writeFile(
      filePath,
      JSON.stringify(data, null, 2), { encoding: 'utf-8' }
    );
    return data;
  };
}


function detectAddedEntries(onAddEntries?: (entry: CMSEntry) => void) {
  return (oldEntries: ManifestEntry[], latestEntries: CMSEntry[]) => {
    let hasAdded = false;
    for (const newEntry of latestEntries) {
      if (!oldEntries.find(hasSameID(newEntry))) {
        lnfo('add', `${cc.gy(newEntry.hash)}/${newEntry.title}`);
        hasAdded = true;
        onAddEntries && onAddEntries(newEntry);
        // saveBodyToFile(cmsEntry);
      }
    }
    return hasAdded;
  };
}


function detectDeletedEntries(onDelete?: (newEntry: CMSEntry) => void) {
  return (oldEntries: ManifestEntry[], latestEntries: CMSEntry[]) => {
    let hasDeleted = false;
    for (const oldEntry of oldEntries) {
      if (!latestEntries.find(hasSameID(oldEntry))) {
        lwarn('omit', `${cc.gy(oldEntry.hash)}/${oldEntry.title}`);
        onDelete && onDelete(oldEntry);
        hasDeleted = true;
        // deleteFile(`${slugify(entry.title)}.mdhtml`);
      }
    }
    return hasDeleted;
  };
}


function detectUpdatedEntries(onUpdate?: (newEntry: CMSEntry) => void) {
  return (oldEntries: ManifestEntry[], latestEntries: CMSEntry[]) => {
    let hasUpdated = false;
    for (const newEntry of latestEntries) {
      const oldEntry = oldEntries.find(hasSameID(newEntry));
      if (oldEntry && oldEntry.hash != newEntry.hash) {
        lnfo('upd',
          `${cc.yw('(')}${cc.gy(`${oldEntry.hash} ${cc.yw('=>')} ${newEntry.hash}`)}`
          +`${cc.yw(')')}/${newEntry.title}`
        );
        onUpdate && onUpdate(newEntry);
        hasUpdated = true;
        // saveBodyToFile(story);
      }
    }
    return hasUpdated;
  };
}










