// Process @[youtube](youtubeVideoID)
// Process @[vimeo](vimeoVideoID)

//*************************************
//     This was converted from JS
//*************************************
/* eslint-disable */

const EMBED_REGEX = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im;
/**
 * Taken from https://webapps.stackexchange.com/a/101153
 *
 * The VideoID spec is **not** defined as Absolute, so this could
 * change in the future.
 */
const YT_REGEX    = /^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/;

function videoEmbed(md: any, options: any) {
  function videoReturn(state: any, silent: any) {
    var serviceEnd;
    var serviceStart;
    var token;
    var videoID;
    var theState = state;
    const oldPos = state.pos;

    if (state.src.charCodeAt(oldPos) !== 0x40/* @ */ ||
      state.src.charCodeAt(oldPos + 1) !== 0x5B/* [ */) {
      return false;
    }

    const match = EMBED_REGEX.exec(state.src.slice(state.pos, state.src.length));

    if (!match || match.length < 3) {
      throw Error('Improperly Formatted YouTube Video')
    }

    const service = match[1];
    videoID = match[2];

    if(!videoID.match(YT_REGEX))
      throw Error('Invalid or Missing Video ID')
    ;

    serviceStart = oldPos + 2;
    serviceEnd = md.helpers.parseLinkLabel(state, oldPos + 1, false);

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
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

function extractVideoParameters(url: string) {
  const parameterMap = new Map();

  //***************************************
  //   WE WILL NOT USE THIS FUNCTIONALITY
  //***************************************
  // const params = url.replace(/&amp;/gi, '&').split(/[#?&]/);
  // if (params.length > 1) {
  //   for (let i = 1; i < params.length; i += 1) {
  //     const keyValue = params[i].split('=');
  //     if (keyValue.length > 1) parameterMap.set(keyValue[0], keyValue[1]);
  //   }
  // }

  return parameterMap;
}

function videoUrl(service: string, videoID: string, url: string, options: any) {
  switch (service) {
    case 'youtube': {
      const parameters = extractVideoParameters(url);
      if (options.youtube.parameters) {
        Object.keys(options.youtube.parameters).forEach((key) => {
          parameters.set(key, options.youtube.parameters[key]);
        });
      }

      //******************************************
      //    WE WILL NOT USE THIS FUNCTIONALITY
      //******************************************
      // Start time parameter can have the format t=0m10s or t=<time_in_seconds> in share URLs,
      // but in embed URLs the parameter must be called 'start' and time must be in seconds
      // const timeParameter = parameters.get('t');
      // if (timeParameter !== undefined) {
      //   let startTime = 0;
      //   const timeParts = timeParameter.match(/[0-9]+/g);
      //   let j = 0;

      //   while (timeParts.length > 0) {
      //     /* eslint-disable no-restricted-properties */
      //     startTime += Number(timeParts.pop()) * Math.pow(60, j);
      //     /* eslint-enable no-restricted-properties */
      //     j += 1;
      //   }
      //   parameters.set('start', startTime);
      //   parameters.delete('t');
      // }

      parameters.delete('v');
      parameters.delete('feature');
      parameters.delete('origin');

      const parameterArray = Array.from(parameters, p => p.join('='));
      const parameterPos = videoID.indexOf('?');

      let finalUrl = 'https://www.youtube';
      if (options.youtube.nocookie) finalUrl += '-nocookie';
      finalUrl += '.com/embed/' + videoID;
      if (parameterArray.length > 0) finalUrl += '?' + parameterArray.join('&');
      return finalUrl;
    }
  }
}

function tokenizeVideo(md: any, options: any) {
  function tokenizeReturn(tokens: any, idx: number) {
    const videoID = md.utils.escapeHtml(tokens[idx].videoID);
    const service = md.utils.escapeHtml(tokens[idx].service).toLowerCase();

    return (
      '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item ' +
      service + '-player" type="text/html" width="' + (options[service].width) +
      '" height="' + (options[service].height) +
      '" src="' + options.url(service, videoID, tokens[idx].url, options) +
      '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>'
    );
  }

  return tokenizeReturn;
}

const defaults = {
  url: videoUrl,
  youtube: { width: 640, height: 390, nocookie: false },
  vimeo: { width: 500, height: 281 },
} as any;

module.exports = function videoPlugin(md: any, options: any) {
  var theOptions = options;
  var theMd = md;
  if (theOptions) {
    Object.keys(defaults).forEach(function checkForKeys(key) {
      if (typeof theOptions[key] === 'undefined') {
        theOptions[key] = defaults[key];
      }
    });
  }
  // DEFAULT OPTIONS
  // else {
  //   theOptions = defaults;
  // }
  theMd.renderer.rules.video = tokenizeVideo(theMd, theOptions);
  theMd.inline.ruler.before('emphasis', 'video', videoEmbed(theMd, theOptions));
};
