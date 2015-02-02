import DeviceWindow from './device-window';

var windows = [];
var ports = [];

function spawnNewWindow(url, device) {
  var devWin = new DeviceWindow({
    url: url,
    device: device
  });

  devWin.create();
  windows.push(devWin);
}

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
    var devWin = windows.find(function (win) {
      return (win.getTab().id === tab.id);
    });

    if (!devWin) {
      console.error('Unknown window wants to be streamed.');
      return;
    }

    captureCurrentTab(devWin.getDevice().width, devWin.getDevice().height).then((stream) => {
      ports.forEach((port) => {
        port.postMessage({
          command: 'add-stream',
          device: devWin,
          tabId: devWin.getTab().id,
          stream: window.URL.createObjectURL(stream)
        });
      });
    });

    devWin.onClose(() => {
      ports.forEach((port) => {
        port.postMessage({
          command: 'remove-stream',
          tabId: devWin.getTab().id
        });
      });
    });
  }
}, () => {});

chrome.extension.onConnect.addListener((port) => {

  ports.push(port);

  port.onMessage.addListener((message) => {
    if(message.command === 'new-window') {
      spawnNewWindow(message.url, message.device);
    }
  });

});