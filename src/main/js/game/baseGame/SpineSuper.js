define([], function () {
        class ClimberMan {
            constructor(x, y, scalex, scaley, parent, addChildAtIndex) {
                this.x = x;
                this.y = y;
                this.scalex = scalex;
                this.scaley = scaley;
                this.parent = parent;
                this.addChildAtIndex = addChildAtIndex;
                this.spineContianer = null;
                this.spine = null;
            }
            
            create() {}

            play(animation, speed, loop, trackIndex) {
                if(trackIndex){
                    this.spine.state.setAnimation(trackIndex, animation, loop);
                }else{
                    this.spine.state.setAnimation(0, animation, loop);
                }
                this.spine.state.timeScale = speed;
            }

            stop() {
                this.spine.state.setEmptyAnimations(0.2);
                this.spine.skeleton.setToSetupPose();
                this.spine.update(0);
            }

            show(){
                this.spineContianer.visible = true;
            }

            hide(){
                this.spineContianer.visible = false;
            }

            getVisible(){
                return this.spineContianer.visible;
            }

            on(eventName, callBack){
                this.spine.interactive = true;
                if (eventName === 'click') {
                    this.spine.on('touchstart', callBack);
                    this.spine.on('click', callBack);            
                }else if(eventName === 'mouseover'){
                    this.spine.on(eventName, callBack);
                }else if(eventName === 'mouseout'){
                    this.spine.on('mouseout', callBack);
                    if('ontouchend' in window){
                        this.spine.on('touchendoutside', callBack);
                    }
                }else if(eventName === 'mousedown'){
                    if('ontouchstart' in window){
                        this.spine.on('touchstart', callBack);
                    }else{
                        this.spine.on('mousedown', callBack);
                    }
                }else if(eventName === 'mouseup'){
                    this.spine.on('mouseup', callBack);
                    if('ontouchend' in window){
                        this.spine.on('touchend', callBack);
                    }
                }else if(eventName === 'mouseupoutside'){
                    if('ontouchend' in window){
                        this.spine.on('touchendoutside', callBack);
                    }else{
                        this.spine.on('mouseupoutside', callBack);
                    }
                }else if(eventName === 'mousemove'){
                    if('ontouchmove' in window){
                        this.spine.on('touchmove', callBack);
                    }else{
                        this.spine.on('mousemove', callBack);
                    }
                }else{
                    throw 'Not supported event!';
                }
            }

        }

        return ClimberMan;

});