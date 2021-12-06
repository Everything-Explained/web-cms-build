import { createBuilder, toManifestEntry, toMd4hash, toShortHash, tryCatch, tryGetJSONFromFile } from "../src/build";
import { CMSOptions, slugify, useCMS } from "../src/services/cms_core";
import { useMockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import litItem from '../__mocks__/fixtures/lit_item.json';
import { readFile, writeFile, stat } from 'fs/promises';
import mockManifest from '../__mocks__/testUpdateManifest/mockManifest.json';
import del from 'del';


const cms              = useCMS();
const mockAPI          = useMockStoryblokAPI();
const litItemPath      = './__mocks__/fixtures/lit_item.json';


function toStoryBlokOpts(slug: string, page?: number, per_page?: number) {
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

function getBuilder(filesPath: string, url: string, logging = false) {
  return createBuilder({
    url,
    filesPath,
    starts_with: '',
    logging,
    exec: mockAPI.get
  });
}

function getSimpleBuilder(filesPath: string) {
  return getBuilder(filesPath, 'test/simple');
}

function getMultipageBuilder(filesPath: string) {
  return getBuilder(filesPath, 'test/multipage');
}


describe('createBuilder().log(msg)', () => {
  it('will not display a log if logging set to false', async () => {
    const activeDir = './__mocks__/test';
    const builder = await getBuilder(activeDir, 'test/simple', false);
    expect(builder._tdd.logging).toBe(false);
  });

  it('will display a log if logging set to true', async () => {
    const activeDir = './__mocks__/test';
    const builder = await getBuilder(activeDir, 'test/simple', true);
    expect(builder._tdd.logging).toBe(true);
  });

  it('will display a log if logging is undefined', async () => {
    const activeDir = './__mocks__/test';
    const builder = await createBuilder({
      url: 'test/simple',
      filesPath: activeDir,
      starts_with: '',
      exec: mockAPI.get,
    });
    expect(builder._tdd.logging).toBe(undefined);
  });
});


describe('createBuilder().updateManifest()', () => {
  it('updates, deletes, and changes all applicable entries then saves as manifest', async () => {
    const activeDir = './__mocks__/testUpdateManifest';
    const changedEntryPath = `${activeDir}/another-lit-post-with-an-internal-link.mdhtml`;
    const testBodyText = 'This is some body text';
    const deletedPath = `${activeDir}/post-to-delete.mdhtml`;
    await writeFile(`${activeDir}/testUpdateManifest.json`, JSON.stringify(mockManifest, null, 2));
    await writeFile(changedEntryPath, testBodyText);
    await writeFile(deletedPath, testBodyText);
    const builder = await getMultipageBuilder(activeDir);
    builder.updateManifest();
    // New entry body saved to file
    expect((await readFile(`${changedEntryPath}`, 'utf-8'))).not.toBe(testBodyText);
    const newBuilder = await getMultipageBuilder(activeDir);
    // New entry added to manifest and deleted entry has been removed
    expect(newBuilder._tdd.manifest[2].ver).toBe('7fd7fdb409fcc');
    // Entry to delete has been deleted
    await readFile(deletedPath)
      .then((res) => { throw Error(`file not deleted: ${res}`); })
      .catch(e => expect(e.message).toContain('ENOENT'));
    // Reset deleted file
    await writeFile(deletedPath, testBodyText);
  });

  it('does not save to manifest if there are no changes', async () => {
    const activeDir = './__mocks__/testNoChanges';
    const fileStats = await stat(`${activeDir}/testNoChanges.json`);
    const builder = await getSimpleBuilder(activeDir);
    builder.updateManifest();
    const newFileStats = await stat(`${activeDir}/testNoChanges.json`);
    expect(fileStats.mtimeMs).toBe(newFileStats.mtimeMs);
  });
});


describe('createBuilder().tryAddEntry(stories)', () => {
  it('returns true when entry is added', async () => {
    const activeDir = './__mocks__/testAddEntry/testReturn';
    const builder = await getMultipageBuilder(activeDir);
    const addedStory = builder._tdd.stories[2];
    expect(builder._tdd.tryAddEntries(builder._tdd.stories)).toBe(true);
    await del(`${activeDir}/${addedStory.slug}.mdhtml`);
  });

  it('saves entry body to file when an entry is added', async () => {
    const activeDir = './__mocks__/testAddEntry/testAddition';
    const builder = await getMultipageBuilder(activeDir);
    const addedStory = builder._tdd.stories[2];
    await del(`${activeDir}/${addedStory.slug}.mdhtml`);
    builder._tdd.tryAddEntries(builder._tdd.stories);
    // We can't await on tryAddEntries, so we need to manually wait
    setTimeout(async () => {
      expect(await readFile(`${activeDir}/${addedStory.slug}.mdhtml`, 'utf-8'))
        .toBe(addedStory.body);
    }, 1);
  });
});


describe('createBuilder().tryDeleteEntries(stories)', () => {
  it('returns true if an entry was deleted', async () => {
    const activeDir = './__mocks__/testDeleteEntry/testReturn';
    const builder = await getSimpleBuilder(activeDir);
    const manifest = builder._tdd.manifest;
    const fileName = slugify(manifest[1].title);
    await writeFile(`${activeDir}/${fileName}.mdhtml`, 'Some body text');
    expect(builder._tdd.tryDeleteEntries(builder._tdd.stories)).toBe(true);
  });

  it('deletes the entry file if an entry was deleted', async () => {
    const activeDir = './__mocks__/testDeleteEntry/testDeletion';
    const builder = await getSimpleBuilder(activeDir);
    const manifest = builder._tdd.manifest;
    const fileName = slugify(manifest[1].title);
    const pathToDelete = `${activeDir}/${fileName}`;
    await writeFile(`${pathToDelete}.mdhtml`, 'Some body text');
    builder._tdd.tryDeleteEntries(builder._tdd.stories);
    await readFile(pathToDelete)
      .then((res) => { throw Error(`file not deleted: ${res}`); })
      .catch(e => expect(e.message).toContain('ENOENT'))
    ;
  });

});


describe('createBuilder().tryUpdateEntries(stories)', () => {
  it('returns true if an entry has been updated', async () => {
    const pathTestChangedEntry = './__mocks__/testChangedEntry/testReturn';
    const builder  = await getMultipageBuilder(pathTestChangedEntry);
    const manifest = builder._tdd.manifest;
    const stories  = builder._tdd.stories;
    expect(manifest[1].summary).toEqual('This is not the original summary');
    expect(builder._tdd.tryUpdateEntries(stories)).toBe(true);
  });

  it('overwrites entry file if changes occurred', async () => {
    const pathTestChangedEntry = './__mocks__/testChangedEntry/testOverwrite';
    const builder = await getSimpleBuilder(pathTestChangedEntry);
    const oldStory = { ...builder._tdd.stories[0], body: 'This is some body text' };
    const oldEntry = toManifestEntry(oldStory);
    await writeFile(`${pathTestChangedEntry}/testOverwrite.json`, JSON.stringify([oldEntry], null, 2));
    const body = await readFile(`${pathTestChangedEntry}/${oldStory.slug}.mdhtml`, 'utf8');
    expect(builder._tdd.tryUpdateEntries(builder._tdd.stories)).toBe(true);
    expect(body).toBe(builder._tdd.stories[0].body);
  });

  it('skips entries that do not exist', async () => {
    const pathTestChangedEntry = './__mocks__/testChangedEntry/testSkipMissingEntries';
    const builder = await getMultipageBuilder(pathTestChangedEntry);
    expect(builder._tdd.tryUpdateEntries(builder._tdd.stories)).toBe(false);
  });
});


describe('createBuilder().saveBodyToFile(entry)', () => {
  const pathSaveBodyToFile = './__mocks__/saveBodyToFile';
  it('writes the body of a CMS Object to the file system using internal path', async () => {
    await getSimpleBuilder(pathSaveBodyToFile);
    const file = await readFile(`${pathSaveBodyToFile}/a-new-lit-post-that-contains-an-image.mdhtml`, 'utf-8');
    const bodyContent =
      `<p>Some body text <a href="http://somedomain.com/somepage.html" target="_blank" rel="noopener">link</a></p>`
    ;
    expect(file).toContain(bodyContent);
  });

  afterAll(() => del(pathSaveBodyToFile));
});


describe('createBuilder().deleteFile(filename)', () => {
  const pathDeleteFile = './__mocks__/deleteFile';
  it('deletes the specified filename from the internal buildpath', async () => {
    const builder = await getSimpleBuilder(pathDeleteFile);
    const deleteFile = builder._tdd.deleteFile;
    const buildPath = builder._tdd.buildPath;
    const file = await readFile(`${buildPath}/deleteFile.json`, 'utf-8');
    expect(file).toContain('69866748');
    return expect(deleteFile("deleteFile.json")).resolves.toBeFalsy();
  });

  afterAll(() => { del(pathDeleteFile); });
});


describe('createBuilder().hasSameID', () => {
  const pathHasSameID = './__mocks__/hasSameID';

  it('returns true if if specified objects IDs are identical', async () => {
    const builder = await getSimpleBuilder(pathHasSameID);
    const hasSameID = builder._tdd.hasSameID;
    expect(hasSameID({id: 1})({id: 1})).toBe(true);
  });

  afterAll(() => { del(pathHasSameID); });
});


describe('createBuilder().saveAsJSON(fileName)(data)', () => {
  it('saves data as JSON to specified filename in active dir', async () => {
    const activeDir = './__mocks__/test';
    const builder = await getSimpleBuilder(activeDir);
    await builder._tdd.saveAsJSON('temp.json')({ test: 'hello world' });
    const data = JSON.parse((await readFile(`${activeDir}/temp.json`, 'utf-8')));
    expect(data.test).toBe('hello world');
    await del(`${activeDir}/temp.json`);
  });
});


describe('createBuilder().createDir(data)', () => {
  it('creates the directory specified by the builder', async () => {
    await getSimpleBuilder('./__mocks__/createDir');
    return expect(readFile('./__mocks__/createDir/createDir.json', 'utf-8'))
            .resolves
            .toContain('69866748');
  });

  it('does NOT throw error if directory already exists', async () => {
    const builder = await getSimpleBuilder('./__mocks__/testEEXIST');
    expect(() => builder._tdd.createDir('test')).not.toThrow();
  });

  afterAll(() => {
    const pathCreateDir = './__mocks__/createDir';
    const pathEEXIST = './__mocks__/testEEXIST/*';
    del(pathCreateDir);
    del(pathEEXIST);
  });
});


describe('toManifestEntry(story)', () => {
  it('returns a ManifestEntry object', done => {
    cms
      .getContent(toStoryBlokOpts('test/singlepage'), mockAPI.get)
      .then(res => {
        const validEntry = {
          id      : 69866748,
          summary : 'This is a fake summary for the purpose of testing',
          title   : 'A New Lit Post that contains an Image',
          author  : 'Jaeiya',
          date    : '2021-09-04T20:19:21.969Z',
          ver     : 'f73c556beff41'
        };
        const entry = toManifestEntry(res[0]);
        expect(entry).toEqual(validEntry);
        done();
      })
      .catch(done);
  });
});


describe('tryGetJSONFromFile<T>(path)', () => {
  it('reads a file and returns a JSON object on success', async () => {
    const resp = await tryGetJSONFromFile<typeof litItem>(litItemPath);
    if (resp) {
      expect(resp.name).toBe('Literature Item 1');
    }
  });

  it('throws an error if promise rejects', async () => {
    await expect(() => tryGetJSONFromFile('test/path.json')).rejects.toThrow();
  });

});


describe('toShortHash(data)', () => {
  it('returns a short hash of any given data', () => {
    const objData = { a: 'b', c: 'd' };
    expect(toShortHash(objData)).toBe('b27cab4df9ddb');
    const strData = 'this is a string';
    expect(toShortHash(strData)).toBe('7a34837405834');
    const arrayData = [1, 2, 3, 4];
    expect(toShortHash(arrayData)).toBe('e0fa4174ebc58');
    const numData = 123456790;
    expect(toShortHash(numData)).toBe('57ad39c70d849');
    const boolData = true;
    expect(toShortHash(boolData)).toBe('89bffb973de6b');
  });

  it('returns a 13 char hash', () => {
    const data = 'test';
    expect(toShortHash(data).length).toBe(13);
  });
});


describe('toMd4hash(str)', () => {
  it('returns an md4 hash of a str', () => {
    const hash = toMd4hash('hello world');
    expect(hash).toBe('d7712b222699d243d3b22f39e020a796');
  });
});


describe('tryCatch<T>(promise<T>)', () => {
  it('returns data from promise if promise does NOT throw error', async () => {
    const okPromise = Promise.resolve(true);
    const resp = await tryCatch(okPromise);
    expect(resp).toBe(true);
  });

  it ('returns Error if promise throws an Error', async () => {
    const badPromise = new Promise(() => { throw Error('test'); });
    const resp = await tryCatch(badPromise);
    expect(resp instanceof Error).toBe(true);
  });
});
