import { StoryblokResult } from "storyblok-js-client";
import { StoryOptions } from "../../src/services/sb_core";
import simpleData from './simple_data.json';
import videoCatData from './videos_with_cat.json';




export function useMockStoryblokAPI() {
  return { get };
}


const emptyResult = {
  perPage: 0,
  total: 0,
  headers: null,
  data: {
    stories: []
  }
} as StoryblokResult;


async function get(slug: string, params: StoryOptions): Promise<StoryblokResult> {
  const page         = params.page || 1;
  const { per_page } = params;
  const slugIs       = (tslug: string) => slug == tslug;

  if (!per_page) throw Error('"per_page" param must be > 0');

  if (slugIs('test/simple')) {
    if (page > 1) return emptyResult;
    return {
      ...emptyResult,
      data: { stories: [simpleData.stories[0]] }
    };
  }

  if (slugIs('test/singlepage') && page == 1) return {
    ...emptyResult,
    data: { stories: simpleData.stories }
  };

  if (slugIs('test/videos_with_categories')) return {
    ...emptyResult,
    data: {
      stories: videoCatData.stories
    }
  };

  if (slugIs('test/multipage')) {
    const index = findIndexByPage(page, per_page);
    return {
      ...emptyResult,
      data: {
        stories: simpleData.stories.slice(index, index + per_page)
      }
    };
  }
  return emptyResult;
}


function findIndexByPage(page: number, perPage: number) {
  return (page * perPage) - perPage;
}



