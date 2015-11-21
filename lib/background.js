import ConnectionHub from './connection-hub';
import TabCollection from './tab-collection';

var edlUrl = chrome.extension.getURL("edl.html");

chrome.browserAction.onClicked.addListener(() => {

  //if edl.html is already open then just focus the right window, otherwise open edl.html in a new window
  chrome.windows.getAll({
    populate: true,
    windowTypes: ['popup']
  }, (windows) => {
    var found = false;

    windows.forEach((window) => {
      window.tabs.forEach((tab) => {
        if(tab.url && tab.url.indexOf(edlUrl) === 0) {
          chrome.windows.update(window.id, {focused: true});
          chrome.tabs.update(tab.id, {selected: true});
          found = true;
        }
      });
    });

    if(!found) {
      chrome.windows.create({
        url: edlUrl,
        focused: true,
        type: 'popup',
        state: 'normal'
      });
    }
  });
});

var hub = new ConnectionHub({
  namespace: 'browser-sync',
  welcomeMsg: {
    action: 'connection',
    data: {
      stylesheetSync: true,
      ghostMode: {
        clicks: true,
        touch: true,
        forms: {
          inputs: true,
          toggles: true,
          submit: true
        },
        scroll: true
      }
    }
  }
});

var tabs = new TabCollection();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.namespace !== 'device-windows') {
    return;
  }

  if(request.action === 'add-tab') {
    var result = tabs.add(request.tabId, request.data);
    if(sendResponse) {
      sendResponse(result);
    }
  } else if (request.action === 'get-tabs') {
    sendResponse(tabs.getAll());
  } else {
    sendResponse('Unknown action');
  }
});
