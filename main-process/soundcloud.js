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
    let resolveUrl = `${baseUrl}/resolve`;

    let r = request({
        url: config.resolveUrl,
        json: true,
        qs: {
          url: url,
          client_id: client_id
        }
      }, (error, response, body) => {
        console.log(response);
        if (error) {
          console.log(error);
          r.abort();
          throw new Error(error);
        }
        if(callback) {
          callback(body);
        }
      });
  }

  Soundcloud.prototype.download = function(event, outputPath, fileName, trackId) {
    var now = Date.now().toString(),
      downloaded = 0,
      len = 0,
      progress = 0;

    var fileName = fileName || `${app.getName()}-${now.substr(0, 7)}`;
    let filePath = path.join(`${outputPath}`, fileName + '.mp3');

    //soundcloud url to get the stream
    let streamUrl = `${config.baseUrl}/tracks/${trackId}/stream?client_id=${config.client_id}`;
    let streamUrlObj = URL.parse(streamUrl);

    function continueRequest() {
      this.on('data', (chunk) => {
          let c = chunk.length;
          downloaded += c;
          progress = (100 * downloaded / len).toFixed(2);
          event.sender.send('progress-file-reply', progress);
        })
        .on('end', () => {
          event.sender.send('download-file-reply');
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
            event.sender.send('on-response-reply', (len / 1000024).toFixed(2), replyobj);
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
          event.sender.send('download-file-error', error);
        }
      })
  }
}

module.exports = Soundcloud;
