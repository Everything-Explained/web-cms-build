import { CMSOptions, _tdd_storyblok } from "../src/lib/services/storyblok";
import { toShortHash, tryCatchAsync } from "../src/lib/utils/utilities";
import litStory from '../__mocks__/fixtures/lit_item.json';
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";







const sb                = _tdd_storyblok!;
const mockAPI           = mockStoryblokAPI;
const multiPageSlug     = 'test/multipage';

function toSBlokOpt(slug: string, page?: number, per_page?: number) {
  const options: CMSOptions = {
    url: slug,
    starts_with: slug,
    version: 'draft',
    sort_by: 'created_at:asc',
    page,
    per_page,
  };
  return options;
}







describe('getRawStories(options, apiFunc)', () => {
  it('returns all stories from all available pages.', async () => {
    const stories = await sb.getRawStories(toSBlokOpt(multiPageSlug, 1), mockAPI);
    expect(stories.length).toBe(3);
  });

  it('returns all available stories from specified page and onwards.', async () => {
    const stories = await sb.getRawStories(toSBlokOpt(multiPageSlug, 2, 1), mockAPI);
    expect(stories.length).toBe(2);
  });

});


describe('toCMSEntry(story)', () => {
  it('returns a CMS entry with all empty properties removed.', () => {
    const story = { ...litStory, content: { ...litStory.content, body: '', summary: '',category: '' } };
    const entry = sb.toCMSEntry(story);
    expect(entry.category).toBeUndefined();
    expect(entry.body).toBeUndefined();
    expect(entry.summary).toBeUndefined();
  });

  it('ignores story.content.category when category is set to none.', () => {
    const story = { ...litStory, content: { ...litStory.content, category: '--'} };
    const entry = sb.toCMSEntry(story);
    expect(entry.category).toBeUndefined();
  });

  it('sets date to created_at, if first_published_at and content.timestamp are null or undefined.', () => {
    const story = { ...litStory, first_published_at: null };
    const entry = sb.toCMSEntry(story);
    expect(entry.date).toEqual('2021-09-03T19:48:44.930Z');
  });

  it('sets date to first_published_at, if content.timestamp is null or undefined.', () => {
    const entry = sb.toCMSEntry(litStory);
    expect(entry.date).toBe('2021-05-19T21:50:32.720Z');
  });

  it('sets date to content.timestamp, if it is defined.', () => {
    const story = { ...litStory, content: { ...litStory.content, timestamp: '2022-01-23T23:22:26.993Z'} };
    const entry = sb.toCMSEntry(story);
    expect(entry.date).toBe('2022-01-23T23:22:26.993Z');
  });

  it('sets id to story.id, if content.id is undefined.', () => {
    const storyWithNoContentID = { ...litStory };
    const entry = sb.toCMSEntry(storyWithNoContentID);
    expect(entry.id).toBe(69852066);
  });

  it('sets id to content.id, if it defined.', () => {
    const storyWithContentID = { ...litStory, content: { ...litStory.content, id: 'faFE_FQf'} };
    const entry = sb.toCMSEntry(storyWithContentID);
    expect(entry.id).toBe('faFE_FQf');
  });

  it('parses story.content.summary as inline markdown.', () => {
    const story = { ...litStory, content: { ...litStory.content, summary: 'hello **world**'} };
    const entry = sb.toCMSEntry(story);
    expect(entry.summary).toBe('hello <strong>world</strong>');
    expect(entry.summary).not.toContain('<p>');
  });

  it('parses story.content.body as markdown page.', () => {
    const entry = sb.toCMSEntry(litStory);
    expect(entry.body).toBe('<p>This is some body content</p>\n');
    expect(entry.body).toContain('<p>');
  });

  it('sets a hash property using the calculated hash of all sanitized properties.', () => {
    const cmsEntry = sb.toCMSEntry(litStory);
    const partialEntry = { ...cmsEntry, hash: undefined };
    const testHash = toShortHash(partialEntry);
    expect(cmsEntry.hash).toBe(testHash);
  });

  it('returns a sanitized version of Storyblok content called a CMS entry.', () => {
    const simplePageCMSEntry = {
      id      : 69852066,
      title   : 'Literature Item 1',
      author  : 'Ethan Kahn',
      summary : 'This is a summary string',
      body    : '<p>This is some body content</p>\n',
      hash    : 'a0b9cf19117c3',
      date    : '2021-05-19T21:50:32.720Z',
    };
    const entry = sb.toCMSEntry(litStory);
    expect(entry).toEqual(simplePageCMSEntry);
  });

  it('returns a CMS entry with video-specific properties.', () => {
    const vidStory = { ...litStory,
      content: { ...litStory.content,
        summary: 'hello world',
        category: 'AC',
        id: 'fl34_31kfQ',
        timestamp: '2021-09-05T19:18:11.450Z'
      }
    };
    const entry = sb.toCMSEntry(vidStory);
    expect(entry.date).toBe(vidStory.content.timestamp);
    expect(entry.id).toBe('fl34_31kfQ');
    expect(entry.category).toBe('AC');
    expect(entry.summary).toBe('hello world');
  });

});


describe('useStoryblok(api).getCMSEntries(options)', () => {
  it('returns an Array of CMS entries (sanitized stories) from Storyblok API.', async () => {
    const cms = sb.useStoryblok(mockAPI);
    const entries = await cms.getCMSEntries(toSBlokOpt(multiPageSlug, 1));
    expect(entries[0].id).toBe(69866748);
    expect(entries[0].hash).toBe('da770dbf514bb');
    expect(entries.length).toBe(3);
    expect('content' in entries[0]).toBe(false);
  });
});


describe('useStoryblok(api).getCategoryList(options)', () => {
  it('throws error if no categories are found', async () => {
    const resp = await tryCatchAsync(sb.useStoryblok(mockAPI).getCategoryList(toSBlokOpt('test/multipage', 1)));
    const isError = resp instanceof Error;
    expect(isError).toBe(true);
    if (isError) expect(resp.message).toEqual('No Categories Found');
  });

  it('returns categories from CMS', async () => {
    const resp = await tryCatchAsync(sb.useStoryblok(mockAPI).getCategoryList(toSBlokOpt('test/category/list', 1)));
    const isError = resp instanceof Error;
    expect(isError).toBe(false);
    if (!isError) expect(resp.length).toBe(12);
  });
});


describe('useStoryblok(api).getStaticPage(options)', () => {
  it('returns an object containing the title and content of the static page', async () => {
    const pageData = await sb.useStoryblok(mockAPI).getStaticPage('static', 'draft');
    expect(pageData.content).toBe('This is a static page with some **body** text and *markdown*');
    expect(pageData.title).toBe('Static Page');
    expect(Object.keys(pageData).length).toEqual(2);
  });
});



