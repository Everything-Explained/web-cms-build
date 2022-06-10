"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCMSDataVersionFile = exports.tryVersionPropertyUpdates = exports.tryCreateCMSDataVersionFile = exports.tryGetCMSVersionFile = exports.buildCMSData = void 0;
const paths_1 = __importDefault(require("../paths"));
const methods_1 = require("./build/methods");
const utilities_1 = require("./utilities");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const logger_1 = require("./lib/logger");
const cc = logger_1.console_colors;
const _dataRoot = (0, path_1.resolve)((0, utilities_1.isDev)() ? paths_1.default.local.root : paths_1.default.release.root);
const _versionsFileName = 'versions';
const _versionNames = [
    'build',
    'blog',
    'chglog',
    'home',
    'libLit',
    'libVid',
    'r3dLit',
    'r3dVid',
];
async function buildCMSData(done) {
    (0, logger_1.lnfo)('build', `Building to ${cc.gn(_dataRoot)}`);
    (0, logger_1.lnfo)('env', `StoryBlok Version: ${cc.gn(methods_1.storyBlokVersion)}`);
    const dataVersions = await tryGetCMSVersionFile();
    await (0, promises_1.mkdir)(_dataRoot, { recursive: true });
    (0, utilities_1.mkDirs)([
        `${_dataRoot}/literature`,
        `${_dataRoot}/literature/public`,
        `${_dataRoot}/literature/red33m`,
        `${_dataRoot}/videos`,
        `${_dataRoot}/videos/public`,
        `${_dataRoot}/videos/red33m`,
        `${_dataRoot}/standalone`
    ]);
    await (0, utilities_1.delayExec)(0)(async () => {
        const [version, entries] = await execBuildData((0, methods_1.buildBlog)(`${_dataRoot}/blog`), dataVersions.blog.v);
        dataVersions.blog.v = version;
        dataVersions.blog.n = entries[0].date;
    });
    (0, utilities_1.delayExec)(30)(async () => {
        const [version, entries] = await execBuildData((0, methods_1.buildChangelog)(`${_dataRoot}/changelog`), dataVersions.chglog.v);
        dataVersions.chglog.v = version;
        dataVersions.chglog.n = entries[0].date;
    });
    (0, utilities_1.delayExec)(60)(async () => {
        const [version, entries] = await execBuildData((0, methods_1.buildLibraryLit)(`${_dataRoot}/literature/public`), dataVersions.libLit.v);
        dataVersions.libLit.v = version;
        dataVersions.libLit.n = entries[entries.length - 1].date;
    });
    (0, utilities_1.delayExec)(120)(async () => {
        const [version, entries] = await execBuildData((0, methods_1.buildRed33mLit)(`${_dataRoot}/literature/red33m`), dataVersions.r3dLit.v);
        dataVersions.r3dLit.v = version;
        dataVersions.r3dLit.n = entries[entries.length - 1].date;
    });
    (0, utilities_1.delayExec)(150)(async () => {
        const [version, entries] = await execBuildData(() => (0, methods_1.buildLibraryVideos)(`${_dataRoot}/videos/public`), dataVersions.libVid.v);
        dataVersions.libVid.v = version;
        dataVersions.libVid.n = entries[entries.length - 1].date;
    });
    await (0, utilities_1.delayExec)(180)(async () => {
        const [version, entries] = await execBuildData(() => (0, methods_1.buildRed33mVideos)(`${_dataRoot}/videos/red33m`), dataVersions.r3dVid.v);
        dataVersions.r3dVid.v = version;
        dataVersions.r3dVid.n = entries[entries.length - 1].date;
    });
    await (await (0, utilities_1.delayExec)(210)(async () => {
        const isUpdated = await (0, methods_1.buildHomePage)(`${_dataRoot}`);
        dataVersions.home.v = isUpdated ? Date.now().toString(36) : dataVersions.home.v;
    }));
    dataVersions.build.v = Date.now().toString(16);
    saveCMSDataVersionFile(dataVersions);
    done();
}
exports.buildCMSData = buildCMSData;
async function tryGetCMSVersionFile() {
    tryCreateCMSDataVersionFile();
    const file = await (0, promises_1.readFile)(`${_dataRoot}/${_versionsFileName}.json`, { encoding: 'utf-8' });
    const versionData = JSON.parse(file);
    tryVersionPropertyUpdates(versionData);
    return versionData;
}
exports.tryGetCMSVersionFile = tryGetCMSVersionFile;
function tryCreateCMSDataVersionFile() {
    if ((0, fs_1.existsSync)(`${_dataRoot}/${_versionsFileName}.json`))
        return;
    const emptyVersionData = _versionNames.reduce((pv, cv) => {
        pv[cv] = { v: '', n: '' };
        return pv;
    }, {});
    (0, fs_1.writeFileSync)(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify(emptyVersionData));
    return;
}
exports.tryCreateCMSDataVersionFile = tryCreateCMSDataVersionFile;
function tryVersionPropertyUpdates(versionData) {
    const dataKeys = Object.keys(versionData);
    for (const key of dataKeys) {
        if (_versionNames.includes(key)) {
            continue;
        }
        delete versionData[key];
        saveCMSDataVersionFile(versionData);
    }
    for (const name of _versionNames) {
        if (versionData[name]) {
            continue;
        }
        versionData[name] = { v: '', n: '' };
        saveCMSDataVersionFile(versionData);
    }
}
exports.tryVersionPropertyUpdates = tryVersionPropertyUpdates;
function saveCMSDataVersionFile(versionData) {
    (0, fs_1.writeFileSync)(`${_dataRoot}/${_versionsFileName}.json`, JSON.stringify(versionData, null, 2));
}
exports.saveCMSDataVersionFile = saveCMSDataVersionFile;
async function execBuildData(buildFunc, version) {
    const [, entries, isUpdated] = await buildFunc();
    return [
        isUpdated ? Date.now().toString(36) : version,
        entries,
    ];
}
