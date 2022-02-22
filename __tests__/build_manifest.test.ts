import del from "del";
import { existsSync, statSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { BuildOptionsInternal, _tdd_buildManifest } from "../src/build_manifest";
import { CMSEntry, CMSOptions, useStoryblok } from "../src/services/storyblok";
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import { resolve as pathResolve } from "path";







const tdd = _tdd_buildManifest!;
const sb = useStoryblok(mockStoryblokAPI);
const mockDir = './__mocks__/build_manifest';

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


// TODO - Change to detect**New**Entries()
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
      (deletedEntry: CMSEntry) => {
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


describe('initManifest(entries, opts)', () => {

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
    const options = mockBuildOptions({ manifestName: 'init_manifest_add', buildPath: dir, onAdd: () => ++addCount });
    await tdd.initManifest(latestEntries, options);
    expect(addCount).toBe(3);
    del(filePath);
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

  const dir = `${mockDir}/buildManifest`;

  it('uses buildPath folder as default manifest file name.', async () => {
    const filePath = `${dir}/buildManifest.json`;
    const options = mockBuildOptions({ manifestName: undefined, buildPath: dir });
    await tdd.buildManifest(options);
    expect(existsSync(filePath)).toBe(true);
    del(filePath);
  });

  it('does not save entries if no entries are modified.', async () => {
    const filePath = `${dir}/test_manifest.json`;
    const options = mockBuildOptions({ manifestName: 'test_manifest', buildPath: dir });
    const fileStats = statSync(filePath);
    await tdd.buildManifest(options);
    expect(fileStats.mtimeMs).toBe(1645548235897.6943);
  });

  it('saves manifest when entries have been modified.', async () => {
    const fileName = 'modified_manifest';
    const filePath = `${dir}/${fileName}.json`;
    const testFileContent = await readFile(filePath, { encoding: 'utf-8' });
    const options = mockBuildOptions({ manifestName: `${fileName}`, buildPath: dir });
    expect(testFileContent.includes('420691337')).toBe(true);
    await tdd.buildManifest(options);
    const rawEntries = await readFile(filePath, { encoding: 'utf-8'});
    const entries = JSON.parse(rawEntries);
    expect(entries[0].id).toBe(69866748);
    await writeFile(filePath, testFileContent);
  });

  it('returns a tuple of buildPath and manifest.', async () => {
    const options = mockBuildOptions({ manifestName: 'test_manifest', buildPath: dir });
    const [buildPath, latestEntries] = await tdd.buildManifest(options);
    const correctBuildPath = pathResolve(`${mockDir}/buildManifest`);
    expect(latestEntries.length).toBe(3);
    expect(buildPath).toBe(correctBuildPath);
  });

});


describe('', () => {

  it('', () => {
    //
  });

});





