"use strict";
const releaseRoot = './release/web_client/_data';
const distRoot = './dist';
const devRoot = '../web-client/release/web_client/_data';
const paths = {
    release: {
        root: releaseRoot,
        pages: `${releaseRoot}/`,
        library: `${releaseRoot}/library`,
        red33m: `${releaseRoot}/red33m`,
    },
    dist: {
        root: distRoot,
        pages: `${distRoot}/`,
        library: `${distRoot}/library`,
        red33m: `${distRoot}/red33m`,
    },
    dev: {
        root: devRoot,
        pages: `${devRoot}/`,
        library: `${devRoot}/library`,
        red33m: `${devRoot}/red33m`,
        utility: `${devRoot}/src/views/utility`,
        release: `${devRoot}/release/web_client/_data`,
    }
};
module.exports = paths;
