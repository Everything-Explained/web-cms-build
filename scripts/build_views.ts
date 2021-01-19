import gzip from 'gulp-gzip';
import changed from 'gulp-changed';
// import { constants } from 'zlib';
import { src, dest } from 'gulp';
import rename from 'gulp-rename';
import bundler from '@everything_explained/web-md-bundler';
import { mkdirSync, existsSync } from 'fs';
import { getBlogPosts } from '../services/api_blogposts';
import { getPages } from '../services/api_pages';
import { getVideos } from '../services/api_videos';
import paths from '../paths';



export function createPageDirs(cb: () => void) {
  if (!existsSync(paths.dist.root)) mkdirSync(paths.dist.root);
  if (!existsSync(paths.dist.pages)) mkdirSync(paths.dist.pages);
  if (!existsSync(paths.release.root)) mkdirSync(paths.release.root);
  if (!existsSync(paths.release.pages)) mkdirSync(paths.release.pages);
  cb();
}


export async function bundleMDPages() {
  const posts = await getBlogPosts();
  const pages = await getPages();
  const videos = await getVideos({
    starts_with: 'red33m',
    version: 'draft',
    sort_by: 'created_at:asc'
  }, 'plain');
  await bundler.bundlePageMaps([
    { dir: `${paths.dist.pages}/blog.json`, pages: posts },
    { dir: `${paths.dist.pages}/home.json`, pages: [pages.home] },
    { dir: `${paths.dist.pages}/red33m.json`, pages: videos }
  ], 'html');
}


export function releasePageData() {
  return src(`${paths.dist.pages}/*.json`)
    .pipe(rename(path => { path.dirname = ''; }))
    .pipe(changed(paths.release.pages))
    .pipe(dest(paths.release.pages));
}


export function compressToGzip() {
  return src(`${paths.dist.pages}/*.json`)
    .pipe(changed(paths.release.pages, { extension: `.json.gz`}))
    .pipe(gzip({ gzipOptions: { level: 9 }}))
    .pipe(dest(paths.release.pages));
}


// export function compressToBrotli() {
//   return src(`${distDir}/*.json`)
//     .pipe(changed(releaseDir, { extension: '.json.br'}))
//     .pipe(brotli.compress({
//       extension: 'br',
//       params: {
//         [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY
//       }
//     }))
//     .pipe(dest(releaseDir));
// }