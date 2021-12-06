/* eslint-disable no-constant-condition */
import { StoryblokResult } from 'storyblok-js-client';
import { ISODateString } from '../global_interfaces';
import { useMarkdown } from './markdown/md_core';
import { StoryOptions, StoryEntry, StorySortString } from './sb_core';



/////////////////////////////////////////
//#region Interfaces and Custom Types
export interface CMSOptions extends StoryOptions {
  url      : string; // cdn/stories/
  stories ?: StoryEntry[];
}

export interface CMSData extends CMSEntry {
  id: string|number;
  date: ISODateString;
}

export interface CMSEntry {
  /** Story ID or Custom ID */
  id         : string|number;
  title      : string;
  author     : string;
  summary   ?: string;
  body       : string;
  /** Video Category */
  category  ?: string;
  /** Video Timestamp */
  timestamp ?: ISODateString;
  /**
   * Should default to the most relevant date
   * property of the content
   */
  date       : ISODateString;
  /** Needed for filename */
  slug       : string;
}

export type CMSGetFunc = (slug: string, params: StoryOptions) => Promise<StoryblokResult>
//#endregion
/////////////////////////////////////////



const md = useMarkdown();


export function useCMS() {
  return {
    getContent,
    getRawStories,
    sanitizeStory,
  };
}


async function getContent(opt: CMSOptions, exec: CMSGetFunc) {
  const stories = await getRawStories(opt, exec);
  return stories.map(sanitizeStory);
}


async function getRawStories(opt: CMSOptions, exec: CMSGetFunc): Promise<StoryEntry[]> {
  opt.per_page = opt.per_page ?? 100;
  opt.page     = opt.page     ?? 1;
  opt.stories  = opt.stories  || [];

  if (opt.per_page > 100)
    throw Error('getStorites()::Max stories "per_page" is 100')
  ;

  const { starts_with, version, sort_by, page, per_page } = opt;
  const resp = await exec(opt.url, { starts_with, version, sort_by, page, per_page, });

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


function sanitizeStory(story: StoryEntry) {
  const { first_published_at, created_at } = story;
  const { title, author, summary, body, timestamp, category } = story.content;
  const categoryNone = '--';
  const cmsContent: CMSEntry = {
    id: story.content.id || story.id, // Videos have content.id
    title,
    author,
    body: body ? md.render(body) : '',
    date: timestamp || first_published_at || created_at,
    slug: slugify(title)
  };
  if (summary || story.content.id) cmsContent.summary = summary ?? md.render(body);
  if (category && category != categoryNone) cmsContent.category = category;
  return cmsContent;
}


export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/α/g, 'a') // Greek Alpha
    .replace(/β/g, 'b') // Greek Beta
    .replace(/[^a-z0-9-]+/g, '')
  ;
}


export function toCMSOptions(url: string, starts_with: string, sort_by?: StorySortString) {
  return {
    url,
    starts_with,
    version: 'draft',
    sort_by: sort_by ?? 'created_at:asc',
    per_page: 100,
  } as CMSOptions;
}




