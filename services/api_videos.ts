/* eslint-disable no-constant-condition */
import bundler, { Page } from "@everything_explained/web-md-bundler/dist/core/md_page_bundler";
import { blok, ISODateString, mapStoryToPage, StoryblokContent, Story, getStories, StoryblokOptions } from "./api_storyblok";

export interface Video extends Page {
  category ?: string;
}


export interface VideoContent extends StoryblokContent {
  id        : string;
  timestamp : ISODateString;
  category ?: string;
}

export interface VideoStory extends Story {
  content: VideoContent;
}


export async function getVideos(options: StoryblokOptions, renderType: 'plain'|'MD' = 'MD') {
  const stories = await getStories<VideoStory>(options);
  return stories.map(story => {
    const page = mapStoryToPage(story);
    const video: Video = {
      ...page,
      content:
        (page.content && renderType == 'MD')
          ? bundler.renderMDStr(page.content)
          : page.content,
      id: story.content.id,
      date: story.content.timestamp || page.date!
    };
    if (story.content.category) {
      video.category = story.content.category;
    }
    return video;
  });
}