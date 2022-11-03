"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lwarn = exports.lact = exports.lnfo = exports.console_colors = void 0;
const chalk_1 = __importDefault(require("chalk"));
const state_1 = require("./state");
const maxTagLength = 11;
exports.console_colors = {
    rd: tryColor('red'),
    gn: tryColor('green'),
    yw: tryColor('yellow'),
    gy: tryColor('gray'),
    w: tryColor('white'),
};
const c = exports.console_colors;
const lnfo = (tag, msg) => log(tag, msg, 'gn');
exports.lnfo = lnfo;
const lact = (tag, msg) => log(tag, msg, 'yw');
exports.lact = lact;
const lwarn = (tag, msg) => log(tag, msg, 'rd');
exports.lwarn = lwarn;
function tryColor(color) {
    return (str) => state_1.state.logger.color ? chalk_1.default[color](str) : str;
}
function log(tagName, msg, color) {
    const colorFn = c[color];
    console.log(colorFn(toTag(tagName)), msg);
}
function toTag(tagName) {
    const specialCharLength = 3;
    const tagLength = tagName.length + specialCharLength;
    const offsetLength = maxTagLength - tagLength;
    return `${' '.repeat(offsetLength)}[${tagName.toUpperCase()}]:`;
}
