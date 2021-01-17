/* eslint-disable no-constant-condition */
import bundler, { Page } from "@everything_explained/web-md-bundler/dist/core/md_page_bundler";
import { blok, ISODateString, mapStoryDefaults, StoryContent, Story } from "./api_storyblok";

export interface Video extends Page {
  category ?: string;
}


export interface VideoContent extends StoryContent {
  id        : string;
  timestamp : ISODateString;
  category ?: string;
}

export interface VideoStory extends Story {
  content: VideoContent;
}

type VideoOptions = {
  starts_with: string;
  sort_by: 'created_at:desc'|'created_at:asc'|'content.category:asc'|'content.category:desc';
  version: 'draft'|'published'
}

function mapVideos(stories: VideoStory[]) {
  return stories.map(story => {
    const page = mapStoryDefaults(story);
    const video: Video = {
      ...page,
      content: page.content ? bundler.renderMDStr(page.content) : page.content,
      id: story.content.id,
      date: story.content.timestamp || page.date!
    };
    if (story.content.category) {
      video.category = story.content.category;
    }
    return video;
  });
}

export async function getVideos(options: VideoOptions) {
  try {
    const allStories = [];
    let i = 1;
    while (true) {
      const stories =
        await blok.get('cdn/stories/', { per_page: 100, page: i++, ...options })
      ;
      if (stories.data.stories.length) {
        allStories.push(...stories.data.stories);
        continue;
      }
      if (!allStories.length) throw Error('No Videos');
      return mapVideos(allStories);
    }
  }
  catch (err) { throw Error(err); }
}