/* eslint-disable no-constant-condition */
import { StoryblokResult } from 'storyblok-js-client';
import { ISODateString } from '../global_interfaces';
import { useMarkdown } from './markdown/md_core';
import { StoryOptions, StoryPage } from './sb_core';
import { map, pipe } from 'ramda';
import { useMockStoryblokAPI } from '../../__fixtures__/sb_mock_api';



/////////////////////////////////////////
//#region Interfaces and Custom Types
export interface CMSOptions extends StoryOptions {
  url      : string; // cdn/stories/
  stories ?: StoryPage[];
}

export interface CMSData extends CMSStory {
  id: string|number;
  date: ISODateString;
}

export interface CMSStory {
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

type CMSGetter = (slug: string, params: StoryOptions) => Promise<StoryblokResult>
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


async function getContent(opt: CMSOptions, exec: CMSGetter) {
  const stories = await getRawStories(opt, exec);
  return stories.map(sanitizeStory);
}


async function getRawStories(opt: CMSOptions, exec: CMSGetter): Promise<StoryPage[]> {
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
    throw Error(`Missing Stories::${starts_with}`)
  ;
  return opt.stories;
}


function sanitizeStory(story: StoryPage) {
  const { first_published_at, created_at, slug } = story;
  const { title, author, summary, body, timestamp, category } = story.content;
  const categoryNone = '--';
  const cmsContent: CMSStory = {
    id: story.content.id || story.id, // Videos have content.id
    title,
    author,
    body: body ? md.render(body) : '',
    date: timestamp || first_published_at || created_at,
    slug,
  };
  if (summary) cmsContent.summary = summary;
  if (category && category != categoryNone) cmsContent.category = category;
  return cmsContent;
}




