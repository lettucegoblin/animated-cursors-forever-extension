
//console.log('Animated Cursor Added to Page!')

var port = chrome.runtime.connect({name:"mycontentscript"});
port.onMessage.addListener(function(message, sender){
    //console.log(message);
    if(message.curData.curType == 'ani'){
        animcur = makeanimcursor(message.curData.blobArray, window.document.documentElement, message.curData.cssDuration)
        /*aniLoadFromBlobo(message.curData,function(aniCursor){
            animcur = makeanimcursor(aniCursor.BlobArray, window.document.documentElement, aniCursor.cssDuration)
        })*/
    } else{
        document.body.style.cursor = 'url(data:image/bmp;base64,'+message.curData.blobArray[0]+'), auto'
    }
});