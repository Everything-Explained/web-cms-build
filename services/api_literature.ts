import { getStories, mapStoryToPage, Story, StoryblokContent, StoryVersion } from "./api_storyblok";

interface LiteratureContent extends StoryblokContent {
  summary: string;
}

interface Literature extends Story {
  content: LiteratureContent;
}

export async function getLiterature(slug: string, version: StoryVersion = 'published') {
  const stories = await getStories<Literature>({
    starts_with: slug,
    sort_by: 'created_at:asc',
    version,
  });
  return stories.map(story => {
    const page = mapStoryToPage(story);
    return {
      ...page,
      summary: story.content.summary
    };
  });
}