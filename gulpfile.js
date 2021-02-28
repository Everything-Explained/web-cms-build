"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const build_categories_1 = require("./scripts/build_categories");
const build_views_1 = require("./scripts/build_views");
const build_1 = require("./scripts/build");
gulp_1.task('build', gulp_1.series(build_1.createPageDirs, gulp_1.parallel(build_views_1.bundleMDPages, build_categories_1.createVideoMap), build_1.compressFiles, gulp_1.parallel(build_1.copyPageData, build_1.releaseLibraryData, build_1.releaseRed33mData)));
