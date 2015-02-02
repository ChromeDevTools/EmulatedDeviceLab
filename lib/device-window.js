import TabDebugger from './tab-debugger';

function createWindow(url, width, height) {
  return new Promise((resolve, reject) => {
    chrome.windows.create({
      url: url,
      width: width,
      height: height + 36,
      focused: true,
      type: 'popup'
    }, (newWindow) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      resolve(newWindow);
    });
  });
}

class DeviceWindow {
  constructor(settings) {
    this._url = settings.url;
    this._device = settings.device;
  }

  create() {
    var device = this._device;
    var url = this._url;

    return createWindow(url, device.width, device.height)
      .then((newWindow) => {
        var tab = newWindow.tabs[0];
        var tabDebugger = new TabDebugger(tab.id);

        function callCommand(command, data = {}) {
          return (tabDebugger.sendCommand).bind(tabDebugger, command, data);
        }

        tabDebugger
          .connect()
          .then(callCommand("Network.enable"))
          .then(callCommand("Page.enable"))
          .then(callCommand("Network.setUserAgentOverride", {
            userAgent: device.userAgent
          }))
          .then(callCommand("Page.setDeviceMetricsOverride", {
            width: device.width,
            height: device.height,
            deviceScaleFactor: device.deviceScaleFactor,
            mobile: device.mobile,
            fitWindow: false
          }))
          .then(callCommand("Page.navigate", {//better results than Page.reload
            url: url
          }));

        this._window = newWindow;
        this._debugger = tabDebugger;
      });
  }

  onClose(callback) {
    chrome.windows.onRemoved.addListener((windowId) => {
      if (windowId === this._window.id) {
        callback();
      }
    });
  }

  getTab() {
    return this._window.tabs[0];
  }

  getDevice() {
    return this._device;
  }
}

export default DeviceWindow;