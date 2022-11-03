
const releaseRoot = './release/web_client/_data';
const localReleaseRoot = '../../web-client/release/web_client/_data';
const devRoot = '../_data';

const paths = {
  release: {
    root: releaseRoot,
    pages: `${releaseRoot}/`,
    library: `${releaseRoot}/library`,
    red33m: `${releaseRoot}/red33m`,
  },
  dev: {
    root: devRoot,
    pages: `${devRoot}/`,
    library: `${devRoot}/library`,
    red33m: `${devRoot}/red33m`,
  },
  local: {
    root: localReleaseRoot,
    pages: `${localReleaseRoot}/`,
    library: `${localReleaseRoot}/library`,
    red33m: `${localReleaseRoot}/red33m`,
    utility: `${localReleaseRoot}/src/views/utility`,
    release: `${localReleaseRoot}/release/web_client/_data`,
  }
};

export = paths;

