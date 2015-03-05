"use strict";
var events = require("./events");
var utils  = require("./browser.utils").utils;

var OPT_PATH = "stylesheetSync";

var current = function () {
  return window.location.pathname;
};

var findStylesheet = function (url) {
  var stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');

  for(var i=0, l=stylesheets.length; i<l; i++) {
    var stylesheet = stylesheets[i];

    if(stylesheet.href === url || stylesheet.dataset.originalHref == url) {
      return stylesheet;
    }
  }

  return null;
};

/**
 * @param {BrowserSync} bs
 */
exports.init = function (bs) {
  bs.socket.on("stylesheet:add", exports.addStylesheet.bind(this, bs));
  bs.socket.on("stylesheet:update", exports.updateStylesheet.bind(this, bs));
};

exports.addStylesheet = function (bs, data) {
  if (!bs.canSync({url: current()}, OPT_PATH)) {
    return;
  }

  var newStylesheet = document.createElement('style');
  newStylesheet.dataset.originalHref = data.stylesheet;
  newStylesheet.innerText = data.content;

  var stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
  if(!stylesheets.length) {
    document.body.insertBefore(newStylesheet, null);//insert at the end of body
  } else {
    var lastStylesheet = stylesheets[stylesheets.length - 1];
    lastStylesheet.parentNode.insertBefore(newStylesheet, lastStylesheet.nextSibling);//insert after last stylesheet
  }
};

exports.updateStylesheet = function (bs, data) {
  if (!bs.canSync({url: current()}, OPT_PATH)) {
    return;
  }

  var stylesheetElem = findStylesheet(data.stylesheet);
  if(stylesheetElem) {
    var parent = stylesheetElem.parentElement;

    var replacement = document.createElement('style');
    replacement.dataset.originalHref = stylesheetElem.href || stylesheetElem.dataset.originalHref;
    replacement.textContent = data.content;

    parent.replaceChild(replacement, stylesheetElem);
  }
};
