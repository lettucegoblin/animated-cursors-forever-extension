var previewCursorImg = document.getElementById('previewCursor')

// --- checkbox stuff ---
var checkboxExtension = document.getElementById('extensionEnableCheckbox')

var areWeEnabled = localStorage.getItem('extensionEnabled')
if(areWeEnabled == null) {
  areWeEnabled = true
  localStorage.setItem('extensionEnabled', areWeEnabled) 
  // local storage incase you want to disable specifically on one device w/ shared google sync
}
checkboxExtension.checked = areWeEnabled == 'true'
checkboxExtension.onclick = function(){
  localStorage.setItem('extensionEnabled', checkboxExtension.checked)
}
// --- checkbox stuff ---
// ---- animated cursor stuff ----
var input = document.getElementById('cursorinput');
var animcur = undefined
input.addEventListener('change', function(e) {
    if(this.files[0]){
      if(this.files[0].name.endsWith('.cur')){
        var reader = new FileReader();
        reader.onload = function() {
            var arrayBuffer = this.result
            cutebytes = new Uint8Array(arrayBuffer)
            var blob = new Blob([cutebytes.buffer], { type: 'image/bmp' });
            
            var blobURL = URL.createObjectURL(blob);
            previewCursorImg.src = blobURL
            const animcur = makeanimcursor([blobURL,blobURL], window.document.documentElement, 300)
            let base64Cursor = btoa(String.fromCharCode.apply(null, cutebytes));
            saveCursor(base64Cursor, false)
        }
        reader.readAsArrayBuffer(this.files[0]);
        
      }else{
        aniFileImport(this.files[0], function(aniCursor){
          previewCursorImg.src = aniCursor.BlobUrlArray[0]
          const animcur = makeanimcursor(aniCursor.BlobUrlArray, window.document.documentElement, aniCursor.cssDuration)
          saveCursor(aniCursor.base64Cursor)
        })
      }
      this.value = ''
    }
}, false);

function renderCurFile(){

}
/*
aniLoadFromStorage(function(aniCursor){
  previewCursorImg.src = aniCursor.BlobUrlArray[0]
  animcur = makeanimcursor(aniCursor.BlobUrlArray, window.document.documentElement, aniCursor.cssDuration)
})
*/
renderCursorWithCurrentIndex()
// ---- end animated cursor stuff ----
// --- CursorKey Helpers ----

function deleteCurrentCursor(callback){
  debugger;
  getCursorKeys(function(cursorKeys){
    var cur = cursorKeys.currentIndex
    var keyName = cursorKeys.keys[cur]
    cursorKeys.keys.splice(cur, 1)
    if(cursorKeys.currentIndex == 0){
      cursorKeys.currentIndex = cursorKeys.keys.length - 1;
    } else{
      cursorKeys.currentIndex -= 1
    }
    chrome.storage.local.remove(keyName, function(){
      //callback
      if(cursorKeys.currentIndex >= 0){
        setCursor(cursorKeys.keys[cursorKeys.currentIndex], function(){
          saveCursorKeys(cursorKeys, function(){})
        })
      }else{
        saveCursorKeys(cursorKeys, function(){})
        previewCursorImg.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"
      }
    })

  })
}


function saveCursor(base64Cursor, isAni = true){
  getCursorKeys(function(cursorKeys){
    var index = cursorKeys.keys.length
    var prefix = isAni ? 'ani' : 'cur'
    var keyname = prefix + '_' + Math.floor(Math.random() * 9999999999);
    cursorKeys.keys.push(keyname)
    saveCursorBase64(keyname, base64Cursor, function(){
      cursorKeys.currentIndex = index
      saveCursorKeys(cursorKeys, function(){
        console.log('yeet')
      })
    })
    
  })
}
function saveCursorBase64(keyname, base64Cursor, callback){
  var tempobj = {}
  tempobj[keyname] = base64Cursor
  chrome.storage.local.set(tempobj, function() {
    console.log('saveCursorBase64')
    callback()
  });
}

function saveCursorKeys(newCursorKeys, callback){
  chrome.storage.local.set({cursorKeys: newCursorKeys}, function() {
    console.log('set saveCursorKeys')
    callback(newCursorKeys)
  });
}

function getCursorKeys(callback){
  chrome.storage.local.get('cursorKeys', function(data) {
    console.log('data', data.cursorKeys)
    if(data.cursorKeys == undefined){
      var initCursorKeys = {
        keys: [],
        currentIndex: -1
      };
      saveCursorKeys(initCursorKeys, callback)
    } else {
      console.log('found')
      callback(data.cursorKeys)
    }
  });
}
function renderCursorWithCurrentIndex(offset = 0){
  getCursorKeys(function(cursorKeys){
    if(cursorKeys.keys.length == 0) return
    if(cursorKeys.currentIndex + offset < 0){
      cursorKeys.currentIndex = cursorKeys.keys.length - 1
    } else if(cursorKeys.currentIndex + offset >= cursorKeys.keys.length){
      cursorKeys.currentIndex = 0
    } else
      cursorKeys.currentIndex += offset
    console.log('cursorKeys.currentIndex',cursorKeys.currentIndex)
    
    setCursor(cursorKeys.keys[cursorKeys.currentIndex], function(){
      saveCursorKeys(cursorKeys, function(){})
    })
  })
}
// --- end CursorKey Helpers ----
// --- prev/next cursor helpers ----
var prevCursorButton = document.getElementById('prevCursor')
var nextCursorButton = document.getElementById('nextCursor')
var delCursorButton = document.getElementById('delCursor')

delCursorButton.onclick = function(){
  deleteCurrentCursor(function(){console.log('deleted')})
}

prevCursorButton.onclick = function(){
  renderCursorWithCurrentIndex(-1)
}
nextCursorButton.onclick = function(){
  renderCursorWithCurrentIndex(1)
}

function getCursorFromStorage(keyName, callback){
  chrome.storage.local.get(keyName, function(data) {
    console.log('getcursor', data)
    callback(data[keyName])
  });
}

function setCursor(keyName, callback){
  console.log(keyName)
  
  getCursorFromStorage(keyName, function(curData){
    localStorage['currentKeyName'] = keyName
//localStorage['myCursor']
    if(keyName.indexOf('cur') > -1){
      var cutebytes = new Uint8Array(atob(curData).split("").map(
          (char)=>char.charCodeAt(0)
          )
      );
      var blob = new Blob([cutebytes.buffer], { type: 'image/bmp' });
      
      var blobURL = URL.createObjectURL(blob);
      previewCursorImg.src = blobURL
      const animcur = makeanimcursor([blobURL,blobURL], window.document.documentElement, 300)

    } else{
      aniLoadFromBlobo(curData, function(aniCursor){
        previewCursorImg.src = aniCursor.BlobUrlArray[0]
        animcur = makeanimcursor(aniCursor.BlobUrlArray, window.document.documentElement, aniCursor.cssDuration)
      })
    }
  })
  callback()
}