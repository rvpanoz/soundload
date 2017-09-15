/**
 * soundcloud module
 */

const fs = require('fs');
const path = require('path');
const request = require('request');
const config = require('../config');
const SC = require('node-soundcloud');

const {
  baseUrl,
  client_id
} = config;

class Soundcloud {
  constructor(MainWindow, opts) {
    this.baseUrl = opts.baseUrl;
    this.client_id = opts.client_id;
    this._soundcloud = SC;
    this._soundcloud.init({
      id: this.client_id
    });
  }
  resolve(url, callback) {
    this._soundcloud.makeCall('GET', '/resolve', {
      url: url,
      json: true
    }, (errors, track) => {
      callback(errors, track);
    });
  }
  download(event, outputPath, fileName, trackId) {
    let now = Date.now().toString(),
      downloaded = 0,
      len = 0,
      progress = 0;
    let filePath = path.join(`${outputPath}`, fileName + '.mp3');
    let streamUrl = this.baseUrl + `/tracks/${trackId}/stream`;

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

    let r = request({
        url: streamUrl,
        qs: {
          client_id: this.client_id
        }
      })
      .on('response', (reply) => {
        let fileSize, error;
        let replyobj = reply.toJSON();
        let statusCode = parseInt(replyobj.statusCode);
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
            error = 'Server error.';
            break;
        }
        if (error) {
          event.sender.send('download-file-error', error);
          throw new Error(error);
        }
      });
  }
  get_related(event, track_id, callback) {
    let url = `/tracks/${track_id}/related`;
    this._soundcloud.makeCall('GET', url, {
      json: true
    }, function(error, response) {
      if (error) {
        event.sender.send('get-related-error', error);
        throw new Error(error);
      }
      callback(response);
    });
  }
}


module.exports = Soundcloud;
