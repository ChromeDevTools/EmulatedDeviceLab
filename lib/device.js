import TabDebugger from './tab-debugger';

//we have to take into account height of the debug infobar at the top and window frame
//TODO fetch actual values, don't hardcode them
const INFOBAR_HEIGHT = 36;
const FRAME_HEIGHT = 22;

function createWindow(url, width, height) {
  return new Promise((resolve, reject) => {
    chrome.windows.create({
      left: 0,
      top: 0,
      url: url,
      width: width,
      height: height + INFOBAR_HEIGHT,
      focused: true,
      type: 'popup'
    }, (newWindow) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      var availableWidth = newWindow.width,
        availableHeight = newWindow.height - FRAME_HEIGHT - INFOBAR_HEIGHT;

      //if created window doesn't have desired dimensions (due to desktop size restrictions) we should, at least,
      //fix window proportions
      if (availableWidth < width || availableHeight < height) {
        var heightProportions = availableHeight / height;
        var widthProportions = availableWidth / width;
        var scale = heightProportions < widthProportions ? heightProportions : widthProportions;

        var newHeight = Math.round(scale * height);
        var newWidth = Math.round(scale * width);

        chrome.windows.update(newWindow.id, {
          width: newWidth,
          height: newHeight + INFOBAR_HEIGHT + FRAME_HEIGHT
        }, (updatedWindow) => {
          newWindow.width = updatedWindow.width;
          newWindow.height = updatedWindow.height;

          resolve(newWindow);
        });

      } else {
        resolve(newWindow);
      }
    });
  });
}

function injectBrowserSyncScript(tabId) {
  //inject browser-sync script
  chrome.tabs.executeScript(tabId, {
    file: './lib/browser-sync.js'
  });
}

class Device {
  constructor(settings) {
    this._url = settings.url;
    this._type = settings.type;
    this._title = settings.title;
    this._width = settings.width;
    this._height = settings.height;
    this._deviceScaleFactor = settings.deviceScaleFactor;
    this._userAgent = settings.userAgent;
    this._mobile = settings.mobile;
    this._touch = settings.touch;
  }

  create() {
    return createWindow(this._url, this._width, this._height)
      .then(this.setWindow.bind(this));
  }

  setWindow(newWindow) {
    var winCtrl = this;

    var tab = newWindow.tabs[0];
    var tabDebugger = new TabDebugger(tab.id);

    if (tab.status === 'complete') {
      injectBrowserSyncScript(tab.id);
    }

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabObj) => {
      if (tab.id === tabId && changeInfo.status === 'complete') {
        injectBrowserSyncScript(tab.id);
      }
    });

    function callCommand(command, data = {}) {
      return (tabDebugger.sendCommand).bind(tabDebugger, command, data);
    }

    tabDebugger
      .connect()
      .then(callCommand("Network.enable"))
      .then(callCommand("Page.enable"))
      .then(callCommand("Page.setTouchEmulationEnabled", {
        enabled: winCtrl._touch
      }))
      .then(callCommand("Network.setUserAgentOverride", {
        userAgent: winCtrl._userAgent
      }))
      .then(callCommand("Page.setDeviceMetricsOverride", {
        width: winCtrl._width,
        height: winCtrl._height,
        deviceScaleFactor: winCtrl._deviceScaleFactor,
        mobile: winCtrl._mobile,
        fitWindow: true
      }))
      .then(callCommand("Page.navigate", {//better results than Page.reload
        url: winCtrl._url
      }));

    //requested screen size VS actual window size
    this._windowScale = newWindow.width / this._width;
    this._window = newWindow;
    this._debugger = tabDebugger;
  }

  navigateTo(url) {
    if (!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    return (this._debugger).sendCommand("Page.navigate", {url: url});
  }

  reload(hard) {
    if (!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    hard = (hard === true);

    return (this._debugger).sendCommand("Page.reload", {ignoreCache: hard});
  }

  /**
   * Emulates mouse and touch events on the device (depending on its _touch flag)
   * @param type {string} Type of event (one of: mousemove, mousedown, mouseup)
   * @param x {number}
   * @param y {number}
   * @returns {Promise}
   */
  sendPointerEvent(type, x, y) {
    if (!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    switch (type) {
      case 'mousemove':
        type = 'mouseMoved';
        break;
      case 'mousedown':
        type = 'mousePressed';
        break;
      case 'mouseup':
        type = 'mouseReleased';
        break;
      default:
        throw new Error("Unknown type of event.");
        break;
    }

    var command, data = {
      type: type,
      button: 'left',
      y: y,
      x: x,
      timestamp: Date.now(),
      clickCount: 1
    };

    if(this._touch) {
      command = 'Input.emulateTouchFromMouseEvent';
      data.x = Math.round(data.x * this._windowScale);
      data.y = Math.round(data.y * this._windowScale);
    } else {
      command = 'Input.dispatchMouseEvent';
    }

    return (this._debugger)
      .sendCommand(command, data);
  }

  sendKeyboardEvent(type, charCode, shift, alt, ctrl, cmd) {
    if (!this._debugger) {
      throw new Error("Debugger is not attached!");
    }

    var text = "";

    switch (type) {
      case 'keyup':
        type = 'keyUp';
        break;
      case 'keydown':
        type = 'rawKeyDown';
        break;
      case 'keypress':
        type = 'char';
        text = String.fromCharCode(charCode);
        break;
      default:
        throw new Error("Unknown type of event.");
        break;
    }

    var modifiers = 0;
    if (shift) {
      modifiers += 8;
    }
    if (alt) {
      modifiers += 1;
    }
    if (ctrl) {
      modifiers += 2;
    }
    if (cmd) {
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

  sendScrollEvent(x = 0, y = 0, distanceY = 0, distanceX = 0) {
    return (this._debugger)
      .sendCommand("Input.emulateTouchFromMouseEvent", {
        type: 'mouseWheel',
        x: x,
        y: y,
        timestamp: Date.now(),
        button: 'none',
        deltaX: distanceX,
        deltaY: distanceY
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
      if (windowController.getTab() && windowController.getTab().id === tabId && changeInfo.status) {
        callback(changeInfo.status);
      }
    });
  }

  onURLChange(callback) {
    var windowController = this;

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (windowController.getTab() && windowController.getTab().id === tabId && changeInfo.url) {
        callback(changeInfo.url);
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
    chrome.windows.remove(this._window.id, () => {
    });
  }

  bringToFront() {
    chrome.windows.update(this._window.id, {focused: true}, () => {
    });
  }

  getTab() {
    return this._window && this._window.tabs && this._window.tabs[0];
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getTitle() {
    return this._title;
  }

  getType() {
    return this._type;
  }
}

export default Device;
