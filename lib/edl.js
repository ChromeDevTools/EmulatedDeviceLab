import DeviceWindow from './device-window';

var deviceArray = [
  {title: "Apple iPhone 4", width: 320, height: 480, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5", touch: true, mobile: true},
  {title: "Apple iPhone 5", width: 320, height: 568, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
  {title: "Google Nexus 4", width: 384, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
  {title: "Google Nexus 5", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
  {title: "Google Nexus S", width: 320, height: 533, deviceScaleFactor: 1.5, userAgent: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Nexus S Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1", touch: true, mobile: true}
];

var deviceSelect = document.getElementById('device-selector');
var urlInput = document.getElementById('url');

var windows = [];

deviceArray.forEach((device, idx) => {
  var option = document.createElement('option');
  option.innerText = device.title;
  option.setAttribute('value', idx);

  deviceSelect.appendChild(option);
});

document.getElementById('spawn').addEventListener('click', () => {
  var url = urlInput.value;
  var device = deviceArray[deviceSelect.value];

  var devWin = new DeviceWindow({
    url: url,
    device: device
  });

  devWin.create();
  windows.push(devWin);
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

function addStream(device, stream) {
  var div = document.createElement("div");

  var video = document.createElement("video");
  video.src = window.URL.createObjectURL(stream);
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.addEventListener("ended", () => {
    console.log('ended');
    document.querySelector('.streams').removeChild(div);
  });

  //video.setAttribute('width', devWin.getDevice().width);
  //video.setAttribute('height', devWin.getDevice().height);

  var h2 = document.createElement('h2');
  h2.innerText = device.title;

  div.appendChild(h2);
  div.appendChild(video);
  document.querySelector('.streams').appendChild(div);

  return div;
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
      var div = addStream(devWin.getDevice(), stream);

      devWin.onClose(() => {
        document.querySelector('.streams').removeChild(div);
      });
    });
  }
}, () => {});