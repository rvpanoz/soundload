/**
 * Dev
 */

'use strict';

var URL = require('url');
var electron = require('electron');
var path = require('path');
var fs = require('fs');
var cwd = process.cwd();

(function() {
  console.log('development mode is on');

  /** electron reload **/
  require('electron-reload')(path.resolve(cwd), {
    electron: require('electron')
  });

  /** React extension **/
  var {
    default: installExtension,
    REACT_DEVELOPER_TOOLS
  } = require('electron-devtools-installer');

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

})();
