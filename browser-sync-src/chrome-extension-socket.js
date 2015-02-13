"use strict";

var MSG_NAMESPACE = 'browser-sync';
var port = chrome.runtime.connect({name: MSG_NAMESPACE});

/**
 * @returns {string}
 */
exports.getPath = function () {
  return window.location.pathname;
};

/**
 * @param name
 * @param data
 */
exports.emit = function (name, data) {
  //console.log('sendMessage', name, data);

  data = data || {};
  data.url = exports.getPath();

  port.postMessage({
    action: name,
    data: data
  });
};

/**
 * @param name
 * @param callback
 */
exports.on = function (name, callback) {
  //console.log('create listener', name);

  port.onMessage.addListener(function(msg) {
    if(msg.action === name) {
      //console.log('onMessage', msg.action, msg.data);
      callback(msg.data);
    }
  });
};