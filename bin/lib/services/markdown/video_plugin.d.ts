declare const EMBED_REGEX: RegExp;
declare const YT_REGEX: RegExp;
declare function videoEmbed(md: any, options: any): (state: any, silent: any) => boolean;
declare function tokenizeVideo(md: any, options: any): (tokens: any, idx: number) => string;
