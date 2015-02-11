import DeviceTypes from '../device-types';
import ArtworkHelper from './artwork-helper';

const SPACE_KEY_CODE = 32;
const ENTER_KEY_CODE = 13;
const SPECIAL_KEY_CODES = [
  37,38,39,40,//arrows
  8,//backspace
  27,//esc
  9,//tab
  ENTER_KEY_CODE,//enter
  SPACE_KEY_CODE,//space
  45, 46, 33, 34, 35, 36//special keys
];

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

        //we have to prevent default key action to stop EDL page from scrolling, changing focus etc.
        //however if we block it completely, keypress event won't fire, and we need that event
        if(e.type === 'keydown' && SPECIAL_KEY_CODES.indexOf(e.keyCode) > -1) {
          //for space and enter we need keypress but we also have to prevent default action
          //so we are preventing default action but sending fake keypress
          if(e.keyCode === ENTER_KEY_CODE || e.keyCode == SPACE_KEY_CODE) {
            (devicePreview._device).sendKeyboardEvent('keypress', e.keyCode, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey);
          }

          e.preventDefault();
        }
        e.stopPropagation();
      }
    }

    rootElement.addEventListener('keyup', forwardKeyEvent);
    rootElement.addEventListener('keypress', forwardKeyEvent);
    rootElement.addEventListener('keydown', forwardKeyEvent);

    /*
    SCROLLING SUPPORT
     */
    function forwardScrollEvent(e) {
      if (devicePreview._device && document.activeElement === rootElement) {
        if (e.wheelDeltaX || e.wheelDeltaY) {
          devicePreview._device.sendScrollEvent(-e.wheelDeltaY, -e.wheelDeltaX);
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener('mousewheel', forwardScrollEvent);
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