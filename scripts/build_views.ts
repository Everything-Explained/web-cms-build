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
import { getLiterature } from '../services/api_literature';



export async function bundleMDPages() {
  const posts = await getBlogPosts();
  const pages = await getPages();
  const videos = await getVideos('red33m/videos');
  const literature = await getLiterature('red33m/literature', 'draft');

  await bundler.bundlePageMaps([
    { dir: `${paths.dist.pages}/blog.json`, pages: posts },
    { dir: `${paths.dist.pages}/home.json`, pages: [pages.home] },
    { dir: `${paths.dist.red33m}/videos.json`, pages: videos },
    { dir: `${paths.dist.red33m}/literature.json`, pages: literature }
  ], 'html');
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