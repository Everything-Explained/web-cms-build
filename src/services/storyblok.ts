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
  page?       : number;
  /** Utilized in **mocks only** */
  per_page?   : number;
}

export interface CMSOptions extends StoryOptions {
  url         : string; // cdn/stories/
  /** Utilized for **recursive calls only** */
  stories?    : StoryEntry[];
}

interface PartialCMSEntry {
  id         : string|number;
  title      : string;
  author     : string;
  summary?   : string;
  body?      : string;
  /** Video Category */
  category?  : string;
  /** A Hash of all the Entry's data, excluding this property. */
  hash?      : string;
  /** Defaults to the most relevant date property of the content */
  date       : ISODateString;
}

export interface CMSEntry extends PartialCMSEntry {
  readonly id        : string|number;
  readonly title     : string;
  readonly author    : string;
  readonly summary?  : string;
  readonly body?     : string;
  readonly category? : string;
  readonly hash      : string;
  readonly date      : ISODateString;
}

type MockStoryBlokAPI = {
  get: (slug: string, params: StoryOptions) => Promise<StoryblokResult>
}

export type StoryblokAPI = MockStoryBlokAPI|StoryblokClient;







const md = useMarkdown();


export function useStoryblok(api: StoryblokAPI) {
  return {
    getCMSEntries: async (options: CMSOptions) => {
      const stories = await getRawStories(options, api);
      return stories.map(toCMSEntry);
    }
  };
}


async function getRawStories(opt: CMSOptions, api: StoryblokAPI): Promise<StoryEntry[]> {
  opt.page    ||= 1;
  opt.stories ??= [];

  const { url, starts_with, version, sort_by, page } = opt;
  const resp = await api.get(url, { starts_with, version, sort_by, page, per_page: opt.per_page || 100, });
  const stories = resp.data.stories;

  if (stories.length) {
    opt.stories.push(...stories);
    opt.page += 1;
    return getRawStories(opt, api);
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
  useStoryblok,
  getRawStories,
  toCMSEntry,
});








