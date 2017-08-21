/**
 * Store file
 * @type {[type]}
 */

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app;
const Store = require('electron-store');

var StoreModule = {
  init: function() {
    var store = new Store();
    var outputPath = store.get('output_path');

    if(!outputPath) {
      //store to app.getPath('userData')
      store.set('output_path', path.join(app.getPath('home'), app.getName()))
    }

    return store;
  }
}

module.exports = StoreModule;
