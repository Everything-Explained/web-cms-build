import { StoryblokResult } from "storyblok-js-client";
import { StoryOptions } from "../../src/services/storyblok";
import simpleData from './simple_data.json';
import videoCatData from './videos_with_cat.json';
import categoryList from './category_list.json';
import staticPage from './static_page.json';




export const mockStoryblokAPI = {
  get
};


const emptyResult = {
  perPage: 0,
  total: 0,
  headers: null,
  data: {
    stories: []
  }
} as StoryblokResult;


async function get(slug: string, params: StoryOptions): Promise<StoryblokResult> {
  const page     = params.page ?? 1;
  const per_page =  params.per_page ?? 1;
  const uriIs   = (testSlug: string) => params.starts_with == testSlug;

  if (!per_page) throw Error('"per_page" param must be > 0');

  if (uriIs('test/simple')) {
    if (page > 1) return emptyResult;
    return {
      ...emptyResult,
      data: { stories: [simpleData.stories[0]] }
    };
  }

  if (uriIs('page-data/standalone/static')) {
    return {
      ...emptyResult,
      data: { stories: staticPage }
    };
  }

  if (uriIs('test/singlepage') && page == 1) return {
    ...emptyResult,
    data: { stories: simpleData.stories }
  };

  if (uriIs('test/category/videos')) {
    if (page > 1) return emptyResult;
    return {
      ...emptyResult,
      data: {
        stories: videoCatData.stories
      }
    };
  }

  if (uriIs('test/category/list')) {
    if (page > 1) return emptyResult;
    return {
      ...emptyResult,
      data: {
        stories: categoryList.stories
      }
    };
  }

  if (uriIs('test/multipage')) {
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



