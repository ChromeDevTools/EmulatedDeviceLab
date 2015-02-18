class Settings {

  constructor() {
    var settingsObj = this;
    this._settings = {};
    this._defaults = {};

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

  setDefaults(defaults) {
    this._defaults = defaults;
  }

  getValue(name) {
    if(this._settings.hasOwnProperty(name)) {
      return this._settings[name];
    } else if(this._defaults.hasOwnProperty(name)) {
      return this._defaults[name];
    }
  }

  setValue(name, value) {
    this._settings[name] = value;

    chrome.storage.local.set({'settings': this._settings});
  }
}

export default new Settings();