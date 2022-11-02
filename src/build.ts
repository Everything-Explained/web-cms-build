

import paths from "../paths";
import { buildChangelog, buildHomePage, buildLibraryLit, buildLibraryVideos, buildPublicBlog, buildRed33mLit, buildRed33mVideos, storyBlokVersion } from "./lib/build_methods";
import { delayExec, isDev, mkDirs } from "./lib/utilities";
import { resolve as pathResolve } from 'path';
import { mkdir, readFile } from "fs/promises";
import { BuildResult } from "./lib/build_manifest";
import { existsSync, writeFileSync } from "fs";
import { CMSEntry } from "./lib/services/storyblok";
import { ISODateString } from "./lib/global_interfaces";
import { console_colors, lnfo } from "./lib/logger";






type VersionTypes    = 'build'|'pubBlog'|'r3dBlog'|'chglog'|'home'|'libLit'|'libVid'|'r3dLit'|'r3dVid'
type CMSDataVersions = Record<VersionTypes, { v: string; n: ISODateString; }>;







const cc = console_colors;
const _dataRoot = pathResolve(isDev() ? paths.local.root : paths.release.root);
const _versionsFileName = 'versions';
const _versionNames: Array<VersionTypes> = [
  'build',
  'pubBlog',
  'r3dBlog',
  'chglog',
  'home',
  'libLit',
  'libVid',
  'r3dLit',
  'r3dVid',
];



export async function buildCMSData(done: () => void) {
  lnfo('build', `Building to ${cc.gn(_dataRoot)}`);
  lnfo('env', `StoryBlok Version: ${cc.gn(storyBlokVersion)}`);
  const dataVersions = await tryGetCMSVersionFile();

  await mkdir(_dataRoot, { recursive: true });
  mkDirs([
    `${_dataRoot}/blog`,
    `${_dataRoot}/blog/public`,
    `${_dataRoot}/blog/red33m`,
    `${_dataRoot}/literature`,
    `${_dataRoot}/literature/public`,
    `${_dataRoot}/literature/red33m`,
    `${_dataRoot}/videos`,
    `${_dataRoot}/videos/public`,
    `${_dataRoot}/videos/red33m`,
    `${_dataRoot}/standalone`
  ]);

  await delayExec(0)(async () => {
    const [version, entries] =
      await execBuildData(buildPublicBlog(`${_dataRoot}/blog/public`), dataVersions.pubBlog.v)
    ;
    dataVersions.pubBlog.v = version;
    dataVersions.pubBlog.n = entries[0].date;
  });

  await delayExec(15)(async () => {
    const [version, entries] =
      await execBuildData(buildPublicBlog(`${_dataRoot}/blog/red33m`), dataVersions.r3dBlog.v)
    ;
    dataVersions.r3dBlog.v = version;
    dataVersions.r3dBlog.n = entries[0].date;
  });

  delayExec(30)(async () => {
    const [version, entries] =
      await execBuildData(buildChangelog(`${_dataRoot}/changelog`), dataVersions.chglog.v)
    ;
    dataVersions.chglog.v = version;
    dataVersions.chglog.n = entries[0].date;
  });

  delayExec(60)(async () => {
    const [version, entries] =
      await execBuildData(buildLibraryLit(`${_dataRoot}/literature/public`), dataVersions.libLit.v)
    ;
    dataVersions.libLit.v = version;
    dataVersions.libLit.n = entries[entries.length - 1].date;
  });

  delayExec(120)(async () => {
    const [version, entries] =
      await execBuildData(buildRed33mLit(`${_dataRoot}/literature/red33m`), dataVersions.r3dLit.v)
    ;
    dataVersions.r3dLit.v = version;
    dataVersions.r3dLit.n = entries[entries.length - 1].date;
  });

  delayExec(150)(async () => {
    const [version, entries] =
      await execBuildData(() => buildLibraryVideos(`${_dataRoot}/videos/public`), dataVersions.libVid.v)
    ;
    dataVersions.libVid.v = version;
    dataVersions.libVid.n = entries[entries.length - 1].date;
  });

  await delayExec(180)(async () => {
    const [version, entries] =
      await execBuildData(() => buildRed33mVideos(`${_dataRoot}/videos/red33m`), dataVersions.r3dVid.v)
    ;
    dataVersions.r3dVid.v = version;
    dataVersions.r3dVid.n = entries[entries.length - 1].date;
  });

  await (await delayExec(210)(async () => {
    const isUpdated = await buildHomePage(`${_dataRoot}`);
    dataVersions.home.v = isUpdated ? Date.now().toString(36) : dataVersions.home.v;
  }));

  dataVersions.build.v = Date.now().toString(16);
  saveCMSDataVersionFile(dataVersions);
  done();
}


export async function tryGetCMSVersionFile() {
  tryCreateCMSDataVersionFile();
  const file = await readFile(`${_dataRoot}/${_versionsFileName}.json`, { encoding: 'utf-8' });
  const versionData: CMSDataVersions = JSON.parse(file);
  tryVersionPropertyUpdates(versionData);
  return versionData;
}


export function tryCreateCMSDataVersionFile() {
  if (existsSync(`${_dataRoot}/${_versionsFileName}.json`)) return;
  const emptyVersionData = _versionNames.reduce((pv, cv) => {
    pv[cv] = { v: '', n: '' };
    return pv;
  }, {} as CMSDataVersions);
  writeFileSync(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify(emptyVersionData));
  return;
}


/** Mutates version data with any property changes discovered. */
export function tryVersionPropertyUpdates(versionData: CMSDataVersions) {
  const dataKeys = Object.keys(versionData) as Array<keyof CMSDataVersions>;

  // Remove deleted/missing versions
  for (const key of dataKeys) {
    if (_versionNames.includes(key)) {
      continue;
    }
    delete versionData[key];
    saveCMSDataVersionFile(versionData);
  }

  // Add new versions
  for (const name of _versionNames) {
    if (versionData[name]) {
      continue;
    }
    versionData[name] = { v: '', n: '' };
    saveCMSDataVersionFile(versionData);
  }
}


export function saveCMSDataVersionFile(versionData: CMSDataVersions) {
  writeFileSync(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify(versionData, null, 2));
}




async function execBuildData(buildFunc: () => BuildResult, version: string): Promise<[version: string, entries: CMSEntry[]]> {
  const [,entries,isUpdated] = await buildFunc();

  return [
    isUpdated ? Date.now().toString(36) : version,
    entries,
  ];
}


