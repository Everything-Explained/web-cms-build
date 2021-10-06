import { StoryblokResult } from "storyblok-js-client";
import { StoryOptions } from "../../src/services/sb_core";
import simpleData from './simple_data.json';




export function useMockStoryblokAPI() {
  return { get };
}


const result = {
  perPage: 0,
  total: 0,
  headers: null,
  data: {
    stories: []
  }
} as StoryblokResult;


async function get(slug: string, params: StoryOptions): Promise<StoryblokResult> {
  const page = params.page || 1;
  const { per_page } = params;
  if (!per_page) throw Error('"per_page" param must be > 0');

  if (slug == 'test/empty') return {
    ...result,
    data: { stories: [] }
  };


  if (slug == 'test/simple' && page == 1) {
    return { ...result, data: { stories: simpleData.stories} };
  }

  if ('test/pages' == slug) {
    const index = findIndexByPage(page, per_page);
    return {
      ...result,
      data: {
        stories: simpleData.stories.slice(index, index + per_page)
      }
    };
  }
  return result;
}


function findIndexByPage(page: number, perPage: number) {
  return (page * perPage) - perPage;
}



