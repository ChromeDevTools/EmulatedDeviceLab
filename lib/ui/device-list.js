import DeviceListItem from './device-list-item';

class DeviceList {
  constructor(rootElement) {
    this._rootElement = rootElement;
    this._devices = [];
    this._selected = null;
    this._listeners = {
      'selected': []
    };
  }

  addDevice(deviceName, deviceWindow) {
    var deviceList = this;

    var itemWidth = Math.floor(deviceWindow.getWidth() / 3);
    var itemHeight = Math.floor(deviceWindow.getHeight() / 3);

    var deviceItem = new DeviceListItem(deviceName, itemWidth, itemHeight);
    var device = {
      name: deviceName,
      window: deviceWindow,
      item: deviceItem
    };

    this._devices.push(device);

    var rootElement = (this._rootElement);
    var deviceElement = deviceItem.getElement();

    deviceElement.addEventListener('click', () => {
      deviceList.selectElementByTabId(deviceWindow.getTab().id);
    });

    rootElement.appendChild(deviceItem.getElement());
    deviceWindow.onClose(() => {
      deviceList.removeDeviceByTabId(deviceWindow.getTab().id);
    });
  }

  selectElementByTabId(id) {
    if(this._selected && this._selected.window.getTab().id === id) {
      //already selected
      return;
    }

    var device = this.getDeviceByTabId(id);
    if(!device) {
      throw new Error("Device with given ID does not exist.");
    }

    this._selected = device;
    var selectedElement = this._rootElement.querySelector('.selected');
    if(selectedElement) {
      selectedElement.classList.remove('selected');
    }

    device.item.getElement().classList.add('selected');

    //trigger callbacks
    (this._listeners['selected']).forEach((callback) => {
      callback(device);
    });
  }

  removeDeviceByTabId(id) {
    var device = this.getDeviceByTabId(id);
    if(!device) {
      throw new Error("Device with given ID does not exist.");
    }

    //remove DOM element
    (this._rootElement).removeChild(device.item.getElement());

    //remove from known devies
    var index = (this._devices).indexOf(device);
    if (index > -1) {
      (this._devices).splice(index, 1);
    }

    //if selected - deselect
    if(this._selected === device) {
      //TODO fix this
      this._selected = null;
    }
  }

  onSelected(callback) {
    this._listeners['selected'].push(callback);
  }

  getDeviceByTabId(id) {
    return (this._devices).find((device) => {
      return (device.window).getTab().id === id;
    });
  }

  getAll() {
    return this._devices;
  }
}

export default DeviceList;