import DeviceWindow from './device-window';

var port = chrome.extension.connect({
  name: "DevTools Panel <-> Background Page"
});

var deviceArray = [
  {title: "Apple iPhone 4", width: 320, height: 480, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5", touch: true, mobile: true},
  {title: "Apple iPhone 5", width: 320, height: 568, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
  {title: "Google Nexus 4", width: 384, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
  {title: "Google Nexus 5", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
  {title: "Google Nexus S", width: 320, height: 533, deviceScaleFactor: 1.5, userAgent: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Nexus S Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1", touch: true, mobile: true}
];

var deviceSelect = document.getElementById('device-selector');
var urlInput = document.getElementById('url');

deviceArray.forEach((device, idx) => {
  var option = document.createElement('option');
  option.innerText = device.title;
  option.setAttribute('value', idx);

  deviceSelect.appendChild(option);
});

document.getElementById('spawn').addEventListener('click', () => {
  var url = urlInput.value;
  var deviceIdx = deviceSelect.value;
  var device = deviceArray[deviceIdx];

  port.postMessage({
    command: 'new-window',
    url: url,
    device: device
  });
});

function addStream(device, tabId, stream) {
  var div = document.createElement("div");

  var video = document.createElement("video");
  video.src = stream;
  video.onloadedmetadata = function (e) {
    video.play();
  };
  //video.setAttribute('width', devWin.getDevice().width);
  //video.setAttribute('height', devWin.getDevice().height);

  video.onended = () => {
    console.log('ended');
    document.querySelector('.streams').removeChild(div);
  };

  var h2 = document.createElement('h2');
  h2.innerText = device.title;

  div.appendChild(h2);
  div.appendChild(video);
  document.querySelector('.streams').appendChild(div);
}

port.onMessage.addListener((message) => {
  if(message.command === 'add-stream') {
    addStream(message.device, message.tabId, message.stream);
  }
});