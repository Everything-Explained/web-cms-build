import bundler from '@everything_explained/web-md-bundler';
import { getBlogPosts } from '../services/api_blogposts';
import { getPages } from '../services/api_pages';
import { getVideos } from '../services/api_videos';
import paths from '../paths';
import { getLiterature } from '../services/api_literature';
import { getChangelogs } from '../services/api_changelog';



export async function bundleMDPages() {
  const posts = await getBlogPosts();
  const pages = await getPages();
  const changelogs = await getChangelogs();
  const videos = await getVideos('red33m/videos');
  const r3d_lit = await getLiterature('red33m/literature');
  const lib_lit = await getLiterature('library/literature');

  await bundler.bundlePageMaps([
    { dir: `${paths.dist.pages}/blog.json`,         pages: posts        },
    { dir: `${paths.dist.pages}/home.json`,         pages: [pages.home] },
    { dir: `${paths.dist.pages}/changelog.json`,    pages: changelogs,  },
    { dir: `${paths.dist.library}/literature.json`, pages: lib_lit      },
    { dir: `${paths.dist.red33m}/videos.json`,      pages: videos       },
    { dir: `${paths.dist.red33m}/literature.json`,  pages: r3d_lit      }
  ], 'html');
}


export async function buildChangelog() {
  const changelogs = await getChangelogs();
  await bundler.bundlePageMaps([
    { dir: `${paths.dist.pages}/changelog.json`,    pages: changelogs,  },
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