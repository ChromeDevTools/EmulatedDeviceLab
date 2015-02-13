import slugify from './helpers';

var port = chrome.runtime.connect({name: 'browser-sync'});
var tabId = chrome.devtools.inspectedWindow.tabId;

chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(res, content) {
  if(res.type === 'stylesheet' && res.url) {
    port.postMessage({
      namespace: 'browser-sync',
      action: 'stylesheet:update',
      tabId,
      data: {
        //url: chrome.devtools.inspectedWindow.location.pathname,
        stylesheet: res.url,
        content
      }
    });
  }
});

chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(res) {
  if(res.type === 'stylesheet' && res.url) {
    res.getContent((content) => {
      port.postMessage({
        action: 'stylesheet:add',
        tabId,
        data: {
          //url: chrome.devtools.inspectedWindow.location.pathname,
          stylesheet: res.url,
          content
        }
      });
    });
  }
});