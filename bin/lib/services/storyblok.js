"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._tdd_storyblok = exports.useStoryblok = exports.storyBlokAPI = void 0;
const storyblok_js_client_1 = __importDefault(require("storyblok-js-client"));
const utilities_1 = require("../utils/utilities");
const md_core_1 = require("./markdown/md_core");
const config_json_1 = __importDefault(require("../../config.json"));
const md = (0, md_core_1.useMarkdown)();
exports.storyBlokAPI = new storyblok_js_client_1.default({
    accessToken: config_json_1.default.apis.storyBlokToken,
    cache: { type: 'memory', clear: 'auto' }
});
function useStoryblok(api) {
    return {
        getCMSEntries: async (options) => {
            const stories = await getRawStories(options, api);
            return stories.map(toCMSEntry);
        },
        getCategoryList: async (options) => {
            const categoryList = await getRawStories(options, api);
            const categories = categoryList[0].content.categories;
            if (categories) {
                return categories.tbody.reduce(toCategory, []);
            }
            throw Error('No Categories Found');
        },
        getStaticPage: async (pageName, version) => {
            const story = await getRawStories({
                url: 'cdn/stories',
                starts_with: `page-data/standalone/${pageName}`,
                version,
                sort_by: 'created_at:asc',
            }, api);
            return {
                title: story[0].content.title,
                content: story[0].content.body
            };
        }
    };
}
exports.useStoryblok = useStoryblok;
function toCategory(pv, cv) {
    const [title, code, description] = cv.body;
    pv.push({
        name: title.value,
        code: code.value,
        desc: description.value
    });
    return pv;
}
async function getRawStories(opt, api) {
    const { url, starts_with, version, sort_by, page } = opt;
    const apiOptions = {
        starts_with,
        version,
        sort_by,
        page: page || 1,
        per_page: opt.per_page || 100
    };
    const sbResp = await (0, utilities_1.tryCatchAsync)(api.get(url, apiOptions));
    if (sbResp instanceof Error)
        throw Error(sbResp.message);
    let currentStories = sbResp.data.stories;
    const totalStories = [];
    while (currentStories.length) {
        totalStories.push(...currentStories);
        if (totalStories.length < apiOptions.per_page)
            break;
        apiOptions.page += 1;
        const sbResp = await api.get(url, apiOptions);
        currentStories = sbResp.data.stories;
    }
    return totalStories;
}
function toCMSEntry(story) {
    const { first_published_at, created_at } = story;
    const { title, author, summary, body, timestamp, category } = story.content;
    const categoryNone = '--';
    const cmsEntry = {
        id: story.content.id || story.id,
        title,
        author,
        date: timestamp || first_published_at || created_at,
    };
    if (summary)
        cmsEntry.summary = md.renderInline(summary);
    if (body)
        cmsEntry.body = md.render(body);
    if (category && category != categoryNone)
        cmsEntry.category = category;
    cmsEntry.hash = (0, utilities_1.toShortHash)(cmsEntry);
    return cmsEntry;
}
exports._tdd_storyblok = (0, utilities_1.setIfInDev)({
    useStoryblok,
    getRawStories,
    toCMSEntry,
});
