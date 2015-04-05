"use strict";

/**
 * This is the plugin for syncing touch events between browsers
 * @type {string[]}
 */
var EVENTS = ["touchstart", "touchmove", "touchend", "touchcancel"];
var OPT_PATH = "ghostMode.touch";
exports.canEmitEvents = true;

/**
 * @param {BrowserSync} bs
 * @param eventManager
 */
exports.init = function (bs, eventManager) {

  EVENTS.forEach(function(eventName) {
    eventManager.addEvent(document.body, eventName, exports.browserEvent(bs));
    bs.socket.on(eventName, exports.socketEvent(bs, eventManager, eventName));
  });
};

/**
 * Uses event delegation to determine the touched element
 * @param {BrowserSync} bs
 * @returns {Function}
 */
exports.browserEvent = function (bs) {

  return function (event) {

    if (exports.canEmitEvents) {

      var elem = event.target || event.srcElement;

      if (elem.type === "checkbox" || elem.type === "radio") {
        bs.utils.forceChange(elem);
        return;
      }

      bs.socket.emit(event.type, bs.utils.getElementData(elem));

    } else {
      exports.canEmitEvents = true;
    }
  };
};

/**
 * @param {BrowserSync} bs
 * @param {manager} eventManager
 * @param {string} eventName
 * @returns {Function}
 */
exports.socketEvent = function (bs, eventManager, eventName) {

  return function (data) {

    if (!bs.canSync(data, OPT_PATH)) {
      return false;
    }

    var elem = bs.utils.getSingleElement(data.tagName, data.index);

    if (elem) {
      exports.canEmitEvents = false;
      eventManager.triggerTouch(elem, eventName);
    }
  };
};
