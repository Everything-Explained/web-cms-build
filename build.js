"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releasePageData = exports.compressToGzip = exports.compressToBrotli = exports.copyPageData = exports.bundleMDPages = exports.createViewDirs = void 0;
const gulp_gzip_1 = __importDefault(require("gulp-gzip"));
const gulp_changed_1 = __importDefault(require("gulp-changed"));
const gulp_brotli_1 = __importDefault(require("gulp-brotli"));
const zlib_1 = require("zlib");
const gulp_1 = require("gulp");
const gulp_rename_1 = __importDefault(require("gulp-rename"));
const web_md_bundler_1 = __importDefault(require("@everything_explained/web-md-bundler"));
const api_storyblok_1 = require("./api_storyblok");
const fs_1 = require("fs");
const distDir = './dist';
const releaseDir = './release/web_client/_data';
const views = ['home', 'blog', 'red33m'];
const compressedDirs = [];
function createViewDirs(cb) {
    for (const view of views) {
        const dir = `./views/${view}`;
        if (fs_1.existsSync(dir))
            continue;
        fs_1.mkdirSync(dir, { recursive: true });
    }
    cb();
}
exports.createViewDirs = createViewDirs;
async function bundleMDPages() {
    const posts = await api_storyblok_1.getBlogPosts();
    const singlePages = await api_storyblok_1.getSinglePages();
    const videos = await api_storyblok_1.getVideos();
    await web_md_bundler_1.default.bundlePageMaps([
        { dir: './views/blog', pages: posts },
        { dir: './views/home', pages: [singlePages.home] },
        { dir: './views/red33m', pages: videos }
    ], 'html');
}
exports.bundleMDPages = bundleMDPages;
function copyPageData() {
    return gulp_1.src('./views/**/*.json')
        .pipe(gulp_rename_1.default(path => { path.dirname = ''; }))
        .pipe(gulp_changed_1.default(`${distDir}`))
        .pipe(gulp_1.dest(`${distDir}`));
}
exports.copyPageData = copyPageData;
function compressToBrotli() {
    return gulp_1.src(`${distDir}/*.json`)
        .pipe(gulp_changed_1.default(releaseDir, { extension: '.json.br' }))
        .pipe(gulp_brotli_1.default.compress({
        extension: 'br',
        params: {
            [zlib_1.constants.BROTLI_PARAM_QUALITY]: zlib_1.constants.BROTLI_MAX_QUALITY
        }
    }))
        .pipe(gulp_1.dest(releaseDir));
}
exports.compressToBrotli = compressToBrotli;
function compressToGzip() {
    return gulp_1.src(`${distDir}/*.json`)
        .pipe(gulp_changed_1.default(releaseDir, { extension: `.json.gz` }))
        .pipe(gulp_gzip_1.default({ append: true, gzipOptions: { level: 9 } }))
        .pipe(gulp_1.dest(releaseDir));
}
exports.compressToGzip = compressToGzip;
function releasePageData() {
    return gulp_1.src(`${distDir}/**`)
        .pipe(gulp_changed_1.default(releaseDir))
        .pipe(gulp_1.dest(releaseDir));
}
exports.releasePageData = releasePageData;
