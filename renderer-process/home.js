/**
 * home section
 * @type {[type]}
 */

'use strict';

const URL = require('url');
const ipcRenderer = require('electron').ipcRenderer;
const config = require('../config');

let $get = $('input[id="soundcloud-get"]');
let $url = $('input#soundcloud-url');
let $details = $('.details');
let $error = $('.error-msg');
let $progress = $('.progress-wrap');

let fileSize;

let clear = function() {
  $details.removeClass('is-shown');
  $error.text('');
  $progress.css({
    width: "0%"
  });
  $('span.size').text('');
}

let validate = function(url) {
  let urlobj = URL.parse(url);
  return /soundcloud.com/.test(urlobj.hostname);
}

let showError = function(error) {
  $url.focus();
  $error.text((error) ? error : '');
}

let fillData = function(data) {
  $details.find('.artwork > img').attr('src', data.artwork_url);
  $details.find('.info > .title').text(data.title);
  $details.show();
}

ipcRenderer.on('download-file', (event, fileData) => {
  console.log(fileData);
});

ipcRenderer.on('download-file-reply', (event, response) => {
  $('span.size').text(`Download completed!`);
});

ipcRenderer.on('get-soundcloud-reply', function(event, fileData) {
  fillData(fileData);
  $details.addClass('is-shown');
});

ipcRenderer.on('download-file-error', function(event, errorMsg) {
  $url.focus();
  $error.text(errorMsg);
});

ipcRenderer.on('progress-file-reply', (event, downloaded) => {
  $('span.size').text(`Downloading ${downloaded}% of ${fileSize} MB`);
  $progress.css({
    width: downloaded + "%"
  });
});

$get.on('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  clear();

  let url = $.trim($url.val()), is_valid=false, validation_msg;
  if (!url.length) {
    is_valid = !is_valid;
    return showError('URL is empty');
  }
  is_valid = validate(url);
  if(!is_valid) {
    return showError('Invalid URL');
  }

  ipcRenderer.send('get-soundcloud', url);
});

clear();
$url.on('input', function(e) {
  clear();
});
