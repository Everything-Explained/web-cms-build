import { dest, src } from "gulp";
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import changed from "gulp-changed";
import gzip from "gulp-gzip";
import rename from "gulp-rename";
import paths from "../paths";
import { resolve as pathResolve } from 'path';



export function createPageDirs(cb: () => void) {
  let path: keyof typeof paths.dist;
  for (path in paths.dist) {
    if (!existsSync(paths.dist[path])) mkdirSync(paths.dist[path]);
    if (!existsSync(paths.release[path])) mkdirSync(paths.release[path]);
  }
  cb();
}


export function compressFiles(dev = false) {
  return function compress(cb: () => void) {
    let path: keyof typeof paths.dist;
    for (path in paths.dist) {
      if (path == 'root') continue;
      const destPath = dev ? paths.dev[path] : paths.release[path];
      src(`${paths.dist[path]}/*.json`)
        .pipe(changed(destPath, { extension: '.json.gz' }))
        .pipe(gzip({ gzipOptions: { level: 9 }}))
        .pipe(dest(destPath));
    }
    cb();
  };
}


export function generateVersion(dev = false) {
  return function genVersion(cb: () => void) {
    const releasePath =
      pathResolve(`${dev ? paths.dev.root : paths.release.root}`, '..')
    ;
    const version = `${Date.now().toString(24)}`;
    writeFileSync(`${releasePath}/version.txt`, version);
    cb();
  };
}


export function copyPageData() {
  return src(`${paths.dist.pages}/*.json`)
    .pipe(rename(path => { path.dirname = ''; }))
    .pipe(changed(paths.release.pages))
    .pipe(dest(paths.release.pages));
}


export function releaseLibraryData() {
  return src(`${paths.dist.library}/*.json`)
    .pipe(changed(paths.release.library))
    .pipe(dest(paths.release.library));
}


export function releaseRed33mData() {
  return src(`${paths.dist.red33m}/*.json`)
    .pipe(changed(paths.release.red33m))
    .pipe(dest(paths.release.red33m));
}