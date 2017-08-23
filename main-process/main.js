/**
 * Electron Main process
 *
 */

'use strict';

const URL = require('url');
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const request = require('request');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;

//config file
const config = require('../config');

//soundcloud
const Soundcloud = require('./soundcloud');

//store initialization
const Store = require('../store').init();

//env
let debug = /--debug/.test(process.argv[2]);
let outputPath = Store.get('output_path');
let soundcloud = null;

//global store instance
global.store = Store;

//main window
let mwin;

//current working directory
let cwd = process.cwd();

//devtools
if (process.env.NODE_ENV === 'development' && debug) {
  require('electron-reload')(path.resolve(cwd), {
    electron: require('electron')
  });
}

function createWindow(opts) {
  let screenSize = electron.screen.getPrimaryDisplay().size;

  //create a BrowserWindow
  mwin = new BrowserWindow({
    width: screenSize.width / 4,
    height: screenSize.height / 1.5
  });

  soundcloud = new Soundcloud(mwin);

  //load index.html
  mwin.loadURL(`file://${cwd}/index.html`);

  //devtools
  if (process.env.NODE_ENV === 'development') {
    mwin.openDevTools();
    ipcMain.on('inspect-element', function(event, coords) {
      if (mwin) {
        mwin.inspectElement(coords.x, coords.y);
      }
    });
  }
}

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

ipcMain.on('get-soundcloud', (event, url) => {
  soundcloud.resolve(url, function(response) {
    console.log(response);
    event.sender.send('get-soundcloud-reply', response);
  });
});

ipcMain.on('download-file', (event, fileData) => {
  console.log('trackId:'+fileData.id);
  // soundcloud.download(fileData.id);
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
