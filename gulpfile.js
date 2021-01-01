"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const build_1 = require("./build");
gulp_1.task('build', gulp_1.series(build_1.createViewDirs, build_1.bundleMDPages, build_1.copyPageData, gulp_1.parallel(build_1.compressToBrotli, build_1.compressToGzip), build_1.releasePageData));
