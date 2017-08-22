/**
 * Electron Main process
 *
 */

'use strict';

var URL = require('url');
var electron = require('electron');
var path = require('path');
var fs = require('fs');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var dialog = electron.dialog;
var request = require('request');
var config = require('./config');
var Store = require('./store').init();

//env
var debug = /--debug/.test(process.argv[2]);
var outputPath = Store.get('output_path');

//global store instance
global.store = Store;

//main window
var mwin;

//devtools
if (process.env.NODE_ENV === 'development' && debug) {
  require('electron-reload')(path.resolve(__dirname), {
    electron: require('electron')
  });
}

function createWindow(opts) {
  var opts = opts || {};
  var screenSize = electron.screen.getPrimaryDisplay().size;

  //create a BrowserWindow
  mwin = new BrowserWindow({
    width: screenSize.width / 2,
    height: screenSize.height
  });

  //load index.html
  mwin.loadURL(`file://${__dirname}/index.html`);

  //devtools
  if (process.env.NODE_ENV === 'development') {
    mwin.openDevTools();
    ipcMain.on('inspect-element', function(event, coords) {
      if (mwin) {
        mwin.inspectElement(coords.x, coords.y);
      }
    })
  }
}

ipcMain.on('set-output-path', function(event) {
  if (!mwin) return;
  dialog.showOpenDialog(mwin, {
    properties: ['openDirectory']
  }, function(outputPath) {
    if (!outputPath) return;
    store.set('output_path', outputPath[0]);
    mwin.webContents.send('set-output-path-reply', store.get('output_path'))
  });
});

ipcMain.on('download-file', function(event, fileData) {
  var now = Date.now().toString(),
    downloaded = 0,
    len = 0,
    progress = 0;

  var fileName = fileData.title || `track-${now.substr(0, 7)}`;
  var filePath = path.join(`${outputPath}`, fileName + '.mp3');

  //soundcloud url to get the stream
  var streamUrl = `${config.baseUrl}/tracks/${fileData.id}/stream?client_id=${config.client_id}`;
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
        this.abort();
        event.sender.send('download-file-error', error);
      }
    })
});

ipcMain.on('open-url', function(event, url) {
  if (!url) return;
  app.openUrl(url);
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
  createWindow();
});

app.on('activate', function() {
  if (mwin === null) {
    createWindow();
  }
})
