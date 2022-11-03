import { task, series } from 'gulp';
import { resolve as pathResolve } from 'path';
import { buildCMSData } from './src/lib/build';
import paths from './src/lib/utils/paths';
import { buildChangelog, buildHomePage, storyBlokVersion } from './src/lib/build_methods';
import { console_colors, lnfo } from './src/lib/utils/logger';

const cc = console_colors;

task('build', series(buildCMSData));

task('changelog', async (done) => {
  lnfo('ENV', `StoryBlok Version: ${cc.gn(storyBlokVersion)}`);
  await buildChangelog(`${pathResolve(paths.local.root)}/changelog`)();
  done();
});

task('home', async (done) => {
  await buildHomePage(`${pathResolve(paths.local.root)}`);
  done();
});











