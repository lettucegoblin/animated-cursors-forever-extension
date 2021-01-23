(function () {
var byteArr = []

const bytes = {
    BYTE: 1,
    WORD: 2,
    DWORD: 4,
    LONG: 8,
    AS_NUM: true,
    AS_STRING: false
}
//https://stackoverflow.com/questions/13932291/css-cursor-using-data-uri
//https://stackoverflow.com/questions/48304752/converting-a-png-jpg-to-ico-in-javascript
//https://stackoverflow.com/questions/38004917/how-to-render-a-blob-on-a-canvas-element
/*
var input = document.getElementById('input');
var canvas = document.getElementById('test')
var ctx = canvas.getContext("2d");
var output = document.getElementById('output')
var outputRaw = document.getElementById('outputRaw')
var picsDiv = document.getElementById('pics')
*/
function picToBlob() {
    canvas.renderImage(this.files[0]);
}

let gcd = function(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (a != b) {
    if (a > b) a -= b
    else b -= a
  }
  return a
}

let gcdArr = function(arr) {
  let gcdres = gcd(arr[0], arr[1])
  for (let i=3; i<arr.length; i++) {
    gcdres = gcd(gcdres, arr[i])
  }
  return gcdres
}

function rateArrToCssDurationAndModifyFrameCount(rateArr, frames){
    var oneFrameTime = gcdArr(rateArr)
    var newFrameArr = []
    //loop over rateArr, divide by frame time and duplicate frame at that index that many times
    for(var i = 0; i < rateArr.length; i++){
        var AmtOfDuplicateFramesToMake = rateArr[i] / oneFrameTime;
        for(var x = 0; x < AmtOfDuplicateFramesToMake; x++){
            newFrameArr.push(frames[i])
        }
    }
    var rateArrSum = rateArr.reduce((a, b) => a + b, 0)
    var conRate = 1/60 * 1000;
    var duration = rateArrSum * conRate
    //var duration = iDispRateToCssDuration(oneFrameTime, frames.length)
    return {
        frames : newFrameArr, 
        duration: duration
    }
}

function iDispRateToCssDuration(iDispRate, totalFrames){
    var conRate = 1/60 * 1000;
    var duration = iDispRate * conRate * totalFrames
    return duration
}

//https://www.gdgsoft.com/anituner/help/aniformat.htm
//http://www.toolsandtips.de/Tutorial/Aufbau-Animierte-Cursor.htm
//https://gist.github.com/grassmunk/93d46d6b665d210215cde9331e875d17

/*
HTMLCanvasElement.prototype.renderImage = function(blob, xOffset) {
    console.log(URL.createObjectURL(blob));
    var ctx = this.getContext('2d');
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0)
    }
    img.src = URL.createObjectURL(blob);
};
*/
//https://stackoverflow.com/questions/32556664/getting-byte-array-through-input-type-file


function clearState(){
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.clear();
    document.getElementById('pics').innerHTML = ''
}

function getfile(fileUrl, callback){
    var req = new XMLHttpRequest();
    req.open("GET", fileUrl, true);
    req.responseType = "arraybuffer";

    req.onload = function() {
        var arrayBuffer = this.response;
        
        byteArr = new Uint8Array(arrayBuffer);

        renderOutputBetter(callback)
    };

    req.send();
}

function toBits(fileObject, callback){
    var reader = new FileReader();
    reader.onload = function() {
        var arrayBuffer = this.result
        array = new Uint8Array(arrayBuffer)

        byteArr = array
        renderOutputBetter(callback)
    }
    reader.readAsArrayBuffer(fileObject);
}

function renderOutputBetter(callback){
    var byteIndex = 0;
    var byteTotalLength = 0;
    var isRIFF = concatBytes(byteArr, byteIndex, bytes.DWORD, bytes.AS_STRING) == 'RIFF'
    if(!isRIFF){
        console.warn('not a RIFF file')
        return;
    }
    var cursorOutput = {
        RIFF: isRIFF,
        fileSize: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
        LIST: {}
    }
    while(byteIndex < byteArr.length){
        var offset = bytes.DWORD
        var topLevelDirective = concatBytes(byteArr, byteIndex, bytes.DWORD, bytes.AS_STRING).trim()
        switch(topLevelDirective) {
            case 'ACON':
                cursorOutput[topLevelDirective] = {};
                break;
            case 'LIST':
                var sizeOfList = concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                //var endOfList = nextNonZeroByteIndex(byteArr, byteIndex + sizeOfList);
                var typeOfList = concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_STRING)
                cursorOutput[topLevelDirective][typeOfList] = {
                    sizeOfList: sizeOfList
                }
                switch(typeOfList){
                    case 'INFO':
                        //cursorOutput[topLevelDirective][typeOfList]
                        var tempByteIndex = byteIndex + bytes.DWORD;
                        
                        while(tempByteIndex < byteIndex + sizeOfList){
                            var subOffset = bytes.DWORD
                            var infoLevelDirective = concatBytes(byteArr, tempByteIndex, bytes.DWORD, bytes.AS_STRING)
                            switch(infoLevelDirective){
                                case 'INAM':
                                    var size = concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                                    cursorOutput[topLevelDirective][typeOfList][infoLevelDirective] = {
                                        size: size // seems to be off by +1, need to investigate
                                    };
                                    
                                    cursorOutput[topLevelDirective][typeOfList][infoLevelDirective].val = concatBytes(byteArr, tempByteIndex+=bytes.DWORD, size, bytes.AS_STRING)
                                    subOffset = size
                                    break;
                                case 'IART':
                                    var size = concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                                    cursorOutput[topLevelDirective][typeOfList][infoLevelDirective] = {
                                        size: size // seems to be off by +1, need to investigate
                                    };
                                    
                                    cursorOutput[topLevelDirective][typeOfList][infoLevelDirective].val = concatBytes(byteArr, tempByteIndex+=bytes.DWORD, size, bytes.AS_STRING)
                                    subOffset = size
                                    break;
                            }
                            tempByteIndex += subOffset
                            
                            tempByteIndex = nextNonZeroByteIndex(byteArr, tempByteIndex);
                        }
                        break;
                    case 'fram':
                        //
                        var tempByteIndex = byteIndex + bytes.DWORD;
                        cursorOutput[topLevelDirective][typeOfList]['frames'] = [];
                        while(tempByteIndex < byteIndex + sizeOfList){
                            var subOffset = bytes.DWORD
                            var infoLevelDirective = concatBytes(byteArr, tempByteIndex, bytes.DWORD, bytes.AS_STRING)
                            switch(infoLevelDirective){
                                case 'icon':
                                    var size = concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                                    
                                    var newIcon = {
                                        size: size
                                    }
                                    var bitmapStartIndex = tempByteIndex + bytes.DWORD
                                    newIcon.CURHEADER = {
                                        wReserved: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.WORD, bytes.AS_NUM), // always 0
                                        wResID: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.WORD, bytes.AS_NUM), // always 2
                                        wNumImages: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.WORD, bytes.AS_NUM)
                                    };
                                    newIcon.CURSORDIRENTRY ={
                                        bWidth: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.BYTE, bytes.AS_NUM),
                                        bHeight: concatBytes(byteArr, tempByteIndex+=bytes.BYTE, bytes.BYTE, bytes.AS_NUM),
                                        bColorCount: concatBytes(byteArr, tempByteIndex+=bytes.BYTE, bytes.BYTE, bytes.AS_NUM),
                                        bReserved: concatBytes(byteArr, tempByteIndex+=bytes.BYTE, bytes.BYTE, bytes.AS_NUM),
                                        wHotspotX: concatBytes(byteArr, tempByteIndex+=bytes.BYTE, bytes.WORD, bytes.AS_NUM),
                                        wHotspotY: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.WORD, bytes.AS_NUM),
                                        dwBytesInImage: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.DWORD, bytes.AS_NUM),
                                        dwImageOffset: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                                    }
                                    
                                    newIcon.BITMAPINFOHEADER = {
                                        biSize: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                                        biWidth: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.LONG, bytes.AS_NUM),
                                        biHeight: concatBytes(byteArr, tempByteIndex+=bytes.LONG, bytes.LONG, bytes.AS_NUM),
                                        biPlanes: concatBytes(byteArr, tempByteIndex+=bytes.LONG, bytes.WORD, bytes.AS_NUM),
                                        biBitCount: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.WORD, bytes.AS_NUM),
                                        biCompression: concatBytes(byteArr, tempByteIndex+=bytes.WORD, bytes.DWORD, bytes.AS_NUM),
                                        biSizeImage: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                                        biXPelsPerMeter: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                                        biYPelsPerMeter: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                                        biClrUsed: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                                        biClrImportant: concatBytes(byteArr, tempByteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM)
                                    }
                                    var te = byteArr.slice(bitmapStartIndex, bitmapStartIndex + size)
                                    
                                    var blob = new Blob([te.buffer], { type: 'image/bmp' });
                                    //canvas.renderImage(blob)
                                    
                                    newIcon.blobURL = URL.createObjectURL(blob);

                                    cursorOutput[topLevelDirective][typeOfList]['frames'].push(newIcon)
                                    tempByteIndex = bitmapStartIndex + size
                                    subOffset = 0
                                    break;
                            }
                            tempByteIndex += subOffset
                            
                            tempByteIndex = nextNonZeroByteIndex(byteArr, tempByteIndex);
                        }
                        break;
                }
                offset = sizeOfList
                break;
            case 'anih':
                cursorOutput[topLevelDirective] = {
                    size: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// size
                    cbSize: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// Num bytes in AniHeader (36 bytes), redundant 
                    nFrames: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// Number of unique Icons in this cursor
                    nSteps: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                    iWidth: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// always 0
                    iHeight: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// always 0
                    iBitCount: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// always 0
                    nPlanes: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),// always 0
                    iDispRate: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                    bfAttributes: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                }
                //offset = cursorOutput[topLevelDirective].size
                break;
            case 'rate':
                cursorOutput[topLevelDirective] = {
                    size: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                    array: []
                };
                var tempByteIndex = byteIndex + bytes.DWORD;

                while(tempByteIndex < byteIndex + cursorOutput[topLevelDirective].size + bytes.DWORD){
                    var subOffset = bytes.DWORD
                    var rateValue = concatBytes(byteArr, tempByteIndex, bytes.DWORD, bytes.AS_NUM)
                    cursorOutput[topLevelDirective].array.push(rateValue)

                    tempByteIndex += subOffset
                }
                offset = cursorOutput[topLevelDirective].size + bytes.DWORD
                
                break;
            case 'seq':
                cursorOutput[topLevelDirective] = {
                    size: concatBytes(byteArr, byteIndex+=bytes.DWORD, bytes.DWORD, bytes.AS_NUM),
                    array: []
                };
                var tempByteIndex = byteIndex + bytes.DWORD;

                while(tempByteIndex < byteIndex + cursorOutput[topLevelDirective].size + bytes.DWORD){
                    var subOffset = bytes.DWORD
                    var rateValue = concatBytes(byteArr, tempByteIndex, bytes.DWORD, bytes.AS_NUM)
                    cursorOutput[topLevelDirective].array.push(rateValue)

                    tempByteIndex += subOffset
                }
                offset = cursorOutput[topLevelDirective].size + bytes.DWORD
                break;
        }
        byteIndex += offset
        byteIndex = nextNonZeroByteIndex(byteArr, byteIndex); // never end on a 0 value byte. happens because dword size limits
    }
    console.log(cursorOutput)
    var cursorBlobArray = []
    var frameCount = cursorOutput.LIST.fram.frames.length
    for(var i = 0; i < frameCount; i++){
        cursorBlobArray.push(cursorOutput.LIST.fram.frames[i].blobURL)
    }
    if(frameCount == 1)
        cursorBlobArray.push(cursorBlobArray[0])
    if(cursorBlobArray.length > 0){
        let base64Cursor = btoa(String.fromCharCode.apply(null, byteArr));
        localStorage.setItem('myCursor', base64Cursor)
        //setSequence

        if(cursorOutput.seq){
            var newCursorBlobArray = []
            for(var i = 0; i < cursorOutput.seq.array.length; i++){
                newCursorBlobArray.push(cursorBlobArray[cursorOutput.seq.array[i]])
            }
            cursorBlobArray = newCursorBlobArray;
        }
        
        var duration = 0;
        var rateObjExist = typeof cursorOutput.rate == "object" && typeof cursorOutput.rate.array == "object" && cursorOutput.rate.array.length > 0
        if(cursorOutput.anih.iDispRate > 0 && !rateObjExist){
            duration = iDispRateToCssDuration(cursorOutput.anih.iDispRate, cursorBlobArray.length)
        } else{
            //duration = cursorOutput.rate.rateArr
            var returnobj = rateArrToCssDurationAndModifyFrameCount(cursorOutput.rate.array, cursorBlobArray)
            duration = returnobj.duration
            cursorBlobArray = returnobj.frames
        }
        callback({
            BlobUrlArray: cursorBlobArray,
            cssDuration: duration,
            base64Cursor: base64Cursor
        })
        
    }
}

