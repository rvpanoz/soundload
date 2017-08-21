'use strict';

/**
 * handles click events from menu items
 */
function handleSectionTrigger(event) {
  var $target = $(event.target);
  hideAllSectionsAndDeselectButtons();

  // Highlight clicked button and show view
  $target.addClass('is-selected');

  // Display the current section
  var sectionId = $target.data('section') + '-section';
  $("#" + sectionId).addClass('is-shown');
}

/**
 * activates the default section
 */
function activateDefaultSection() {
  $('a[href="#home"]').click();
}

/**
 * shows the main content
 */
function showMainContent() {
  $body.removeClass('is-menu-visible');
  $('.js-section').addClass('is-shown');
}

/**
 * hide all sections
 */
function hideAllSectionsAndDeselectButtons() {
  var sections = $('.js-section');
  sections.each(function(idx, section) {
    $(section).removeClass('is-shown');
  });

  $('.nav-button.is-selected').removeClass('is-selected');
}

/**
 * menu events
 */
var $menu = $('#menu');
var $body = $('body');

$menu.wrapInner('<div class="inner"></div>');
$menu.appendTo($body)
  .on('click', function(event) {
    event.stopPropagation();
  })
  .on('click', 'a', function(event) {
    var element = event.target;
    var href = $(element).attr('href');

    event.preventDefault();
    event.stopPropagation();

    $('body').removeClass('is-menu-visible');
    if (href == '#menu') {
      return;
    }

    window.setTimeout(function() {
      handleSectionTrigger(event);
    }, 350);

  }).append('<a class="close" href="#menu">Close</a>');

$body
  .on('click', 'a[href="#menu"]', function(event) {
    event.stopPropagation();
    event.preventDefault();
    $('body').toggleClass('is-menu-visible');
  })
  .on('click', function(event) {
    $('body').removeClass('is-menu-visible');
    var section = $(event.target).data('section');
    if(section) {
      handleSectionTrigger(event);
    }
  })
  .on('keydown', function(event) {
    // hide on escape
    if (event.keyCode == 27)
      $('body').removeClass('is-menu-visible');
  });

$('a[href="#home"]').click();
