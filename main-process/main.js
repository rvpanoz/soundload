/**
 * Electron Main process
 */

'use strict';

var electron = require('electron');
var path = require('path');
var fs = require('fs');
var config = require('../config');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var cwd = process.cwd();

// get parameters
var debug = /--debug/.test(process.argv[2]);
var needslog = /--log/.test(process.argv[3]);

// store initialization to save settings (output_path)
var Store = require('../store').init();
var outputPath = Store.get('output_path');

// holds BrowserWindow instance
var mwin;

// sc module to handle requests
var soundcloud = null;

// set store as a global object
global.store = Store;

/*** Development ***/
if (process.env.NODE_ENV === 'development' && debug === true) {
  require('./development/imports.js');
}

/*** Logger ***/
var winston = require('winston');
global.logger = new winston.Logger({
  level: 'info',
  transports: [
    new(winston.transports.Console)(),
    new(winston.transports.File)({
      filename: 'log.log'
    })
  ]
});

/** Create the main browser window **/
function createWindow(opts) {
  var screenSize = electron.screen.getPrimaryDisplay().size;

  // create a new BrowserWindow
  mwin = new BrowserWindow({
    width: config.windowWidth || 780,
    height: config.windowHeight || screenSize.height
  });

  // get web contents
  let webContent = mwin.webContents;

  // event listeners
  webContent.on('did-fail-load', function() {
    logger.log('error', 'Window fail to load', arguments);
  });

  webContent.on('did-finish-load', function() {
    console.log('BrowserWindow finish loading.')
  });

  webContent.on('crashed', function() {
    logger.log('error', 'Window has crashed', arguments);
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
  var dialog = electron.dialog;
  dialog.showOpenDialog(mwin, {
    properties: ['openDirectory']
  }, function(outputPath) {
    if (!outputPath) return;
    store.set('output_path', outputPath[0]);
    logger.log('info', 'output_oath set to ', outputPath[0]);
    mwin.webContents.send('set-output-path-reply', store.get('output_path'))
  });
});

ipcMain.on('resolve', (event, url) => {
  soundcloud.resolve(url, function(errors, response) {
    if(errors) {
      logger.log('error', `${url}: ${errors[0].error_message}`);
    } else {
      logger.log('info', 'url resolved ', url);
    }
    event.sender.send('resolve-reply', errors, response);
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

ipcMain.on('open-url', (event, url) => {
  if (!url) return;
  app.openUrl(url);
});

ipcMain.on('clear-cache', (event) => {
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
  console.log('app is ready');
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
  logger.log('error', err);
  throw new Error(err);
});

// GPU AMD fix for Linux
let platform = process.platform;
if(platform === 'linux') {
  app.commandLine.appendSwitch('disable-gpu-compositing');
}