function nextNonZeroByteIndex(byteArr, startIndex) {
    var offset = 0;
    while(byteArr[startIndex + offset] == 0) {
        offset++;
        if (startIndex+offset > byteArr.length) return byteArr.length
    } 
    return startIndex + offset
}

function concatBytes(byteArr, index, howManyBytes, isInt = true){
    if(isInt){
        var combinedInt = 0;
        for(var i = 0; i < howManyBytes; i++){
            var shiftSize = i * 8;
            combinedInt += byteArr[index + i] << shiftSize
        }
        return combinedInt;
    } else {
        var combinedString = ""
        for(var i = 0; i < howManyBytes; i++){
            combinedString += String.fromCharCode(byteArr[index + i])
        }
        return combinedString
    }
}



// URL
// or
// https://developer.mozilla.org/en-US/docs/Web/API/File
// File Object 
// usually from input.files[0]
window.aniFileImport = function(urlOrFile, callback){
    if(typeof urlOrFile == "string"){
        //is url
        getfile(urlOrFile, callback)

    } else{
        //is File
        toBits(urlOrFile, callback)
    }
}

window.aniLoadFromStorage = function(callback){
    if(localStorage.hasOwnProperty('myCursor')) {
        aniLoadFromBlobo(localStorage.getItem('myCursor'),callback)
    }
}

window.aniLoadFromBlobo = function(blobo, callback){
    byteArr = new Uint8Array(atob(blobo).split("").map(
        (char)=>char.charCodeAt(0)
        )
    );
    renderOutputBetter(callback)
}

/*
if(localStorage.hasOwnProperty('myCursor')) {
    byteArr = new Uint8Array(atob(localStorage.getItem('myCursor')).split("").map(
        (char)=>char.charCodeAt(0)
        )
    );
    renderOutputBetter()
}
*/

})();