class URLBar {
  constructor(rootElement) {
    var urlBar = this;

    this._rootElement = rootElement;
    this._listeners = {
      navigate: [],
      reload: []
    };

    var urlInput = rootElement.querySelector('input.url');
    var reloadButton = rootElement.querySelector('button.reload');

    urlInput.addEventListener('keyup', (e) => {
      if(e.which === 13) {
        var url = urlBar._fixURL(urlInput.value);
        urlInput.value = url;

        urlBar._trigger('navigate', url);
      }
    });

    reloadButton.addEventListener('click', this._trigger.bind(this, 'reload'));
  }

  _fixURL(url) {
    if(!url.match(/^https?:\/\//)) {
      url = 'http://' + url;
    }

    return url;
  }

  _trigger(action, data) {
    this._listeners[action].forEach((callback) => {
      callback(data);
    });
  }

  onNavigate(callback) {
    this._listeners['navigate'].push(callback);
  }

  onReload(callback) {
    this._listeners['reload'].push(callback);
  }

  getURL() {
    return this._rootElement.querySelector('input.url').value;
  }

  setURL(url) {
    url = this._fixURL(url);

    this._rootElement.querySelector('input.url').value = url;
  }
}

export default URLBar;