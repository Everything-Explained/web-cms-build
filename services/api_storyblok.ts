import StoryblokClient from 'storyblok-js-client';
import { Page } from '@everything_explained/web-md-bundler/dist/core/md_page_bundler';
import config from '../config.json';



export type ISODateString = string;


export interface Story {
  id                  : number;
  name                : string;
  slug                : string;
  created_at          : ISODateString;
  published_at?       : ISODateString;
  first_published_at? : ISODateString;
  content             : StoryContent;
}
export interface StoryContent {
  title: string;
  author: string;
  body: string;
}


export const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


export function mapStoryDefaults(story: Story) {
  const c = story.content;
  return {
    title   : c.title,
    author  : c.author,
    content : c.body,
    id      : story.id,
    date    : story.first_published_at ?? story.created_at
  } as Page;
}