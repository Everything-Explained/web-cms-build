"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHomePage = exports.buildRed33mArchive = exports.buildRed33mVideos = exports.buildPublicVideos = exports.buildRed33mLit = exports.buildPublicLit = exports.buildChangelog = exports.buildRed33mBlog = exports.buildPublicBlog = exports.storyBlokVersion = void 0;
const storyblok_1 = require("../services/storyblok");
const utilities_1 = require("../utils/utilities");
const build_literature_1 = require("./build_literature");
const build_static_1 = require("./build_static");
const build_videos_1 = require("./build_videos");
exports.storyBlokVersion = ((0, utilities_1.isDev)() ? 'draft' : 'published');
const partialBuildOptions = {
    version: exports.storyBlokVersion,
    api: storyblok_1.storyBlokAPI
};
const buildPublicBlog = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/blog/public/',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildPublicBlog = buildPublicBlog;
const buildRed33mBlog = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/blog/red33m/',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildRed33mBlog = buildRed33mBlog;
const buildChangelog = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/changelog/',
    sort_by: 'created_at:desc',
    ...partialBuildOptions,
});
exports.buildChangelog = buildChangelog;
const buildPublicLit = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/literature/public/',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildPublicLit = buildPublicLit;
const buildRed33mLit = (buildPath) => (0, build_literature_1.buildLiterature)({
    buildPath,
    starts_with: 'page-data/literature/red33m/',
    sort_by: 'first_published_at:asc',
    ...partialBuildOptions,
});
exports.buildRed33mLit = buildRed33mLit;
const buildPublicVideos = (buildPath) => (0, build_videos_1.buildVideos)({
    buildPath,
    fileName: 'public',
    starts_with: 'page-data/videos/public/',
    sort_by: 'content.timestamp:asc',
    catList_starts_with: 'utils/category-list',
    ...partialBuildOptions
});
exports.buildPublicVideos = buildPublicVideos;
const buildRed33mVideos = (buildPath) => (0, build_videos_1.buildVideos)({
    buildPath,
    fileName: 'red33m',
    starts_with: 'page-data/videos/red33m/',
    sort_by: 'content.timestamp:asc',
    ...partialBuildOptions
});
exports.buildRed33mVideos = buildRed33mVideos;
const buildRed33mArchive = (buildPath) => (0, build_videos_1.buildVideos)({
    buildPath,
    fileName: 'red33m',
    starts_with: 'page-data/videos/red33m-archive/',
    sort_by: 'content.timestamp:asc',
    ...partialBuildOptions
});
exports.buildRed33mArchive = buildRed33mArchive;
const buildHomePage = async (path) => {
    return (0, build_static_1.buildStaticPage)({
        folderPath: path,
        pageName: 'home',
        ...partialBuildOptions
    });
};
exports.buildHomePage = buildHomePage;
