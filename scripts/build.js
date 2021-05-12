"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseRed33mData = exports.releaseLibraryData = exports.copyPageData = exports.generateVersion = exports.compressFiles = exports.createPageDirs = void 0;
const gulp_1 = require("gulp");
const fs_1 = require("fs");
const gulp_changed_1 = __importDefault(require("gulp-changed"));
const gulp_gzip_1 = __importDefault(require("gulp-gzip"));
const gulp_rename_1 = __importDefault(require("gulp-rename"));
const paths_1 = __importDefault(require("../paths"));
const path_1 = require("path");
function createPageDirs(cb) {
    let path;
    for (path in paths_1.default.dist) {
        if (!fs_1.existsSync(paths_1.default.dist[path]))
            fs_1.mkdirSync(paths_1.default.dist[path]);
        if (!fs_1.existsSync(paths_1.default.release[path]))
            fs_1.mkdirSync(paths_1.default.release[path]);
    }
    cb();
}
exports.createPageDirs = createPageDirs;
function compressFiles(dev = false) {
    return function compress(cb) {
        let path;
        for (path in paths_1.default.dist) {
            if (path == 'root')
                continue;
            const destPath = dev ? paths_1.default.dev[path] : paths_1.default.release[path];
            gulp_1.src(`${paths_1.default.dist[path]}/*.json`)
                .pipe(gulp_changed_1.default(destPath, { extension: '.json.gz' }))
                .pipe(gulp_gzip_1.default({ gzipOptions: { level: 9 } }))
                .pipe(gulp_1.dest(destPath));
        }
        cb();
    };
}
exports.compressFiles = compressFiles;
function generateVersion(dev = false) {
    return function genVersion(cb) {
        const releasePath = path_1.resolve(`${dev ? paths_1.default.dev.root : paths_1.default.release.root}`, '..');
        const version = `${Date.now().toString(24)}`;
        fs_1.writeFileSync(`${releasePath}/version.json`, JSON.stringify({ version }));
        cb();
    };
}
exports.generateVersion = generateVersion;
function copyPageData() {
    return gulp_1.src(`${paths_1.default.dist.pages}/*.json`)
        .pipe(gulp_rename_1.default(path => { path.dirname = ''; }))
        .pipe(gulp_changed_1.default(paths_1.default.release.pages))
        .pipe(gulp_1.dest(paths_1.default.release.pages));
}
exports.copyPageData = copyPageData;
function releaseLibraryData() {
    return gulp_1.src(`${paths_1.default.dist.library}/*.json`)
        .pipe(gulp_changed_1.default(paths_1.default.release.library))
        .pipe(gulp_1.dest(paths_1.default.release.library));
}
exports.releaseLibraryData = releaseLibraryData;
function releaseRed33mData() {
    return gulp_1.src(`${paths_1.default.dist.red33m}/*.json`)
        .pipe(gulp_changed_1.default(paths_1.default.release.red33m))
        .pipe(gulp_1.dest(paths_1.default.release.red33m));
}
exports.releaseRed33mData = releaseRed33mData;
