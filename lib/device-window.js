import TabDebugger from './tab-debugger';

function createWindow(url, width, height) {
  return new Promise((resolve, reject) => {
    chrome.windows.create({
      left: 0,
      top: 0,
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

  navigateTo(url) {
    if(!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    return (this._debugger).sendCommand("Page.navigate", {url: url});
  }

  reload(hard) {
    if(!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    hard = (hard === true);

    return (this._debugger).sendCommand("Page.reload", {ignoreCache: hard});
  }

  sendMouseEvent(type, x, y) {
    if(!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    switch(type) {
      case 'mousemove': type = 'mouseMoved'; break;
      case 'mousedown': type = 'mousePressed'; break;
      case 'mouseup': type = 'mouseReleased'; break;
      default:
        throw new Error("Unknown type of event.");
        break;
    }

    return (this._debugger)
      .sendCommand("Input.dispatchMouseEvent", {
        type: type,
        button: 'left',
        clickCount: 1,
        y: y,
        x: x
      });
  }

  sendKeyboardEvent(type, charCode, shift, alt, ctrl, cmd) {
    if(!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    switch(type) {
      case 'keyup': type = 'keyUp'; break;
      case 'keydown': type = 'keyDown'; break;
      default:
        throw new Error("Unknown type of event.");
        break;
    }

    var text = String.fromCharCode(charCode).toLocaleLowerCase();

    var modifiers = 0;
    if(shift) {
      modifiers += 8;
      text = text.toLocaleUpperCase();
    }
    if(alt) {
      modifiers += 1;
    }
    if(ctrl) {
      modifiers += 2;
    }
    if(cmd) {
      modifiers += 4;
    }

    return (this._debugger)
      .sendCommand("Input.dispatchKeyEvent", {
        type: type,
        windowsVirtualKeyCode: charCode,
        modifiers: modifiers,
        text: text
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