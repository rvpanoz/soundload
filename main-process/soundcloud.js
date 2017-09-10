/**
 * soundcloud module
 */

const fs = require('fs');
const path = require('path');
const URL = require('url');
const request = require('request');
const ipcMain = require('electron').ipcMain;
const app = require('electron').app;
const config = require('../config');
const SC = require('node-soundcloud');

const {
  baseUrl,
  client_id
} = config;

const SoundcloudAPI = function() {

  SC.init({
    id: config.client_id
  });

  SoundcloudAPI.prototype.resolve = function(url, callback) {
    if (!url) return;

    SC.makeCall('GET', '/resolve', {
      url: url,
      json: true
    }, function(error, response) {
      if (error) {
        console.log(error);
        r.abort();
        throw new Error(error);
      }
      if (callback) {
        callback(response);
      }
    });
  }
  SoundcloudAPI.prototype.download = function(event, outputPath, fileName, trackId) {
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
        var fileSize, statusCode, error;
        var replyobj = reply.toJSON();

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
      })
  }
  SoundcloudAPI.prototype.get_related = function(track_id, callback) {

    SC.makeCall('GET', `/tracks/${track_id}/related`, {
      json: true
    }, function(error, response) {
      if (error) {
        console.log(error);
        r.abort();
        throw new Error(error);
      }
      if (callback) {
        callback(response);
      }
    });
  }
}

module.exports = SoundcloudAPI;
