/* eslint-disable no-constant-condition */
import { StoryblokResult } from 'storyblok-js-client';
import { ISODateString } from '../global_interfaces';
import { useMarkdown } from './markdown/md_core';
import { StoryOptions, StoryPage } from './sb_core';



/////////////////////////////////////////
//#region Interfaces and Custom Types
interface CMSOptions extends StoryOptions {
  url     ?: string;
  stories ?: StoryPage[];
}

export interface CMSData extends CMSContent {
  id: string|number;
  date: ISODateString;
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

type CMSGetter = (slug: string, params: StoryOptions) => Promise<StoryblokResult>
//#endregion
/////////////////////////////////////////



const md = useMarkdown();


export function useCMS() {
  return {
    getContent,
    filterStoryContent,
  };
}



async function getContent(opt: CMSOptions, exec: CMSGetter): Promise<CMSContent[]> {
  opt.per_page = opt.per_page ?? 100;
  opt.page     = opt.page     ?? 1;
  opt.stories  = opt.stories  || [];

  if (opt.per_page > 100)
    throw Error('getStorites()::Max stories "per_page" is 100')
  ;

  const batch = await exec(opt.url || 'cdn/stories/', {
    starts_with : opt.starts_with,
    version     : opt.version,
    sort_by     : opt.sort_by,
    page        : opt.page,
    per_page    : opt.per_page,
  });

  const stories = batch.data.stories;

  if (stories.length) {
    if (!opt.page) return stories.map(filterStoryContent);
    opt.stories.push(...batch.data.stories);
    opt.page += 1;
    return getContent(opt, exec);
  }

  // We want our build process to fail if stories can't be found
  if (!opt.stories.length)
    throw Error(`Missing Stories::${opt.starts_with}`)
  ;
  return opt.stories.map(filterStoryContent);
}


function filterStoryContent(story: StoryPage) {
  const { first_published_at, created_at } = story;
  const { title, author, summary, body, timestamp, category } = story.content;
  const categoryNone = '--';
  const cmsContent: CMSContent = {
    id: story.content.id || story.id, // Videos have content.id
    title,
    author,
    date: timestamp || first_published_at || created_at
  };
  if (body) cmsContent.body = md.render(body);
  if (summary) cmsContent.summary = summary;
  if (category && category != categoryNone) cmsContent.category = category;
  return cmsContent;
}


