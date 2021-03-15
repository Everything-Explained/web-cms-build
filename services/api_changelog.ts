import { getStories, mapStoryToPage, Story, StoryblokContent } from "./api_storyblok";

interface ChangelogContent extends StoryblokContent {
  summary: string;
  version: string;
}

interface Changelog extends Story {
  content: ChangelogContent;
}

export async function getChangelogs() {
  const stories = await getStories<Changelog>({
    starts_with: 'changelog',
    sort_by: 'created_at:asc',
    version: 'draft',
  });

  return stories.map(story => {
    const page = mapStoryToPage(story);
    return {
      ...page,
      summary: story.content.summary,
      version: story.content.version,
    };
  });
}