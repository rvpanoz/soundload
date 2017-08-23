/**
 * home section
 * @type {[type]}
 */

'use strict';

const URL = require('url');
const ipcRenderer = require('electron').ipcRenderer;
const config = require('../config');

let $get = $('input[id="soundcloud-get"]');
let $downloadBtn = $('button.download');
let $url = $('input#soundcloud-url');
let $details = $('.details');
let $error = $('.error-msg');
let $info = $('.details__info__msg');
let $progress = $('.progress-wrap');

let fileSize, fileName;

let clear = function() {
  $details.removeClass('is-shown');
  $error.text('');
  $progress.css({
    width: "0%"
  });
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
  fileName = data.title;
  $details.find('.details__img > img').attr('src', data.artwork_url);
  $details.find('.details__img > img').attr('alt', data.title);
  $details.find('.details__info__type').text(data.user.username);
  $details.find('.details__info__name').text(data.title);
  $details.find('input[type="hidden"]').val(data.id);
  $details.show();
}

ipcRenderer.on('download-file-reply', function(event) {
  $info.text(`Download completed!`);
});

ipcRenderer.on('on-response-reply', (event, trackSize) => {
  fileSize = trackSize;
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
  $info.text(`Downloading ${downloaded}% of ${fileSize} MB`);
  $progress.css({
    width: downloaded + "%"
  });
});

$downloadBtn.on('click', function(e) {
    e.preventDefault();
    let trackId = parseInt($('input[type="hidden"]').val());
    ipcRenderer.send('download-file', fileName, trackId);
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
