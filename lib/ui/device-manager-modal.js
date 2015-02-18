import Modal from './modal';

var template = document.getElementById('device-manager-modal-tpl');

class DeviceManagerModal extends Modal {
  constructor() {
    super();

    var deviceManagerElement = document.importNode(template.content, true);
    this.setContent(deviceManagerElement);

    var rootElement = this._rootElement;

    rootElement.classList.add('device-manager-modal');
  }
}

export default DeviceManagerModal;