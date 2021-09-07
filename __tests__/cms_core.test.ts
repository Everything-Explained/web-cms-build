import { useCMS } from "../src/services/cms/cms_core";
import { CMSContent, StoryOptions } from "../src/services/cms/sb_interfaces";
import lit from './data/lit_item.json';


const CMS = useCMS();
const testLitSlug = 'test/tlit';
const testVidSlug = 'test/tvid';


function toSBOptions(slug: string, per_page = 100) {
  const options = {
    starts_with: slug,
    version: 'draft',
    sort_by: 'created_at:asc',
  } as StoryOptions;
  if (per_page == 100) return options;
  options.per_page = per_page;
  return options;
}


describe('StoryBlokAPI.getStories()', () => {

  it('returns expected stories from API', () => {
    expect.assertions(1);
    const onResolve =
      (data: CMSContent[]) => expect(data.length).toBe(3)
    ;
    return CMS
      .getContent(toSBOptions(testLitSlug))
      .then(onResolve);
  });

  it('returns all story pages', () => {
    expect.assertions(1);
    const testLength =
      (data: CMSContent[]) => expect(data.length).toBe(144)
    ;
    return CMS
      .getContent(toSBOptions(testVidSlug))
      .then(testLength);
  });

  it('throws an error if no stories exist', () => {
    expect.assertions(1);
    const onMissingStories =
      (e: Error) => expect(e.message).toContain('Missing Stories::')
    ;
    return CMS
      .getContent(toSBOptions('doesnotexist'))
      .catch(onMissingStories)
    ;
  });

  it('throws an error if "per_page" is greater than 100', () => {
    expect.assertions(1);
    const onTooLargePerPage =
      (e: Error) => expect(e.message).toContain('getStorites()::Max stories')
    ;
    return CMS
      .getContent(toSBOptions('test/tlit', 101))
      .catch(onTooLargePerPage);
  });

  it ('does NOT loop through pages when page param set to 0', () => {
    expect.assertions(1);
    const onDoNotLoop =
      (c: CMSContent[]) => {
        expect(c.length).toBe(1);
      }
    ;
    return CMS
      .getContent(toSBOptions(testLitSlug, 1), 0)
      .then(onDoNotLoop);
  });
});


describe('StoryBlokAPI.toSimplePage()', () => {

  const litNoPublishDate =
    { ...lit, published_at: null, first_published_at: null }
  ;

  const vid = {
    ...lit,
    content: {
      ...lit.content,
      summary: undefined,
      category: 'AA',
      id: 'fl34_31kfQ',
      timestamp: '2021-09-05T19:18:11.450Z'
    }
  };
  const vidNoCategory = {
    ...vid,
    content: {
      ...vid.content,
      category: '--'
    }
  };

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


  it('returns a specific subset of Story content', () => {
    const page = CMS.filterStoryContent(lit);
    expect(page).toEqual(simplePage);
  });

  it('uses created date of Story content if published date is null', () => {
    const page = CMS.filterStoryContent(litNoPublishDate);
    expect(page).toEqual(simplePageNoPublishDate);
  });

  it ('assigns Video-specific properties if Story is Video', () => {
    const page = CMS.filterStoryContent(vid);
    expect(page.date).toBe(vid.content.timestamp);
    expect(page.id).toBe('fl34_31kfQ');
    expect(page.category).toBe('AA');
    expect('summary' in page).toBeFalsy();
  });

  it('removes category if category is "none"', () => {
    const page = CMS.filterStoryContent(vidNoCategory);
    expect('category' in page).toBeFalsy();
  });


});