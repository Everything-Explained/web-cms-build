"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const path_1 = require("path");
const build_1 = require("./src/build");
const paths_1 = __importDefault(require("./paths"));
const methods_1 = require("./src/build/methods");
const logger_1 = require("./src/lib/logger");
const cc = logger_1.console_colors;
(0, gulp_1.task)('build', (0, gulp_1.series)(build_1.buildCMSData));
(0, gulp_1.task)('changelog', async (done) => {
    (0, logger_1.lnfo)('ENV', `StoryBlok Version: ${cc.gn(methods_1.storyBlokVersion)}`);
    await (0, methods_1.buildChangelog)(`${(0, path_1.resolve)(paths_1.default.local.root)}/changelog`)();
    done();
});
(0, gulp_1.task)('home', async (done) => {
    await (0, methods_1.buildHomePage)(`${(0, path_1.resolve)(paths_1.default.local.root)}`);
    done();
});
