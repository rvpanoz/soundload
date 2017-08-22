const fs = require('fs');
const path = require('path');
const URL = require('url');
const request = require('request');
const ipcRenderer = require('electron').ipcRenderer;

let config = require('../config');

module.exports = {
  process: function(url) {
    if (!url) return;
    const rp = require('request-promise');
    const resolveUrl = `${config.baseUrl}/resolve?url=${url}&client_id=${config.client_id}`;

    return rp({
        url: resolveUrl,
        json: true
      })
      .on('response', function(reply) {
        var error, replyobj = reply.toJSON();
        var statusCode = parseInt(replyobj.statusCode);
        switch (statusCode) {
          case 200:
            fileSize = parseInt(reply.headers['content-length'], 10);
            len = fileSize.toFixed(2);
            ipcRenderer.send('on-response-reply', (len / 1000024).toFixed(2), replyobj);
            break
          case 401:
            error = 'Unauthorized request.';
            break;
          case 404:
            error = 'Page not found.';
            break;
          case 500:
            error = 'Server error.'
            break;
        }
        if (error) {
          ipcRenderer.send('download-file-error', error);
          this.abort();
        }
      })
      .then(function(data) {
        ipcRenderer.send('download-file', data);
      })
      .catch(function(err) {
        ipcRenderer.send('download-file-error', err);
      });
  },
  validate: function(soundcloudUrl) {
    let is_valid = false;

    try {
      let urlObj = URL.parse(soundcloudUrl);
      if (!urlObj.hostname || !urlObj.host) {
        return is_valid;
      }
      is_valid = /soundcloud.com/.test(urlObj.hostname);
      return is_valid;
    } catch (e) {
      throw new Error(e);
    }
  }
}
