import DeviceListItem from './device-list-item';

class DeviceList {
  constructor(rootElement) {
    this._rootElement = rootElement;
    this._items = [];
    this._selected = null;
    this._listeners = {
      'selected': []
    };
  }

  /**
   * @param {Device} device
   */
  addDevice(device) {
    var deviceList = this;

    var listItem = new DeviceListItem(device);

    this._items.push(listItem);

    var deviceElement = listItem.getElement();

    (this._rootElement).appendChild(deviceElement);

    deviceElement.addEventListener('click', () => {
      deviceList.selectItemByTabId(device.getTab().id);
    });

    device.onClose(() => {
      deviceList.removeItemByTabId(device.getTab().id);
    });
  }

  selectItemByTabId(id) {
    if(this._selected && this._selected.getDevice().getTab().id === id) {
      //already selected
      return;
    }

    var item = this.getItemByTabId(id);
    if(!item) {
      throw new Error("Device with given ID does not exist.");
    }

    if(this._selected) {
      this._selected.deselect();
    }

    this._selected = item;
    this._selected.select();

    this._trigger('selected', item);
  }

  removeItemByTabId(id) {
    var device = this.getItemByTabId(id);
    if(!device) {
      throw new Error("Device with given ID does not exist.");
    }

    //remove DOM element
    (this._rootElement).removeChild(device.item.getElement());

    //remove from known items
    var index = (this._items).indexOf(device);
    if (index > -1) {
      (this._items).splice(index, 1);
    }

    //if selected - deselect
    if(this._selected === device) {
      this.deselect();
    }
  }

  deselect() {
    if(this._selected) {
      this._selected.deselect();
    }

    this._selected = null;

    this._trigger('selected', null);
  }

  onSelected(callback) {
    this._listeners['selected'].push(callback);
  }

  getItemByTabId(id) {
    return (this._items).find((item) => {
      return item.getDevice().getTab().id === id;
    });
  }

  getAll() {
    return this._items;
  }

  _trigger(action, data) {
    (this._listeners[action]).forEach((callback) => {
      callback(data);
    });
  }
}

export default DeviceList;