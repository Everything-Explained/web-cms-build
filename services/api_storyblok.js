"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStories = exports.mapStoryToPage = exports.blok = void 0;
/* eslint-disable no-constant-condition */
const storyblok_js_client_1 = __importDefault(require("storyblok-js-client"));
const config_json_1 = __importDefault(require("../config.json"));
exports.blok = new storyblok_js_client_1.default({
    accessToken: config_json_1.default.apis.storyBlokToken,
    cache: { type: 'memory', clear: 'auto' }
});
function mapStoryToPage(story) {
    const c = story.content;
    return {
        title: c.title,
        author: c.author,
        content: c.body,
        id: story.id,
        date: story.content.date ?? story.first_published_at ?? story.created_at
    };
}
exports.mapStoryToPage = mapStoryToPage;
async function getStories(options) {
    const stories = [];
    let i = 1;
    while (true) {
        const batch = await exports.blok.get('cdn/stories/', { per_page: 100,
            page: i++,
            ...options });
        if (batch.data.stories.length) {
            stories.push(...batch.data.stories);
            continue;
        }
        if (!stories.length)
            throw Error('No Literature');
        return stories;
    }
}
exports.getStories = getStories;
