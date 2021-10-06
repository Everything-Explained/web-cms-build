import { CMSEntry, CMSOptions, useCMS, slugify, toCMSOptions } from "../src/services/cms_core";
import { useMockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import litItem from '../__mocks__/fixtures/lit_item.json';


const CMS = useCMS();
const mockAPI = useMockStoryblokAPI();
const testSimpleSlug = 'test/simple';
const testPagesSlug  = 'test/pages';


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


describe('StoryBlokAPI.getContent()', () => {

  it('returns sanitized stories from API', done => {
    CMS
      .getContent(toSBlokOpt(testSimpleSlug), mockAPI.get)
      .then((data) => {
        expect(data.length).toBe(3);
        done();
      })
      .catch(done);
  });

  it('returns all story pages', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBlokOpt(testPagesSlug, 1, 1), mockAPI.get)
      .then((data: CMSEntry[]) => {
        expect(data.length).toBe(3);
      });
  });

  it('throws an error if no stories exist', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBlokOpt('doesnotexist'), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('Missing Stories::');
      });
  });

  it('throws an error if pages are set to 0 and no stories are found', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBlokOpt('doesnotexist', 0), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('Missing Stories::');
      })
    ;
  });

  it('throws an error if "per_page" is greater than 100', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBlokOpt(testSimpleSlug, 1, 101), mockAPI.get)
      .catch((e) => {
        expect(e.message).toContain('getStorites()::Max stories');
      });
  });

  it ('does NOT loop through pages when page param set to 0', () => {
    expect.assertions(1);
    return CMS
      .getContent(toSBlokOpt(testPagesSlug, 0, 1), mockAPI.get)
      .then((c: CMSEntry[]) => {
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
    slug    : 'literature-item-1',
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


describe('slugify(str)', () => {
  it('returns a sanitized string which can be used as a url', () => {
    expect(slugify('This is a "T3ST"')).toBe('this-is-a-t3st');
  });

  it('converts Greek Alpha character to "a"', () => {
    expect(slugify('greek-alpha-α')).toBe('greek-alpha-a');
  });

  it('converts Greek Beta character to "b"', () => {
    expect(slugify('greek-beta-β')).toBe('greek-beta-b');
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