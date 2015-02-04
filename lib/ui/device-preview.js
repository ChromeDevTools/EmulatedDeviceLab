import DOMHelper from '../dom-helper';

class DevicePreview {
  constructor(rootElement) {
    this._rootElement = rootElement;
    this._device = null;

    var devicePreview = this;

    /*
     MOUSE EVENTS SUPPORT
     */
    function forwardMouseEvent(e) {
      if (devicePreview._device && document.activeElement === rootElement) {
        var videoPos = (e.target).getBoundingClientRect();
        (devicePreview._device.window).sendMouseEvent(e.type, e.clientX - videoPos.left, e.clientY - videoPos.top);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    rootElement.addEventListener('mousedown', forwardMouseEvent);
    rootElement.addEventListener('mouseup', forwardMouseEvent);
    //rootElement.addEventListener('mousemove', forwardMouseEvent);

    rootElement.setAttribute('tabindex', -1);
    rootElement.addEventListener('click', () => {
      rootElement.focus();
    });

    /*
     KEYBOARD EVENTS SUPPORT
     */
    function forwardKeyEvent(e) {
      if (devicePreview._device && document.activeElement === rootElement) {
        (devicePreview._device.window).sendKeyboardEvent(e.type, e.keyCode, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    document.addEventListener('keyup', forwardKeyEvent);
    document.addEventListener('keydown', forwardKeyEvent);
  }

  setDevice(device) {
    this._device = device;

    var videoURL = device.item.getVideoURL();
    if (!videoURL) {
      throw new Error("Video does not exist.");
    }

    var videoElem = document.createElement('video');
    videoElem.addEventListener("loadedmetadata", () => {
      videoElem.play();
    });
    videoElem.src = videoURL;

    DOMHelper.purgeElement(this._rootElement);
    this._rootElement.appendChild(videoElem);

    device.window.repaint();
  }
}

export default DevicePreview;