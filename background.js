chrome.runtime.onConnect.addListener(function(port){
    var areWeEnabled = localStorage.getItem('extensionEnabled')

    if(areWeEnabled == null){ 

      aniFileImport('hert.ani', function(aniCursor){        
        port.postMessage({
          curData:{
            curType: 'ani',
            blobArray: aniCursor.BlobArray,
            cssDuration: aniCursor.cssDuration
          } 
        });
      })
      
    }

    if(areWeEnabled == "true" ){
        var keyName = localStorage['currentKeyName']
        console.log('currentKeyName', keyName)
        if(keyName == undefined) return
        

        chrome.storage.local.get(keyName, function(data) {
          port.postMessage({
              curData: data[keyName]
            });
        });
        
    }
  });