/**
 * Electron Main process
 */

'use strict';

var URL = require('url');
var electron = require('electron');
var path = require('path');
var fs = require('fs');
var request = require('request');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var dialog = electron.dialog;
var crashReporter = electron.crashReporter;

//start crashReporter
crashReporter.start({
  productName: 'soundload',
  companyName: 'soundload inc',
  submitURL: 'http://127.0.0.1:3001/submit',
  uploadToServer: true
});

var config = require('../config');
var debug = /--debug/.test(process.argv[2]);
var cwd = process.cwd();

//soundcloud module
var Soundcloud = require('./soundcloud');

//store initialization
var Store = require('../store').init();

//output path
var outputPath = Store.get('output_path');
var soundcloud = null;

//main window
var mwin;

//set store as a global object
global.store = Store;

/*** Dev ***/
if (process.env.NODE_ENV === 'development' && debug === true) {
  /** electron reload **/
  require('electron-reload')(path.resolve(cwd), {
    electron: require('electron')
  });
}

/** Create the main browser window **/
function createWindow(opts) {
  var screenSize = electron.screen.getPrimaryDisplay().size;

  // create a new BrowserWindow
  mwin = new BrowserWindow({
    width: config.windowWidth || 780,
    height: config.windowHeight || screenSize.height,
    protocol: 'file:'
  });

  let webContent = mwin.webContents;

  webContent.on('did-fail-load', function() {
    console.log('did-fail-load')
  })

  webContent.on('did-finish-load', function() {
    console.log('did-finish-load');
  })

  webContent.on('crashed', function() {
    console.log('crashed');
  })

  webContent.on('plugin-crashed', function() {
    console.log('plugin-crashed');
  })

  //initialization of the soundcloud module passing mwin
  soundcloud = new Soundcloud(mwin);

  //load index.html
  mwin.loadURL(`file://${cwd}/index.html`);

  if (process.env.NODE_ENV === 'development' && debug === true) {
    //devTools
    mwin.openDevTools();

    ipcMain.on('inspect-element', function(event, coords) {
      if (mwin) {
        mwin.inspectElement(coords.x, coords.y);
      }
    });
  }
}

/** Process Communication **/

ipcMain.on('get-output-path', (event) => {
  var outputPath = store.get('output_path');
  event.sender.send('get-output-path-reply', outputPath);
});

ipcMain.on('set-output-path', (event) => {
  if (!mwin) return;
  dialog.showOpenDialog(mwin, {
    properties: ['openDirectory']
  }, function(outputPath) {
    if (!outputPath) return;
    store.set('output_path', outputPath[0]);
    mwin.webContents.send('set-output-path-reply', store.get('output_path'))
  });
});

ipcMain.on('resolve', (event, url) => {
  soundcloud.resolve(url, function(response) {
    event.sender.send('resolve-reply', response);
  });
});

ipcMain.on('fetch-related', (event, trackId) => {
  soundcloud.get_related(trackId, function(response) {
    event.sender.send('fetch-related-reply', response);
  });
});

ipcMain.on('download-file', (event, fileName, trackId) => {
  let outputPath = store.get('output_path');
  soundcloud.download(event, outputPath, fileName, trackId);
});

ipcMain.on('open-url', function(event, url) {
  if (!url) return;
  app.openUrl(url);
});

ipcMain.on('clear-cache', function(event) {

  if(mwin) {
    mwin.webContents.session.clearCache(function() {
      console.log('cached cleared');
    });
  }
});

app.on('quit', function(event, exitCode) {
  console.log(exitCode);
});

/** App Events **/
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
  console.log('app is ready');
  createWindow();
});

app.on('gpu-process-crashed', function(event, killed) {
  console.log(arguments);
});

process.on('uncaughtException', function(err) {
  console.log(err);
});

app.on('activate', function() {
  console.log('app is activated');
  if (mwin === null) {
    createWindow();
  }
});

app.on('before-quit', function() {
  console.log('before-quit');
});

app.on('will-quit', function() {
  console.log('will-quit');
});
