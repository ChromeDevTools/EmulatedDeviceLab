import DeviceCollection from './device-collection';
import DeviceList from './ui/device-list';
import DeviceTypes from './device-types';

var deviceSelect = document.getElementById('device-selector');
var spawnButton = document.getElementById('spawn');
var urlInput = document.getElementById('url');
var reloadButton = document.getElementById('reload');

var deviceCollection = new DeviceCollection();
var deviceList = new DeviceList(document.querySelector('.device-list'));

//setup <select> with list of devices
DeviceTypes.getAll().forEach((device) => {
  var option = document.createElement('option');
  option.innerText = device.title;
  option.setAttribute('value', device.id);

  deviceSelect.appendChild(option);
});

spawnButton.addEventListener('click', () => {
  var url = urlInput.value;
  var deviceType = DeviceTypes.getTypeById(deviceSelect.value);

  deviceCollection.add({
    url: url,
    type: deviceType.id,
    title: deviceType.title,
    width: deviceType.width,
    height: deviceType.height,
    deviceScaleFactor: deviceType.deviceScaleFactor,
    userAgent: deviceType.userAgent,
    mobile: deviceType.mobile
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

    deviceCollection.getAll().forEach((device) => {
      device.navigateTo(url);
    });
  }
});

reloadButton.addEventListener('click', () => {
  deviceCollection.getAll().forEach((device) => {
    device.reload();
  });
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
            //TODO request 2x video when on Retina
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
      var videoURL = window.URL.createObjectURL(stream);
      listItem.setVideoURL(videoURL);
    });
  }
}, () => {});