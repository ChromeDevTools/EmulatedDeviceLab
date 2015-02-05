"use strict";

var MSG_NAMESPACE = 'browser-sync';

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
  console.log('emit', name, data);

  data = data || {};
  data.url = exports.getPath();

  chrome.runtime.sendMessage({
    namespace: MSG_NAMESPACE,
    action: name,
    data: data
  }, function(response) {
    console.log('response', response);
  });
};

/**
 * @param name
 * @param callback
 */
exports.on = function (name, callback) {
  console.log('on', name);

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.namespace && request.namespace === 'browser-sync' && request.action === name) {
      console.log('sync', request.action, request.data);
      callback(request.data);
    }
  });
};