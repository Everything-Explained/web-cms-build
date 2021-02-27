import { task, series, parallel } from 'gulp';
import { createVideoMap } from './scripts/build_categories';
import { bundleMDPages } from './scripts/build_views';
import {
  compressFiles,
  releaseLibraryData,
  copyPageData,
  createPageDirs
} from './scripts/build';






task('build',
  series(
    createPageDirs,
    parallel(bundleMDPages, createVideoMap),
    parallel(releasePageData, releaseLibraryData)
    compressFiles,
  )
);