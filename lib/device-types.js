import {slugify} from './helpers';

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
        bottom: 112
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
        left: 23,
        top: 68,
        right: 22,
        bottom: 94
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
        top: 121,
        right: 64,
        bottom: 112
      }
    }
  }
];

class DeviceTypes {
  constructor(rawList) {
    this._types = [];

    rawList.map((item) => {
      item.id = slugify(item.title);
      this._types.push(item);

      //this generates landscape versions of all devices
      //TODO should be replaced with possibility to rotate devices ( issue #5 )
      item = JSON.parse(JSON.stringify(item));
      var tmp = item.width;
      item.width = item.height;
      item.height = tmp;
      item.title = item.title + ' (landscape)';
      item.id = slugify(item.title);

      this._types.push(item);
    });
  }


  getAll() {
    return this._types;
  }

  getTypeById(id) {
    return this._types.find((type) => type.id === id);
  }
}

export default new DeviceTypes(deviceArray);