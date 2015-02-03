class DOMHelper {

  getParentByClassName(elem, className) {
    var parent = elem.parentNode;
    if (!parent || !parent.classList) {
      return false;
    }

    return parent.classList.contains(className) ? parent : this.getParentByClassName(parent, className);
  }
}

export default new DOMHelper();