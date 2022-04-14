import del from "del";
import { existsSync } from "fs";
import { join as pathJoin } from "path";
import { copyFile, readdir, readFile, writeFile } from "fs/promises";
import { _tdd_buildLiterature } from "../src/build_literature";
import { CMSEntry, CMSOptions, PartialCMSEntry, useStoryblok } from "../src/services/storyblok";
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";







const tdd = _tdd_buildLiterature!;
const mockSB = useStoryblok(mockStoryblokAPI);
const mockDir = './__mocks__/build_literature';

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

function build(starts_with: string, path: string) {
  return tdd.buildLiterature({
    buildPath: `${mockDir}/${path}`,
    starts_with,
    version: 'draft',
    sort_by: 'created_at:asc',
    api: mockStoryblokAPI,
  })();
}

async function copyFiles(src: string, dest: string) {
  const fileNames = await readdir(src);
  for (const fileName of fileNames) {
    const filePath = pathJoin(src, fileName);
    const fileDestPath = pathJoin(dest, fileName);
    await copyFile(filePath, fileDestPath);
  }
}







describe('fitTitle(maxLen)(title)', () => {
  const testStr = 'hello world';

  it('return title without truncation if title length < maxLen', () => {
    const title = tdd.fitTitle(11)(testStr);
    expect(title).toBe('hello world');
  });

  it('truncate title to maxLen if title length > maxLen', () => {
    const title = tdd.fitTitle(5)(testStr);
    expect(title).toBe('hello...');
  });

  it('truncates title to first non-whitespace character', () => {
    const title = tdd.fitTitle(6)(testStr);
    expect(title).toBe('hello...');
  });
});



describe('deleteLiterature(folderPath)(litEntry)', () => {
  it('deletes an mdhtml file using the litEntry id, from the folderPath', async () => {
    const entry = (await mockSB.getCMSEntries(toSBlokOpt('test/simple')))[0];
    const filePath = `${mockDir}/${entry.id}.mdhtml`;
    await writeFile(filePath, '123');
    const file = await readFile(filePath, { encoding: 'utf-8'});
    expect(file).toBe('123');
    await tdd.deleteLiterature(mockDir)(entry);
    expect(existsSync(filePath)).toBe(false);
  });
});


describe('saveLiterature(folderPath)(litEntry)', () => {
  it('throw error if missing body property', async () => {
    const entry = (await mockSB.getCMSEntries(toSBlokOpt('test/simple')))[0] as PartialCMSEntry;
    entry.body = undefined;
    expect(() => tdd.saveLiterature(mockDir)(entry as CMSEntry)).toThrow();
  });

  it('write body to mdhtml file with litEntry id as file name, to folderPath', async () => {
    const entry = (await mockSB.getCMSEntries(toSBlokOpt('test/simple')))[0];
    const filePath = `${mockDir}/${entry.id}.mdhtml`;
    const bodyContent = `<p>Some body text <a href="http://somedomain.com/somepage.html" target="_blank" rel="noopener">link</a></p>\n`;
    await tdd.saveLiterature(mockDir)(entry);
    const file = await readFile(filePath, { encoding: 'utf-8'});
    expect(file).toBe(bodyContent);
    del(filePath);
  });
});


describe('buildLiterature(options)()', () => {
  it('save literature when adding an entry', async () => {
    const entry = (await mockSB.getCMSEntries(toSBlokOpt('test/multipage')))[0];
    const mockFolder = `${mockDir}/addEntry`;
    const mockFilepath = `${mockFolder}/addEntry.json`;
    await copyFiles(`${mockFolder}/mock_files`, `${mockFolder}`);
    await del(`${mockFolder}/69866748.mdhtml`);
    expect(existsSync(`${mockFolder}/69866748.mdhtml`)).toBe(false);
    await build('test/multipage', 'addEntry');
    expect(existsSync(`${mockFolder}/69866748.mdhtml`)).toBe(true);
    const addedEntry = JSON.parse(await readFile(`${mockFilepath}`, 'utf-8'))[0];
    expect(addedEntry.id).toEqual(entry.id);

  });

  it('save literature when updating an entry', async () => {
    const mockFolder = `${mockDir}/updateEntry`;
    const mockFilepath = `${mockFolder}/updateEntry.json`;
    await copyFiles(`${mockFolder}/mock_files`, `${mockFolder}`);
    const oldManifest = await readFile(`${mockFilepath}`, 'utf-8');
    const oldContent = await readFile(`${mockFolder}/69866748.mdhtml`, 'utf-8');
    const oldEntry = JSON.parse(oldManifest)[0];
    await build('test/multipage', 'updateEntry');
    const updatedEntry = JSON.parse(await readFile(`${mockFilepath}`, 'utf-8'))[0];
    const updatedContent = await readFile(`${mockFolder}/69866748.mdhtml`, 'utf-8');
    expect(updatedContent).not.toBe(oldContent);
    expect(updatedEntry.hash).not.toBe(oldEntry.hash);
  });

  it('delete literature when removing an entry', async () => {
    const mockFolder = `${mockDir}/deleteEntry`;
    const mockFilepath = `${mockFolder}/deleteEntry.json`;
    await copyFiles(`${mockFolder}/mock_files`, `${mockFolder}`);
    const oldEntries = JSON.parse(await readFile(`${mockFilepath}`, 'utf-8'));
    expect(oldEntries.length).toBe(3);
    expect(existsSync(`${mockFolder}/69866783.mdhtml`)).toBe(true);
    expect(existsSync(`${mockFolder}/69866784.mdhtml`)).toBe(true);
    await build('test/simple', 'deleteEntry');
    expect(existsSync(`${mockFolder}/69866783.mdhtml`)).toBe(false);
    expect(existsSync(`${mockFolder}/69866784.mdhtml`)).toBe(false);
    const newEntries = JSON.parse(await readFile(`${mockFilepath}`, 'utf-8'));
    expect(newEntries.length).toBe(1);
  });
});











