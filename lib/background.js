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