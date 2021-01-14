"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideos = void 0;
const api_storyblok_1 = require("./api_storyblok");
function mapVideos(stories) {
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryDefaults(story);
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
async function getVideos(options) {
    try {
        const allStories = [];
        let i = 1;
        while (true) {
            const stories = await api_storyblok_1.blok.get('cdn/stories/', { per_page: 100, page: i++, ...options });
            if (stories.data.stories.length) {
                allStories.push(...stories.data.stories);
                continue;
            }
            if (!allStories.length)
                throw Error('No Videos');
            return mapVideos(allStories);
        }
    }
    catch (err) {
        throw Error(err);
    }
}
exports.getVideos = getVideos;
