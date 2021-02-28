"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiterature = void 0;
const api_storyblok_1 = require("./api_storyblok");
async function getLiterature(slug, version = 'published') {
    const stories = await api_storyblok_1.getStories({
        starts_with: slug,
        sort_by: 'created_at:asc',
        version,
    });
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryToPage(story);
        return {
            ...page,
            summary: story.content.summary
        };
    });
}
exports.getLiterature = getLiterature;
