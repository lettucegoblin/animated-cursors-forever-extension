var previewCursorImg = document.getElementById('previewCursor')

// --- checkbox stuff ---
var checkboxExtension = document.getElementById('extensionEnableCheckbox')

var areWeEnabled = localStorage.getItem('extensionEnabled')
if(areWeEnabled == null) {
  areWeEnabled = 'true'
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
            debugger;
            var blobURL = URL.createObjectURL(blob);
            var blobString = btoa(String.fromCharCode.apply(null, cutebytes));
            previewCursorImg.src = blobURL

            var artificialAniCursor = {
              BlobArray: [blobString,blobString],
              cssDuration: 300
            }
            const animcur = makeanimcursor(artificialAniCursor.BlobArray, window.document.documentElement, artificialAniCursor.cssDuration)
            //let base64Cursor = btoa(String.fromCharCode.apply(null, cutebytes));
            
            saveCursor(artificialAniCursor, false)
        }
        reader.readAsArrayBuffer(this.files[0]);
        
      }else{
        aniFileImport(this.files[0], function(aniCursor){
          previewCursorImg.src = aniCursor.previewCursorUrl
          const animcur = makeanimcursor(aniCursor.BlobArray, window.document.documentElement, aniCursor.cssDuration)
          saveCursor(aniCursor)
        })
      }
      this.value = ''
    }
}, false);

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


function saveCursor(aniCursor, isAni = true){
  getCursorKeys(function(cursorKeys){
    var index = cursorKeys.keys.length
    var prefix = isAni ? 'ani' : 'cur'
    var keyname = prefix + '_' + Math.floor(Math.random() * 9999999999);
    cursorKeys.keys.push(keyname)
    localStorage["currentKeyName"] = keyname
    cacheCursor(keyname, aniCursor, isAni, function(){
      cursorKeys.currentIndex = index
      saveCursorKeys(cursorKeys, function(){
        console.log('yeet')
      })
    })
    
  })
}

function cacheCursor(keyname, aniCursor, isAni, callback){
  var tempobj = {}
  tempobj[keyname] = {
    blobArray: aniCursor.BlobArray,
    cssDuration: aniCursor.cssDuration,
    curType: isAni ? 'ani' : 'cur'
  }

  chrome.storage.local.set(tempobj, function() {
    console.log('saved cacheCursor')
    callback()
  });
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
    if(cursorKeys.keys.length == 0) {
      aniFileImport('hert.ani', function(aniCursor){
        previewCursorImg.src = aniCursor.previewCursorUrl
        const animcur = makeanimcursor(aniCursor.BlobArray, window.document.documentElement, aniCursor.cssDuration)
        saveCursor(aniCursor)
      })
      return
    }
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
    callback(data[keyName])
  });
}

function setCursor(keyName, callback){
  console.log(keyName)
  
  getCursorFromStorage(keyName, function(curData){
    localStorage['currentKeyName'] = keyName
//localStorage['myCursor']
    if(keyName.indexOf('cur') > -1){
      var blob = b64toBlob(curData.blobArray[0], 'image/bmp');
      var blobUrl = URL.createObjectURL(blob);
      previewCursorImg.src = blobUrl
      const animcur = makeanimcursor(curData.blobArray, window.document.documentElement, curData.cssDuration)

    } else{
      var blob = b64toBlob(curData.blobArray[0], 'image/bmp');
      var blobUrl = URL.createObjectURL(blob);
      previewCursorImg.src = blobUrl
      animcur = makeanimcursor(curData.blobArray, window.document.documentElement, curData.cssDuration)
    }
  })
  callback()
}
//https://stackoverflow.com/a/16245768
const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
