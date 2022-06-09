"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._tdd_buildManifest = exports.buildManifest = void 0;
const promises_1 = require("fs/promises");
const ramda_1 = require("ramda");
const path_1 = require("path");
const logger_1 = require("../lib/logger");
const utilities_1 = require("../utilities");
const storyblok_1 = require("../services/storyblok");
async function buildManifest(opts) {
    const { url, api, starts_with, sort_by, version } = opts;
    opts.buildPath = (0, path_1.resolve)(opts.buildPath);
    opts.manifestName ??= (0, path_1.basename)(opts.buildPath);
    opts.canSave ??= true;
    opts.isHashManifest ??= false;
    const internalOptions = opts;
    internalOptions.isInit = false;
    const cmsOptions = { url, starts_with, sort_by, version, };
    const latestEntries = await (0, storyblok_1.useStoryblok)(api).getCMSEntries(cmsOptions);
    const oldEntries = await getManifestEntries(latestEntries, internalOptions);
    const detectionFuncs = [
        detectAddedEntries(opts.onAdd),
        detectUpdatedEntries(opts.onUpdate),
        detectDeletedEntries(opts.onDelete),
    ];
    const hasUpdatedEntries = detectionFuncs.map(f => f(oldEntries, latestEntries)).includes(true);
    let manifest = oldEntries;
    if (hasUpdatedEntries && opts.canSave) {
        manifest = latestEntries.map(opts.isHashManifest ? toHashManifestEntry : toManifestEntry);
        await (0, utilities_1.saveAsJSON)(opts.buildPath, opts.manifestName)(manifest);
    }
    return [
        (0, path_1.join)(opts.buildPath, `/${opts.manifestName}.json`),
        latestEntries,
        internalOptions.isInit || hasUpdatedEntries
    ];
}
exports.buildManifest = buildManifest;
async function getManifestEntries(latestEntries, opts) {
    const { buildPath, manifestName } = opts;
    const accessResponse = await (0, utilities_1.tryCatchAsync)((0, promises_1.stat)(`${buildPath}/${manifestName}.json`));
    const isFileENOENT = (0, ramda_1.is)(Error)(accessResponse) && (0, utilities_1.isENOENT)(accessResponse);
    return isFileENOENT
        ? await initManifest(latestEntries, opts)
        : await readManifestFile(buildPath, manifestName);
}
function initManifest(entries, opts) {
    const { buildPath, manifestName, onAdd, canSave } = opts;
    if (canSave == undefined || canSave) {
        opts.isInit = true;
        (0, utilities_1.tryCreateDir)(opts.buildPath);
    }
    if (onAdd) {
        entries.forEach(onAdd);
    }
    const manifest = entries.map(opts.isHashManifest ? toHashManifestEntry : toManifestEntry);
    return (canSave == undefined || canSave
        ? (0, utilities_1.saveAsJSON)(buildPath, manifestName)(manifest)
        : Promise.resolve(manifest));
}
async function readManifestFile(path, fileName) {
    const file = await (0, promises_1.readFile)(`${path}/${fileName}.json`, 'utf-8');
    return JSON.parse(file);
}
function toManifestEntry(newEntry) {
    const { id, title, author, date, hash, summary, category } = newEntry;
    const entry = {
        id,
        title,
        author,
        summary,
        category,
        hash,
        date,
    };
    return entry;
}
function toHashManifestEntry(newEntry) {
    const { id, title, hash } = newEntry;
    const entry = {
        id, title, hash,
    };
    return entry;
}
function detectAddedEntries(onAddEntries) {
    return (oldEntries, latestEntries) => {
        let hasAdded = false;
        for (const newEntry of latestEntries) {
            if (!oldEntries.find((0, utilities_1.hasSameID)(newEntry))) {
                (0, logger_1.lnfo)('add', `${logger_1.console_colors.gy(newEntry.hash)}/${newEntry.title}`);
                onAddEntries && onAddEntries(newEntry);
                hasAdded = true;
            }
        }
        return hasAdded;
    };
}
function detectDeletedEntries(onDelete) {
    return (oldEntries, latestEntries) => {
        let hasDeleted = false;
        for (const oldEntry of oldEntries) {
            if (!latestEntries.find((0, utilities_1.hasSameID)(oldEntry))) {
                (0, logger_1.lwarn)('omit', `${logger_1.console_colors.gy(oldEntry.hash)}/${oldEntry.title}`);
                onDelete && onDelete(oldEntry);
                hasDeleted = true;
            }
        }
        return hasDeleted;
    };
}
function detectUpdatedEntries(onUpdate) {
    return (oldEntries, latestEntries) => {
        let hasUpdated = false;
        for (const latestEntry of latestEntries) {
            const oldEntry = oldEntries.find((0, utilities_1.hasSameID)(latestEntry));
            if (oldEntry && oldEntry.hash != latestEntry.hash) {
                (0, logger_1.lnfo)('upd', `${logger_1.console_colors.yw('(')}${logger_1.console_colors.gy(`${oldEntry.hash} ${logger_1.console_colors.yw('=>')} ${latestEntry.hash}`)}`
                    + `${logger_1.console_colors.yw(')')}/${latestEntry.title}`);
                onUpdate && onUpdate(latestEntry);
                hasUpdated = true;
            }
        }
        return hasUpdated;
    };
}
exports._tdd_buildManifest = (0, utilities_1.setIfInDev)({
    buildManifest,
    getManifestEntries,
    initManifest,
    readManifestFile,
    tryCreateDir: utilities_1.tryCreateDir,
    toManifestEntry,
    toHashManifestEntry,
    saveAsJSON: utilities_1.saveAsJSON,
    detectAddedEntries,
    detectDeletedEntries,
    detectUpdatedEntries,
});
