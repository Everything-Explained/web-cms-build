/* eslint-disable no-constant-condition */
import StoryblokClient from 'storyblok-js-client';
import config from '../../../config.json';
import { StoryOptions, StoryPage, StorySimplePage } from './sb_interfaces';


const blok = new StoryblokClient({
  accessToken: config.apis.storyBlokToken,
  cache: { type: 'memory', clear: 'auto' }
});


export class CMS {

  static async getStories<T = StoryPage>(options: StoryOptions, page = 1, stories = [] as T[]): Promise<T[]> {
    const batch = await blok.get(
      'cdn/stories/',
      { per_page: 100, // 100 is max allowed
        page: page++,
        ...options }
    );

    if (batch.data.stories.length) {
      stories.push(...batch.data.stories);
      return CMS.getStories<T>(options, page, stories);
    }

    // We want our build process to fail if stories can't be found
    if (!stories.length)
      throw Error(`Missing Stories::${options.starts_with}`)
    ;

    return stories;
  }

  static toSimplePage(story: StoryPage) {
    const { first_published_at, created_at } = story;
    const { title, author, summary, body } = story.content;
    const simplePage: StorySimplePage = {
      id: story.id,
      title,
      author,
      summary,
      body,
      date: first_published_at || created_at
    };
    return simplePage;
  }

}


