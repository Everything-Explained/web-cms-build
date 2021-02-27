import { Page } from '@everything_explained/web-md-bundler/dist/core/md_page_bundler';
import { mkdirSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { getVideos } from '../services/api_videos';
import { dest, src } from 'gulp';
import changed from 'gulp-changed';
import gzip from 'gulp-gzip';
import paths from '../paths';

const categories: {[key: string]: string|undefined} = {
  'AA': 'General Spirituality (Meta-Spirituality)',
  'AB': 'Enlightenment',
  'AC': 'Religious Acceptance',
  'AD': 'Philosophical Reasoning',
  'AE': 'Reincarnation & the Soul',
  'AF': 'Paranormal Abilities',
  'AG': 'PAT (Paranormal Ability Training)',
  'AH': 'Paranormal Entities',
  'AI': 'Psychedelics',
  'AJ': 'Law of Attraction',
  'AK': 'Lifestyle Integration',
  'AL': 'Conspiracies',
};

function getCategoryName(category: string) {
  const cat = categories[category];
  if (!cat) throw Error('Category Not Found');
  return cat;
}

export async function createVideoMap(cb: () => void): Promise<void> {
  if (!existsSync(paths.dist.library)) mkdirSync(paths.dist.library);
  if (!existsSync(paths.release.library)) mkdirSync(paths.release.library);

  const rawVideos = await getVideos({
    starts_with: 'library/videos',
    version: 'draft',
    sort_by: 'content.category:asc',
  });

  const videoMap: {[key: string]: Page[] } = {};
  rawVideos.forEach(v => {
    const cat = getCategoryName(v.category!);
    delete v.category;
    if(!videoMap[cat]) videoMap[cat] = [];
    videoMap[cat].push(v);
  });

  // Sort Videos Descending for each category
  for (const cat in videoMap) {
    videoMap[cat].sort((v1, v2) => Date.parse(v1.date!) - Date.parse(v2.date!));
  }

  await writeFile(`${paths.dist.library}/videos.json`, JSON.stringify(videoMap, null, 2));
  cb();
}

