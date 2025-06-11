importScripts('aniImport.js');

chrome.runtime.onConnect.addListener(function(port) {
  chrome.storage.local.get(['extensionEnabled', 'currentKeyName'], function(res) {
    var areWeEnabled = res.extensionEnabled;

    if (areWeEnabled == null) {
      aniFileImport('hert.ani', function(aniCursor) {
        port.postMessage({
          curData: {
            curType: 'ani',
            blobArray: aniCursor.BlobArray,
            cssDuration: aniCursor.cssDuration
          }
        });
      });
      return;
    }

    if (areWeEnabled === 'true') {
      var keyName = res.currentKeyName;
      if (keyName === undefined) return;

      chrome.storage.local.get(keyName, function(data) {
        port.postMessage({
          curData: data[keyName]
        });
      });
    }
  });
});
