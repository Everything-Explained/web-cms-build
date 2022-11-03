"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = exports.mkDirs = exports.delayExec = exports.isError = exports.isENOENT = exports.setIfInDev = exports.hasSameID = exports.saveAsJSON = exports.toShortHash = exports.truncateStr = exports.slugify = exports.tryCreateDir = exports.tryCatchAsync = exports.pathDirname = exports.pathResolve = exports.pathBasename = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const ramda_1 = require("ramda");
const logger_1 = require("./logger");
exports.pathBasename = path_1.basename;
exports.pathResolve = path_1.resolve;
exports.pathDirname = path_1.dirname;
async function tryCatchAsync(p) {
    try {
        const data = await p;
        return data;
    }
    catch (e) {
        return Error(e.message);
    }
}
exports.tryCatchAsync = tryCatchAsync;
function tryCreateDir(path) {
    try {
        (0, fs_1.mkdirSync)(path);
        (0, logger_1.lact)('create', logger_1.console_colors.gy(`/${(0, exports.pathBasename)(path)}`));
        return (data) => data;
    }
    catch (e) {
        if (e.message.includes('EEXIST'))
            return (data) => data;
        throw e;
    }
}
exports.tryCreateDir = tryCreateDir;
function slugify(str) {
    const slug = str
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/α/g, 'a')
        .replace(/β/g, 'b')
        .replace(/[^a-z0-9-]+/g, '')
        .replace(/[-]+/g, '-');
    if (slug.at(-1) == '-')
        return slug.slice(0, -1);
    return slug;
}
exports.slugify = slugify;
function truncateStr(to) {
    if (to <= 0) {
        throw Error('truncateStr()::can only truncate to > 0');
    }
    return (str) => str.substring(0, to);
}
exports.truncateStr = truncateStr;
function toShortHash(data) {
    const toMd4Hash = (str) => (0, crypto_1.createHmac)('md4', 'EvEx1337').update(str).digest('hex');
    return (0, ramda_1.pipe)(JSON.stringify, toMd4Hash, truncateStr(13))(data);
}
exports.toShortHash = toShortHash;
function saveAsJSON(path, fileName) {
    return async (data) => {
        const filePath = `${path}/${fileName}.json`;
        (0, logger_1.lact)('create', `${logger_1.console_colors.gy(`/${(0, exports.pathBasename)(path)}/`)}${fileName}.json`);
        await (0, promises_1.writeFile)(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
        return data;
    };
}
exports.saveAsJSON = saveAsJSON;
function hasSameID(o1) {
    return (o2) => o1.id == o2.id;
}
exports.hasSameID = hasSameID;
function setIfInDev(data) {
    return (process.env.NODE_ENV == 'production') ? null : data;
}
exports.setIfInDev = setIfInDev;
function isENOENT(err) {
    return err.message.includes('ENOENT');
}
exports.isENOENT = isENOENT;
function isError(obj) {
    return obj instanceof Error ? true : false;
}
exports.isError = isError;
function delayExec(timeInMs) {
    return (cb) => new Promise((rs) => {
        setTimeout(() => {
            rs(cb());
        }, timeInMs);
    });
}
exports.delayExec = delayExec;
function mkDirs(dirs) {
    for (const dir of dirs) {
        const fullDirPath = (0, exports.pathResolve)(dir);
        if ((0, fs_1.existsSync)(fullDirPath))
            continue;
        (0, logger_1.lact)('create', fullDirPath);
        (0, fs_1.mkdirSync)(dir);
    }
}
exports.mkDirs = mkDirs;
function isDev() {
    return process.env.NODE_ENV == 'development';
}
exports.isDev = isDev;
