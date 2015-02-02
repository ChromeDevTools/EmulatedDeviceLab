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
      console.log('command', command, tabId, data);
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
    this._tabId = tabId;
  }

  connect() {
    return _attach(this._tabId);
  }

  sendCommand(command, data) {
    return _sendCommand(this._tabId, command, data);
  }
}

export default TabDebugger;