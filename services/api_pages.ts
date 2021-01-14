import { Page } from "@everything_explained/web-md-bundler/dist/core/md_page_bundler";
import { blok, mapStoryDefaults, Story } from "./api_storyblok";

interface DynamicPages {
  home: Page;
  [key: string]: Page;
}

export function mapPages(stories: Story[]) {
  const pages = {} as DynamicPages;
  stories.forEach(story => pages[story.slug] = mapStoryDefaults(story));
  return pages;
}

export async function getPages() {
  return new Promise<DynamicPages>((rs, rj) => {
    blok
      .get('cdn/stories/', { version: 'published', starts_with: 'single-pages' })
      .then(res => { rs(mapPages(res.data.stories)); })
      .catch(err => rj(err));
  });
}