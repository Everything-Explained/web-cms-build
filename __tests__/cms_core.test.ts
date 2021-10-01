import { CMSStory, CMSOptions, useCMS } from "../src/services/cms_core";
import { useMockStoryblokAPI } from "../__fixtures__/sb_mock_api";
import litItem from '../__fixtures__/lit_item.json';


const CMS = useCMS();
const mockAPI = useMockStoryblokAPI();
const testSimpleSlug = 'test/simple';
const testPagesSlug  = 'test/pages';


function toSBOptions(slug: string, page?: number, per_page?: number) {
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


describe('StoryBlokAPI.getContent()', () => {

  it('returns sanitized stories from API', done => {
    CMS
      .getContent(toSBOptions(testSimpleSlug), mockAPI.get)
      .then((data) => {
        expect(data.length).toBe(3);
        done();
      })
      .catch(done);
  });

  it('returns all story pages', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBOptions(testPagesSlug, 1, 1), mockAPI.get)
      .then((data: CMSStory[]) => {
        expect(data.length).toBe(3);
      });
  });

  it('throws an error if no stories exist', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBOptions('doesnotexist'), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('Missing Stories::');
      });
  });

  it('throws an error if pages are set to 0 and no stories are found', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBOptions('doesnotexist', 0), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('Missing Stories::');
      })
    ;
  });

  it('throws an error if "per_page" is greater than 100', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBOptions(testSimpleSlug, 1, 101), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('getStorites()::Max stories');
      });
  });

  it ('does NOT loop through pages when page param set to 0', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBOptions(testPagesSlug, 0, 1), mockAPI.get)
      .then((c: CMSStory[]) => {
        expect(c.length).toBe(1);
      });
  });
});



describe('StoryBlokAPI.sanitizeStory()', () => {

  const litNoPublishDate =
    { ...litItem, published_at: null, first_published_at: null }
  ;

  const vid = {
    ...litItem,
    content: {
      ...litItem.content,
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
    body    : '<p>This is some body content</p>\n',
    date    : '2021-05-19T21:50:32.720Z',
  };

  const simplePageNoPublishDate =
    {...simplePage, date: '2021-09-03T19:48:44.930Z' } // using created_at date
  ;


  it('returns a sanitized version of Story content', () => {
    const page = CMS.sanitizeStory(litItem);
    expect(page).toEqual(simplePage);
  });

  it('uses created date of Story content if published date is null', () => {
    const page = CMS.sanitizeStory(litNoPublishDate);
    expect(page).toEqual(simplePageNoPublishDate);
  });

  it ('assigns Video-specific properties if Story is Video', () => {
    const page = CMS.sanitizeStory(vid);
    expect(page.date).toBe(vid.content.timestamp);
    expect(page.id).toBe('fl34_31kfQ');
    expect(page.category).toBe('AA');
    expect('summary' in page).toBeFalsy();
  });

  it('removes category if category is "none"', () => {
    const page = CMS.sanitizeStory(vidNoCategory);
    expect('category' in page).toBeFalsy();
  });

});