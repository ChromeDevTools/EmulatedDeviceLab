/**
 * Collection of Tabs ( https://developer.chrome.com/extensions/tabs#type-Tab ) that auto-removes tabs when they are closed.
 */
class TabCollection {
  constructor() {
    this._tabs = [];
    this._listeners = {
      'onchange': []
    };

    chrome.tabs.onRemoved.addListener(this.remove.bind(this));
  }

  add(tabId, tabData) {
    var tab = this.find(tabId);

    if(!tab) {
      tab = {
        id: tabId
      };

      this._tabs.push(tab);
      this._trigger('onchange', this._tabs);
    }

    tab.data = tabData;

    return true;
  }

  remove(tabId) {
    var tab = this.find(tabId);

    if(!tab) {
      return false;
    }

    var index = (this._tabs).indexOf(tab);

    if (index < 0) {
      return false;
    }

    (this._tabs).splice(index, 1);
    this._trigger('onchange', this._tabs);

    return true;
  }

  find(tabId) {
    return (this._tabs).find((tab) => (tab.id === tabId));
  }

  getAll() {
    return this._tabs;
  }

  onChange(listener) {
    this._listeners['onchange'].push(listener);
  }

  _trigger(action, data) {
    (this._listeners[action]).forEach((callback) => {
      callback(data);
    });
  }
}

export default TabCollection;