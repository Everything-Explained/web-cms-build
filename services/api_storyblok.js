"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStoryDefaults = exports.blok = void 0;
const storyblok_js_client_1 = __importDefault(require("storyblok-js-client"));
const config_json_1 = __importDefault(require("../config.json"));
exports.blok = new storyblok_js_client_1.default({
    accessToken: config_json_1.default.apis.storyBlokToken,
    cache: { type: 'memory', clear: 'auto' }
});
function mapStoryDefaults(story) {
    const c = story.content;
    return {
        title: c.title,
        author: c.author,
        content: c.body,
        id: story.id,
        date: story.first_published_at ?? story.created_at
    };
}
exports.mapStoryDefaults = mapStoryDefaults;
