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
        var replyobj = reply.toJSON();
        var statusCode = parseInt(replyobj.statusCode);
        if(statusCode === 404) {
          ipcRenderer.send('download-file-error');
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
