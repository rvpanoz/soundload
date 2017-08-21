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
var MainWindow;

var debug = /--debug/.test(process.argv[2]);
var outputPath = Store.get('output_path');

//global store object
global.store = Store;

if (process.env.NODE_ENV === 'development' && debug) {
  require('electron-reload')(path.resolve(__dirname), {
    electron: require('electron')
  });
}

function createWindow(opts) {
  var opts = opts || {};

  MainWindow = new BrowserWindow({
    defaultEncoding: 'utf-8',
    autoHideMenuBar: true,
    useContentSize: true,
    show: false,
    center: true,
    minHeight: 350,
    minWidth: 628,
    height: 497,
    width: 955
  });

  MainWindow.loadURL(`file://${__dirname}/index.html`);

  if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV === 'development') {
      MainWindow.openDevTools();
      ipcMain.on('inspect-element', function(event, coords) {
        if (MainWindow) {
          MainWindow.inspectElement(coords.x, coords.y);
        }
      });
    }
  }
}

ipcMain.on('set-output-path', function(event) {
  if(!MainWindow) return;
  dialog.showOpenDialog(MainWindow, {
    properties: ['openDirectory']
  }, function(outputPath) {
    if(!outputPath) return;
    store.set('output_path', outputPath[0]);
    MainWindow.webContents.send('set-output-path-reply', store.get('output_path'))
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
      progress = (100 * downloaded / len).toFixed(2); //bytes
      // console.info(`Downloaded ${progress}%`);
      event.sender.send('progress-file-reply', progress);
    })
    .on('end', () => {
      // console.info('Download completed!');
      event.sender.send('download-file-reply');
    })
    .on('error', (err) => {
      console.log(err);
    })
    .pipe(fs.createWriteStream(filePath))
  }

  var r = request(streamUrl)
    .on('response', (reply) => {
      var replyobj = reply.toJSON();
      var statusCode = parseInt(replyobj.statusCode);
      if(statusCode === 404) {
        event.sender.send('download-file-error');
      } else {
        var fileSize = parseInt(reply.headers['content-length'], 10);
        len = fileSize.toFixed(2);
        event.sender.send('on-response-reply', (len / 1000024).toFixed(2));
        continueRequest.call(r);
      }
    })
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
  createWindow();
  MainWindow.show();
});

app.on('activate', function() {
  if (MainWindow === null) {
    createWindow();
  }
})
