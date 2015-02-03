class DeviceListItem {
  constructor(title, width, height) {
    this._title = title;
    this._width = width;
    this._height = height;

    var wrapper = document.createElement('div');
    wrapper.classList.add('device-list-item');

    var videoPlaceholder = document.createElement('div');
    videoPlaceholder.classList.add('video-placeholder');
    videoPlaceholder.style.width = this._width + 'px';
    videoPlaceholder.style.height = this._height + 'px';

    var h2 = document.createElement('h2');
    h2.innerText = this._title;

    wrapper.appendChild(h2);
    wrapper.appendChild(videoPlaceholder);

    this._rootElement = wrapper;
  }

  addVideoStream(stream) {
    var video = document.createElement("video");
    video.src = window.URL.createObjectURL(stream);
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    video.style.width = this._width + 'px';
    video.style.height = this._height + 'px';

    var videoPlaceholder = this._rootElement.querySelector('.video-placeholder');
    this._rootElement.replaceChild(video, videoPlaceholder);
  }

  getElement() {
    return this._rootElement;
  }
}

export default DeviceListItem;