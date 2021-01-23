(function () {
    window.makeanimcursor = function makeanimcursor(imgArrOrGif, elem = window.document.body, duration = 250){
        var imgArr = normalizeToImgArr(imgArrOrGif)
        return new animcursor(imgArr, elem, duration)
    }

    function normalizeToImgArr(imgArrOrGif){
        return imgArrOrGif // todo
    }
    class animcursor {
        #elem = undefined;
        #animationObject = undefined;
        #keyframes = [];
        #duration = 250;
        #iterations = Infinity;

        constructor(imgArr, elem, duration) {
            this.#duration = duration
            this.changeCursor(imgArr, elem)
        }
        //https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Basic_User_Interface/Using_URL_values_for_the_cursor_property
        changeCursor(imgArr, elem = this.elem){
            var css = `<style>
                @keyframes cursoranim {
                `
            this.disable()
            this.#elem = elem;
            this.#keyframes = []
            for(var i = 0; i < imgArr.length; i++){
                /*var percent = Math.round((i / imgArr.length) * 100)
                css += percent + `% { cursor: url(`+ imgArr[i] +`) 0 0, auto; }`*/
                this.#keyframes.push({
                    cursor: 'url("' + imgArr[i] + '"), url("' + imgArr[i] + '"), auto',
                    perspective: 1000,
                    backfaceVisibility: 'hidden'
                })
            }
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
           
            this.#animationObject = this.#elem.animate(this.#keyframes, { 
                duration: this.#duration,
                iterations: this.#iterations
            });
            /*
            css += 
            `}
            body {
                animation: cursoranim `+this.#duration+`s infinite;
            }
            </style>`
           document.head.insertAdjacentHTML("beforeend", css)*/
           document.head.insertAdjacentHTML('beforeend','<style>html{transform: transale3d(0,0,0); }</style>')
        }

        disable(){
            if(this.#animationObject){
                this.#animationObject.cancel();
            }
        }

        #removeAllAnimations(elem){
            Promise.all(
                elem.getAnimations({ subtree: true })
                    .map(animation => animation.cancel())
            );
        }
    }   
    
})();