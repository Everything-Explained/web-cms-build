
import { StoryblokResult } from 'storyblok-js-client';
import { ISODateString } from '../global_interfaces';
import { toShortHash } from '../utilities';
import { useMarkdown } from './markdown/md_core';
import { StoryOptions, StoryEntry, StorySortString, StoryVersion } from './sb_core';




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


export function toCMSOptions(url: string, starts_with: string, sort_by?: StorySortString) {
  const opts: CMSOptions = {
    url,
    starts_with,
    version: 'draft',
    sort_by: sort_by ?? 'created_at:asc',
  };
  return opts;
}


async function getContent(opt: CMSOptions, exec: CMSGetFunc) {
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


export function useCMS() {
  return {
    getContent,
    getRawStories,
    toCMSEntry,
  };
}




