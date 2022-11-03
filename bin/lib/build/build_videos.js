"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._tdd_buildVideos = exports.buildVideos = void 0;
const build_manifest_1 = require("./build_manifest");
const storyblok_1 = require("../services/storyblok");
const utilities_1 = require("../utils/utilities");
const path_1 = require("path");
async function buildVideos(options) {
    const buildOptions = {
        ...options,
        url: 'cdn/stories',
        manifestName: `${options.fileName}Manifest`,
        isHashManifest: true,
    };
    const [filePath, entries, isUpdated] = await (0, build_manifest_1.buildManifest)(buildOptions);
    const saveVideos = (0, utilities_1.saveAsJSON)((0, path_1.dirname)(filePath), options.fileName);
    if (!isUpdated)
        return [filePath, entries, false];
    if (options.catList_starts_with) {
        const sb = (0, storyblok_1.useStoryblok)(options.api);
        buildOptions.starts_with = options.catList_starts_with;
        buildOptions.version = 'draft';
        const categoryList = await sb.getCategoryList(buildOptions);
        saveVideos(createVideoCategories(entries, categoryList));
    }
    else {
        saveVideos(entries.map(toVideoEntry));
    }
    return [filePath, entries, true];
}
exports.buildVideos = buildVideos;
function createVideoCategories(videos, categoryList) {
    const categories = {};
    let processedVideoCount = 0;
    for (const cat of categoryList) {
        const filteredVideos = videos.filter(v => v.category == cat.code);
        if (!filteredVideos.length)
            continue;
        const { name, desc } = cat;
        if (!categories[name]) {
            categories[name] = { desc, videos: [] };
        }
        processedVideoCount += filteredVideos.length;
        categories[name].videos.push(...filteredVideos.map(toVideoEntry));
    }
    if (processedVideoCount != videos.length) {
        throw Error('Detected Unknown or Missing Categories');
    }
    return objectToArray(categories);
}
function objectToArray(obj) {
    const objArray = [];
    for (const key in obj) {
        objArray.push({ name: key, ...obj[key] });
    }
    return objArray;
}
function toVideoEntry(entry) {
    const { id, title, author, summary, date } = entry;
    return {
        id, title, author, summary, date
    };
}
exports._tdd_buildVideos = (0, utilities_1.setIfInDev)({
    buildVideos,
    createVideoCategories,
    toVideoEntry,
});
