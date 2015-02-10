class ArtworkHelper {
  /**
   * Sets given device artwork on provided DOM node.
   * @param {HTMLElement} element
   * @param {Object} artworkSettings
   * @param {Number} scale
   */
  static setArtwork(element, artworkSettings, scale=1) {
    element.classList.add('artwork');
    element.style.backgroundImage = 'url(device-art/' + artworkSettings.file + ')';
    element.style.paddingLeft = Math.round(scale * artworkSettings.padding.left) + 'px';
    element.style.paddingRight = Math.round(scale * artworkSettings.padding.right) + 'px';
    element.style.paddingTop = Math.round(scale * artworkSettings.padding.top) + 'px';
    element.style.paddingBottom = Math.round(scale * artworkSettings.padding.bottom) + 'px';
  }
}

export default ArtworkHelper;