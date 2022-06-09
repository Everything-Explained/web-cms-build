"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMarkdown = void 0;
const markdown_it_1 = __importDefault(require("markdown-it"));
function useMarkdown() { return md; }
exports.useMarkdown = useMarkdown;
const md = new markdown_it_1.default({
    xhtmlOut: true,
    breaks: true,
    typographer: true,
    quotes: '“”‘’',
    linkify: true,
});
md.use(require('markdown-it-deflist'));
md.use(require('./video_plugin'), {
    youtube: {
        width: 'auto',
        height: 'auto',
        nocookie: true,
        parameters: {
            rel: 0,
        }
    }
});
applyCustomLinks();
function applyCustomLinks() {
    const defaultLinkRenderer = md.renderer.rules.link_open || defaultRenderer;
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const link = tokens[idx].attrGet('href').toLowerCase();
        applyLinkTargetBlank(tokens, idx, link) || applyVueRouterLinks(tokens, idx, link);
        return defaultLinkRenderer(tokens, idx, options, env, self);
    };
}
function applyLinkTargetBlank(tokens, idx, link) {
    if (link.startsWith('http')) {
        tokens[idx].attrPush(['target', '_blank']);
        tokens[idx].attrPush(['rel', 'noopener']);
        return true;
    }
    return false;
}
function applyVueRouterLinks(tokens, idx, link) {
    const linkOpen = tokens[idx];
    linkOpen.attrSet('onclick', `event.preventDefault(); window.$router.push('${link}')`);
}
function defaultRenderer(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
}
