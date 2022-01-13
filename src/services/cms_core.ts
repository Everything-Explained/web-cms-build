
import { StoryblokResult } from 'storyblok-js-client';
import { ISODateString } from '../global_interfaces';
import { toShortHash } from '../utilities';
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

interface PartialCMSEntry {
  /** Story ID or Custom ID */
  id         : string|number;
  title      : string;
  author     : string;
  summary   ?: string;
  body      ?: string;
  /** Video Category */
  category  ?: string;
  /** Video Timestamp */
  timestamp ?: ISODateString;
  /** Should default to the most relevant date property of the content */
  date       : ISODateString;
}

export interface CMSEntry extends PartialCMSEntry {
  /** A hash of all the Entry's data, excluding this property. */
  hash       : string;
}

export type CMSGetFunc = (slug: string, params: StoryOptions) => Promise<StoryblokResult>
//#endregion
/////////////////////////////////////////



const md = useMarkdown();


export function useCMS() {
  return {
    getContent,
    getRawStories,
    toCMSEntry,
  };
}


async function getContent(opt: CMSOptions, exec: CMSGetFunc) {
  const stories = await getRawStories(opt, exec);
  return stories.map(toCMSEntry);
}


async function getRawStories(opt: CMSOptions, exec: CMSGetFunc): Promise<StoryEntry[]> {
  opt.per_page = opt.per_page ?? 100;
  opt.page     = opt.page     ?? 1;
  opt.stories  = opt.stories  || [];

  if (opt.per_page > 100)
    throw Error('getStories()::Max stories "per_page" is 100')
  ;

  const { starts_with, version, sort_by, page, per_page } = opt;
  const resp = await exec(opt.url, { starts_with, version, sort_by, page, per_page, });

  const stories = resp.data.stories;
  if (stories.length) {
    if (!page || stories.length < opt.per_page) return stories;
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
  const pCMSEntry: PartialCMSEntry = {
    id: story.content.id || story.id, // Videos have content.id
    title,
    author,
    date: timestamp || first_published_at || created_at,
  };
  if (summary) pCMSEntry.summary = md.renderInline(summary);
  if (body) pCMSEntry.body = md.render(body);
  if (category && category != categoryNone) pCMSEntry.category = category;
  return { ...pCMSEntry, hash: toShortHash(pCMSEntry) };
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




