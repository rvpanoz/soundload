// * soundcloud module */

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
  return {
    resolve: function(url, callback) {
      if (!url) return;
      var resolveUrl = `${baseUrl}/resolve`;

      var r = request({
        url: config.resolveUrl,
        json: true,
        qs: {
          url: url,
          client_id: client_id
        }
      }, (error, response, body) => {
        if (error) {
          console.log(error);
          r.abort();
          throw new Error(error);
        }
        if (callback) {
          callback(body);
        }
      });
    },
    get_related: function(track_id, callback) {
      if (!track_id) {
        throw new Error('get_related: track_id parameter is missing.');
      }

      var url = config.relatedUrl.replace('{trackid}', track_id);
      var r = request({
        url: url,
        json: true,
        qs: {
          client_id: client_id
        }
      }, (error, response, body) => {
        if (error) {
          console.log(error);
          r.abort();
          throw new Error(error);
        }
        if (callback) {
          callback(body);
        }
      });
    },
    download: function(event, outputPath, fileName, trackId) {
      var now = Date.now().toString(),
        downloaded = 0,
        len = 0,
        progress = 0;

      var fileName = fileName || `${app.getName()}-${now.substr(0, 7)}`;
      var filePath = path.join(`${outputPath}`, fileName + '.mp3');

      //soundcloud url to get the stream
      var streamUrl = `${config.baseUrl}/tracks/${trackId}/stream?client_id=${config.client_id}`;
      var streamUrlObj = URL.parse(streamUrl);


      function continueRequest() {
        this.on('data', (chunk) => {
            var c = chunk.length;
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

      var r = request(streamUrl)
        .on('response', (reply) => {
          var fileSize, error;
          var replyobj = reply.toJSON();
          var statusCode = parseInt(replyobj.statusCode);


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
            r.abort();
            event.sender.send('download-file-error', error);
          }
        });
    }
  }
}

module.exports = Soundcloud;
