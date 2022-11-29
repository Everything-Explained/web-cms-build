import del from 'del';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { delayExec, hasSameID, isENOENT, isError, mkDirs, saveAsJSON, setIfInDev, slugify, toShortHash, truncateStr, tryCatchAsync, tryCreateDir } from '../src/lib/utils/utilities';





const MOCK_DIR = './__mocks__/utilities';


describe('tryCatchAsync(promise)', () => {
  it('returns expected data when promise resolves', async () => {
    const data = await tryCatchAsync(readFile(`${MOCK_DIR}/tryCatchAsync/test.txt`));
    expect(data.toString('ascii')).toBe('this is some data');
  });

  it('returns an error object when promise is rejected', async () => {
    const data = await tryCatchAsync(readFile(`${MOCK_DIR}/tryCatchAsync/doesnotexist.txt`));
    const dataIsError = data instanceof Error;
    expect(dataIsError).toBe(true);
    if (dataIsError) {
      expect(data.message.includes('ENOENT: no such file or directory')).toBe(true);
    }
  });
});


describe('tryCreateDir(dirPath)(anyData)', () => {
  it('creates the directory and returns a function that accepts and returns any data.', () => {
    const mockPath = `${MOCK_DIR}/tryCreateDir/create`;
    const f = tryCreateDir(mockPath);
    expect(f('a')).toBe('a');
    del(mockPath);
  });

  it('returns a function that accepts and returns any data, when directory already exists.', () => {
    const mockPath = `${MOCK_DIR}/tryCreateDir/exists`;
    const f = tryCreateDir(mockPath);
    expect(f('b')).toBe('b');
  });

  it('throws an error when path leading up to directory does not exist.', () => {
    const mockPath = `${MOCK_DIR}/tryCreateDir/doesnotexist/nope`;
    expect(() => tryCreateDir(mockPath)).toThrow();
  });
});


