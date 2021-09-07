

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
  content: CMSContent;
}


export interface CMSData extends CMSContent {
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


export interface CMSContent {
  title      : string;
  author     : string;
  summary   ?: string;
  body      ?: string;
  /** Story ID or Custom ID */
  id        ?: string|number;
  /** Video Category */
  category  ?: string;
  /** Video Timestamp */
  timestamp ?: ISODateString;
  /**
   * Should default to the most relevant date
   * property of the content
   */
  date      ?: ISODateString;
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
  /** How many stories per page */
  per_page   ?: number;
}








