class DOMHelper {

  getParentByClassName(elem, className) {
    var parent = elem.parentNode;
    if (!parent || !parent.classList) {
      return false;
    }

    return parent.classList.contains(className) ? parent : this.getParentByClassName(parent, className);
  }

  purgeElement(elem) {
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.lastChild);
    }
  }
}

export default new DOMHelper();