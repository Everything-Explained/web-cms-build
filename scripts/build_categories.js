"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVideoMap = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const api_videos_1 = require("../services/api_videos");
const paths_1 = __importDefault(require("../paths"));
const api_storyblok_1 = require("../services/api_storyblok");
async function buildVideoMap(cb) {
    if (!fs_1.existsSync(paths_1.default.dist.library))
        fs_1.mkdirSync(paths_1.default.dist.library);
    if (!fs_1.existsSync(paths_1.default.release.library))
        fs_1.mkdirSync(paths_1.default.release.library);
    const videos = await api_videos_1.getVideos('library/videos', 'published', 'content.category:asc');
    const categoryMap = await createCategoryMap(videos);
    // Sort Videos by Ascending Date for each category
    for (const cat of categoryMap) {
        cat.videos.sort((v1, v2) => Date.parse(v1.date) - Date.parse(v2.date));
    }
    await promises_1.writeFile(`${paths_1.default.dist.library}/videos.json`, JSON.stringify(categoryMap, null, 2));
    cb();
}
exports.buildVideoMap = buildVideoMap;
async function createCategoryMap(videos) {
    const catList = await getCategoryList();
    return videos.reduce((catMap, v) => {
        const category = catList.find(cat => cat.id == v.category);
        if (!category)
            throw Error('Category Not Found');
        const { name, desc } = category;
        const catIndex = catMap.findIndex(cat => cat.name == name);
        // We no longer need this value
        delete v.category;
        if (!~catIndex) {
            catMap.push({ name: name, description: desc, videos: [v] });
            return catMap;
        }
        catMap[catIndex].videos.push(v);
        return catMap;
    }, []);
}
async function getCategoryList() {
    const options = {
        starts_with: 'library/category-list',
        sort_by: 'created_at:asc',
        version: 'draft',
    };
    const stories = await api_storyblok_1.getStories(options);
    const table = stories[0].content.categories.tbody;
    return table.map(t => {
        return {
            name: t.body[0].value,
            id: t.body[1].value,
            desc: t.body[2].value,
        };
    });
}
