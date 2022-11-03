

import paths from "./utils/paths";
import { buildChangelog, buildHomePage, buildPublicLit, buildPublicVideos, buildPublicBlog, buildRed33mBlog, buildRed33mLit, buildRed33mVideos, storyBlokVersion } from "./build/build_methods";
import { isDev, mkDirs } from "./utils/utilities";
import { resolve as pathResolve } from 'path';
import { mkdir, readFile } from "fs/promises";
import { BuildResult } from "./build/build_manifest";
import { existsSync, writeFileSync } from "fs";
import { CMSEntry } from "./services/storyblok";
import { ISODateString } from "./utils/global_interfaces";
import { console_colors, lact, lnfo } from "./utils/logger";






type VersionTypes    = 'build'|'pubBlog'|'r3dBlog'|'chglog'|'home'|'pubLit'|'pubVid'|'r3dLit'|'r3dVid'
type CMSDataVersions = Record<VersionTypes, { v: string; n: ISODateString; }>;







const cc = console_colors;
const _dataRoot = pathResolve(isDev() ? paths.release.root : paths.local.root);
const _versionsFileName = 'versions';
const _versionNames: Array<VersionTypes> = [
  'build',
  'pubBlog',
  'r3dBlog',
  'chglog',
  'home',
  'pubLit',
  'pubVid',
  'r3dLit',
  'r3dVid',
];

type BuilderData = Array<{
  path: string;
  dataKey: VersionTypes;
  order: 'asc'|'desc';
  buildFn: (buildPath: string) => () => BuildResult;
}>


export async function buildCMSData(done: () => void) {
  lnfo('build', `Building to ${cc.gn(_dataRoot)}`);
  lnfo('env', `StoryBlok Version: ${cc.gn(storyBlokVersion)}`);
  const dataVersions = await tryGetCMSVersionFile();
  await createDirs(_dataRoot);

  for (const builder of getBuilders(_dataRoot)) {
    const { path, dataKey, buildFn, order } = builder;
    const versionObj = dataVersions[dataKey];
    lact('PARSING', `${cc.gn(dataKey)}`);
    const [version, entries] = await execBuildData(buildFn(path), versionObj.v);
    versionObj.v = version;
    versionObj.n = order == 'desc' ? entries[0].date : entries[entries.length - 1].date;
  }

  const isUpdated = await buildHomePage(`${_dataRoot}`);
  dataVersions.home.v = isUpdated ? Date.now().toString(36) : dataVersions.home.v;

  dataVersions.build.v = Date.now().toString(16);
  saveCMSDataVersionFile(dataVersions);
  done();
}

async function createDirs(rootDir: string) {
  await mkdir(rootDir, { recursive: true });
  mkDirs([
    `${rootDir}/blog`,
    `${rootDir}/blog/public`,
    `${rootDir}/blog/red33m`,
    `${rootDir}/literature`,
    `${rootDir}/literature/public`,
    `${rootDir}/literature/red33m`,
    `${rootDir}/videos`,
    `${rootDir}/videos/public`,
    `${rootDir}/videos/red33m`,
    `${rootDir}/standalone`
  ]);
}

function getBuilders(rootPath: string) {
  const builders: BuilderData = [
    {
      path: `${rootPath}/blog/public`,
      dataKey: 'pubBlog',
      order: 'desc',
      buildFn: buildPublicBlog
    },
    {
      path: `${rootPath}/blog/red33m`,
      dataKey: 'r3dBlog',
      order: 'desc',
      buildFn: buildRed33mBlog
    },
    {
      path: `${rootPath}/changelog`,
      dataKey: 'chglog',
      order: 'desc',
      buildFn: buildChangelog
    },
    {
      path: `${rootPath}/literature/public`,
      dataKey: 'pubLit',
      order: 'asc',
      buildFn: buildPublicLit
    },
    {
      path: `${rootPath}/literature/red33m`,
      dataKey: 'r3dLit',
      order: 'asc',
      buildFn: buildRed33mLit
    },
    {
      path: `${rootPath}/videos/public`,
      dataKey: 'pubVid',
      order: 'asc',
      buildFn: (buildPath: string) => () => buildPublicVideos(buildPath)
    },
    {
      path: `${rootPath}/videos/red33m`,
      dataKey: 'r3dVid',
      order: 'asc',
      buildFn: (buildPath: string) => () => buildRed33mVideos(buildPath)
    },
  ];
  return builders;
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


