//Taken from: https://gist.github.com/mathewbyrne/1280286
export function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Returns index of provided node in its parent.
 * @param {HTMLElement} child
 * @returns {Number}
 */
export function childNodeIndex(child) {
  if(!child || !child.parentNode) {
    return null;
  }

  return Array.prototype.indexOf.call(child.parentNode.children, child);
}