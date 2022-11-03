import chalk from 'chalk';
import { state } from './state';

type ConsoleColor = 'red'|'green'|'yellow'|'gray'|'white';


const maxTagLength = 11;
export const console_colors = {
  rd: tryColor('red'),
  gn: tryColor('green'),
  yw: tryColor('yellow'),
  gy: tryColor('gray'),
  w: tryColor('white'),
};
const c = console_colors;

/** Info Log */
export const lnfo = (tag: string, msg: string) => log(tag, msg, 'gn');
/** Action Log */
export const lact = (tag: string, msg: string) => log(tag, msg, 'yw');
/** Warn Log */
export const lwarn = (tag: string, msg: string) => log(tag, msg, 'rd');


/** Conditionally colors text using `state.logger` */
function tryColor(color: ConsoleColor) {
  return (str: string) => state.logger.color ? chalk[color](str) : str;
}

function log(tagName: string, msg: string, color: keyof typeof c) {
  const colorFn = c[color];
  console.log(colorFn(toTag(tagName)), msg);
}

function toTag(tagName: string) {
  const specialCharLength = 3; // [, ], :
  const tagLength = tagName.length + specialCharLength;
  const offsetLength = maxTagLength - tagLength;
  return `${' '.repeat(offsetLength)}[${tagName.toUpperCase()}]:`;
}


