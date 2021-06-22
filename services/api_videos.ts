/* eslint-disable no-constant-condition */
import { Page } from "@everything_explained/web-md-bundler/dist/core/md_page_bundler";
import {
  ISODateString,
  mapStoryToPage,
  StoryPageContent,
  StoryPage,
  getStories,
  StoryVersion,
  StorySortString
} from "./api_storyblok";




export interface Video extends Page {
  category    ?: string;
  description ?: string;
}

export interface VideoContent extends StoryPageContent {
  id        : string;
  timestamp : ISODateString;
  category ?: string;
}

export interface VideoStory extends StoryPage {
  content: VideoContent;
}


export async function getVideos(slug: string, version: StoryVersion = 'published', sort_by: StorySortString = 'created_at:asc') {
  const stories = await getStories<VideoStory>({
    starts_with: slug,
    sort_by,
    version,
  });
  return stories.map(story => {
    const page = mapStoryToPage(story);
    const video: Video = {
      ...page,
      id: story.content.id,
      date: story.content.timestamp || page.date!
    };
    if (story.content.category) {
      video.category = story.content.category;
    }
    return video;
  });
}