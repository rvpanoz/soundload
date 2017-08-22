/**
 * home section
 * @type {[type]}
 */

'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const config = require('../config');
const soundcloud = require('./soundcloud');

var download_btn = $('input[id="soundcloud-download"]');
var url = $('input#soundcloud-url');
var error = $('.error-msg');
var progress = $('.progress-wrap');
var fileSize;

ipcRenderer.on('download-file', function(event, fileData) {
  console.log(fileData);
});

ipcRenderer.on('download-file-reply', (event, response) => {
  $('span.size').text(`Download completed!`);
});

ipcRenderer.on('on-response-reply', function(event, size, data) {
  fileSize = size;
});

ipcRenderer.on('download-file-error', function(event, errorMsg) {
  url.focus();
  error.text(errorMsg);
  progress.css({
    width: "0%"
  });
  $('span.size').text('');
});

ipcRenderer.on('progress-file-reply', (event, downloaded) => {
  $('span.size').text(`Downloading ${downloaded}% of ${fileSize} MB`);
  progress.css({
    width: downloaded + "%"
  });
});

url.on('input', function(e) {
  error.text('');
  $('span.size').text('');
  progress.css({
    width: "0%"
  });
});

download_btn.on('click', function(e) {
  e.preventDefault();
  var url_value = $.trim(url.val()), is_valid=false, validation_msg = '';

  if (url_value.length) {
    is_valid = !is_valid;
  }
  is_valid = soundcloud.validate(url_value);
  if(!is_valid) {
    url.focus();
    error.text('Invalid URL or URL is empty');
    return;
  }
  var r = soundcloud.process(url_value);
  return false;
});
