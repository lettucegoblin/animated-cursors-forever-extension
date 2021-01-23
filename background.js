chrome.runtime.onConnect.addListener(function(port){
    var areWeEnabled = localStorage.getItem('extensionEnabled')
    if(areWeEnabled == "true" ){
        var keyName = localStorage['currentKeyName']
        console.log('currentKeyName', keyName)
        if(keyName == undefined) return
        

        chrome.storage.local.get(keyName, function(data) {
          port.postMessage({
              curType: keyName.indexOf('cur') > -1 ? 'cur' : 'ani',
              curData: data[keyName]
            });
        });
        
    }
  });