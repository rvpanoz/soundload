/**
 * Store file
 */

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app;
const Store = require('electron-store');

const StoreModule = {
  init: function() {
    let store = new Store();
    let outputPath = store.get('output_path');

    if(!outputPath) {
      //default store path: app.getPath('userData')
      store.set('output_path', path.join(app.getPath('music')));
    }
    return store;
  }
}

module.exports = StoreModule;
