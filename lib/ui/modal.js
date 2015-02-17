var template = document.getElementById('modal-tpl');

class Modal {
  constructor() {
    var modal = this;

    /* ELEMENT SETUP */
    var modalElement = document.importNode(template.content, true);
    var rootElement = (modalElement.children[0]);

    rootElement.querySelector('.close').addEventListener('click', modal.close.bind(modal));
    rootElement.querySelector('.fog-of-war').addEventListener('click', modal.close.bind(modal));

    this._rootElement = rootElement;
    this._listeners = {
      close: []
    };
  }

  _trigger(action, data) {
    this._listeners[action].forEach((callback) => {
      callback(data);
    });
  }

  setContent(element) {
    var article = this._rootElement.querySelector('article');

    article.innerHTML = '';
    article.appendChild(element);
  }

  setHeight(height) {
    var contentWrapper = this._rootElement.querySelector('.content-wrapper');
    contentWrapper.style.height = height + 'px';
    contentWrapper.style.marginTop = -(height/2) + 'px';
  }

  setWidth(width) {
    var contentWrapper = this._rootElement.querySelector('.content-wrapper');
    contentWrapper.style.width = width + 'px';
    contentWrapper.style.marginLeft = -(width/2) + 'px';
  }

  onClose(callback) {
    this._listeners['close'].push(callback);
  }

  show() {
    if(this._rootElement.parentNode !== document.body) {
      document.body.appendChild(this._rootElement);
    }

    this._rootElement.classList.add('visible');
    document.body.classList.add('modal-open');
  }

  close() {
    this._rootElement.classList.remove('visible');
    document.body.classList.remove('modal-open');
    this._trigger('close');
  }

}

export default Modal;