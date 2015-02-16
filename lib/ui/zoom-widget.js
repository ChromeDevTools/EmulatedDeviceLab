class ZoomWidget {
  constructor(rootElement) {
    var zoomWidget = this;

    this._rootElement = rootElement;
    this._listeners = {
      change: []
    };

    var zoomInputElem = (this._rootElement).querySelector('input.zoom');
    this._min = parseFloat(zoomInputElem.getAttribute('min')) || 0;
    this._max = parseFloat(zoomInputElem.getAttribute('max')) || 1;
    this._step = parseFloat(zoomInputElem.getAttribute('step')) || 0.1;
    this._value = parseFloat(zoomInputElem.value) || this._min;

    (this._rootElement).querySelector('.zoom-value').innerText = (this._value).toFixed(1) + 'x';

    (this._rootElement).querySelector('.zoom-in').addEventListener('click', () => {
      zoomWidget.setValue(zoomWidget._value + zoomWidget._step);
    });
    (this._rootElement).querySelector('.zoom-out').addEventListener('click', () => {
      zoomWidget.setValue(zoomWidget._value - zoomWidget._step);
    });
    zoomInputElem.addEventListener('input', () => {
      zoomWidget.setValue(zoomInputElem.value);
    });
  }

  _trigger(action, data) {
    this._listeners[action].forEach((callback) => {
      callback(data);
    });
  }

  onChange(callback) {
    this._listeners['change'].push(callback);
  }

  setValue(scale) {
    scale = parseFloat(scale) || this._min;
    scale = (scale < this._min) ? this._min : scale;
    scale = (scale > this._max) ? this._max : scale;
    this._value = scale;

    (this._rootElement).querySelector('input.zoom').value = scale;
    (this._rootElement).querySelector('.zoom-value').innerText = scale.toFixed(1) + 'x';

    this._trigger('change', scale);
  }

  getValue() {
    return this._value;
  }

}

export default ZoomWidget;