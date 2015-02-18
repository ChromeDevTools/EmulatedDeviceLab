import DeviceCollection from './device-collection';
import DeviceList from './ui/device-list';
import URLBar from './ui/url-bar';
import DeviceChooser from './ui/device-chooser';
import ZoomWidget from './ui/zoom-widget';
import WelcomeModal from './ui/welcome-modal';
import DropDownMenu from './ui/dropdown-menu';

var deviceCollection = new DeviceCollection();
var deviceList = new DeviceList(document.querySelector('.device-list'));
var urlBar = new URLBar(document.getElementById('navigation'));
var deviceChooser = new DeviceChooser(document.getElementById('new-device'));
var zoomWidget = new ZoomWidget(document.getElementById('zoom'));
var dropDownMenu = new DropDownMenu(document.getElementById('config'));

if(!localStorage.welcomeMessage) {
  let welcome = new WelcomeModal();
  welcome.show();
  welcome.onClose(() => {
    localStorage.welcomeMessage = true;
  });
}

urlBar.onReload(() => {
  deviceCollection.getAll().forEach((device) => {
    device.reload();
  });
});

urlBar.onNavigate((url) => {
  deviceCollection.getAll().forEach((device) => {
    device.navigateTo(url);
  });
});

deviceChooser.onSelected((deviceType) => {
  deviceCollection.add({
    url: urlBar.getURL(),
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
    urlBar.setURL(url);
  });

  deviceList.addDevice(device);
});

deviceList.setScale(zoomWidget.getValue());
zoomWidget.onChange((value) => {
  deviceList.setScale(value);
});

dropDownMenu.addItem('Device artwork', (state) => {
  deviceList.getAll().forEach((item) => {
    if(state) {
      item.showArtwork();
    } else {
      item.hideArtwork();
    }
  });
}, true);

dropDownMenu.addItem('Instructions', () => {
  let welcome = new WelcomeModal();
  welcome.show();
});

/*
SUPPORT FOR STREAMING TABS
 */

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

window.onunload = () => {
  chrome.contextMenus.removeAll(() => {});
};