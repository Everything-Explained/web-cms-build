import { CMSEntry, CMSOptions, useCMS, toCMSOptions } from "../src/services/cms_core";
import { useMockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import litItem from '../__mocks__/fixtures/lit_item.json';
import { slugify, tryCatchAsync } from "../src/utilities";


const CMS = useCMS();
const mockAPI = useMockStoryblokAPI();
const singlePageSlug = 'test/singlepage';
const multiPageSlug  = 'test/multipage';


function toSBlokOpt(slug: string, page?: number, per_page?: number) {
  const options = {
    url: slug,
    starts_with: slug,
    version: 'draft',
    sort_by: 'created_at:asc',
    page,
    per_page,
  } as CMSOptions;
  return options;
}


describe('getContent()', () => {

  it('returns sanitized stories from API', async () => {
    const data = await CMS.getContent(toSBlokOpt(singlePageSlug), mockAPI.get);
    expect(data.length).toBe(3);
  });

  it('returns all story pages', async () => {
    const data = await CMS.getContent(toSBlokOpt(multiPageSlug, 1, 1), mockAPI.get);
    expect(data.length).toBe(3);
  });

  it('throws an error if no stories exist', async () => {
    const error = await tryCatchAsync(CMS.getContent(toSBlokOpt('doesnotexist'), mockAPI.get));
    const isError = error instanceof Error;
    expect(isError).toBeTruthy();
    if (isError) {
      expect(error.message).toContain('Missing Stories From "doesnotexist"');
    }
  });

  it('throws an error if pages are set to 0 and no stories are found', async () => {
    const error = await tryCatchAsync(CMS.getContent(toSBlokOpt('doesnotexist', 0), mockAPI.get));
    const isError = error instanceof Error;
    expect(isError).toBeTruthy();
    if (isError) {
      expect(error.message).toContain('Missing Stories From "doesnotexist"');
    }
  });

  it('throws an error if "per_page" is greater than 100', async () => {
    const error = await tryCatchAsync(CMS.getContent(toSBlokOpt(singlePageSlug, 1, 101), mockAPI.get));
    const isError = error instanceof Error;
    expect(isError).toBeTruthy();
    if (isError) {
      expect(error.message).toContain('getStories()::Max stories');
    }
  });

  it ('does NOT loop through pages when page param set to 0', async () => {
    const data = await CMS.getContent(toSBlokOpt(multiPageSlug, 0, 1), mockAPI.get);
    expect(data.length).toBe(1);
  });
});



describe('toCMSEntry()', () => {

  const simplePageCMSEntry = {
    id      : 69852066,
    title   : 'Literature Item 1',
    author  : 'Ethan Kahn',
    summary : 'This is a summary string',
    body    : '<p>This is some body content</p>\n',
    hash    : 'caeea493a03b2',
    date    : '2021-05-19T21:50:32.720Z',
  };


  it('returns a sanitized version of Story content', () => {
    const page = CMS.toCMSEntry(litItem);
    expect(page).toEqual(simplePageCMSEntry);
  });

  it('uses created date of Story content if published date is null', () => {
    const litNoPublishDate = { ...litItem, published_at: null, first_published_at: null };
    const page = CMS.toCMSEntry(litNoPublishDate);
    expect(page.date).toEqual('2021-09-03T19:48:44.930Z');
  });

  it ('returns an entry with video-specific properties.', () => {
    const vid = { ...litItem,
      content: { ...litItem.content,
        summary: 'hello world',
        category: 'AC',
        id: 'fl34_31kfQ',
        timestamp: '2021-09-05T19:18:11.450Z'
      }
    };
    const page = CMS.toCMSEntry(vid);
    expect(page.date).toBe(vid.content.timestamp);
    expect(page.id).toBe('fl34_31kfQ');
    expect(page.category).toBe('AC');
    expect(page.summary).toBe('hello world');
  });

  it('returns an entry with all empty properties removed.', () => {
    const item = {
      ...litItem,
      content: {
        ...litItem.content,
        body: '',
        summary: '',
        category: ''
      }
    };
    const entry = CMS.toCMSEntry(item);
    expect(entry.category).toBeUndefined();
    expect(entry.body).toBeUndefined();
    expect(entry.summary).toBeUndefined();
  });

  it('returns an entry without a category when category is set to none.', () => {
    const item = { ...litItem, content: { ...litItem.content, category: '--'} };
    const entry = CMS.toCMSEntry(item);
    expect(entry.category).toBeUndefined();
  });

});


describe('toSBOptions(url, starts_with, sort_by?)', () => {
  it('returns StoryBlok options with specified params', () => {
    const options = toCMSOptions('test/path', 'test', 'created_at:desc');
    expect(options.url).toBe('test/path');
    expect(options.starts_with).toBe('test');
    expect(options.sort_by).toBe('created_at:desc');
  });

  it('returns options that contain defaults', () => {
    const options = toCMSOptions('test/path', 'test');
    expect(options.version).toBe('draft');
    expect(options.sort_by).toBe('created_at:asc');
    expect(options.per_page).toBe(100);
  });
});