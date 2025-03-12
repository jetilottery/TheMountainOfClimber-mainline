define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/componentCRDC/gladRenderer/Tween',
    'skbJet/component/gameMsgBus/GameMsgBus',
], function (gr, Tween, msgBus) {

        class Mountain{
            constructor(appStore) {
                this.appStore = appStore;
                this.container = gr.lib._hill;
                this.pixiContainer = this.container.pixiContainer;
                this.mousePrevPos_onDrag = null;
                this.mountainCurrPos_beforeDrag = null;
                this.dragging = false;
                this.flyMoveLeft = 0;
                this.flyMoveTop = 0;
                this.currentMoveLeft = 0;
                this.currentMoveTop = 0;
                this.stepLineLeft = this.getAwardsStepsLeft();
                this.stepLineHeight = 70;
                this.startTop = 700;
                this.hillOriginPosition = {
                    'landscape': {
                        x: 382,
                        y: -284
                    },
                    'portrait':{
                        x: 0,
                        y: 0
                    }
                };
            }
            
            setInteractive(value){
                this.container.pixiContainer.interactive = value;
            }

            getAwardsStepsLeft(){
                const { _entrance } = gr.lib;
                return Object.keys(_entrance.sprites).map((element)=>{
                    return gr.lib[element]._currentStyle._left;
                });
            }

            resetPosition(){
                let orientation;
                if(this.appStore.SKBeInstant.isSKB()){
                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                }else{
                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                }
                this.container.updateCurrentStyle({_left:this.hillOriginPosition[orientation].x, _top:this.hillOriginPosition[orientation].y});
            }

            setPostion(x, y) { 
                this.container.updateCurrentStyle({_left:x, _top:y});
            }

            setCurrentStep(currentSteps){
                let orientation;
                if(this.appStore.SKBeInstant.isSKB()){
                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                }else{
                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                }
                this.container.updateCurrentStyle({
                    _left: this.hillOriginPosition[orientation].x - 35 - (this.stepLineLeft[currentSteps - 1] - this.stepLineLeft[0]), 
                    _top: this.hillOriginPosition[orientation].y + (currentSteps * this.stepLineHeight)
                });
            }

            moveDownStepByStep(steps, callBack) {
                let stepsFlag = 0;
                const move = () => { 
                    msgBus.publish("MOUNTAIN.UP.ONESTEP", this.appStore.SKBeInstant.getGameOrientation());
                    let { _left, _top } = this.container._currentStyle;
                    let { totalClimberStep } = this.appStore.baseGameStore.data;
                    let keyAnimation;
                    if (totalClimberStep === 0) {
                        _left -= 35; // 35 is calculated by config.js 35 = 245 - 210
                    } else {
                        _left -= (this.stepLineLeft[totalClimberStep] - this.stepLineLeft[totalClimberStep - 1]);
                    }
                    _top = _top + this.stepLineHeight;
                    keyAnimation = Tween.to(this.container, { 
                        left: _left,
                        top: _top
                    }, 300);
                    if(!keyAnimation._onComplete){
                        keyAnimation._onComplete = () => {
                            totalClimberStep++;
                            this.appStore.baseGameStore.setTotalClimberStep(totalClimberStep);
                            stepsFlag++;
                            if (stepsFlag >= steps) {
                                if(callBack){ callBack();}
                                return;
                            }
                            gr.getTimer().setTimeout(() => {move();}, 50);
                        };
                    }
                };
                move();
            }

            moveDownStepByStep1(steps, callBack) {
                let stepsFlag = 0;
                const move = () => { 
                    msgBus.publish("GOAT.MOUNTAIN.UP.ONESTEP", this.appStore.SKBeInstant.getGameOrientation());
                    let { _left, _top } = this.container._currentStyle;
                    let { totalClimberStep } = this.appStore.baseGameStore.data;
                    let keyAnimation;
                    if (totalClimberStep === 0) {
                        _left -= 35; // 35 is calculated by config.js 35 = 245 - 210
                    } else {
                        _left -= (this.stepLineLeft[totalClimberStep] - this.stepLineLeft[totalClimberStep - 1]);
                    }
                    _top = _top + this.stepLineHeight;
                    keyAnimation = Tween.to(this.container, { 
                        left: _left,
                        top: _top
                    }, 200);
                    if(!keyAnimation._onComplete){
                        keyAnimation._onComplete = () => {
                            totalClimberStep++;
                            this.appStore.baseGameStore.setTotalClimberStep(totalClimberStep);
                            stepsFlag++;
                            if (stepsFlag >= steps) {
                                if(callBack){ callBack();}
                                return;
                            }
                            gr.getTimer().setTimeout(() => {move();}, 0);
                        };
                    }
                };
                move();
            }

            flyDown(flyMoveLeft, flyMoveTop){
                let {  _left, _top } = this.container._currentStyle;
                _left += flyMoveLeft;
                _top += flyMoveTop;
                this.container.updateCurrentStyle({_left: _left, _top: _top});
                //this.appStore.baseGameStore.data.totalClimberStep+=steps;
            }

            updateFlyUp(steps){
                let {  _left, _top } = this.container._currentStyle;
                let _flyMoveLeft,_flyMoveTop;
                let { totalClimberStep } = this.appStore.baseGameStore.data;
                if(this.stepLineLeft[totalClimberStep - 1]){
                    this.flyMoveLeft = (this.stepLineLeft[totalClimberStep + steps -1] - this.stepLineLeft[totalClimberStep - 1]);
                    _flyMoveLeft = (this.stepLineLeft[totalClimberStep + steps -1] - this.stepLineLeft[totalClimberStep - 1]);
                }else{
                    this.flyMoveLeft = (this.stepLineLeft[totalClimberStep + steps -1] - 210);
                    _flyMoveLeft = (this.stepLineLeft[totalClimberStep + steps -1] - 210);
                }
                this.flyMoveTop = this.stepLineHeight*steps;
                _flyMoveTop = this.stepLineHeight*steps;
                _left -= _flyMoveLeft;
                _top += _flyMoveTop;
                this.currentMoveLeft = _left;
                this.currentMoveTop = _top;
            }

            rollDown(steps, callBack){
                let {  _left, _top } = this.container._currentStyle;
                let keyAnimation;
                let { totalClimberStep } = this.appStore.baseGameStore.data;
                this.flyMoveLeft = (this.stepLineLeft[totalClimberStep - 1] - this.stepLineLeft[totalClimberStep - steps -1]);
                this.flyMoveTop = this.stepLineHeight*steps;
                _left += this.flyMoveLeft;
                _top -= this.flyMoveTop;
                keyAnimation = Tween.to(this.container, { 
                        left: _left, 
                        top: _top 
                }, steps*160);
                keyAnimation._onComplete = () => {
                    if(callBack){
                        callBack();
                    }
                };
            }

        }

        return Mountain;

});