import ConnectionHub from './connection-hub';
import TabCollection from './tab-collection';

var edlUrl = chrome.extension.getURL("edl.html");

chrome.browserAction.onClicked.addListener(() => {

  //if edl.html is already open then just select the tab, otherwise open edl.html in a new tab
  chrome.tabs.getAllInWindow(undefined, (tabs) => {
    var found = false;

    tabs.forEach((tab) => {
      if(tab.url && tab.url.indexOf(edlUrl) === 0) {
        chrome.tabs.update(tab.id, {selected: true});
        found = true;
      }
    });

    if(!found) {
      chrome.tabs.create({url: edlUrl});
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
        forms: {
          inputs: true,
          toggles: true,
          submit: true
        },
        scroll: true,
        //scrollProportionally: true,
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