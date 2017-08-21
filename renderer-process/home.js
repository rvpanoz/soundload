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
  $('span.size').text(`Download completed!`);
});

ipcRenderer.on('on-response-reply', function(event, response) {
  $('span.size').text(`Downloading ${response} MB`);
});

ipcRenderer.on('progress-file-reply', (event, response) => {
  $('.progress-wrap').css({
    width: response + "%"
  });
});

discover_btn.on('click', function(e) {
  e.preventDefault();
  var url_value = $.trim(url.val());

  if (!url_value.length) {
    console.error('Please enter a soundcloud url');
    return;
  }
  var is_valid = soundcloud.validate(url_value);
  if (!is_valid) {
    console.error('Invalid URL');
    return;
  }

  var r = soundcloud.process(url_value);
  return false;
});
