import Modal from './modal';
import DeviceTypes from '../device-types';
import {closestNode} from '../helpers';

var template = document.getElementById('device-manager-modal-tpl');
var itemTemplate = document.getElementById('device-manager-modal-device-tpl');

class DeviceManagerModal extends Modal {
  constructor() {
    super();

    var deviceManagerElement = document.importNode(template.content, true);
    this.setContent(deviceManagerElement);

    var rootElement = this._rootElement;

    rootElement.classList.add('device-manager-modal');

    this.setWidth(550);
    this.setHeight(455);

    var deviceMgrModal = this;

    DeviceTypes.getAll().forEach((type) => {
      if(!type.buildIn) {
        deviceMgrModal.addItem(type.id, type.title);
      }
    });

    var form = rootElement.querySelector('form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      var newType = deviceMgrModal._getFormData();
      form.reset();

      newType = DeviceTypes.addType(newType);

      deviceMgrModal.addItem(newType.id, newType.title);

      return false;
    });

    rootElement.addEventListener('click', (e) => {
      if (e.target.matches('button.delete, button.delete *')) {
        var item = closestNode(e.target, 'li');
        var id = item.dataset.id;

        var player = item.animate([{
          height: item.clientHeight
        }, {
          height: 0
        }], 100);

        player.onfinish = () => {
          item.remove();
        };

        DeviceTypes.removeType(id);
      }
    });
  }

  _getFormData() {
    var form = (this._rootElement).querySelector('form');

    return {
      title: form.querySelector('#device-name').value,
      width: parseInt(form.querySelector('#screen-width').value, 10),
      height: parseInt(form.querySelector('#screen-height').value, 10),
      deviceScaleFactor: parseInt(form.querySelector('#device-scale-factor').value, 10),
      userAgent: form.querySelector('#user-agent').value,
      mobile: form.querySelector('#is-mobile').checked,
      touch: true
    };
  }

  addItem(id, name) {
    var li = document.createElement('li');
    li.dataset.id = id;

    var newItem = document.importNode(itemTemplate.content, true);
    newItem.querySelector('span').innerText = name;
    li.appendChild(newItem);

    var ul = (this._rootElement).querySelector('.custom-devices');

    ul.insertBefore(li, ul.firstChild);

    li.animate([{
      height: 0
    }, {
      height: li.clientHeight
    }], 100);
  }
}

export default DeviceManagerModal;