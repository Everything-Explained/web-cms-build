"use strict";
const releaseRoot = './release/web_client/_data';
const distRoot = './dist';
const paths = {
    release: {
        root: releaseRoot,
        pages: `${releaseRoot}/pages`,
        library: `${releaseRoot}/library`
    },
    dist: {
        root: distRoot,
        pages: `${distRoot}/pages`,
        library: `${distRoot}/library`
    }
};
module.exports = paths;
