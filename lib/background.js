//this import is useless, however, removing it will prevent this file from loading - this is some kind of systemjs weirdness
import DOMHelper from './dom-helper';

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

var currentSender = null;

/*
Connection hub - messages from content scripts are not propagated across whole extension, this hub sends all received
messages to each tab individually
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.namespace !== 'browser-sync') {
    return;
  }

  /*
  We have to prevent a 'message storm' where each tab, after receiving update (e.g. scroll position), emits new message.
  This is done by tab getting temporary monopoly to send messages. We are assuming that user can only interact
  with a single tab at a given time.
   */
  var now = new Date().getTime();
  if(!currentSender || currentSender.timeout < now) {
    currentSender = {
      id: sender.tab.id,
      timeout: now + 500
    };
  }

  if(currentSender.id !== sender.tab.id) {
    console.log('Message blocked to prevent message storm');
    return;
  }

  chrome.windows.getAll({
    populate: true
  }, (windows) => {
    windows.forEach((win) => {
      win.tabs.forEach((tab) => {
        //TODO limit sending messages only to tabs created by this extension

        //don't send back the message to the original tab
        if(!sender.tab || sender.tab.id !== tab.id) {
          chrome.tabs.sendMessage(tab.id, request);
        }
      })
    });
  })
});