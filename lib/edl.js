import DeviceCollection from './device-collection';
import DeviceList from './ui/device-list';
import DevicePreview from './ui/device-preview';

var deviceArray = [
  {title: "Apple iPhone 5", width: 320, height: 568, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
  {title: "Apple iPhone 5 (landscape)", width: 568, height: 320, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},

  {title: "Google Nexus 5", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
  {title: "Google Nexus 5 (landscape)", width: 640, height: 360, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},

  {title: "Apple iPad 3/4", width: 768, height: 1024, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
  {title: "Apple iPad 3/4 (landscape)", width: 1024, height: 768, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
];

var deviceSelect = document.getElementById('device-selector');
var spawnButton = document.getElementById('spawn');
var urlInput = document.getElementById('url');
var reloadButton = document.getElementById('reload');
var closePreviewButton = document.getElementById('close-preview');

var deviceCollection = new DeviceCollection();
var deviceList = new DeviceList(document.querySelector('.device-list'));
var devicePreview = new DevicePreview(document.querySelector('.device-preview'));

//setup <select> with list of devices
deviceArray.forEach((device, idx) => {
  var option = document.createElement('option');
  option.innerText = device.title;
  option.setAttribute('value', idx);

  deviceSelect.appendChild(option);
});

spawnButton.addEventListener('click', () => {
  var url = urlInput.value;
  var deviceSettings = deviceArray[deviceSelect.value];

  deviceCollection.add({
    url: url,
    title: deviceSettings.title,
    width: deviceSettings.width,
    height: deviceSettings.height,
    deviceScaleFactor: deviceSettings.deviceScaleFactor,
    userAgent: deviceSettings.userAgent,
    mobile: deviceSettings.mobile
  });
});

deviceCollection.onDeviceAdded((device) => {
  device.onURLChange((url) => {
    urlInput.value = url;
  });

  deviceList.addDevice(device);
});

urlInput.addEventListener('keyup', (e) => {
  if(e.which === 13) {
    var url = urlInput.value;

    deviceList.getAll().forEach((item) => {
      (item.getDevice()).navigateTo(url);
    });
  }
});

reloadButton.addEventListener('click', () => {
  deviceList.getAll().forEach((item) => {
    (item.getDevice()).reload();
  });
});

closePreviewButton.addEventListener('click', () => {
  deviceList.deselect();
});

deviceList.onSelected((item) => {
  if(item) {
    document.querySelector('article').classList.add('device-selected');
    devicePreview.setDevice(item.getDevice());
    devicePreview.setVideoURL(item.getVideoURL());
  } else {
    document.querySelector('article').classList.remove('device-selected');
  }
});

function captureCurrentTab(width, height) {
  return new Promise((resolve, reject) => {
    chrome.tabs.getSelected(null, (tab) => {
      var mediaStreamConstraint = {
        audio: false,
        video: true,
        videoConstraints: {
          mandatory: {
            chromeMediaSource: 'tab',
            minWidth: width,
            minHeight: height,
            maxWidth: width,
            maxHeight: height
          }
        }
      };

      chrome.tabCapture.capture(mediaStreamConstraint, (stream) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(stream);
      });
    });
  });
}

chrome.contextMenus.removeAll(() => {});

chrome.contextMenus.create({
  title: 'Stream to EDL',
  contexts: ["all"],
  onclick: (info, tab) => {
    //find device associated with clicked tab
    var listItem = deviceList.getItemByTabId(tab.id);

    if (!listItem) {
      console.error('Unknown window wants to be streamed.', tab.id);
      return;
    }

    captureCurrentTab(listItem.getDevice().getWidth(), listItem.getDevice().getHeight()).then((stream) => {
      var videoUrl = window.URL.createObjectURL(stream);
      listItem.setVideoURL(videoUrl);
    });
  }
}, () => {});