"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChangelog = exports.bundleMDPages = void 0;
const web_md_bundler_1 = __importDefault(require("@everything_explained/web-md-bundler"));
const api_blogposts_1 = require("../services/api_blogposts");
const api_pages_1 = require("../services/api_pages");
const api_videos_1 = require("../services/api_videos");
const paths_1 = __importDefault(require("../paths"));
const api_literature_1 = require("../services/api_literature");
const api_changelog_1 = require("../services/api_changelog");
async function bundleMDPages() {
    const posts = await api_blogposts_1.getBlogPosts();
    const pages = await api_pages_1.getPages();
    const changelogs = await api_changelog_1.getChangelogs();
    const videos = await api_videos_1.getVideos('red33m/videos');
    const r3d_lit = await api_literature_1.getLiterature('red33m/literature');
    const lib_lit = await api_literature_1.getLiterature('library/literature');
    await web_md_bundler_1.default.bundlePageMaps([
        { dir: `${paths_1.default.dist.pages}/blog.json`, pages: posts },
        { dir: `${paths_1.default.dist.pages}/home.json`, pages: [pages.home] },
        { dir: `${paths_1.default.dist.pages}/changelog.json`, pages: changelogs, },
        { dir: `${paths_1.default.dist.library}/literature.json`, pages: lib_lit },
        { dir: `${paths_1.default.dist.red33m}/videos.json`, pages: videos },
        { dir: `${paths_1.default.dist.red33m}/literature.json`, pages: r3d_lit }
    ], 'html');
}
exports.bundleMDPages = bundleMDPages;
async function buildChangelog() {
    const changelogs = await api_changelog_1.getChangelogs();
    await web_md_bundler_1.default.bundlePageMaps([
        { dir: `${paths_1.default.dist.pages}/changelog.json`, pages: changelogs, },
    ], 'html');
}
exports.buildChangelog = buildChangelog;
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
