

import del from "del";
import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import { BuildOptionsInternal, HashManifestEntry, _tdd_buildManifest } from "../src/lib/build_manifest";
import { CMSEntry, CMSOptions, useStoryblok } from "../src/lib/services/storyblok";
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import { resolve as pathResolve } from "path";







const tdd = _tdd_buildManifest!;
const sb = useStoryblok(mockStoryblokAPI);
const mockDir = './__mocks__/build_manifest';
const mockCMSEntry: CMSEntry = {
  id: 38123974,
  title: 'hello world',
  author: 'author',
  summary: 'summary',
  categoryTable: [],
  category: 'AB',
  hash: '42O691ee7',
  date: '2022-03-10T22:09:42.359Z'
};


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

function mockBuildOptions(opts: {[key: string]: any}) {
  const defaultOptions: BuildOptionsInternal = {
    url: 'test/multipage',
    starts_with: 'test/multipage',
    version: 'draft',
    sort_by: 'created_at:desc',
    manifestName: 'temp_name',
    api: mockStoryblokAPI,
    isInit: false,
    canSave: true,
    isHashManifest: false,
    buildPath: ''
  };
  return { ...defaultOptions, ...opts };
}







describe('readManifestFile(path, filename)', () => {
  it('returns an array of manifest entries from the manifest file.', async () => {
    const path     = `${mockDir}/readManifestFile`;
    const filename = 'readManifestFile';
    const entries  = await tdd.readManifestFile(path, filename);
    expect(entries instanceof Array).toBe(true);
    expect('hash' in entries[0]).toBe(true);
    expect(typeof entries[0]).toBe('object');
  });
});



describe('toManifestEntry(cmsEntry)', () => {
  it('return ManifestEntry object.', async () => {
    const manifestEntry = tdd.toManifestEntry(mockCMSEntry);
    expect(manifestEntry).toEqual({
      id       : 38123974,
      title    : 'hello world',
      author   : 'author',
      summary  : 'summary',
      category : 'AB',
      hash     : '42O691ee7',
      date     : '2022-03-10T22:09:42.359Z'
    });
  });
});



describe('toHashManifestEntry(cmsEntry)', () => {
  it('return HashManifestEntry object.', async () => {
    const manifestEntry = tdd.toHashManifestEntry(mockCMSEntry);
    expect(manifestEntry).toEqual({
      id    : 38123974,
      title : 'hello world',
      hash  : '42O691ee7',
    });
  });
});



describe('detectAddedEntries(onAddEntries)(oldEntries, latestEntries)', () => {
  it('returns true if new entries have been detected.', async () => {
    const path = `${mockDir}/detectAddedEntries`;
    const latestEntries   = await sb.getCMSEntries(toSBlokOpt('test/simple'));
    const oldEntries      = await tdd.readManifestFile(path, 'detectAddedEntries');
    const hasAddedEntries = tdd.detectAddedEntries(() => void(0))(oldEntries, latestEntries);
    expect(hasAddedEntries).toBe(true);
  });

  it('calls onAddEntries(addedEntry) for each new entry detected.', async () => {
    const path = `${mockDir}/detectAddedEntries`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const oldEntries    = await tdd.readManifestFile(path, 'detectAddedEntries');
    let counter = 0;
    const onAddedEntries = () => ++counter;
    tdd.detectAddedEntries(onAddedEntries)(oldEntries, latestEntries);
    expect(counter).toBe(3);
  });
});



