/**
 * Electron Main process
 */

'use strict';

var electron = require('electron');
var path = require('path');
var fs = require('fs');
var config = require('../config');
var Soundcloud = require('./soundcloud');
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
var MainWindow;

// soundcloud module to handle requests
var soundcloud = null;

// set store as a global object
global.store = Store;
global.config = config;

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
  MainWindow = new BrowserWindow({
    width: config.windowWidth || 790,
    height: config.windowHeight || screenSize.height - 15
  });

  // get web contents
  let webContent = MainWindow.webContents;

  // event listeners
  webContent.on('did-fail-load', function() {
    logger.log('error', 'Window fail to load', arguments);
  });

  webContent.on('did-finish-load', function() {
    logger.log('info', 'BrowserWindow finish loading')
  });

  webContent.on('crashed', function() {
    logger.log('error', 'Window has crashed', arguments);
  });

  if (process.env.NODE_ENV === 'development') {
    // MainWindow.openDevTools();
    ipcMain.on('inspect-element', function(event, coords) {
      if (MainWindow) {
        MainWindow.inspectElement(coords.x, coords.y);
      }
    });
  }

  soundcloud = new Soundcloud(MainWindow, {
    baseUrl: config.baseUrl,
    client_id: config.client_id
  });

  //load index.html
  MainWindow.loadURL(`file://${cwd}/index.html`);
}

/** Process Communication **/
ipcMain.on('get-output-path', (event) => {
  var outputPath = store.get('output_path');
  event.sender.send('get-output-path-reply', outputPath);
});

ipcMain.on('set-output-path', (event) => {
  if (!MainWindow) return;
  var dialog = electron.dialog;
  dialog.showOpenDialog(MainWindow, {
    properties: ['openDirectory']
  }, function(outputPath) {
    if (!outputPath) return;
    store.set('output_path', outputPath[0]);
    logger.log('info', 'output_oath set to ', outputPath[0]);
    MainWindow.webContents.send('set-output-path-reply', store.get('output_path'))
  });
});

ipcMain.on('resolve', (event, url) => {
  soundcloud.resolve(url, function(errors, response) {
    if(errors) {
      logger.log('error', `${url}: ${errors[0].error_message}`);
      event.sender.send('resolve-reply-error', errors);
    } else {
      event.sender.send('resolve-reply', response);
    }
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
  if (MainWindow) {
    MainWindow.webContents.session.clearCache(function() {
      logger.log('info', 'cache cleared');
    });
  }
});

app.on('quit', function(event, exitCode) {
  logger.log('info', `app quit with exitCode ${exitCode}`);
  return true;
});

/** App Events **/
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function() {
  logger.log('info', `Loading BrowserWindow..`);
  createWindow();
});

app.on('activate', function() {
  logger.log('info', `app is activated`);
  if (MainWindow === null) {
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
  throw new Error(err);
});

// GPU AMD fix for Linux
let platform = process.platform;
if(platform === 'linux') {
  app.commandLine.appendSwitch('disable-gpu-compositing');
}
