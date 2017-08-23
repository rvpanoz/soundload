/**
 * soundcloud module
 * @type singleton
 */

const fs = require('fs');
const path = require('path');
const URL = require('url');
const request = require('request');
const ipcMain = require('electron').ipcMain;
const app = require('electron').app;
const config = require('../config');

const {
  baseUrl,
  client_id
} = config;

const Soundcloud = function() {

  Soundcloud.prototype.resolve = function(url, callback) {
    if (!url) return;

    let self = this;
    let resolveUrl = `${baseUrl}/resolve?url=${url}&client_id=${client_id}`;

    let r = request({
        url: resolveUrl,
        json: true
      }, (error, response, body) => {
        if (error) {
          throw new Error(error);
        }
        if(callback) {
          callback(body);
        }
      });
  }

  Soundcloud.prototype.download = function(trackId) {
    var now = Date.now().toString(),
      downloaded = 0,
      len = 0,
      progress = 0;

    let fileName = `${app.getName()}-${now.substr(0, 7)}`;
    let filePath = path.join(`${outputPath}`, fileName + '.mp3');

    //soundcloud url to get the stream
    let streamUrl = `${config.baseUrl}/tracks/${trackId}/stream?client_id=${config.client_id}`;
    let streamUrlObj = URL.parse(streamUrl);

    function continueRequest() {
      this.on('data', (chunk) => {
          let c = chunk.length;
          downloaded += c;
          progress = (100 * downloaded / len).toFixed(2);
          ipcRenderer.send('progress-file-reply', progress);
        })
        .on('end', () => {
          ipcRenderer.send('download-file-reply');
        })
        .on('error', (err) => {
          console.log(err);
        })
        .pipe(fs.createWriteStream(filePath))
    }

    let r = request(streamUrl)
      .on('response', (reply) => {
        let fileSize, statusCode, error;
        let replyobj = reply.toJSON();

        statusCode = parseInt(replyobj.statusCode);
        switch (statusCode) {
          case 200:
            fileSize = parseInt(reply.headers['content-length'], 10);
            len = fileSize.toFixed(2);
            ipcRenderer.send('on-response-reply', (len / 1000024).toFixed(2), replyobj);
            continueRequest.call(r);
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
          this.abort();
          ipcRenderer.send('download-file-error', error);
        }
      })
  }
}

module.exports = Soundcloud;
