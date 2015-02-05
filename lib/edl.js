import WindowController from './window-controller';
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

var deviceList = new DeviceList(document.querySelector('.device-list'));
var devicePreview = new DevicePreview(document.querySelector('.device-preview'));

deviceArray.forEach((device, idx) => {
  var option = document.createElement('option');
  option.innerText = device.title;
  option.setAttribute('value', idx);

  deviceSelect.appendChild(option);
});

spawnButton.addEventListener('click', () => {
  var url = urlInput.value;
  var device = deviceArray[deviceSelect.value];

  var deviceWindow = new WindowController({
    url: url,
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.deviceScaleFactor,
    userAgent: device.userAgent,
    mobile: device.mobile
  });

  deviceWindow.create();

  deviceWindow.onURLChange((url) => {
    urlInput.value = url;
  });

  deviceList.addDevice(device.title, deviceWindow);
});

urlInput.addEventListener('keyup', (e) => {
  if(e.which === 13) {
    var url = urlInput.value;

    deviceList.getAll().forEach((device) => {
      (device.window).navigateTo(url);
    });
  }
});

reloadButton.addEventListener('click', () => {
  deviceList.getAll().forEach((device) => {
    (device.window).reload();
  });
});

closePreviewButton.addEventListener('click', () => {
  document.querySelector('article').classList.remove('device-selected');
  deviceList.deselect();
});

deviceList.onSelected((device) => {
  document.querySelector('article').classList.add('device-selected');
  devicePreview.setDevice(device);
});

//close all device windows on exit
//TODO it may be possible to reattach to existing windows after reload
window.onunload = () => {
  deviceList.getAll().forEach((device) => {
    (device.window).close();
  });
};

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
    //find DeviceWindow associated with clicked tab
    var device = deviceList.getDeviceByTabId(tab.id);

    if (!device) {
      console.error('Unknown window wants to be streamed.');
      return;
    }

    captureCurrentTab((device.window).getWidth(), (device.window).getHeight()).then((stream) => {
      var videoUrl = window.URL.createObjectURL(stream);
      (device.item).setVideoURL(videoUrl);
    });
  }
}, () => {});