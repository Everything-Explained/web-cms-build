

export type ISODateString   = string;
export type StoryVersion    = 'published'|'draft';
export type StorySortString =
   'created_at:desc'
  |'created_at:asc'
  |'content.category:asc'
  |'content.category:desc'
;
export type StoryCategoryTableBody = Array<[
  title       : { value: string },
  category    : { value: string },
  description : { value: string },
]>


export interface StoryPage extends Story {
  content: StoryContent;
}


export interface StorySimplePage extends StoryContent {
  id: string|number;
  date: ISODateString;
}


export interface StoryVideoCategories extends Story {
  content: StoryVideoCategoryTable;
}


export interface Story {
  id                 : number;
  name               : string;
  created_at         : ISODateString;
  published_at       : ISODateString|null;
  first_published_at : ISODateString|null;
}


export interface StoryContent {
  title    : string;
  author   : string;
  summary? : string;
  body     : string;
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
}








