const ipcRenderer = require('electron').ipcRenderer;
const _ = require('lodash');

let links = $('link[rel="import"]');

// Import and add each page to the DOM
links.each(function (idx, link) {
  var link_import = $(link.import);
  var template = link_import.find('.page-template');
  var content = $('.content');

  $('.content').append(template.html());
});

$('body').on("contextmenu", function(e) {
  var coords = {
    x: e.pageX,
    y: e.pageY
  }
  ipcRenderer.send('inspect-element', coords);
});
