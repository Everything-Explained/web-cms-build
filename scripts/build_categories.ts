import { Page } from '@everything_explained/web-md-bundler/dist/core/md_page_bundler';
import { mkdirSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { getVideos, Video } from '../services/api_videos';
import paths from '../paths';
import { getStories, StoryblokOptions, StoryCategories } from '../services/api_storyblok';



interface CategoryMap {
  name: string;
  description: string;
  videos: Page[];
}


export async function buildVideoMap(cb: () => void): Promise<void> {
  if (!existsSync(paths.dist.library)) mkdirSync(paths.dist.library);
  if (!existsSync(paths.release.library)) mkdirSync(paths.release.library);

  const videos      = await getVideos('library/videos', 'published', 'content.category:asc');
  const categoryMap = await createCategoryMap(videos);

  // Sort Videos by Ascending Date for each category
  for (const cat of categoryMap) {
    cat.videos.sort((v1, v2) => Date.parse(v1.date!) - Date.parse(v2.date!));
  }

  await writeFile(`${paths.dist.library}/videos.json`, JSON.stringify(categoryMap, null, 2));
  cb();
}


async function createCategoryMap(videos: Video[]) {
  const catList = await getCategoryList()
  ;
  return videos.reduce((catMap, v) => {
    const category = catList.find(cat => cat.id == v.category);
    if (!category) throw Error('Category Not Found');

    const {name, desc} = category;
    const catIndex = catMap.findIndex(cat => cat.name == name);
    // We no longer need this value
    delete v.category;

    if (!~catIndex) {
      catMap.push({ name: name, description: desc, videos: [v] });
      return catMap;
    }
    catMap[catIndex].videos.push(v);
    return catMap;
  }, [] as CategoryMap[]);
}


async function getCategoryList() {
  const options: StoryblokOptions = {
    starts_with: 'library/category-list',
    sort_by: 'created_at:asc',
    version: 'draft',
  };
  const stories = await getStories<StoryCategories>(options);
  const table = stories[0].content.categories.tbody;
  return table.map(t => {
    return {
      name : t.body[0].value,
      id   : t.body[1].value,
      desc : t.body[2].value,
    };
  });
}
