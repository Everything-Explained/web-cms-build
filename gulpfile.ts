import { task, series } from 'gulp';
import { resolve as pathResolve } from 'path';
import { buildCMSData } from './src/build';
import paths from './paths';
import { buildChangelog, buildHomePage } from './src/build/methods';



task('build', series(buildCMSData));

task('changelog', async (done) => {
  await buildChangelog(`${pathResolve(paths.local.root)}/changelog`)();
  done();
});

task('home', async (done) => {
  await buildHomePage(`${pathResolve(paths.local.root)}`);
  done();
});















