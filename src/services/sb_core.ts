import { ISODateString } from "../global_interfaces";
import StoryblokClient from 'storyblok-js-client';
import config from '../../config.json';




////////////////////////////////////////////
//#region Interfaces
export type StoryVersion    = 'published'|'draft';
export type StorySortString =
   'created_at:desc'
  |'created_at:asc'
  |'content.category:asc'
  |'content.category:desc'
  |'content.timestamp:asc'
  |'content.timestamp:desc'
;
export type StoryCategoryTableBody = Array<[
  title       : { value: string },
  category    : { value: string },
  description : { value: string },
]>


export interface StoryEntry extends Story {
  content: StoryContent;
}


export interface StoryContent {
  id        ?: string;
  title      : string;
  author     : string;
  category  ?: string;
  summary   ?: string;
  body      ?: string;
  timestamp ?: ISODateString;
}


export interface StoryVideoCategories extends Story {
  content: StoryVideoCategoryTable;
}


export interface Story {
  id                 : number;
  name               : string;
  slug               : string;
  created_at         : ISODateString;
  published_at       : ISODateString|null;
  first_published_at : ISODateString|null;
}


export interface StoryVideoCategoryTable {
  categories: {
    tbody: StoryCategoryTableBody
  }
}


export interface StoryOptions {
  /** Slug pointing to CMS content */
  starts_with : string;
  sort_by     : StorySortString;
  version     : StoryVersion;
  page       ?: number;
  /** How many stories per page */
  per_page   ?: number;
}
//#endregion
///////////////////////////////////////////




const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});

export function useStoryblok() {
  return {
    get(slug: string, params?: any) {
      return blok.get(slug, params);
    }
  };
}








