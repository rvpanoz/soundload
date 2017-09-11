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

var config = require('../config');
var debug = /--log/.test(process.argv[2]);
var needslog = /--debug/.test(process.argv[3]);
var cwd = process.cwd();
var logger = null;

//store initialization
var Store = require('../store').init();

//output path
var outputPath = Store.get('output_path');
var soundcloud = null;

//main window
var mwin;

//set store as a global object
global.store = Store;

/** crach reporter **/
crashReporter.start({
  productName: 'soundload',
  companyName: 'soundload inc',
  submitURL: 'http://127.0.0.1:3001/submit',
  uploadToServer: true
});

/*** Dev - hot-reload ***/
if (process.env.NODE_ENV === 'development' && debug === true) {
  /** https://github.com/yan-foto/electron-reload - hard reset starts a new process **/
  require('electron-reload')(path.resolve(cwd), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

/*** Logger ***/
if (process.env.NODE_ENV === 'development' && needslog === true) {
  var winston = require('winston');
  logger = new winston.Logger({
    level: 'info',
    transports: [
      new(winston.transports.Console)(),
      new(winston.transports.File)({
        filename: 'log.log'
      })
    ]
  });
}

/** Create the main browser window **/
function createWindow(opts) {
  var screenSize = electron.screen.getPrimaryDisplay().size;

  // create a new BrowserWindow
  mwin = new BrowserWindow({
    width: config.windowWidth || 780,
    height: config.windowHeight || screenSize.height
  });

  let webContent = mwin.webContents;

  webContent.on('did-fail-load', function() {
    if (needslog && logger) {
      logger.log('error', 'Window fail to load', arguments);
    }
  });

  webContent.on('did-finish-load', function() {
    if (needslog && logger) {
      logger.log('info', 'Window finish loading');
    }
  });

  webContent.on('crashed', function() {
    if (needslog && logger) {
      logger.log('error', 'Window has crached', arguments);
    }
  });

  webContent.on('plugin-crashed', function() {
    if (needslog && logger) {
      logger.log('error', 'A plugin has crashed', arguments);
    }
  });

  //open devtools
  if (process.env.NODE_ENV === 'development') {
    mwin.openDevTools();
    ipcMain.on('inspect-element', function(event, coords) {
      if (mwin) {
        mwin.inspectElement(coords.x, coords.y);
      }
    });
  }

  //soundcloud module
  var Soundcloud = require('./soundcloud');

  //initialization of the soundcloud module passing mwin
  soundcloud = new Soundcloud(mwin);

  //load index.html
  mwin.loadURL(`file://${cwd}/index.html`);
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
  soundcloud.get_related(event, trackId, function(response) {
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
  if (mwin) {
    mwin.webContents.session.clearCache(function() {
      console.log('cached cleared');
    });
  }
});

app.on('quit', function(event, exitCode) {
  console.log('app quit', exitCode);
  return true;
});

/** App Events **/
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
  createWindow();
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

process.on('uncaughtException', function(err) {
  console.log(err);
});

// GPU AMD fix for Linux
let platform = process.platform;
if(platform === 'linux') {
  app.commandLine.appendSwitch('disable-gpu-compositing');
}
