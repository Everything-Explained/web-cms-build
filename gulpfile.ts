import { task, series, parallel } from 'gulp';
import { createVideoMap } from './scripts/build_categories';
import { bundleMDPages } from './scripts/build_views';
import {
  compressFiles,
  releaseLibraryData,
  copyPageData,
  releaseRed33mData,
  createPageDirs,
  generateVersion
} from './scripts/build';







task('build',
  series(
    parallel(createPageDirs, generateVersion),
    parallel(bundleMDPages, createVideoMap),
    compressFiles,
    parallel(copyPageData, releaseLibraryData, releaseRed33mData)
  )
);