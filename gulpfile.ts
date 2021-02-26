import { task, series, parallel } from 'gulp';
import { compressLibraryData, createVideoMap, releaseLibraryData } from './scripts/build_categories';
import { bundleMDPages, compressToGzip, createPageDirs, releasePageData } from './scripts/build_views';






task('build',
  series(
    createPageDirs,
    parallel(bundleMDPages, createVideoMap),
    parallel(compressToGzip, compressLibraryData),
    parallel(releasePageData, releaseLibraryData)
  )
);