describe('detectDeletedEntries(onDeletedEntry)(oldEntries, latestEntries)', () => {
  it('returns true if deleted entries have been detected.', async () => {
    const path = `${mockDir}/detectDeletedEntries`;
    const latestEntries     = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const oldEntries        = await tdd.readManifestFile(path, 'detectDeletedEntries');
    const hasDeletedEntries = tdd.detectDeletedEntries(() => void(0))(oldEntries, latestEntries);
    expect(hasDeletedEntries).toBe(true);
  });

  it('calls onDeletedEntry(deletedEntry) for each deleted entry detected.', async () => {
    const path = `${mockDir}/detectDeletedEntries`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const oldEntries    = await tdd.readManifestFile(path, 'detectDeletedEntries');
    let counter = 0;
    tdd.detectDeletedEntries(
      (deletedEntry: CMSEntry|HashManifestEntry) => {
        ++counter;
        if (counter == 1) expect(deletedEntry.hash).toBe('abracadabra');
        if (counter == 2) expect(deletedEntry.hash).toBe('bighashdaddy');
      }
    )(oldEntries, latestEntries);
    expect(counter).toBe(2);
  });
});



describe('detectUpdatedEntries(onUpdatedEntries)(oldEntries, latestEntries)', () => {
  it('return true if updated entries have been detected.', async () => {
    const path = `${mockDir}/detectUpdatedEntries`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const oldEntries    = await tdd.readManifestFile(path, 'detectUpdatedEntries');
    const hasUpdatedEntries = tdd.detectUpdatedEntries(() => void(0))(oldEntries, latestEntries);
    expect(hasUpdatedEntries).toBe(true);
  });

  it('calls onUpdatedEntries(updatedEntry) for each updated entry detected.', async () => {
    const path = `${mockDir}/detectUpdatedEntries`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const oldEntries    = await tdd.readManifestFile(path, 'detectUpdatedEntries');
    let counter = 0;
    tdd.detectUpdatedEntries((updatedEntry) => {
      ++counter;
      expect(updatedEntry.hash).toBe('2c6181fe83007');
    })(oldEntries, latestEntries);
    expect(counter).toBe(1);
  });
});



describe('initManifest(entries, options)', () => {
  it('initializes a new manifest using specified entries and options.', async () => {
    const dir = `${mockDir}/initManifest`;
    const filePath = `${dir}/init_manifest.json`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const options = mockBuildOptions({ manifestName: 'init_manifest', buildPath: dir});
    const entries = await tdd.initManifest(latestEntries, options);
    expect(entries.length).toBe(3);
    expect(existsSync(filePath)).toBe(true);
    del(filePath);
  });

  it('creates a directory for the manifest.', async () => {
    const dir = `${mockDir}/initManifest/folderToCreate`;
    const filePath = `${dir}/init_manifest.json`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const options = mockBuildOptions({ manifestName: 'init_manifest', buildPath: dir});
    const entries = await tdd.initManifest(latestEntries, options);
    expect(entries.length).toBe(3);
    expect(existsSync(filePath)).toBe(true);
    del(dir);
  });

  it('executes the onAdd() handler for every entry.', async () => {
    const dir = `${mockDir}/initManifest`;
    const filePath = `${dir}/init_manifest_add.json`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    let addCount = 0;
    const options = mockBuildOptions({
      manifestName: 'init_manifest_add',
      buildPath: dir,
      onAdd: () => ++addCount
    });
    await tdd.initManifest(latestEntries, options);
    expect(addCount).toBe(3);
    del(filePath);
  });

  it('should not save manifest if options.canSave is set to false.', async () => {
    const dir = `${mockDir}/initManifest`;
    const filePath = `${dir}/should_not_save.json`;
    const options = mockBuildOptions({
      manifestName: 'should_not_save',
      buildPath: dir,
      canSave: false
    });
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    await tdd.initManifest(latestEntries, options);
    expect(existsSync(filePath)).toBe(false);
  });
});



describe('getManifestEntries(latestEntries, options)', () => {
  const dir = `${mockDir}/getManifestEntries`;

  it('initialize a manifest using the latest entries, if it does not exist.', async () => {
    const filePath = `${dir}/init_manifest.json`;
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const options = mockBuildOptions({ manifestName: 'init_manifest', buildPath: dir });
    await tdd.getManifestEntries(latestEntries, options);
    expect(existsSync(filePath)).toBe(true);
    del(filePath);
  });

  it('read existing manifest if it exists.', async () => {
    const latestEntries = await sb.getCMSEntries(toSBlokOpt('test/multipage'));
    const options = mockBuildOptions({ manifestName: 'existing_manifest', buildPath: dir });
    const entries = await tdd.getManifestEntries(latestEntries, options);
    expect(entries[0].id).toBe(420691337);
  });
});



