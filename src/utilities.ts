import { createHmac } from "crypto";
import { mkdirSync } from "fs";
import { pipe } from "ramda";




export function tryCreateDir(path: string) {
  return <T>(data?: T) => {
    try {
      mkdirSync(path);
      return data;
    }
    catch (e: any) {
      if (e.message.includes('EEXIST'))
        return data
      ;
      throw e;
    }
  };
}


export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/α/g, 'a') // Greek Alpha
    .replace(/β/g, 'b') // Greek Beta
    .replace(/[^a-z0-9-]+/g, '')
  ;
}


export async function tryCatchAsync<T>(p: Promise<T>): Promise<T|Error> {
  try {
    const data = await p;
    return data;
  }
  catch (e) {
    return Error((e as Error).message);
  }
}


export function truncateStr(to: number) {
  if (to <= 0)
    throw Error('truncateStr()::can only truncate to > 0')
  ;
  return (str: string) => str.substring(0, to);
}

export function toShortHash(data: any) {
  const toMd4Hash = (str: string) => createHmac('md4', 'EvEx1337').update(str).digest('hex');
  return pipe(
    JSON.stringify,
    toMd4Hash,
    truncateStr(13),
  )(data);
}


