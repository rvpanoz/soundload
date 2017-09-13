//config

'use strict';

let config = function() {

  return {
    _wait: 500,
    windowWidth: 740,
    windowHeight: 868,
    client_id: 'KFSHpN5xEaAvIZZCrsrDjuFHOcArM91q',
    baseUrl: 'http://api.soundcloud.com',
    resolveUrl: 'http://api.soundcloud.com/resolve',
    relatedUrl: 'http://api.soundcloud.com/tracks/{trackid}/related',
    testUrl: 'https://soundcloud.com/desert-hearts-records/live-desert-hearts-atish-072'
  }
}

module.exports = config;
