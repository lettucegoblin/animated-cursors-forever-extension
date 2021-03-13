(function () {
    window.makeanimcursor = function makeanimcursor(blobArr, elem = window.document.body, duration = 250){
        return new animcursor(blobArr, elem, duration)
    }

    class animcursor {
        elem = undefined;
        animationObject = undefined;
        keyframes = [];
        duration = 250;
        iterations = Infinity;

        constructor(blobArr, elem, duration) {
            this.duration = duration
            this.changeCursor(blobArr, elem)
        }
        //https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Basic_User_Interface/Using_URL_values_for_the_cursor_property
        changeCursor(blobArr, elem = this.elem){
            var css = `<style>
                @keyframes cursoranim {
                `
            this.disable()
            this.elem = elem;
            this.keyframes = []
            for(var i = 0; i < blobArr.length; i++){
                this.keyframes.push({
                    cursor: `url(data:image/bmp;base64,`+blobArr[i]+`), auto`,
                    backfaceVisibility: 'hidden'
                })
            }
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
           
            this.animationObject = this.elem.animate(this.keyframes, { 
                duration: this.duration,
                iterations: this.iterations
            });
        }

        disable(){
            if(this.animationObject){
                this.animationObject.cancel();
            }
        }

        removeAllAnimations(elem){
            Promise.all(
                elem.getAnimations({ subtree: true })
                    .map(animation => animation.cancel())
            );
        }
    }   
    
})();