"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideos = void 0;
const api_storyblok_1 = require("./api_storyblok");
async function getVideos(slug, version = 'published', sort_by = 'created_at:asc') {
    const stories = await api_storyblok_1.getStories({
        starts_with: slug,
        sort_by,
        version,
    });
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryToPage(story);
        const video = {
            ...page,
            id: story.content.id,
            date: story.content.timestamp || page.date
        };
        if (story.content.category) {
            video.category = story.content.category;
        }
        return video;
    });
}
exports.getVideos = getVideos;
