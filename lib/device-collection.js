import Device from './device';

class DeviceCollection {
  constructor() {
    var collection = this;

    this._devices = [];
    this._listeners = {
      'onadded': [],
      'onremoved': []
    };

    chrome.runtime.sendMessage({
      namespace: 'device-windows',
      action: 'get-tabs'
    }, (tabs) => {
      tabs.forEach((tabInfo) => {
        chrome.tabs.get(tabInfo.id, (tab) => {
          if(!tab || !tab.windowId) {
            return;
          }

          chrome.windows.get(tab.windowId, {populate: true}, (deviceWindow) => {
            collection.add(tabInfo.data, deviceWindow);
          })
        });
      });
    });
  }

  add(settings, deviceWindow) {
    var device = new Device(settings);

    //create new or reattach existing window
    if(!deviceWindow) {
      device.create()
        .then(() => {
          chrome.runtime.sendMessage({
            namespace: 'device-windows',
            action: 'add-tab',
            tabId: device.getTab().id,
            data: settings
          });
        });
    } else {
      device.setWindow(deviceWindow);
    }

    this._devices.push(device);

    var collection = this;
    device.onClose(() => {
      collection.remove(device);
    });

    this._trigger('onadded', device);

    return device;
  }

  remove(device) {
    var idx = this._devices.indexOf(device);

    if(idx > -1) {
      (this._devices).splice(idx, 1);
      this._trigger('onremoved', device);

      return true;
    }

    return false;
  }

  onDeviceAdded(listener) {
    this._listeners['onadded'].push(listener);

    return true;
  }

  onDeviceRemoved(listener) {
    this._listeners['onremoved'].push(listener);

    return true;
  }

  getAll() {
    return this._devices;
  }

  _trigger(event, data) {
    if(!this._listeners[event]) {
      return;
    }

    (this._listeners[event]).forEach((listener) => {
      listener(data);
    });
  }
}

export default DeviceCollection;