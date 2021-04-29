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
const categories = {
    'AA': 'General Spirituality (Meta-Spirituality)',
    'AB': 'Enlightenment',
    'AC': 'Religious Acceptance',
    'AD': 'Philosophical Reasoning',
    'AE': 'Reincarnation & the Soul',
    'AF': 'Paranormal Abilities',
    'AG': 'PAT (Paranormal Ability Training)',
    'AH': 'Paranormal Entities',
    'AI': 'Psychedelics',
    'AJ': 'Law of Attraction',
    'AK': 'Lifestyle Integration',
    'AL': 'Conspiracies',
};
async function buildVideoMap(cb) {
    if (!fs_1.existsSync(paths_1.default.dist.library))
        fs_1.mkdirSync(paths_1.default.dist.library);
    if (!fs_1.existsSync(paths_1.default.release.library))
        fs_1.mkdirSync(paths_1.default.release.library);
    const videos = await api_videos_1.getVideos('library/videos', 'published', 'content.category:asc');
    const categoryMap = createCategoryMap(videos);
    // Sort Videos by Ascending Date for each category
    for (const cat of categoryMap) {
        cat.videos.sort((v1, v2) => Date.parse(v1.date) - Date.parse(v2.date));
    }
    await promises_1.writeFile(`${paths_1.default.dist.library}/videos.json`, JSON.stringify(categoryMap, null, 2));
    cb();
}
exports.buildVideoMap = buildVideoMap;
function createCategoryMap(videos) {
    const categoryMap = [];
    videos.forEach(v => {
        if (!v.category)
            throw Error('Category Undefined');
        if (!isValidCategory(v.category))
            throw Error('Category Not Found');
        const catName = categories[v.category];
        const catIndex = categoryMap.findIndex(cat => cat.name == catName);
        if (!~catIndex)
            categoryMap.push({ name: catName, videos: [v] });
        else
            categoryMap[catIndex].videos.push(v);
    });
    return categoryMap;
}
const isValidCategory = (name) => !!categories[name];
