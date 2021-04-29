import { Page } from '@everything_explained/web-md-bundler/dist/core/md_page_bundler';
import { mkdirSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { getVideos, Video } from '../services/api_videos';
import paths from '../paths';



interface CategoryMap {
  name: string,
  videos: Page[]
}

const categories: {[key: string]: string} = {
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




export async function buildVideoMap(cb: () => void): Promise<void> {
  if (!existsSync(paths.dist.library)) mkdirSync(paths.dist.library);
  if (!existsSync(paths.release.library)) mkdirSync(paths.release.library);

  const videos      = await getVideos('library/videos', 'published', 'content.category:asc');
  const categoryMap = createCategoryMap(videos);

  // Sort Videos by Ascending Date for each category
  for (const cat of categoryMap) {
    cat.videos.sort((v1, v2) => Date.parse(v1.date!) - Date.parse(v2.date!));
  }

  await writeFile(`${paths.dist.library}/videos.json`, JSON.stringify(categoryMap, null, 2));
  cb();
}


function createCategoryMap(videos: Video[]) {
  const categoryMap: CategoryMap[] = [];

  videos.forEach(v => {
    if (!v.category)                  throw Error('Category Undefined');
    if (!isValidCategory(v.category)) throw Error('Category Not Found')
    ;
    const catName  = categories[v.category];
    const catIndex = categoryMap.findIndex(cat => cat.name == catName)
    ;
    if (!~catIndex) categoryMap.push({ name: catName, videos: [v] });
    else categoryMap[catIndex].videos.push(v);
  });

  return categoryMap;
}


const isValidCategory = (name: string) => !!categories[name];


