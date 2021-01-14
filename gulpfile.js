"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const build_categories_1 = require("./scripts/build_categories");
const build_views_1 = require("./scripts/build_views");
gulp_1.task('build', gulp_1.series(build_views_1.createPageDirs, gulp_1.parallel(build_views_1.bundleMDPages, build_categories_1.createVideoMap), gulp_1.parallel(build_views_1.compressToGzip, build_categories_1.compressLibraryData), gulp_1.parallel(build_views_1.releasePageData, build_categories_1.releaseLibraryData)));
