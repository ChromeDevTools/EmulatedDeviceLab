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

class WindowController {
  constructor(settings) {
    this._url = settings.url;
    this._width = settings.width;
    this._height = settings.height;
    this._deviceScaleFactor = settings.deviceScaleFactor;
    this._userAgent = settings.userAgent;
    this._mobile = settings.mobile;
  }

  create() {
    var winCtrl = this;

    return createWindow(this._url, this._width, this._height)
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
            userAgent: winCtrl._userAgent
          }))
          .then(callCommand("Page.setDeviceMetricsOverride", {
            width: winCtrl._width,
            height: winCtrl._height,
            deviceScaleFactor: winCtrl._deviceScaleFactor,
            mobile: winCtrl._mobile,
            fitWindow: false
          }))
          .then(callCommand("Page.navigate", {//better results than Page.reload
            url: winCtrl._url
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
      case 'keydown': type = 'keyDown';

        //we have to handle arrows and enter key differently
        if(charCode >= 37 && charCode <= 40) {
          type = 'rawKeyDown';
        }
        break;
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

  onStatusChange(callback) {
    var windowController = this;

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if(windowController.getTab().id === tabId && changeInfo.status) {
        callback(changeInfo.status);
      }
    });
  }

  /**
   * Forced window repaint
   * @returns {Promise}
   */
  repaint() {
    return (this._debugger)
      .sendCommand("DOM.highlightRect", {x: 0, y: 0, width: 1, height: 1})
      .then(() => {
        (this._debugger).sendCommand("DOM.hideHighlight");
      })
  }

  close() {
    chrome.windows.remove(this._window.id, () => {});
  }

  getTab() {
    return this._window.tabs[0];
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }
}

export default WindowController;