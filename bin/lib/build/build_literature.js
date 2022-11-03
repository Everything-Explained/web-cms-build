"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._tdd_buildLiterature = exports.buildLiterature = void 0;
const build_manifest_1 = require("./build_manifest");
const path_1 = require("path");
const logger_1 = require("../utils/logger");
const logger_2 = require("../utils/logger");
const promises_1 = require("fs/promises");
const utilities_1 = require("../utils/utilities");
function buildLiterature(options) {
    const buildOptions = {
        ...options,
        url: 'cdn/stories',
    };
    const folderPath = (0, path_1.resolve)(buildOptions.buildPath);
    buildOptions.onUpdate = saveLiterature(folderPath);
    buildOptions.onAdd = saveLiterature(folderPath);
    buildOptions.onDelete = deleteLiterature(folderPath);
    return () => (0, build_manifest_1.buildManifest)(buildOptions);
}
exports.buildLiterature = buildLiterature;
function saveLiterature(folderPath) {
    return (litEntry) => {
        (0, logger_1.lact)('create', `${logger_2.console_colors.gy('/')}` +
            `${logger_2.console_colors.gy((0, path_1.basename)(folderPath))}` +
            `${logger_2.console_colors.gy('/')}${litEntry.id}.mdhtml ${logger_2.console_colors.gy(`(${fitTitle(30)(litEntry.title)})`)}`);
        if (!litEntry.body) {
            throw Error('Literature Missing Body');
        }
        return (0, promises_1.writeFile)(`${folderPath}/${litEntry.id}.mdhtml`, litEntry.body);
    };
}
function deleteLiterature(folderPath) {
    return (litEntry) => {
        return (0, promises_1.rm)(`${folderPath}/${litEntry.id}.mdhtml`);
    };
}
function fitTitle(maxLen) {
    return (title) => {
        return ((title.length > maxLen)
            ? (0, utilities_1.truncateStr)(maxLen)(title).trim() + '...'
            : title);
    };
}
exports._tdd_buildLiterature = (0, utilities_1.setIfInDev)({
    buildLiterature,
    saveLiterature,
    deleteLiterature,
    fitTitle,
});
