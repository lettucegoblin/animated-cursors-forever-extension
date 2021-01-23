
console.log('injected')
var port = chrome.runtime.connect({name:"mycontentscript"});
port.onMessage.addListener(function(message,sender){
    console.log(message);
    if(message.curType == 'ani'){
        aniLoadFromBlobo(message.curData,function(aniCursor){
            animcur = makeanimcursor(aniCursor.BlobUrlArray, window.document.documentElement, aniCursor.cssDuration)
        })
    } else{
        var cutebytes = new Uint8Array(atob(message.curData).split("").map(
            (char)=>char.charCodeAt(0)
            )
        );
        var blob = new Blob([cutebytes.buffer], { type: 'image/bmp' });
        
        var blobURL = URL.createObjectURL(blob);

        console.log(blobURL)
        document.body.style.cursor = 'url('+blobURL+'), auto'
    }
});