describe('buildManifest(options)', () => {
  const _dir = `${mockDir}/buildManifest`;
  const _filePath = `${_dir}/buildManifest.json`;
  const _options = mockBuildOptions({ manifestName: undefined, buildPath: _dir });

  beforeEach(async () => {
    await tdd.buildManifest(_options);
  });

  afterEach(async () => {
    await del(_filePath);
  });

  it('uses buildPath folder as default manifest file name.', async () => {
    expect(existsSync(_filePath)).toBe(true);
  });

  it('does not save entries if no entries are modified.', async () => {
    const fileStats1 = await stat(_filePath);
    await tdd.buildManifest(_options);
    const fileStats2 = await stat(_filePath);
    expect(fileStats2.mtimeMs).toBe(fileStats1.mtimeMs);
  });

  it('saves manifest when entries have been modified.', async () => {
    const testFileContent = await readFile(_filePath, { encoding: 'utf-8' });
    expect(testFileContent.includes('69866748')).toBe(true);
    const options = { ..._options, starts_with: 'test/category/videos' };
    await tdd.buildManifest(options);
    const rawEntries = await readFile(_filePath, { encoding: 'utf-8'});
    const entries = JSON.parse(rawEntries);
    expect(entries[0].id).toBe('rbkzASVI7wg');
  });

  it('does not save manifest if options.canSave is set to false.', async () => {
    const filePath = `${_dir}/should_not_save.json`;
    const options = mockBuildOptions({
      manifestName: 'should_not_save',
      buildPath: _dir,
      canSave: false
    });
    await tdd.buildManifest(options);
    expect(existsSync(filePath)).toBe(false);
  });

  it('does not create folder when options.canSave is set to false.', async () => {
    const buildPath = `${_dir}/should_not_save_folder`;
    const options = mockBuildOptions({
      manifestName: 'should_not_save',
      buildPath,
      canSave: false
    });
    await tdd.buildManifest(options);
    expect(existsSync(buildPath)).toBe(false);
  });

  it('saves hash-only manifest when isHashManifest set to true.', async () => {
    const fileName = 'hashOnly';
    const options = { ..._options, manifestName: fileName, isHashManifest: true };
    await tdd.buildManifest(options);
    const file = await readFile(`${_dir}/${fileName}.json`, { encoding: 'utf-8'});
    const entry = JSON.parse(file)[0];
    expect(entry).toEqual({
      "id": 69866748,
      "title": "A New Lit Post that contains an Image",
      "hash": "2c6181fe83007"
    });
    await del(`${_dir}/${fileName}.json`);
  });

  it('saves hash-only manifest when updates are discovered and isHashManifest is set to true.', async () => {
    const oldFile = await readFile(_filePath, { encoding: 'utf-8'});
    const oldEntry = JSON.parse(oldFile)[0];
    const options = { ..._options, starts_with: 'test/category/videos', isHashManifest: true };
    await tdd.buildManifest(options);
    const newFile = await readFile(_filePath, { encoding: 'utf-8'});
    const newEntry = JSON.parse(newFile)[0];
    expect(oldEntry.id).toBe(69866748);
    expect(newEntry.id).toBe('rbkzASVI7wg');
  });

  it('returns a tuple of filePath, manifest and entries update status.', async () => {
    const [filePath, latestEntries, isUpdated] = await tdd.buildManifest(_options);
    const correctBuildPath = pathResolve(_filePath);
    expect(filePath).toBe(correctBuildPath);
    expect(latestEntries.length).toBe(3);
    expect(isUpdated).toBe(false);
  });
});



















