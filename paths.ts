
const releaseRoot = './release/web_client/_data';
const distRoot = './dist';

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
  }
};

export = paths;