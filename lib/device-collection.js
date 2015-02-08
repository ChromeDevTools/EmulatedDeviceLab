import Device from './device';

class DeviceCollection {
  constructor() {
    var collection = this;

    this._listeners = {
      'onadded': []
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

            var device = new Device(tabInfo.data);
            device.setWindow(deviceWindow);

            collection._trigger('onadded', device);
          })
        });
      });
    });
  }

  add(settings) {
    var device = new Device(settings);

    device.create()
      .then(() => {
        chrome.runtime.sendMessage({
          namespace: 'device-windows',
          action: 'add-tab',
          tabId: device.getTab().id,
          data: settings
        });
      });

    this._trigger('onadded', device);

    return device;
  }

  onDeviceAdded(listener) {
    this._listeners['onadded'].push(listener);

    return true;
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