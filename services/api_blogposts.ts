import { Page } from "@everything_explained/web-md-bundler/dist/core/md_page_bundler";
import { blok, mapStoryToPage, StoryblokContent, Story } from "./api_storyblok";

type BlogImage = {
  id?: number;
  title?: string;
  filename: string;
  copyright?: string;
}

interface BlogContent extends StoryblokContent {
  summary: string;
  image_header: BlogImage;
}

interface BlogStory extends Story {
  content: BlogContent;
}

function mapBlogPosts(stories: BlogStory[]) {
  return stories.map(story => {
    const page = mapStoryToPage(story);
    page.summary = story.content.summary;
    page.header_image = story.content.image_header.filename || null;
    return page;
  });
}

export async function getBlogPosts() {
  return new Promise<Page[]>((rs, rj) => {
    blok
      .get('cdn/stories/', { version: 'published', starts_with: 'blog/' })
      .then(res => { rs(mapBlogPosts(res.data.stories)); })
      .catch(err => rj(err));
  });
}