"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHomePage = exports.buildRed33mVideos = exports.buildLibraryVideos = exports.buildRed33mLit = exports.buildLibraryLit = exports.buildChangelog = exports.buildBlog = exports.storyBlokVersion = void 0;
const storyblok_1 = require("../services/storyblok");
const utilities_1 = require("../utilities");
const build_literature_1 = require("./build_literature");
const build_static_1 = require("./build_static");
const build_videos_1 = require("./build_videos");
exports.storyBlokVersion = ((0, utilities_1.isDev)() ? 'draft' : 'published');
const partialBuildOptions = {
    version: exports.storyBlokVersion,
    api: storyblok_1.storyBlokAPI
};
const buildBlog = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/blog',
    sort_by: 'created_at:desc',
    ...partialBuildOptions,
});
exports.buildBlog = buildBlog;
const buildChangelog = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/changelog',
    sort_by: 'created_at:desc',
    ...partialBuildOptions,
});
exports.buildChangelog = buildChangelog;
const buildLibraryLit = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/literature/public',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildLibraryLit = buildLibraryLit;
const buildRed33mLit = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/literature/red33m',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildRed33mLit = buildRed33mLit;
const buildLibraryVideos = (buildPath) => (0, build_videos_1.buildVideos)({
    buildPath,
    fileName: 'public',
    starts_with: 'page-data/videos/public',
    sort_by: 'content.timestamp:asc',
    catList_starts_with: 'utils/category-list',
    ...partialBuildOptions
});
exports.buildLibraryVideos = buildLibraryVideos;
const buildRed33mVideos = (buildPath) => (0, build_videos_1.buildVideos)({
    buildPath,
    fileName: 'red33m',
    starts_with: 'page-data/videos/red33m',
    sort_by: 'content.timestamp:asc',
    ...partialBuildOptions
});
exports.buildRed33mVideos = buildRed33mVideos;
const buildHomePage = async (path) => {
    return (0, build_static_1.buildStaticPage)({
        folderPath: path,
        pageName: 'home',
        ...partialBuildOptions
    });
};
exports.buildHomePage = buildHomePage;
