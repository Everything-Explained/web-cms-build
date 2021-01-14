"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPages = exports.mapPages = void 0;
const api_storyblok_1 = require("./api_storyblok");
function mapPages(stories) {
    const pages = {};
    stories.forEach(story => pages[story.slug] = api_storyblok_1.mapStoryDefaults(story));
    return pages;
}
exports.mapPages = mapPages;
async function getPages() {
    return new Promise((rs, rj) => {
        api_storyblok_1.blok
            .get('cdn/stories/', { version: 'published', starts_with: 'single-pages' })
            .then(res => { rs(mapPages(res.data.stories)); })
            .catch(err => rj(err));
    });
}
exports.getPages = getPages;
