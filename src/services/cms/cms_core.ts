/* eslint-disable no-constant-condition */
import StoryblokClient from 'storyblok-js-client';
import config from '../../../config.json';
import { StoryOptions, StoryPage, CMSContent } from './sb_interfaces';



export function useCMS() {
  return {
    getContent,
    filterStoryContent,
  };
}


const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


async function getContent(options: StoryOptions, startPage = 1, stories = [] as StoryPage[]): Promise<CMSContent[]> {
  options.per_page = options.per_page ?? 100;
  if (options.per_page > 100)
    throw Error('getStorites()::Max stories "per_page" is 100')
  ;
  const page = startPage ? startPage++ : startPage;
  const batch = await blok.get('cdn/stories/', { page, ...options });

  if (batch.data.stories.length && startPage) {
    stories.push(...batch.data.stories);
    return getContent(options, startPage, stories);
  }

  if (!startPage) return batch.data.stories.map(filterStoryContent);

  // We want our build process to fail if stories can't be found
  if (!stories.length)
    throw Error(`Missing Stories::${options.starts_with}`)
  ;
  return stories.map(filterStoryContent);
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
  if (body) cmsContent.body = body;
  if (summary) cmsContent.summary = summary;
  if (category && category != categoryNone) cmsContent.category = category;
  return cmsContent;
}


