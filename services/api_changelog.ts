import { getStories, mapStoryToPage, StoryPage, StoryPageContent } from "./api_storyblok";

interface ChangelogContent extends StoryPageContent {
  summary: string;
  version: string;
}

interface Changelog extends StoryPage {
  content: ChangelogContent;
}

export async function getChangelogs() {
  const stories = await getStories<Changelog>({
    starts_with: 'changelog',
    version: 'published',
    sort_by: 'created_at:desc',
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