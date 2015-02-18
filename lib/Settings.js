class Settings {

  constructor() {
    var settingsObj = this;
    this._settings = {};

    this._ready = new Promise((resolve, reject) => {
      chrome.storage.local.get('settings', (data) => {
        settingsObj._settings = (data && data.settings) || {};
        resolve();
      });
    });
  }

  ready() {
    return this._ready;
  }

  getValue(name) {
    if(this._settings.hasOwnProperty(name)) {
      return this._settings[name];
    }
  }

  setValue(name, value) {
    this._settings[name] = value;

    chrome.storage.local.set({'settings': this._settings});
  }
}

export default new Settings();