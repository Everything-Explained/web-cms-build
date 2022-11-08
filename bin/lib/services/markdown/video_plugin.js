"use strict";
const EMBED_REGEX = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im;
const YT_REGEX = /^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/;
function videoEmbed(md, options) {
    function videoReturn(state, silent) {
        var serviceEnd;
        var serviceStart;
        var token;
        var videoID;
        var theState = state;
        const oldPos = state.pos;
        if (state.src.charCodeAt(oldPos) !== 0x40 ||
            state.src.charCodeAt(oldPos + 1) !== 0x5B) {
            return false;
        }
        const match = EMBED_REGEX.exec(state.src.slice(state.pos, state.src.length));
        if (!match || match.length < 3) {
            throw Error('Improperly Formatted YouTube Video');
        }
        const service = match[1];
        videoID = match[2];
        if (!videoID.match(YT_REGEX))
            throw Error('Invalid or Missing Video ID');
        serviceStart = oldPos + 2;
        serviceEnd = md.helpers.parseLinkLabel(state, oldPos + 1, false);
        if (!silent) {
            theState.pos = serviceStart;
            theState.service = theState.src.slice(serviceStart, serviceEnd);
            const newState = new theState.md.inline.State(service, theState.md, theState.env, []);
            newState.md.inline.tokenize(newState);
            token = theState.push('video', '');
            token.videoID = videoID;
            token.service = service;
            token.url = match[2];
            token.level = theState.level;
        }
        theState.pos += theState.src.indexOf(')', theState.pos);
        return true;
    }
    return videoReturn;
}
function tokenizeVideo(md, options) {
    function tokenizeReturn(tokens, idx) {
        const videoID = md.utils.escapeHtml(tokens[idx].videoID);
        return (`<youtube id="${videoID}" />`);
    }
    return tokenizeReturn;
}
module.exports = function videoPlugin(md, options) {
    var theOptions = options;
    var theMd = md;
    theMd.renderer.rules.video = tokenizeVideo(theMd, theOptions);
    theMd.inline.ruler.before('emphasis', 'video', videoEmbed(theMd, theOptions));
};
