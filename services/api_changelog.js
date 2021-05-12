"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangelogs = void 0;
const api_storyblok_1 = require("./api_storyblok");
async function getChangelogs() {
    const stories = await api_storyblok_1.getStories({
        starts_with: 'changelog',
        version: 'published',
        sort_by: 'created_at:desc',
    });
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryToPage(story);
        return {
            ...page,
            summary: story.content.summary,
            version: story.content.version,
        };
    });
}
exports.getChangelogs = getChangelogs;
