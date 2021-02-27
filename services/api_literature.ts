import { getStories, mapStoryToPage, Story, StoryVersion } from "./api_storyblok";


export async function getLiterature(slug: string, version: StoryVersion = 'published') {
  const stories = await getStories<Story>({
    starts_with: slug,
    sort_by: 'created_at:asc',
    version,
  });
  return stories.map(mapStoryToPage);
}