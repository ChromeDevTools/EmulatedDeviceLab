import {slugify} from './helpers';

//TODO landscape versions of devices should be replaced with possibility to rotate devices ( issue #5 )
var deviceArray = [
  {
    title: "Apple iPhone 5",
    width: 320,
    height: 568,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53",
    touch: true,
    mobile: true,
    artwork: {
      file: 'iphone5-portrait.svg',
      padding: {
        left: 34,
        top: 120,
        right: 29,
        bottom: 115
      }
    }
  },
  {
    title: "Apple iPhone 5 (landscape)",
    width: 568,
    height: 320,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53",
    touch: true,
    mobile: true,
    artwork: {
      file: 'iphone5-landscape.svg',
      padding: {
        left: 119,
        top: 30,
        right: 122,
        bottom: 30
      }
    }
  },
  {
    title: "Google Nexus 5",
    width: 360,
    height: 640,
    deviceScaleFactor: 3,
    userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
    touch: true,
    mobile: true,
    artwork: {
      file: 'nexus5-portrait.svg',
      padding: {
        left: 22,
        top: 67,
        right: 24,
        bottom: 95
      }
    }
  },
  {
    title: "Google Nexus 5 (landscape)",
    width: 640,
    height: 360,
    deviceScaleFactor: 3,
    userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19",
    touch: true,
    mobile: true,
    artwork: {
      file: 'nexus5-landscape.svg',
      padding: {
        bottom: 22,
        left: 84,
        top: 24,
        right: 85
      }
    }
  },
  {
    title: "Apple iPad 3/4",
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53",
    touch: true,
    mobile: true,
    artwork: {
      file: 'ipad-portrait.svg',
      padding: {
        left: 63,
        top: 122,
        right: 62,
        bottom: 118
      }
    }
  },
  {
    title: "Apple iPad 3/4 (landscape)",
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53",
    touch: true,
    mobile: true,
    artwork: {
      file: 'ipad-landscape.svg',
      padding: {
        bottom: 57,
        left: 121,
        top: 66,
        right: 123
      }
    }
  },
  {
    title: "Chromebook Pixel",
    width: 2560,
    height: 1700,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (X11; CrOS x86_64 6457.31.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.38 Safari/537.36",
    touch: true,
    mobile: false,
    artwork: {
      file: 'chromebook.svg',
      padding: {
        bottom: 271,
        left: 545,
        top: 154,
        right: 516
      }
    }
  }
];

class DeviceTypes {
  constructor(rawList) {
    this._types = [];
    this._listeners = {
      change: []
    };

    rawList.map(this.addType.bind(this));
  }

  _trigger(action, data) {
    this._listeners[action].forEach((callback) => {
      callback(data);
    });
  }

  _createUniqueId(item) {
    var prefix = slugify(item.title);
    var i = 0;
    var id = prefix;

    while(this.getTypeById(id)) {
      id = prefix + '_' + i;
      i++;
    }

    return id;
  }

  getAll() {
    return this._types;
  }

  getTypeById(id) {
    return this._types.find((type) => type.id === id);
  }

  addType(type) {
    type.id = this._createUniqueId(type);
    type.touch = (type.touch === false) ? false : true;
    type.mobile = (type.mobile === false) ? false : true;
    (this._types).push(type);

    this._trigger('change');

    return type;
  }

  removeType(id) {
    var type = this.getTypeById(id);

    if(type) {
      var idx = this._types.indexOf(type);
      (this._types).splice(idx, 1);

      this._trigger('change');
    }
  }

  onChange(callback) {
    this._listeners.change.push(callback);
  }
}

export default new DeviceTypes(deviceArray);