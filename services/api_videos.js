"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideos = void 0;
/* eslint-disable no-constant-condition */
const md_page_bundler_1 = __importDefault(require("@everything_explained/web-md-bundler/dist/core/md_page_bundler"));
const api_storyblok_1 = require("./api_storyblok");
function mapVideos(stories, renderType = 'MD') {
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryDefaults(story);
        const video = {
            ...page,
            content: (page.content && renderType == 'MD')
                ? md_page_bundler_1.default.renderMDStr(page.content)
                : page.content,
            id: story.content.id,
            date: story.content.timestamp || page.date
        };
        if (story.content.category) {
            video.category = story.content.category;
        }
        return video;
    });
}
async function getVideos(options, renderType = 'MD') {
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
            return mapVideos(allStories, renderType);
        }
    }
    catch (err) {
        throw Error(err);
    }
}
exports.getVideos = getVideos;
