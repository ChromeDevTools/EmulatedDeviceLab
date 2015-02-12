import slugify from './helpers';

chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(res, content) {
  var tabId = chrome.devtools.inspectedWindow.tabId;

  if(res.type === 'stylesheet' && res.url) {
    chrome.runtime.sendMessage({
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
  var tabId = chrome.devtools.inspectedWindow.tabId;

  if(res.type === 'stylesheet' && res.url) {
    res.getContent((content) => {
      chrome.runtime.sendMessage({
        namespace: 'browser-sync',
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