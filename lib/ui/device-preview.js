import DeviceTypes from '../device-types';
import ArtworkHelper from './artwork-helper';

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
        (devicePreview._device).sendMouseEvent(e.type, e.clientX - videoPos.left, e.clientY - videoPos.top);

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
        (devicePreview._device).sendKeyboardEvent(e.type, e.keyCode, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    document.addEventListener('keyup', forwardKeyEvent);
    document.addEventListener('keydown', forwardKeyEvent);
  }

  /**
   * @param {Device} device
   */
  setDevice(device) {
    this._device = device;

    var videoPlaceholder = this._rootElement.querySelector('.video-placeholder');
    videoPlaceholder.style.width = device.getWidth() + 'px';
    videoPlaceholder.style.height = device.getHeight() + 'px';

    var deviceType = DeviceTypes.getTypeById(device.getType());
    if(deviceType.artwork) {
      ArtworkHelper.setArtwork(this._rootElement, deviceType.artwork);
    }
  }

  /**
   * @param {String} videoURL
   */
  setVideoURL(videoURL) {
    var oldVideo = this._rootElement.querySelector('video');
    if(oldVideo) {
      this._rootElement.removeChild(oldVideo);
    }

    this._rootElement.classList.remove('streaming');

    if (!videoURL) {
      throw new Error("Video does not exist.");
    }

    this._rootElement.classList.add('streaming');

    var videoElem = document.createElement('video');
    videoElem.addEventListener("loadedmetadata", () => {
      videoElem.play();
    });
    videoElem.src = videoURL;
    (this._rootElement).appendChild(videoElem);

    this._device.repaint();
  }
}

export default DevicePreview;