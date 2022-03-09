import { readFile, open, stat }  from 'fs/promises';
import { pipe, is, both, forEach }  from "ramda";
import { ISODateString }                from "./global_interfaces";
import { basename as pathBasename, resolve as pathResolve, join as pathJoin } from 'path';
import { console_colors as cc, lnfo, lwarn } from "./lib/logger";
import { hasSameID, isENOENT, saveAsJSON, setIfInDev, tryCatchAsync, tryCreateDir } from "./utilities";
import { CMSEntry, CMSOptions, StoryblokAPI, StorySortString, StoryVersion, useStoryblok } from './services/storyblok';



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


export interface BuildOptions {
  /** CDN Root Slug */
  url           : string;
  starts_with   : string;
  version       : StoryVersion;
  sort_by       : StorySortString;
  /** Path to build manifest */
  buildPath     : string;
  /** Will overwrite default manifest file name. */
  manifestName? : string;
  /** Storyblok API Object or Mock API Object */
  api           : StoryblokAPI;
  /** Saves the manifest. Default: **true** */
  canSave?         : boolean;
  /** Callback when an entry has been deleted. */
  onDelete?     : (entry: CMSEntry) => void;
  /** Callback when an entry has been updated. */
  onUpdate?     : (entry: CMSEntry) => void;
  /** Callback when an entry has been Added. */
  onAdd?        : (entry: CMSEntry) => void;
}

export interface BuildOptionsInternal extends BuildOptions {
  /** Set as the default manifest file name. */
  manifestName: string;
}

type BuildResult = Promise<[filePath: string, latestEntries: CMSEntry[], hasUpdated: boolean]>;




export async function buildManifest(opts: BuildOptions): BuildResult {
  const { url, api, starts_with, sort_by, version } = opts;
  opts.buildPath      = pathResolve(opts.buildPath);
  opts.manifestName ??= pathBasename(opts.buildPath);
  opts.canSave         ??= true;

  const cmsOptions: CMSOptions = { url, starts_with, sort_by, version, };

  const latestEntries  = await useStoryblok(api).getCMSEntries(cmsOptions);
  const oldEntries     = await getManifestEntries(latestEntries, opts as BuildOptionsInternal);
  const detectionFuncs = [
    detectAddedEntries(opts.onAdd),
    detectUpdatedEntries(opts.onUpdate),
    detectDeletedEntries(opts.onDelete),
  ];

  const hasUpdatedEntries = detectionFuncs.map(f => f(oldEntries, latestEntries)).includes(true);
  let manifest            = oldEntries;

  if (hasUpdatedEntries && opts.canSave) {
    manifest = latestEntries.map(toManifestEntry);
    await saveAsJSON(opts.buildPath, opts.manifestName)(manifest);
  }

  return [pathJoin(opts.buildPath, `/${opts.manifestName}.json`), manifest, hasUpdatedEntries];
}


async function getManifestEntries(latestEntries: CMSEntry[], opts: BuildOptionsInternal) {
  const { buildPath, manifestName} = opts;
  const accessResponse = await tryCatchAsync(stat(`${buildPath}/${manifestName}.json`));
  const isFileENOENT = is(Error)(accessResponse) && isENOENT(accessResponse);

  return isFileENOENT
    ? await initManifest(latestEntries, opts)
    : await readManifestFile(buildPath, manifestName)
  ;
}


function initManifest(entries: CMSEntry[], opts: BuildOptionsInternal) {
  const { buildPath, manifestName, onAdd, canSave } = opts;
  tryCreateDir(opts.buildPath);
  if (onAdd) {
    entries.forEach(onAdd);
  }
  const manifest = entries.map(toManifestEntry);
  return (
    canSave == undefined || canSave
      ? saveAsJSON(buildPath, manifestName)(manifest)
      : Promise.resolve(manifest)
  );
}


async function readManifestFile(path: string, fileName: string) {
  const file = await readFile(`${path}/${fileName}.json`, 'utf-8');
  return JSON.parse(file) as Manifest;
}


// todo - make sure all properties are tested
export function toManifestEntry(newEntry: CMSEntry) {
  const { id, title, author, date, hash, summary, category } = newEntry;
  const entry: ManifestEntry = {
    id,
    title,
    author,
    summary,
    category,
    hash,
    date,
  };
  return entry;
}


function detectAddedEntries(onAddEntries?: (entry: CMSEntry) => void) {
  return (oldEntries: ManifestEntry[], latestEntries: CMSEntry[]) => {
    let hasAdded = false;
    for (const newEntry of latestEntries) {
      if (!oldEntries.find(hasSameID(newEntry))) {
        lnfo('add', `${cc.gy(newEntry.hash)}/${newEntry.title}`);
        onAddEntries && onAddEntries(newEntry);
        hasAdded = true;
        // saveBodyToFile(cmsEntry);
      }
    }
    return hasAdded;
  };
}


function detectDeletedEntries(onDelete?: (oldEntry: CMSEntry) => void) {
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


function detectUpdatedEntries(onUpdate?: (updatedEntry: CMSEntry) => void) {
  return (oldEntries: ManifestEntry[], latestEntries: CMSEntry[]) => {
    let hasUpdated = false;
    for (const latestEntry of latestEntries) {
      const oldEntry = oldEntries.find(hasSameID(latestEntry));
      if (oldEntry && oldEntry.hash != latestEntry.hash) {
        lnfo('upd',
          `${cc.yw('(')}${cc.gy(`${oldEntry.hash} ${cc.yw('=>')} ${latestEntry.hash}`)}`
          +`${cc.yw(')')}/${latestEntry.title}`
        );
        onUpdate && onUpdate(latestEntry);
        hasUpdated = true;
        // saveBodyToFile(story);
      }
    }
    return hasUpdated;
  };
}







export const _tdd_buildManifest = setIfInDev({
  buildManifest,
  getManifestEntries,
  initManifest,
  readManifestFile,
  tryCreateDir,
  toManifestEntry,
  saveAsJSON,
  detectAddedEntries,
  detectDeletedEntries,
  detectUpdatedEntries,
});










