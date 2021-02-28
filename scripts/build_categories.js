"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoMap = void 0;
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
function getCategoryName(category) {
    const cat = categories[category];
    if (!cat)
        throw Error('Category Not Found');
    return cat;
}
async function createVideoMap(cb) {
    if (!fs_1.existsSync(paths_1.default.dist.library))
        fs_1.mkdirSync(paths_1.default.dist.library);
    if (!fs_1.existsSync(paths_1.default.release.library))
        fs_1.mkdirSync(paths_1.default.release.library);
    const rawVideos = await api_videos_1.getVideos('library/videos', 'published', 'content.category:asc');
    const videoMap = {};
    rawVideos.forEach(v => {
        const cat = getCategoryName(v.category);
        delete v.category;
        if (!videoMap[cat])
            videoMap[cat] = [];
        videoMap[cat].push(v);
    });
    // Sort Videos Descending for each category
    for (const cat in videoMap) {
        videoMap[cat].sort((v1, v2) => Date.parse(v1.date) - Date.parse(v2.date));
    }
    await promises_1.writeFile(`${paths_1.default.dist.library}/videos.json`, JSON.stringify(videoMap, null, 2));
    cb();
}
exports.createVideoMap = createVideoMap;
