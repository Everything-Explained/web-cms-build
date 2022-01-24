import { CMSEntry, CMSOptions, useCMS, toCMSOptions } from "../src/services/cms_core";
import { useMockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import litStory from '../__mocks__/fixtures/lit_item.json';
import { slugify, tryCatchAsync } from "../src/utilities";


const CMS = useCMS();
const mockAPI = useMockStoryblokAPI();
const singlePageSlug = 'test/singlepage';
const multiPageSlug  = 'test/multipage';
const multiPageFailSlug = 'test/multipage/fail';


function toSBlokOpt(slug: string, page?: number) {
  const options = {
    url: slug,
    starts_with: slug,
    version: 'draft',
    sort_by: 'created_at:asc',
    page,
  } as CMSOptions;
  return options;
}


describe('getContent()', () => {

  it('returns sanitized stories from API', async () => {
    const data = await CMS.getContent(toSBlokOpt(singlePageSlug), mockAPI.get);
    expect(data.length).toBe(3);
  });

  it('returns all story pages', async () => {
    const data = await CMS.getContent(toSBlokOpt(multiPageSlug, 1), mockAPI.get);
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

  it ('does NOT loop through pages when page param set to 0', async () => {
    const data = await CMS.getContent(toSBlokOpt(multiPageFailSlug, 0), mockAPI.get);
    expect(data.length).toBe(1);
  });
});



describe('toCMSEntry()', () => {

  it('returns a CMS entry with all empty properties removed.', () => {
    const story = { ...litStory, content: { ...litStory.content, body: '', summary: '',category: '' } };
    const entry = CMS.toCMSEntry(story);
    expect(entry.category).toBeUndefined();
    expect(entry.body).toBeUndefined();
    expect(entry.summary).toBeUndefined();
  });

  it('ignores story.content.category when category is set to none.', () => {
    const story = { ...litStory, content: { ...litStory.content, category: '--'} };
    const entry = CMS.toCMSEntry(story);
    expect(entry.category).toBeUndefined();
  });

  it('uses story.created_at as date, if story.first_published_at and story.content.timestamp are null or undefined.', () => {
    const story = { ...litStory, first_published_at: null };
    const entry = CMS.toCMSEntry(story);
    expect(entry.date).toEqual('2021-09-03T19:48:44.930Z');
  });

  it('uses story.first_published_at as date, if story.content.timestamp is null or undefined.', () => {
    const entry = CMS.toCMSEntry(litStory);
    expect(entry.date).toBe('2021-05-19T21:50:32.720Z');
  });

  it('uses story.content.timestamp as date, if it is defined.', () => {
    const story = { ...litStory, content: { ...litStory.content, timestamp: '2022-01-23T23:22:26.993Z'} };
    const entry = CMS.toCMSEntry(story);
    expect(entry.date).toBe('2022-01-23T23:22:26.993Z');
  });

  it('uses story.id as id, if story.content.id is undefined.', () => {
    const storyWithNoContentID = { ...litStory };
    const entry = CMS.toCMSEntry(storyWithNoContentID);
    expect(entry.id).toBe(69852066);
  });

  it('uses story.content.id as id, if it defined.', () => {
    const storyWithContentID = { ...litStory, content: { ...litStory.content, id: 'faFE_FQf'} };
    const entry = CMS.toCMSEntry(storyWithContentID);
    expect(entry.id).toBe('faFE_FQf');
  });

  it('parses story.content.summary as inline markdown.', () => {
    const story = { ...litStory, content: { ...litStory.content, summary: 'hello **world**'} };
    const entry = CMS.toCMSEntry(story);
    expect(entry.summary).toBe('hello <strong>world</strong>');
    expect(entry.summary).not.toContain('<p>');
  });

  it('parses story.content.body as markdown page.', () => {
    const entry = CMS.toCMSEntry(litStory);
    expect(entry.body).toBe('<p>This is some body content</p>\n');
    expect(entry.body).toContain('<p>');
  });

  it('returns a sanitized version of Storyblok content called a CMS entry.', () => {
    const simplePageCMSEntry = {
      id      : 69852066,
      title   : 'Literature Item 1',
      author  : 'Ethan Kahn',
      summary : 'This is a summary string',
      body    : '<p>This is some body content</p>\n',
      hash    : 'caeea493a03b2',
      date    : '2021-05-19T21:50:32.720Z',
    };
    const entry = CMS.toCMSEntry(litStory);
    expect(entry).toEqual(simplePageCMSEntry);
  });

  it ('returns a CMS entry with video-specific properties.', () => {
    const vidStory = { ...litStory,
      content: { ...litStory.content,
        summary: 'hello world',
        category: 'AC',
        id: 'fl34_31kfQ',
        timestamp: '2021-09-05T19:18:11.450Z'
      }
    };
    const entry = CMS.toCMSEntry(vidStory);
    expect(entry.date).toBe(vidStory.content.timestamp);
    expect(entry.id).toBe('fl34_31kfQ');
    expect(entry.category).toBe('AC');
    expect(entry.summary).toBe('hello world');
  });

});


describe('toCMSOptions(url, starts_with, sort_by?)', () => {
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
  });
});