/* eslint-disable no-constant-condition */
import StoryblokClient from 'storyblok-js-client';
import { Page } from '@everything_explained/web-md-bundler/dist/core/md_page_bundler';
import config from '../config.json';



export type ISODateString   = string;
export type StoryVersion    = 'published'|'draft';
export type StorySortString =
   'created_at:desc'
  |'created_at:asc'
  |'content.category:asc'
  |'content.category:desc'
;

export interface RawStory {
  id                  : number;
  name                : string;
  slug                : string;
  created_at          : ISODateString;
  published_at?       : ISODateString;
  first_published_at? : ISODateString;
}


export interface StoryPage extends RawStory {
  content: StoryPageContent;
}
export interface StoryPageContent {
  title: string;
  author: string;
  body: string;
  date?: ISODateString;
}

export interface StoryCategories extends RawStory {
  content: StoryCategoryTable;
}

export interface StoryCategoryTable {
  categories: {
    tbody: {
      body: { value: string }[]
    }[]
  }
}


export interface StoryblokOptions {
  /** Full Slug pointing to CMS content */
  starts_with : string;
  sort_by     : StorySortString;
  version     : StoryVersion;
}


export const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


export function mapStoryToPage(story: StoryPage) {
  const c = story.content;
  return {
    title   : c.title,
    author  : c.author,
    content : c.body,
    id      : story.id,
    date    : story.content.date ?? story.first_published_at ?? story.created_at
  } as Page;
}


export async function getStories<T = StoryPage>(options: StoryblokOptions) {
  const stories = [];
  let i = 1;
  while (true) {
    const batch = await blok.get(
        'cdn/stories/',
        { per_page: 100, // 100 is max allowed
          page: i++,
          ...options }
    );

    if (batch.data.stories.length) {
      stories.push(...batch.data.stories);
      continue;
    }

    if (!stories.length) throw Error(`Missing Stories::${options.starts_with}`);
    return stories as T[];
  }
}