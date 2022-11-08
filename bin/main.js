#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const fs_1 = require("fs");
const build_1 = require("./lib/build");
const logger_1 = require("./lib/utils/logger");
const utilities_1 = require("./lib/utils/utilities");
function build(rootPath, destPath) {
    (0, build_1.buildCMSData)(validatePaths(rootPath, destPath));
}
exports.build = build;
if (process.argv.length > 2) {
    if (process.argv[2] == '-s') {
        runAsCmdLine();
    }
    else {
        (0, logger_1.lwarn)('ERROR', 'To run script on cmd line, you need to include "-s" flag');
        process.exit(1);
    }
}
function runAsCmdLine() {
    const [, , , rootPath, destPath] = process.argv;
    if (!rootPath || !destPath) {
        throw Error('Missing either the root path or destination path argument');
    }
    (0, build_1.buildCMSData)(validatePaths(rootPath, destPath));
}
function validatePaths(rootPath, destPath) {
    const validRootPath = (0, utilities_1.pathResolve)(rootPath);
    const validDestPath = (0, utilities_1.pathResolve)(destPath);
    if (!(0, fs_1.existsSync)(rootPath)) {
        throw Error(`Path: "${validRootPath}" does not exist`);
    }
    if (!destPath.includes(rootPath)) {
        throw Error(`Root path does not intersect destination path: \nRoot: "${validRootPath}"\nDest: "${validDestPath}"`);
    }
    return validDestPath;
}
