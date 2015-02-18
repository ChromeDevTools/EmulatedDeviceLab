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

var template = document.querySelector('#device-list-item-tpl');

class DeviceListItem {

  /**
   * @param {Device} device
   */
  constructor(device) {
    var deviceListItem = this;

    this._device = device;
    this._width = device.getWidth();
    this._height = device.getHeight();
    this._scale = 1;
    this._showArtwork = true;

    /* ELEMENT SETUP */
    var newItem = document.importNode(template.content, true);

    var videoPlaceholder = newItem.querySelector('.video-placeholder');
    videoPlaceholder.style.width = this._width + 'px';
    videoPlaceholder.style.height = this._height + 'px';

    var h2 = newItem.querySelector('h2');
    h2.innerText = device.getTitle();

    var rootElement = (newItem.children[0]);

    rootElement.setAttribute('title', device.getTitle());

    /* PAGE LOADING INDICATOR */
    device.onStatusChange((status) => {
      if(status === 'loading') {
        rootElement.classList.add('loading');
      } else {
        rootElement.classList.remove('loading');
      }
    });

    //make element selectable
    rootElement.setAttribute('tabindex', -1);

    /* FORWARDING: MOUSE EVENTS */
    function forwardMouseEvent(e) {
      if (document.activeElement === rootElement && e.target.tagName === 'VIDEO') {
        var videoPos = (e.target).getBoundingClientRect();
        var x = Math.round( (e.clientX - videoPos.left) / deviceListItem._scale );
        var y = Math.round( (e.clientY - videoPos.top) / deviceListItem._scale );

        device.sendMouseEvent(e.type, x, y);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    rootElement.addEventListener('mousedown', forwardMouseEvent);
    rootElement.addEventListener('mouseup', forwardMouseEvent);
    //rootElement.addEventListener('mousemove', forwardMouseEvent);

    /* FORWARDING: KEYBOARD EVENTS */
    function forwardKeyEvent(e) {
      if (document.activeElement === rootElement) {
        device.sendKeyboardEvent(e.type, e.keyCode, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey);

        //we have to prevent default key action to stop EDL page from scrolling, changing focus etc.
        //however if we block it completely, keypress event won't fire, and we need that event
        if(e.type === 'keydown' && SPECIAL_KEY_CODES.indexOf(e.keyCode) > -1) {
          //for space and enter we need keypress but we also have to prevent default action
          //so we are preventing default action but sending fake keypress
          if(e.keyCode === ENTER_KEY_CODE || e.keyCode == SPACE_KEY_CODE) {
            device.sendKeyboardEvent('keypress', e.keyCode, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey);
          }

          e.preventDefault();
        }
        e.stopPropagation();
      }
    }

    rootElement.addEventListener('keyup', forwardKeyEvent);
    rootElement.addEventListener('keypress', forwardKeyEvent);
    rootElement.addEventListener('keydown', forwardKeyEvent);

    /* FORWARDING: SCROLL EVENTS */
    function forwardScrollEvent(e) {
      if (document.activeElement === rootElement) {
        if (e.wheelDeltaX || e.wheelDeltaY) {
          device.sendScrollEvent(-e.wheelDeltaY, -e.wheelDeltaX);
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener('mousewheel', forwardScrollEvent);

    this._rootElement = rootElement;
    this.setScale(1);
  }

  setScale(scale) {
    scale = parseFloat(scale) || 1;

    var device = this._device;
    var elem = this._rootElement;

    this._width = Math.round(device.getWidth() * scale);
    this._height = Math.round(device.getHeight() * scale);

    var video = elem.querySelector('.video-placeholder, video');
    video.style.width = this._width + 'px';
    video.style.height = this._height + 'px';

    this._scale = scale;

    this._updateArtwork();
  }

  select() {
    (this._rootElement).focus();
  }

  deselect() {
    (this._rootElement).blur();
  }

  showArtwork() {
    this._showArtwork = true;
    this._updateArtwork();
  }

  hideArtwork() {
    this._showArtwork = false;
    ArtworkHelper.removeArtwork(this._rootElement);
  }

  _updateArtwork() {
    if(this._showArtwork) {
      var deviceType = DeviceTypes.getTypeById(this._device.getType());
      if(deviceType.artwork) {
        ArtworkHelper.setArtwork(this._rootElement, deviceType.artwork, this._scale);
      }
    }
  }

  setVideoURL(url) {
    var video = document.createElement("video");
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    video.style.width = this._width + 'px';
    video.style.height = this._height + 'px';

    var videoPlaceholder = this._rootElement.querySelector('.video-placeholder, video');
    this._rootElement.replaceChild(video, videoPlaceholder);
  }

  getVideoURL() {
    var video = (this._rootElement).querySelector('video');

    return video ? video.src : null;
  }

  getElement() {
    return this._rootElement;
  }

  getDevice() {
    return this._device;
  }
}

export default DeviceListItem;