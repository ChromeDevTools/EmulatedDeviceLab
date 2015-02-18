import DeviceTypes from '../device-types';

class DeviceChooser {
  constructor(rootElement) {
    var deviceChooser = this;

    this._rootElement = rootElement;
    this._listeners = {
      selected: []
    };

    var deviceSelect = document.querySelector('select.device-selector');
    var spawnButton = document.querySelector('button.spawn');

    this._setup();
    DeviceTypes.onChange(() => {
      deviceChooser._setup();
    });

    spawnButton.addEventListener('click', () => {
      var deviceType = DeviceTypes.getTypeById(deviceSelect.value);
      deviceChooser._trigger('selected', deviceType);
    });
  }

  _setup() {
    //setup <select> with list of devices
    var deviceSelect = document.querySelector('select.device-selector');
    deviceSelect.innerHTML = '';

    DeviceTypes.getAll().forEach((device) => {
      var option = document.createElement('option');
      option.innerText = device.title;
      option.setAttribute('value', device.id);

      deviceSelect.appendChild(option);
    });
  }

  _trigger(action, data) {
    this._listeners[action].forEach((callback) => {
      callback(data);
    });
  }

  onSelected(callback) {
    this._listeners['selected'].push(callback);
  }
}

export default DeviceChooser;