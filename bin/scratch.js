"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storyblok_1 = require("./src/services/storyblok");
const sb_mock_api_1 = require("./__mocks__/fixtures/sb_mock_api");
async function test() {
    const path = './testall/home';
    const sb = (0, storyblok_1.useStoryblok)(sb_mock_api_1.mockStoryblokAPI);
    const resp = await sb.getStaticPage('static', 'draft');
    console.log(resp);
}
test();
