/**
 * Electron Main process
 *
 */

'use strict';

var url = require('url');
var electron = require('electron');
var path = require('path');
var fs = require('fs');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var _ = require('lodash');
var request = require('request');
var config = require('./config');

var MainWindow;
var debug = /--debug/.test(process.argv[2]);
var timeout = 1000000;

var musicDir = app.getPath('home');
var outputPath = path.join(musicDir, app.getName());
config.outputPath = outputPath;

if(!fs.existsSync(outputPath)) {
  //create folder to store the files in user's home dir
  try {
    fs.mkdir(outputPath, function(err, dirPath) {
      if(err) throw err;
    });
  } catch (e) {
    throw new Error(e);
  }
}

if (process.env.NODE_ENV === 'development') {
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
    height: 1024,
    width: 1280
  });

  MainWindow.loadURL(`file://${__dirname}/index.html`);

  if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV === 'development') {
      MainWindow.openDevTools();
    }
  }
}

ipcMain.on('download-file', function(event, fileData) {
  var now = Date.now().toString(), downloaded = 0, len = 0, progress = 0;
  var fileName = fileData.title || `track-${now.substr(0, 7)}`;
  var filePath = path.join(`${config.outputPath}`, fileName + '.mp3');
  var url = `${config.baseUrl}/tracks/${fileData.id}/stream?client_id=${config.client_id}`;

  request(url)
    .on('response', (response) => {
      var fileSize = parseInt(response.headers['content-length'], 10); //bytes
      len = fileSize.toFixed(2);
      event.sender.send('on-response-reply', (len/1000024).toFixed(2));
    })
    .on('data', (chunk) => {
      var c = chunk.length;
      downloaded+=c;
      progress = (100 * downloaded / len).toFixed(2); //bytes
      event.sender.send('progress-file-reply', progress);
    })
    .on('end', () => {
      event.sender.send('download-file-reply');
      // event.returnValue = filePath;
    })
    .on('error', (err) => {
      console.log(err);
    })
    .pipe(fs.createWriteStream(filePath));
})
ipcMain.on('inspect-element', function(event, coords) {
  if (MainWindow) {
    MainWindow.inspectElement(coords.x, coords.y);
  }
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
