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
      if (devicePreview._device) {
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

    var orgVideo = device.item.getElement().querySelector('video');

    if(!orgVideo) {
      throw new Error("Video does not exist.");
    }

    var videoClone = orgVideo.cloneNode(true);
    videoClone.addEventListener("loadedmetadata", () => {
      videoClone.play();
    });
    videoClone.style.width = 'auto';
    videoClone.style.height = 'auto';

    DOMHelper.purgeElement(this._rootElement);
    this._rootElement.appendChild(videoClone);

    //HACK video goes "to sleep" - we have to wake it up using top arrow / bottom arrow combo
    device.window.sendKeyboardEvent('keydown', 40, false, false, false, false);
    device.window.sendKeyboardEvent('keydown', 38, false, false, false, false);
  }
}

export default DevicePreview;