/**
 * Connection hub - messages from content scripts are not propagated across whole extension, this hub sends all received
 * messages to each tab individually
 */
class ConnectionHub {
  constructor(settings) {
    this._namespace = settings.namespace;
    /**
     * List of IDs of tabs that should receive messages
     * @type {Array}
     * @private
     */
    this._tabs = settings.tabs;
    this._currentSender = null;

    chrome.runtime.onMessage.addListener(this._handleNewMessage.bind(this));
  }

  setTabs(tabs) {
    this._tabs = tabs;
  }

  _handleNewMessage(request, sender, sendResponse) {
    if(request.namespace !== this._namespace) {
      return;
    }

    /*
     We have to prevent a 'message storm' where each tab, after receiving update (e.g. scroll position), emits new message.
     This is done by tab getting temporary monopoly to send messages. We are assuming that user can only interact
     with a single tab at a given time.
     */
    var now = new Date().getTime();
    if(!this._currentSender || this._currentSender.timeout < now) {
      this._currentSender = {
        id: sender.tab.id,
        timeout: now + 500
      };
    }

    if(this._currentSender.id !== sender.tab.id) {
      console.log('Message blocked to prevent message storm.');
      console.log('Blocked sender:', sender.tab.id, 'current sender:', this._currentSender.id, 'time diff:', this._currentSender.timeout - now);
      return;
    }

    (this._tabs).forEach((tabId) => {
      //don't send back the message to the original tab
      if(!sender.tab || sender.tab.id !== tabId) {
        chrome.tabs.sendMessage(tabId, request);
      }
    });
  }
}

export default ConnectionHub;