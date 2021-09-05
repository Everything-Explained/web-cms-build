import { CMS } from "../src/services/cms/cms_core";
import { StoryOptions, StoryPage } from "../src/services/cms/sb_interfaces";
import lit from './data/lit_item.json';


const testLitSlug = 'test/tlit';
const testVidSlug = 'test/tvid';

const litNoPublishDate =
  { ...lit, published_at: null, first_published_at: null }
;

const simplePage = {
  id      : 69852066,
  title   : 'Literature Item 1',
  author  : 'Ethan Kahn',
  summary : 'This is a summary string',
  body    : 'This is some body content',
  date    : '2021-05-19T21:50:32.720Z',
};

const simplePageNoPublishDate =
  {...simplePage, date: '2021-09-03T19:48:44.930Z' } // using created_at date
;

function toSBOptions(slug: string) {
  return {
    starts_with: slug,
    version: 'draft',
    sort_by: 'created_at:asc'
  } as StoryOptions;
}


describe('StoryBlokAPI.getStories()', () => {

  it('returns expected stories from API', () => {
    expect.assertions(1);
    const onResolve =
      (data: StoryPage[]) => expect(data.length).toBe(3)
    ;
    return CMS
      .getStories(toSBOptions(testLitSlug))
      .then(onResolve);
  });

  it('returns all story pages', () => {
    expect.assertions(1);
    const testLength =
      (data: StoryPage[]) => expect(data.length).toBe(144)
    ;
    return CMS
      .getStories(toSBOptions(testVidSlug))
      .then(testLength);
  });

  it('returns an error if no stories exist', () => {
    expect.assertions(1);
    const onMissingStories =
      (e: Error) => expect(e.message).toContain('Missing Stories::')
    ;
    return CMS
      .getStories(toSBOptions('doesnotexist'))
      .catch(onMissingStories)
    ;
  });
});


describe('StoryBlokAPI.toSimplePage()', () => {

  it('returns a specific subset of Story content', () => {
    const page = CMS.toSimplePage(lit);
    expect(page).toEqual(simplePage);
  });

  it('uses created date of Story content if published date is null', () => {
    const page = CMS.toSimplePage(litNoPublishDate);
    expect(page).toEqual(simplePageNoPublishDate);
  });
});