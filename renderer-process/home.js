/**
 * home section
 * @type {[type]}
 */

'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const config = require('../config');
const soundcloud = require('./soundcloud');

var discover_btn = $('input[type="submit"]');
var url = $('input#soundcloud-url');

ipcRenderer.on('download-file-reply', (event, response) => {
  $('span.size').innerHTML = `Download completed!`;
});

ipcRenderer.on('on-response-reply', function(event, response) {
  $('span.size').innerHTML = `Downloading ${response} MB`;
});

ipcRenderer.on('progress-file-reply', (event, response) => {
  $('.progress-wrap').style.width = response + "%";
});

discover_btn.on('click', function(e) {
  e.preventDefault();
  var url_value = $.trim(url.val());
  
  if(!url_value.length) {
    console.log('Please enter a soundcloud url');
    return;
  }
  var is_valid = soundcloud.validate(url_value);
  if(!is_valid) {
    console.log('Invalid URL');
    return;
  }

  var r = soundcloud.process(url.value);
  return false;
});
