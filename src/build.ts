

import paths from "../paths";
import { buildBlog, buildChangelog, buildLibraryLit, buildLibraryVideos, buildRed33mLit, buildRed33mVideos } from "./build/methods";
import { delayExec, mkDirs } from "./utilities";
import { resolve as pathResolve } from 'path';
import { mkdir, readFile } from "fs/promises";
import { BuildResult } from "./build/build_manifest";
import { existsSync, writeFileSync } from "fs";
import { CMSEntry } from "./services/storyblok";






type VersionTypes    = 'build'|'blog'|'chglog'|'home'|'libLit'|'libVid'|'r3dLit'|'r3dVid'
type CMSDataVersions = Record<VersionTypes, { v: string; n: boolean; }>;







const _dataRoot = pathResolve(paths.local.root);
const _versionsFileName = 'versions';
const _versionNames: Array<VersionTypes> = [
  'build',
  'blog',
  'chglog',
  'home',
  'libLit',
  'libVid',
  'r3dLit',
  'r3dVid',
];



export async function buildCMSData(done: () => void) {
  console.log(`Building to: ${_dataRoot}`);
  const dataVersions = await tryGetCMSVersionFile();

  await mkdir(_dataRoot, { recursive: true });
  mkDirs([`${_dataRoot}/library`, `${_dataRoot}/red33m`, `${_dataRoot}/static`]);

  await delayExec(0)(async () => {
    const [version, entries] =
      await execBuildData(buildBlog(`${_dataRoot}/blog`), dataVersions.blog.v)
    ;
    dataVersions.blog.v = version;
  });

  delayExec(70)(async () => {
    const [version, entries] =
      await execBuildData(buildChangelog(`${_dataRoot}/changelog`), dataVersions.chglog.v)
    ;
    dataVersions.chglog.v = version;
  });

  delayExec(140)(async () => {
    const [version, entries] =
      await execBuildData(buildLibraryLit(`${_dataRoot}/library/literature`), dataVersions.libLit.v)
    ;
    dataVersions.libLit.v = version;
  });

  delayExec(210)(async () => {
    const [version, entries] =
      await execBuildData(buildRed33mLit(`${_dataRoot}/red33m/literature`), dataVersions.r3dLit.v)
    ;
    dataVersions.r3dLit.v = version;
  });

  delayExec(280)(async () => {
    const [version, entries] =
      await execBuildData(() => buildLibraryVideos(`${_dataRoot}/library/videos`), dataVersions.libVid.v)
    ;
    dataVersions.libVid.v = version;
  });

  await (await delayExec(350)(async () => {
    const [version, entries] =
      await execBuildData(() => buildRed33mVideos(`${_dataRoot}/red33m/videos`), dataVersions.r3dVid.v)
    ;
    dataVersions.r3dVid.v = version;
  }));

  dataVersions.build.v = Date.now().toString(16);
  saveCMSDataVersionFile(dataVersions);
  done();
}


export async function tryGetCMSVersionFile() {
  createCMSDataVersionFile();
  const file = await readFile(`${_dataRoot}/${_versionsFileName}.json`, { encoding: 'utf-8' });
  const versionData: CMSDataVersions = JSON.parse(file);
  tryVersionPropertyUpdates(versionData);
  return versionData;
}


export function createCMSDataVersionFile() {
  if (existsSync(`${_dataRoot}/${_versionsFileName}.json`)) return;
  const emptyVersionData = _versionNames.reduce((pv, cv) => {
    pv[cv] = { v: '', n: false };
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
    versionData[name] = { v: '', n: false };
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


