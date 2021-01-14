"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogPosts = void 0;
const api_storyblok_1 = require("./api_storyblok");
function mapBlogPosts(stories) {
    return stories.map(story => {
        const page = api_storyblok_1.mapStoryDefaults(story);
        page.summary = story.content.summary;
        page.header_image = story.content.image_header.filename || null;
        return page;
    });
}
async function getBlogPosts() {
    return new Promise((rs, rj) => {
        api_storyblok_1.blok
            .get('cdn/stories/', { version: 'published', starts_with: 'blog/' })
            .then(res => { rs(mapBlogPosts(res.data.stories)); })
            .catch(err => rj(err));
    });
}
exports.getBlogPosts = getBlogPosts;
