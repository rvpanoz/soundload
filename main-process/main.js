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

//configuration file
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

  /** React extension **/
  // var {
  //   default: installExtension,
  //   REACT_DEVELOPER_TOOLS
  // } = require('electron-devtools-installer');
  //
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log('An error occurred: ', err));
}

/** Create the main browser window **/
function createWindow(opts) {
  var screenSize = electron.screen.getPrimaryDisplay().size;

  // create a new BrowserWindow
  mwin = new BrowserWindow({
    width: config.windowWidth,
    height: config.windowHeight || screenSize.height
  });

  //initialization of the soundcloud module passing mwin
  soundcloud = new Soundcloud(mwin);

  //load index.html
  mwin.loadURL(`file://${cwd}/index.html`);

  //dev mode
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
  soundcloud.download(event, outputPath, fileName, trackId);
});

ipcMain.on('open-url', function(event, url) {
  if (!url) return;
  app.openUrl(url);
});

/** App Events **/

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
