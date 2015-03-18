import DeviceCollection from './device-collection';
import DeviceList from './ui/device-list';
import URLBar from './ui/url-bar';
import DeviceChooser from './ui/device-chooser';
import ZoomWidget from './ui/zoom-widget';
import WelcomeModal from './ui/welcome-modal';
import DeviceManagerModal from './ui/device-manager-modal';
import DropDownMenu from './ui/dropdown-menu';
import DeviceTypes from './device-types';
import Settings from './settings';
import GoogleAnalytics from './google-analytics';

GoogleAnalytics.init('UA-60865823-1');

var deviceCollection = new DeviceCollection();
var deviceList = new DeviceList(document.querySelector('.device-list'));
var urlBar = new URLBar(document.getElementById('navigation'));
var deviceChooser = new DeviceChooser(document.getElementById('new-device'));
var zoomWidget = new ZoomWidget(document.getElementById('zoom'));
var dropDownMenu = new DropDownMenu(document.getElementById('config'));
var deviceManagerModal = null;

Settings.setDefaults({
  'welcome-message': false,
  'show-device-artwork': true,
  'zoom-level': 0.3,
  'custom-device-types': []
});

DeviceTypes.onChange(() => {
  var customTypes = DeviceTypes.getAll().filter((item) => !item.buildIn);
  Settings.setValue('custom-device-types', customTypes);
});

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
  GoogleAnalytics.trackEvent({
    category: 'EDL tab',
    action: 'Spawn device',
    label: deviceType.title
  });

  deviceCollection.add({
    url: urlBar.getURL(),
    type: deviceType.id,
    title: deviceType.title,
    width: deviceType.width,
    height: deviceType.height,
    deviceScaleFactor: deviceType.deviceScaleFactor,
    userAgent: deviceType.userAgent,
    mobile: deviceType.mobile,
    touch: deviceType.touch
  });
});

deviceCollection.onDeviceAdded((device) => {
  device.onURLChange((url) => {
    urlBar.setURL(url);
  });

  deviceList.addDevice(device);
});

zoomWidget.onChange((value) => {
  deviceList.setScale(value);
  Settings.setValue('zoom-level', value);
});

Settings.ready()
  .then(() => {
    if (!Settings.getValue('welcome-message')) {
      let welcome = new WelcomeModal();
      welcome.show();
      welcome.onClose(() => {
        Settings.setValue('welcome-message', true);
      });
    }

    if (!Settings.getValue('show-device-artwork')) {
      deviceList.hideArtwork();
    }

    if(Settings.getValue('custom-device-types')) {
      Settings.getValue('custom-device-types').forEach((type) => {
        DeviceTypes.addType(type);
      });
    }

    zoomWidget.setValue(Settings.getValue('zoom-level'));

    deviceList.setScale(zoomWidget.getValue());

    initOptions();
  });

//Send status to Google Analytics every 1min
setInterval(() => {
  GoogleAnalytics.trackEvent({
    category: 'EDL tab',
    action: 'Status',
    label: 'Number of devices',
    value: deviceList.getAll().length
  });

  GoogleAnalytics.trackEvent({
    category: 'EDL tab',
    action: 'Status',
    label: 'Zoom level',
    value: (zoomWidget.getValue() * 100)
  });
}, 60000);

function initOptions() {
  dropDownMenu.addItem('Device manager', () => {
    if (!deviceManagerModal) {
      deviceManagerModal = new DeviceManagerModal();
    }

    deviceManagerModal.show();
  });

  dropDownMenu.addItem('Device artwork', (state) => {
    if (state) {
      deviceList.showArtwork();
    } else {
      deviceList.hideArtwork();
    }

    GoogleAnalytics.trackEvent({
      category: 'EDL tab',
      action: 'Toggle artwork',
      value: ~~state
    });

    Settings.setValue('show-device-artwork', state);
  }, Settings.getValue('show-device-artwork'));

  dropDownMenu.addItem('Instructions', () => {
    let welcome = new WelcomeModal();
    welcome.show();
  });

  dropDownMenu.addItem('Feedback', () => {
    window.open('https://github.com/ChromeDevTools/EmulatedDeviceLab/issues/21', '_blank');
  });
}

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

chrome.contextMenus.removeAll(() => {
});

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
}, () => {
});

window.onunload = () => {
  chrome.contextMenus.removeAll(() => {
  });
};
