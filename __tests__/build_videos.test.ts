

import del from "del";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { VideoBuildOptions, VideoCategoryArray, _tdd_buildVideos } from "../src/lib/build/build_videos";
import { CMSEntry, CMSOptions, StoryCategory, useStoryblok } from "../src/lib/services/storyblok";
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";







const tdd = _tdd_buildVideos!;
const mockSB = useStoryblok(mockStoryblokAPI);
const mockDir = './__mocks__/build_videos';



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


function toVideoOptions(
  starts_with: string,
  fileName: string,
  buildPath: string,
  cat_uri?: string
) {
  const options: VideoBuildOptions = {
    fileName,
    starts_with,
    version: 'draft',
    sort_by: 'content.category:asc',
    buildPath,
    catList_starts_with: cat_uri,
    api: mockStoryblokAPI,
  };
  return options;
}



describe('toVideoEntry(CMSEntry)', () => {
  it('returns an entry without the hash or category fields.', async () => {
    const entries = await mockSB.getCMSEntries(toSBlokOpt('test/category/videos'));
    const videoEntry = tdd.toVideoEntry(entries[0]);
    const objProps = Object.getOwnPropertyNames(videoEntry);
    expect(objProps.includes('category')).toBe(false);
    expect(objProps.includes('hash')).toBe(false);
  });
});



describe('createVideoCategories(videos, categoryList)', () => {
  let entries: CMSEntry[];
  let catList: StoryCategory[];
  let videoCategories: VideoCategoryArray;

  beforeEach(async () => {
    entries = await mockSB.getCMSEntries(toSBlokOpt('test/category/videos'));
    catList = await mockSB.getCategoryList(toSBlokOpt('test/category/list'));
    videoCategories = tdd.createVideoCategories(entries, catList);
  });

  it('only create categories that have associated videos.', async () => {
    expect(videoCategories.length).toBe(5);
  });

  it('filters videos into their proper categories.', async () => {
    expect(videoCategories[1].videos.length).toBe(2);
    expect(videoCategories[2].videos.length).toBe(2);
  });

  it('maintain order of category list when categories are created with videos.', async () => {
    const filteredCats = catList.map(cl => {
        if (entries.find(e => e.category == cl.code)) {
          return cl.name;
        }
      }).filter(cl => cl != undefined)
    ;
    expect(videoCategories.map(vc => vc.name)).toEqual(filteredCats);
  });

  it('throws error when video has an unknown category.', async () => {
    entries[0].category = 'UK';
    expect(() => tdd.createVideoCategories(entries, catList)).toThrow(/Unknown/g);
  });

  it('throws error when no categories are found.', async () => {
    const entries = await mockSB.getCMSEntries(toSBlokOpt('test/singlepage'));
    expect(() => tdd.createVideoCategories(entries, catList)).toThrow(/Missing/g);
  });
});



describe('buildVideos(options, withCategories)', () => {
  const path = `${mockDir}/buildVideos`;
  const fileName = 'testFile';

  afterEach(async () => {
    await del(`${path}/${fileName}.json`);
    await del(`${path}/${fileName}Manifest.json`);
  });

  it('save manifest file as options.fileName + "Manifest".', async () => {
    await tdd.buildVideos(toVideoOptions('test/singlepage', `${fileName}`, path));
    expect(existsSync(`${path}/${fileName}Manifest.json`)).toBe(true);
  });

  it('save manifest as a hash-only manifest.', async () => {
    await tdd.buildVideos(toVideoOptions('test/singlepage', `${fileName}`, path));
    const file = await readFile(`${path}/${fileName}Manifest.json`, { encoding: 'utf-8'});
    const manifest = JSON.parse(file);
    expect(Object.keys(manifest).length).toBe(3);
    const objProperties = Object.getOwnPropertyNames(manifest[0]);
    expect(objProperties.includes('hash')).toBe(true);
    expect(objProperties.includes('id')).toBe(true);
    expect(objProperties.includes('title')).toBe(true);
  });

  it('skip processing if entries have not been updated.', async () => {
    const fileName = 'normalTestFile';
    const catFileName = 'catTestFile';
    const [,,isUpdated] = await tdd.buildVideos(toVideoOptions('test/singlepage', `${fileName}`, path));
    const [,,isCatUpdated] = await tdd.buildVideos(
      toVideoOptions('test/category/videos', `${catFileName}`, path, 'test/category/list')
    );
    expect(isUpdated).toBe(false);
    expect(isCatUpdated).toBe(false);
    await del(`${path}/${fileName}.json`);
    await del(`${path}/${catFileName}.json`);
  });

  it('saves entries as video categories with hash-only manifest.', async () => {
    const [,,isUpdated] = await tdd.buildVideos(
      toVideoOptions('test/category/videos', `${fileName}`, path, 'test/category/list')
    );
    const file = await readFile(`${path}/${fileName}.json`, { encoding: 'utf-8'});
    const categoryVideos = JSON.parse(file) as VideoCategoryArray;
    expect(categoryVideos[0].name).toBe('General Spirituality (Meta-Spirituality)');
    expect(categoryVideos.length).toBe(5);
    expect(isUpdated).toBe(true);
  });
});











