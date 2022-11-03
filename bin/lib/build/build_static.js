"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStaticPage = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const logger_1 = require("../utils/logger");
const md_core_1 = require("../services/markdown/md_core");
const storyblok_1 = require("../services/storyblok");
const utilities_1 = require("../utils/utilities");
const cc = logger_1.console_colors;
const md = (0, md_core_1.useMarkdown)();
async function buildStaticPage(options) {
    const path = (0, utilities_1.pathResolve)(options.folderPath);
    const filePath = (0, utilities_1.pathResolve)(`${path}/standalone/${options.pageName}.json`);
    const cmsStaticContent = await (0, storyblok_1.useStoryblok)(options.api).getStaticPage(options.pageName, 'draft');
    const fileResponse = await (0, utilities_1.tryCatchAsync)((0, promises_1.readFile)(filePath, { encoding: 'utf-8' }));
    const cmsContentHash = (0, utilities_1.toShortHash)(cmsStaticContent);
    const newStaticContent = {
        title: cmsStaticContent.title,
        content: md.render(cmsStaticContent.content),
        hash: cmsContentHash
    };
    if ((0, utilities_1.isError)(fileResponse)) {
        const dirPath = (0, utilities_1.pathDirname)(filePath);
        if (!(0, fs_1.existsSync)((0, utilities_1.pathDirname)(dirPath))) {
            throw Error(`buildStatic::CANNOT FIND PATH::${(0, utilities_1.pathDirname)(dirPath)}`);
        }
        (0, logger_1.lact)('create', `${filePath}`);
        await (0, promises_1.writeFile)(filePath, JSON.stringify(newStaticContent));
        return true;
    }
    const page = JSON.parse(fileResponse);
    if (cmsContentHash != page.hash) {
        (0, logger_1.lact)('upd', `Static ${cc.gn(options.pageName.toUpperCase())} page`);
        await (0, promises_1.writeFile)(filePath, JSON.stringify(newStaticContent));
        return true;
    }
    return false;
}
exports.buildStaticPage = buildStaticPage;
