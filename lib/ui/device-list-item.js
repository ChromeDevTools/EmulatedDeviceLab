import DeviceTypes from '../device-types';

var template = document.querySelector('#device-list-item-tpl');

class DeviceListItem {

  /**
   * @param {Device} device
   */
  constructor(device) {
    this._device = device;
    this._width = device.getWidth();
    this._height = device.getHeight();

    var newItem = document.importNode(template.content, true);

    var videoPlaceholder = newItem.querySelector('.video-placeholder');
    videoPlaceholder.style.width = this._width + 'px';
    videoPlaceholder.style.height = this._height + 'px';

    var h2 = newItem.querySelector('h2');
    h2.innerText = device.getTitle();

    var rootElement = (newItem.children[0]);

    rootElement.setAttribute('title', device.getTitle());

    device.onStatusChange((status) => {
      if(status === 'loading') {
        rootElement.classList.add('loading');
      } else {
        rootElement.classList.remove('loading');
      }
    });

    this._rootElement = rootElement;

    this.setScale(0.3);
  }

  setScale(scale) {
    var device = this._device;
    var elem = this._rootElement;

    this._width = Math.round(device.getWidth() * scale);
    this._height = Math.round(device.getHeight() * scale);

    var video = elem.querySelector('.video-placeholder, video');
    video.style.width = this._width + 'px';
    video.style.height = this._height + 'px';

    var deviceType = DeviceTypes.getTypeById(device.getType());
    if(deviceType.artwork) {
      elem.classList.add('artwork');
      elem.style.backgroundImage = 'url(device-art/' + deviceType.artwork.file + ')';
      elem.style.paddingLeft = Math.round(scale * deviceType.artwork.padding.left) + 'px';
      elem.style.paddingRight = Math.round(scale * deviceType.artwork.padding.right) + 'px';
      elem.style.paddingTop = Math.round(scale * deviceType.artwork.padding.top) + 'px';
      elem.style.paddingBottom = Math.round(scale * deviceType.artwork.padding.bottom) + 'px';
    }
  }

  select() {
    (this._rootElement).classList.add('selected');
  }

  deselect() {
    (this._rootElement).classList.remove('selected');
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