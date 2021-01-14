"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressToGzip = exports.releasePageData = exports.bundleMDPages = exports.createPageDirs = void 0;
const gulp_gzip_1 = __importDefault(require("gulp-gzip"));
const gulp_changed_1 = __importDefault(require("gulp-changed"));
// import { constants } from 'zlib';
const gulp_1 = require("gulp");
const gulp_rename_1 = __importDefault(require("gulp-rename"));
const web_md_bundler_1 = __importDefault(require("@everything_explained/web-md-bundler"));
const fs_1 = require("fs");
const config_json_1 = __importDefault(require("../config.json"));
const api_blogposts_1 = require("../services/api_blogposts");
const api_pages_1 = require("../services/api_pages");
const api_videos_1 = require("../services/api_videos");
const paths = config_json_1.default.paths;
function createPageDirs(cb) {
    if (!fs_1.existsSync(paths.dist.root))
        fs_1.mkdirSync(paths.dist.root);
    if (!fs_1.existsSync(paths.dist.pages))
        fs_1.mkdirSync(paths.dist.pages);
    if (!fs_1.existsSync(paths.release.pages))
        fs_1.mkdirSync(paths.release.pages);
    cb();
}
exports.createPageDirs = createPageDirs;
async function bundleMDPages() {
    const posts = await api_blogposts_1.getBlogPosts();
    const pages = await api_pages_1.getPages();
    const videos = await api_videos_1.getVideos({
        starts_with: 'red33m',
        version: 'draft',
        sort_by: 'created_at:asc'
    });
    await web_md_bundler_1.default.bundlePageMaps([
        { dir: `${paths.dist.pages}/blog.json`, pages: posts },
        { dir: `${paths.dist.pages}/home.json`, pages: [pages.home] },
        { dir: `${paths.dist.pages}/red33m.json`, pages: videos }
    ], 'html');
}
exports.bundleMDPages = bundleMDPages;
function releasePageData() {
    return gulp_1.src(`${paths.dist.pages}/*.json`)
        .pipe(gulp_rename_1.default(path => { path.dirname = ''; }))
        .pipe(gulp_changed_1.default(paths.release.pages))
        .pipe(gulp_1.dest(paths.release.pages));
}
exports.releasePageData = releasePageData;
function compressToGzip() {
    return gulp_1.src(`${paths.dist.pages}/*.json`)
        .pipe(gulp_changed_1.default(paths.release.pages, { extension: `.json.gz` }))
        .pipe(gulp_gzip_1.default({ gzipOptions: { level: 9 } }))
        .pipe(gulp_1.dest(paths.release.pages));
}
exports.compressToGzip = compressToGzip;
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
