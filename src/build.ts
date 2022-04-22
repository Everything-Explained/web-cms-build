import paths from "../paths";
import { buildBlog, buildChangelog, buildLibraryLit, buildLibraryVideos, buildRed33mLit, buildRed33mVideos } from "./build/methods";
import { delayExec, mkDirs } from "./utilities";
import { resolve as pathResolve } from 'path';
import { mkdir, readFile } from "fs/promises";
import { BuildResult } from "./build/build_manifest";
import { existsSync, writeFileSync } from "fs";







type CMSDataVersions = {
  /** Generated after each successful build */
  build: string;
  blog: string;
  chglog: string;
  home: string;
  libLit: string;
  libVid: string;
  r3dLit: string;
  r3dVid: string;
}







const _dataRoot = pathResolve(paths.local.root);
const _versionsFileName = 'versions';



export async function buildCMSData(done: () => void) {
  console.log(`Building to: ${_dataRoot}`);
  const dataVersions = await tryGetCMSVersionFile();

  await mkdir(_dataRoot, { recursive: true });
  mkDirs([`${_dataRoot}/library`, `${_dataRoot}/red33m`, `${_dataRoot}/static`]);

  await delayExec(0)(async () => {
    dataVersions.blog =
      await execBuildData(buildBlog(`${_dataRoot}/blog`), dataVersions.blog);
  });

  delayExec(70)(async () => {
    dataVersions.chglog =
      await execBuildData(buildChangelog(`${_dataRoot}/changelog`), dataVersions.chglog);
  });

  delayExec(140)(async () => {
    dataVersions.libLit =
      await execBuildData(buildLibraryLit(`${_dataRoot}/library/literature`), dataVersions.libLit);
  });

  delayExec(210)(async () => {
    dataVersions.r3dLit =
      await execBuildData(buildRed33mLit(`${_dataRoot}/red33m/literature`), dataVersions.r3dLit);
  });

  delayExec(280)(async () => {
    dataVersions.libVid =
      await execBuildData(() => buildLibraryVideos(`${_dataRoot}/library/videos`), dataVersions.libVid);
  });

  await (await delayExec(350)(async () => {
    dataVersions.r3dVid =
      await execBuildData(() => buildRed33mVideos(`${_dataRoot}/red33m/videos`), dataVersions.r3dVid);
  }));

  dataVersions.build = Date.now().toString(16);
  saveCMSDataVersionFile(dataVersions);
  done();
}


export async function tryGetCMSVersionFile() {
  createCMSDataVersionFile();
  const file = await readFile(`${_dataRoot}/${_versionsFileName}.json`, { encoding: 'utf-8' });
  return JSON.parse(file) as CMSDataVersions;
}


export function createCMSDataVersionFile() {
  if (existsSync(`${_dataRoot}/${_versionsFileName}.json`)) return;
  writeFileSync(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify({}));
  return;
}


export function saveCMSDataVersionFile(versionData: CMSDataVersions) {
  writeFileSync(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify(versionData, null, 2));
}




async function execBuildData(buildFunc: () => BuildResult|Promise<boolean>, version: string) {
  const result = await buildFunc();
  const isUpdated =
    (typeof result == 'boolean')
      ? result
      : result[2]
  ;
  if (isUpdated) return Date.now().toString(36);
  return version;
}


