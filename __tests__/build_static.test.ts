import del from "del";
import { readFile, writeFile } from "fs/promises";
import { BuildStaticOptions, buildStaticPage } from "../src/build/build_static";
import { tryCatchAsync } from "../src/utilities";
import { mockStoryblokAPI } from "../__mocks__/fixtures/sb_mock_api";
import staticFile from '../__mocks__/fixtures/static_page.json';






const mockDir = './__mocks__/build_static';
const mockStaticFile = {
  title: staticFile[0].content.title,
  body: 'not original content',
  hash: '12345',
};
const mockStaticFileAccurate = {
  title: staticFile[0].content.title,
  body: 'This is a static page with some <strong>body</strong> text and <em>markdown</em>',
  hash: 'f71eb227d79a7'
};

const setStaticOptions = (folder: string, name: string) => {
  const options: BuildStaticOptions = {
    folderPath: `${mockDir}/${folder}`,
    pageName: name,
    version: 'draft',
    api: mockStoryblokAPI
  };
  return options;
};





describe('buildStatic(options)', () => {
  it('throws error if path cannot be found', async () => {
    const resp = await tryCatchAsync(buildStaticPage(setStaticOptions('path_not_found', 'static')));
    const isError = resp instanceof Error;
    expect(isError).toBe(true);
    if (isError) expect(resp.message).toContain('CANNOT FIND PATH');
  });

  it('creates static page data if it does not already exist', async () => {
    const filePath = `${mockDir}/test_new_file/standalone/static.json`;
    const resp = await tryCatchAsync(buildStaticPage(setStaticOptions('test_new_file', 'static')));
    expect(resp).toBe(true);
    await del(filePath);
  });

  it('updates static page data when there are changes', async () => {
    const filePath = `${mockDir}/test_update/standalone/static.json`;
    await writeFile(filePath, JSON.stringify(mockStaticFile));
    const oldFile = await readFile(filePath, { encoding: 'utf-8'});
    const resp = await tryCatchAsync(buildStaticPage(setStaticOptions('test_update', 'static')));
    const newFile = await readFile(filePath, { encoding: 'utf-8'});
    expect(JSON.parse(oldFile).hash).toBe('12345');
    expect(JSON.parse(newFile).hash).toBe('f71eb227d79a7');
    expect(resp).toBe(true);
    await del(filePath);
  });

  it('does not update static page data if there are no changes', async () => {
    const filePath = `${mockDir}/standalone/static.json`;
    await writeFile(filePath, JSON.stringify(mockStaticFileAccurate));
    const resp = await tryCatchAsync(buildStaticPage(setStaticOptions('', 'static')));
    expect(resp).toBe(false);
    await del(filePath);
  });

  it('renders body content as markdown', async () => {
    const filePath = `${mockDir}/standalone/static.json`;
    await tryCatchAsync(buildStaticPage(setStaticOptions('', 'static')));
    const file = await readFile(filePath, { encoding: 'utf8'});
    const pageObj = JSON.parse(file);
    expect(pageObj.content).toContain('<strong>');
    expect(pageObj.content).toContain('<em>');
    await del(filePath);
  });
});

















