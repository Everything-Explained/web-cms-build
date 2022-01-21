import { createHmac } from "crypto";
import { mkdirSync } from "fs";
import { basename as pathBasename } from "path";
import { pipe } from "ramda";
import { console_colors as cc, lact } from "./lib/logger";




interface ObjWithID {
  id: string|number;
  [key: string]: any;
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


export function tryCreateDir(path: string) {
  try {
    mkdirSync(path);
    lact('create', cc.gy(`/${pathBasename(path)}`));
    return (data: any) => data;
  }
  catch (e: any) {
    if (e.message.includes('EEXIST'))
      return (data: any) => data
    ;
    throw e;
  }
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


export function hasSameID(o1: ObjWithID) {
  return (o2: ObjWithID) => o1.id == o2.id;
}


/** Return data if environment is set to development */
export function setIfInDev<T>(data: T) {
  return (process.env.NODE_ENV == 'production') ? null : data;
}


export function isENOENT(err: Error) {
  return err.message.includes('ENOENT');
}


