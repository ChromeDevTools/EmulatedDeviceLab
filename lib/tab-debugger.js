function _attach(tabId) {
  var protocolVersion = '1.1';

  return new Promise((resolve, reject) => {
    chrome.debugger.attach({
      tabId: tabId
    }, protocolVersion, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
        return;
      }

      resolve();
    });
  });
}

function _sendCommand(tabId, command, data = {}) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({
      tabId: tabId
    }, command, data, (response) => {
      if (response.error) {
        reject(response.error);
        return;
      }

      resolve();
    });
  });
}

class TabDebugger {
  constructor(tabId) {
    var tabDebugger = this;
    this._tabId = tabId;
    this._attached = true;

    chrome.debugger.onDetach.addListener((source, reason) => {
      if(source.tabId === tabDebugger._tabId) {
        tabDebugger._attached = false;
      }
    });
  }

  connect() {
    var tabDebugger = this;

    return _attach(this._tabId).then(() => {
      tabDebugger._attached = true;
    });
  }

  sendCommand(command, data) {
    var tabDebugger = this;

    if(!this._attached) {
      return this.connect().then(() => {
        return _sendCommand(tabDebugger._tabId, command, data);
      });
    }

    return _sendCommand(this._tabId, command, data);
  }
}

export default TabDebugger;