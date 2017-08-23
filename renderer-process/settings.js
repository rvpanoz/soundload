/**
 * settings section
 * @type {[type]}
 */

'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const config = require('../config');
const remote = require('electron').remote;
const Store = remote.getGlobal('store');

let apply_btn = $('input[id="apply-settings"]');
let output_dir = $('input[id="output-dir"]');
let output_path = Store.get('output_path');

if(output_path) {
  output_dir.val(output_path);
}

ipcRenderer.on('set-output-path-reply', function(event, folderPath) {
  output_dir.val(folderPath);
  $('a[href="#home"]').click();
});

apply_btn.on('click', function(e) {
  e.preventDefault();
  e.stopPropagation();

  ipcRenderer.send('set-output-path');
});
