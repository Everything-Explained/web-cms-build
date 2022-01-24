import { ISODateString } from "../global_interfaces";
import StoryblokClient, { StoryblokResult } from 'storyblok-js-client';
import config from '../../config.json';
import { setIfInDev, toShortHash } from "../utilities";
import { useMarkdown } from "./markdown/md_core";







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

export interface CMSOptions {
  url         : string; // cdn/stories/
  starts_with : string;
  sort_by     : StorySortString;
  version     : StoryVersion;
  page?       : number;
  /** For callback only */
  stories?    : StoryEntry[];
}

export interface CMSData extends CMSEntry {
  id: string|number;
  date: ISODateString;
}

interface PartialCMSEntry {
  /** Story ID or Custom ID */
  id         : string|number;
  title      : string;
  author     : string;
  summary?   : string;
  body?      : string;
  /** Video Category */
  category?  : string;
  /** A Hash of all the Entry's data, excluding this property. */
  hash?      : string;
  /** Should default to the most relevant date property of the content */
  date       : ISODateString;
}

export interface CMSEntry extends PartialCMSEntry {
  hash       : string;
}

export type CMSGetFunc = (slug: string, params: StoryOptions) => Promise<StoryblokResult>







const md = useMarkdown();

const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


export function useStoryblok() {
  return {
    getCMSEntries: (opt: CMSOptions) => getCMSEntries(opt, blok.get)
  };
}


export function toCMSOptions(url: string, starts_with: string, sort_by?: StorySortString) {
  const opts: CMSOptions = {
    url,
    starts_with,
    version: 'draft',
    sort_by: sort_by ?? 'created_at:asc',
  };
  return opts;
}


async function getCMSEntries(opt: CMSOptions, exec: CMSGetFunc) {
  const stories = await getRawStories(opt, exec);
  return stories.map(toCMSEntry);
}


async function getRawStories(opt: CMSOptions, exec: CMSGetFunc): Promise<StoryEntry[]> {
  opt.page     = opt.page     ?? 1;
  opt.stories  = opt.stories  || [];

  const { starts_with, version, sort_by, page } = opt;
  const resp = await exec(opt.url, { starts_with, version, sort_by, page, per_page: 100, });

  const stories = resp.data.stories;
  if (stories.length) {
    if (!page) return stories;
    opt.stories.push(...stories);
    opt.page += 1;
    return getRawStories(opt, exec);
  }

  // We want our build process to fail if stories can't be found
  if (!opt.stories.length)
    throw Error(`Missing Stories From "${starts_with}"`)
  ;
  return opt.stories;
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
  if (summary) cmsEntry.summary = md.renderInline(summary);
  if (body) cmsEntry.body = md.render(body);
  if (category && category != categoryNone) cmsEntry.category = category;
  cmsEntry.hash = toShortHash(cmsEntry);
  return cmsEntry as CMSEntry;
}


export const _tdd_storyblok = setIfInDev({
  getStories(slug: string, params?: any) {
    return blok.get(slug, params);
  },
  getCMSEntries,
  getRawStories,
  toCMSEntry,
});