describe('slugify(string)', () => {
  it(`lowercase the string`, () => {
    expect(slugify('AbCdEfGHIJkLmNOP')).toBe('abcdefghijklmnop');
  });

  it('replaces all whitespace with a hyphen', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('replaces all repeated hyphens with a hyphen', () => {
    // White-space creates hyphens
    expect(slugify('hello       world   today')).toBe('hello-world-today');
    expect(slugify('hello-------world---today')).toBe('hello-world-today');
  });

  it('remove trailing hyphens', () => {
    // White-space creates hyphens
    expect(slugify('hello world   ')).toBe('hello-world');
    expect(slugify('hello world---')).toBe('hello-world');
  });

  it('removes all characters that are not a-z, 0-9, or a hyphen', () => {
    expect(slugify('%!hello!! &*w&o/r<l+d 420')).toBe('hello-world-420');
    expect(slugify('hello----/?----world---@')).toBe('hello-world');
  });

  it('normalize certain Greek characters to an English equivalent', () => {
    expect(slugify('α')).toBe('a');
    expect(slugify('β')).toBe('b');
  });
});


describe('truncateStr(number)(string)', () => {
  it('truncates string to specified number of chars.', () => {
    const t = truncateStr(5);
    expect(typeof t == 'function').toBe(true);
    expect(t('hello world')).toBe('hello');
    expect(t('hello world').length).toBe(5);
  });

  it('throws error when trying to truncate <= 0 chars.', () => {
    expect(() => truncateStr(0)('hello')).toThrow();
    expect(() => truncateStr(-10)('hello')).toThrow();
  });
});


describe('toShortHash(data)', () => {
  it('returns a hash of the provided data', () => {
    expect(toShortHash('hello world')).toBe('87c41abf1f72c');
  });

  it('truncates the hash to 13 characters', () => {
    expect(toShortHash('hello world').length).toBe(13);
  });
});


describe('saveAsJSON(path, filename)(anyData)', () => {
  it('returns a function that writes data using path and filename.', async () => {
    const mockPath = `${MOCK_DIR}/saveAsJSON`;
    const mockFile = `${mockPath}/filename1.json`;
    const save = saveAsJSON(mockPath, 'filename1');
    await save(['hello world']);
    const file = JSON.parse((await readFile(mockFile)).toString('ascii'));
    expect(file[0]).toBe('hello world');
    del(mockFile);
  });

  it('returns a function that returns the original data.', async () => {
    const mockPath = `${MOCK_DIR}/saveAsJSON`;
    const mockFile = `${mockPath}/filename2.json`;
    const save = saveAsJSON(mockPath, 'filename2');
    expect(typeof save).toBe('function');
    const data = await save('hello world');
    expect(data).toBe('hello world');
    del(mockFile);
  });

  it('throws an error if a bad path is given.', async () => {
    const mockPath = `${MOCK_DIR}/doesnotexist`;
    const save = saveAsJSON(mockPath, 'filename2');
    const error = await tryCatchAsync(save('hello world'));
    expect(error instanceof Error).toBe(true);
  });
});


describe('hasSameID(obj1)(obj2)', () => {
  it('returns true if objects both contain the same ID.', () => {
    expect(hasSameID({ id: 'hello' })({ id: 'hello' })).toBe(true);
  });

  it('returns false if objects do not contain same ID.', () => {
    expect(hasSameID({ id: 'hello' })({ id: 'world' })).toBe(false);
  });
});


describe('setIfInDev(anyData)', () => {
  it('returns data if node environment is NOT production.', () => {
    expect(setIfInDev('hello')).toBe('hello');
  });

  it('returns null if node environment IS production.', () => {
    process.env.NODE_ENV = 'production';
    expect(setIfInDev('hello')).toBe(null);
    process.env.NODE_ENV = '';
  });
});


describe('isENOENT(error)', () => {
  it('returns true if error code is ENOENT.', () => {
    expect(isENOENT(Error('ENOENT: some kind of message'))).toBe(true);
  });

  it('returns false if error code is not ENOENT.', () => {
    expect(isENOENT(Error('no error code'))).toBe(false);
  });
});

describe('isError(obj)', () => {
  it('returns whether or not any type is an error type', () => {
    const error = new Error('some error');
    expect(isError(error)).toBe(true);
    expect(isError('hello')).toBe(false);
    expect(isError(['hello'])).toBe(false);
    expect(isError({ hello: 'world'})).toBe(false);
    expect(isError(5)).toBe(false);
  });
});


describe('delayExec(timeInMs)(cb)', () => {
  it('delays the execution of the callback function by timeInMs', async () => {
    const now = Date.now();
    await (new Promise<boolean>((rs) => {
      delayExec(20)(() => {
        const timeDiff = Date.now() - now;
        // Code execution timing is highly irregular and unpredictable
        // so we have to go with a range of possible valid time differences.
        expect(timeDiff).toBeGreaterThan(18);
        expect(timeDiff).toBeLessThan(20 * 1.9);
        rs(true);
      });
    }));
  });
});


describe('mkDirs(dirs)', () => {
  const mockDir = `${MOCK_DIR}/mkDirs`;

  it('skip directories that already exist', () => {
    expect(() => mkDirs([`${mockDir}/skipThisDir1`, `${mockDir}/skipThisDir2`])).not.toThrow();
  });

  it('create all directories from array of dirs', async () => {
    mkDirs([`${mockDir}/testDir1`, `${mockDir}/testDir2`]);
    expect(existsSync(`${mockDir}/testDir1`)).toBe(true);
    expect(existsSync(`${mockDir}/testDir2`)).toBe(true);
    await del([`${mockDir}/testDir1`, `${mockDir}/testDir2`]);
  });

  it('create only directories that have not been skipped', async () => {
    mkDirs([
      `${mockDir}/skipThisDir1`,
      `${mockDir}/testDir3`,
      `${mockDir}/skipThisDir2`,
      `${mockDir}/testDir4`,
    ]);
    expect(existsSync(`${mockDir}/testDir3`)).toBe(true);
    expect(existsSync(`${mockDir}/testDir4`)).toBe(true);
    await del([`${mockDir}/testDir3`, `${mockDir}/testDir4`]);
  });
});





