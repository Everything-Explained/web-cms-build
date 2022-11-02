

import { ISODateString } from "../global_interfaces";
import StoryblokClient, { StoryblokResult } from 'storyblok-js-client';
import { setIfInDev, toShortHash, tryCatchAsync } from "../utilities";
import { useMarkdown } from "./markdown/md_core";
import config from '../config.json';







//##################################
//#region Types and Interfaces
interface InternalStoryOptions {
  /** Slug pointing to CMS content */
  starts_with : string;
  sort_by     : StorySortString;
  version     : StoryVersion;
  page        : number;
  /** Utilized in **mocks only** */
  per_page    : number;
}

export type StoryVersion    = 'published'|'draft';
export type StorySortString =
   'created_at:desc'
  |'created_at:asc'
  |'first_published_at:asc'
  |'first_published_at:desc'
  |'content.category:asc'
  |'content.category:desc'
  |'content.timestamp:asc'
  |'content.timestamp:desc'
;
export type StoryCategoryTableBody = [
  title       : { value: string },
  code        : { value: string },
  description : { value: string },
]

export type StoryCategory = {
  name : string,
  code  : string,
  desc  : string,
}

export interface Story {
  id                 : number;
  name               : string;
  slug               : string;
  created_at         : ISODateString;
  published_at       : ISODateString|null;
  first_published_at : ISODateString|null;
}

export interface StoryEntry extends Story {
  content: StoryContent;
}

export interface StoryContent {
  id?         : string;
  title       : string;
  author      : string;
  category?   : string;
  summary?    : string;
  body?       : string;
  categories? : { tbody: { body: StoryCategoryTableBody }[] };
  timestamp?  : ISODateString;
}

export interface StoryVideoCategories extends Story {
  content: StoryVideoCategoryTable;
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
  page?       : number;
  /** Utilized in **mocks only** */
  per_page?   : number;
}

export interface CMSOptions extends StoryOptions {
  url         : string; // cdn/stories/
}

export interface PartialCMSEntry {
  id             : string|number;
  title          : string;
  author         : string;
  summary?       : string;
  body?          : string;
  categoryTable? : StoryCategoryTableBody[];
  /** Video Category */
  category?      : string;
  /** A Hash of all the Entry's data, excluding this property. */
  hash?          : string;
  /** Defaults to the most relevant date property of the content */
  date           : ISODateString;
}

export interface CMSEntry extends PartialCMSEntry {
  readonly id       : string|number;
  readonly title    : string;
  readonly author   : string;
  readonly summary? : string;
  readonly body?    : string;
  category?         : string;
  hash              : string;
  readonly date     : ISODateString;
}

type MockStoryBlokAPI = {
  get: (slug: string, params: StoryOptions) => Promise<StoryblokResult>
}

export type StoryblokAPI = MockStoryBlokAPI|StoryblokClient;
//#endregion
//##################################







const md = useMarkdown();

export const storyBlokAPI = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


export function useStoryblok(api: StoryblokAPI) {
  return {
    getCMSEntries: async (options: CMSOptions) => {
      const stories = await getRawStories(options, api);
      return stories.map(toCMSEntry);
    },
    getCategoryList: async (options: CMSOptions) => {
      const categoryList = await getRawStories(options, api);
      const categories = categoryList[0].content.categories;
      if (categories) {
        return categories.tbody.reduce(toCategory, []);
      }
      throw Error('No Categories Found');
    },
    getStaticPage: async (pageName: string, version: StoryVersion) => {
      const story = await getRawStories({
        url: 'cdn/stories',
        starts_with: `page-data/standalone/${pageName}`,
        version,
        sort_by: 'created_at:asc',
      }, api);

      return {
        title: story[0].content.title,
        content: story[0].content.body!
      };
    }
  };
}

function toCategory(pv: StoryCategory[], cv: { body: StoryCategoryTableBody }) {
  const [title, code, description] = cv.body;
  pv.push({
    name: title.value,
    code: code.value,
    desc: description.value
  } as StoryCategory);
  return pv;
}


async function getRawStories(opt: CMSOptions, api: StoryblokAPI): Promise<StoryEntry[]> {
  const { url, starts_with, version, sort_by, page } = opt;
  const apiOptions: InternalStoryOptions = {
    starts_with,
    version,
    sort_by,
    page: page || 1,
    per_page: opt.per_page || 100
  };

  const sbResp = await tryCatchAsync(api.get(url, apiOptions));
  if (sbResp instanceof Error) throw Error(sbResp.message);

  let currentStories: StoryEntry[] = sbResp.data.stories;
  const totalStories: StoryEntry[] = [];

  while (currentStories.length) {
    totalStories.push(...currentStories);
    //* Prevent excess requests
    //! An extra request WILL happen when length == per_page
    if (totalStories.length < apiOptions.per_page) break;
    apiOptions.page += 1;
    const sbResp = await api.get(url, apiOptions);
    currentStories = sbResp.data.stories;
  }
  // We want our build process to fail if stories can't be found
  if (!totalStories.length)
    throw Error(`Missing Stories From "${starts_with}"`)
  ;
  return totalStories;
}


function toCMSEntry(story: StoryEntry): CMSEntry {
  const { first_published_at, created_at } = story;
  const { title, author, summary, body, timestamp, category } = story.content;
  const categoryNone = '--';
  const cmsEntry: PartialCMSEntry = {
    id: story.content.id || story.id, // Videos have content.id
    title,
    author,
    date: timestamp || first_published_at || created_at,
  };
  if (summary)
    cmsEntry.summary = md.renderInline(summary)
  ;
  if (body)
    cmsEntry.body = md.render(body)
  ;
  if (category && category != categoryNone)
    cmsEntry.category = category
  ;
  cmsEntry.hash = toShortHash(cmsEntry);
  return cmsEntry as CMSEntry;
}


export const _tdd_storyblok = setIfInDev({
  useStoryblok,
  getRawStories,
  toCMSEntry,
});








