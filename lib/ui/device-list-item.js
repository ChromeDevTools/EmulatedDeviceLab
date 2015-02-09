var template = document.querySelector('#device-list-item-tpl');

//Taken from: https://gist.github.com/mathewbyrne/1280286
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

class DeviceListItem {

  /**
   * @param {Device} device
   */
  constructor(device) {
    this._device = device;
    this._title = device.getTitle();
    this._width = Math.floor(device.getWidth() / 3);
    this._height = Math.floor(device.getHeight() / 3);

    var newItem = document.importNode(template.content, true);

    var videoPlaceholder = newItem.querySelector('.video-placeholder');
    videoPlaceholder.style.width = this._width + 'px';
    videoPlaceholder.style.height = this._height + 'px';

    var h2 = newItem.querySelector('h2');
    h2.innerText = this._title;

    var rootElement = (newItem.children[0]);

    //add device specific class - used for device artwork
    rootElement.classList.add('device-' + slugify(this._title));
    rootElement.setAttribute('title', this._title);

    device.onStatusChange((status) => {
      if(status === 'loading') {
        rootElement.classList.add('loading');
      } else {
        rootElement.classList.remove('loading');
      }
    });

    this._rootElement = rootElement;
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