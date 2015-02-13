/**
 * Connection hub - messages from content scripts are not propagated across whole extension, this hub sends all received
 * messages to each tab individually
 */
class ConnectionHub {
  constructor(settings) {
    this._namespace = settings.namespace;
    this._welcomeMsg = settings.welcomeMsg;
    this._currentSender = null;
    this._ports = [];

    chrome.runtime.onConnect.addListener(this._handleNewConnection.bind(this));
  }

  _handleNewConnection(port) {
    console.log('incoming connection', port);

    if (port.name !== this._namespace) {
      return;
    }

    this._ports.push(port);
    port.onMessage.addListener(this._handleNewMessage.bind(this, port));
    port.onDisconnect.addListener(this._removePort.bind(this, port));

    if(this._welcomeMsg) {
      port.postMessage(this._welcomeMsg);
    }
  }

  _removePort(port) {
    console.log('connection lost', port);
    var idx = (this._ports).indexOf(port);

    if(idx > -1) {
      (this._ports).splice(idx, 1);
    }
  }

  _handleNewMessage(fromPort, msg) {
    //msg.tabId - devtools are sending messages on behalf of the tab that is being inspected
    //fromPort.sender.tab.id - regular tab is sending message
    var senderTabId = msg.tabId || (fromPort.sender.tab && fromPort.sender.tab.id) || null;

    /*
     We have to prevent a 'message storm' where each tab, after receiving update (e.g. scroll position), emits new message.
     This is done by tab getting temporary monopoly to send messages. We are assuming that user can only interact
     with a single tab at a given time.
     */
    var now = new Date().getTime();
    if (!this._currentSender || this._currentSender.timeout < now) {
      this._currentSender = {
        id: senderTabId,
        timeout: now + 500
      };
    }

    if (this._currentSender.id !== senderTabId) {
      console.log('Message blocked to prevent message storm.');
      console.log('Blocked sender:', senderTabId, 'current sender:', this._currentSender.id, 'time diff:', this._currentSender.timeout - now);
      return;
    }

    (this._ports).forEach((port) => {
      //don't send back the message to the original tab
      if (port.sender.tab && port.sender.tab.id !== senderTabId && port !== fromPort) {
        port.postMessage(msg);
      }
    });
  }
}

export default ConnectionHub;