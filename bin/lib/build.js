"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCMSDataVersionFile = exports.tryVersionPropertyUpdates = exports.tryCreateCMSDataVersionFile = exports.tryGetCMSVersionFile = exports.buildCMSData = void 0;
const build_methods_1 = require("./build/build_methods");
const utilities_1 = require("./utils/utilities");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const logger_1 = require("./utils/logger");
const cc = logger_1.console_colors;
const _versionsFileName = 'versions';
const _versionNames = [
    'build',
    'pubBlog',
    'r3dBlog',
    'chglog',
    'home',
    'pubLit',
    'pubVid',
    'r3dLit',
    'r3dVid',
];
async function buildCMSData(rootDir) {
    (0, logger_1.lnfo)('build', `Building to ${cc.gn(rootDir)}`);
    (0, logger_1.lnfo)('env', `StoryBlok Version: ${cc.gn(build_methods_1.storyBlokVersion)}`);
    await createDirs(rootDir);
    const dataVersions = await tryGetCMSVersionFile(rootDir);
    for (const builder of getBuilders(rootDir)) {
        const { path, dataKey, buildFn, order } = builder;
        const versionObj = dataVersions[dataKey];
        (0, logger_1.lact)('PARSING', `${cc.gn(dataKey)}`);
        const [version, entries] = await execBuildData(buildFn(path), versionObj.v);
        versionObj.v = version;
        versionObj.n = order == 'desc' ? entries[0].date : entries[entries.length - 1].date;
    }
    const isUpdated = await (0, build_methods_1.buildHomePage)(`${rootDir}`);
    dataVersions.home.v = isUpdated ? Date.now().toString(36) : dataVersions.home.v;
    dataVersions.build.v = Date.now().toString(16);
    saveCMSDataVersionFile(dataVersions, rootDir);
}
exports.buildCMSData = buildCMSData;
async function createDirs(rootDir) {
    await (0, promises_1.mkdir)(rootDir, { recursive: true });
    (0, utilities_1.mkDirs)([
        `${rootDir}/blog`,
        `${rootDir}/blog/public`,
        `${rootDir}/blog/red33m`,
        `${rootDir}/literature`,
        `${rootDir}/literature/public`,
        `${rootDir}/literature/red33m`,
        `${rootDir}/videos`,
        `${rootDir}/videos/public`,
        `${rootDir}/videos/red33m`,
        `${rootDir}/standalone`
    ]);
}
function getBuilders(rootPath) {
    const builders = [
        {
            path: `${rootPath}/blog/public`,
            dataKey: 'pubBlog',
            order: 'desc',
            buildFn: build_methods_1.buildPublicBlog
        },
        {
            path: `${rootPath}/blog/red33m`,
            dataKey: 'r3dBlog',
            order: 'desc',
            buildFn: build_methods_1.buildRed33mBlog
        },
        {
            path: `${rootPath}/changelog`,
            dataKey: 'chglog',
            order: 'desc',
            buildFn: build_methods_1.buildChangelog
        },
        {
            path: `${rootPath}/literature/public`,
            dataKey: 'pubLit',
            order: 'asc',
            buildFn: build_methods_1.buildPublicLit
        },
        {
            path: `${rootPath}/literature/red33m`,
            dataKey: 'r3dLit',
            order: 'asc',
            buildFn: build_methods_1.buildRed33mLit
        },
        {
            path: `${rootPath}/videos/public`,
            dataKey: 'pubVid',
            order: 'asc',
            buildFn: (buildPath) => () => (0, build_methods_1.buildPublicVideos)(buildPath)
        },
        {
            path: `${rootPath}/videos/red33m`,
            dataKey: 'r3dVid',
            order: 'asc',
            buildFn: (buildPath) => () => (0, build_methods_1.buildRed33mVideos)(buildPath)
        },
    ];
    return builders;
}
async function tryGetCMSVersionFile(rootDir) {
    tryCreateCMSDataVersionFile(rootDir);
    const file = await (0, promises_1.readFile)(`${rootDir}/${_versionsFileName}.json`, { encoding: 'utf-8' });
    const versionData = JSON.parse(file);
    tryVersionPropertyUpdates(versionData, rootDir);
    return versionData;
}
exports.tryGetCMSVersionFile = tryGetCMSVersionFile;
function tryCreateCMSDataVersionFile(rootDir) {
    if ((0, fs_1.existsSync)(`${rootDir}/${_versionsFileName}.json`))
        return;
    const emptyVersionData = _versionNames.reduce((pv, cv) => {
        pv[cv] = { v: '', n: '' };
        return pv;
    }, {});
    (0, fs_1.writeFileSync)(`${rootDir}/${_versionsFileName}.json`, JSON.stringify(emptyVersionData));
    return;
}
exports.tryCreateCMSDataVersionFile = tryCreateCMSDataVersionFile;
function tryVersionPropertyUpdates(versionData, rootDir) {
    const dataKeys = Object.keys(versionData);
    for (const key of dataKeys) {
        if (_versionNames.includes(key)) {
            continue;
        }
        delete versionData[key];
        saveCMSDataVersionFile(versionData, rootDir);
    }
    for (const name of _versionNames) {
        if (versionData[name]) {
            continue;
        }
        versionData[name] = { v: '', n: '' };
        saveCMSDataVersionFile(versionData, rootDir);
    }
}
exports.tryVersionPropertyUpdates = tryVersionPropertyUpdates;
function saveCMSDataVersionFile(versionData, rootDir) {
    (0, fs_1.writeFileSync)(`${rootDir}/${_versionsFileName}.json`, JSON.stringify(versionData, null, 2));
}
exports.saveCMSDataVersionFile = saveCMSDataVersionFile;
async function execBuildData(buildFunc, version) {
    const [, entries, isUpdated] = await buildFunc();
    return [
        isUpdated ? Date.now().toString(36) : version,
        entries,
    ];
}
