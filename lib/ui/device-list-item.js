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
  constructor(title, width, height) {
    this._title = title;
    this._width = width;
    this._height = height;

    var newItem = document.importNode(template.content, true);

    var videoPlaceholder = newItem.querySelector('.video-placeholder');
    videoPlaceholder.style.width = this._width + 'px';
    videoPlaceholder.style.height = this._height + 'px';

    var h2 = newItem.querySelector('h2');
    h2.innerText = this._title;

    this._rootElement = (newItem.children[0]);

    //add device specific class - used for device artwork
    this._rootElement.classList.add('device-' + slugify(title));
    this._rootElement.setAttribute('title', title);
  }

  setVideoURL(url) {
    var video = document.createElement("video");
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    video.style.width = this._width + 'px';
    video.style.height = this._height + 'px';

    var videoPlaceholder = this._rootElement.querySelector('.video-placeholder');
    this._rootElement.replaceChild(video, videoPlaceholder);
  }

  getVideoURL() {
    var video = (this._rootElement).querySelector('video');

    return video ? video.src : null;
  }

  getElement() {
    return this._rootElement;
  }
}

export default DeviceListItem;