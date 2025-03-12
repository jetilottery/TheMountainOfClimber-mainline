define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tweenIconUtil',
    'game/gameUtils',
    'game/baseGame/container/keyFrameIconContainer',
    'game/gameConfig/textStyle',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(gr, tweenIconUtil, gameUtils, keyFrameIconContainer, textStyle, audio) {

    const hideAllDnSprites = () => {
        const { _collectDownWinLight } = gr.lib;
        for(let i = 1; i < 5; i++){
            gr.lib['_collectDownLight_0'+i].show(false);
            gr.lib['_collectDownIcon0'+i].show(false);
            gr.lib['_collectDownAperture_0'+i].show(false);
        }
        _collectDownWinLight.show(false);
    };

    const resetDnSprites = () => {
        const { _collectDnText } = gr.lib;
        hideAllDnSprites();
        if(gr.animMap._dnLightAnimation.isPlaying()){ 
            gr.animMap._dnLightAnimation.stop(); 
            for(let i = 1; i < 5; i++){
                gr.lib['_collectDownLight_0'+i].updateCurrentStyle({_transform:{_rotate:0}});
            }
        }
        if(gr.animMap._winDownEW.isPlaying()){ 
            gr.animMap._winDownEW.stop(); 
            gameUtils.setTextStyle(_collectDnText, textStyle.upDnAccEinstant_nowin);
            _collectDnText.updateCurrentStyle({_transform:{_scale:{_x:1,_y:1}},_top: _collectDnText._currentStyle._top + 4});
        }
       
    };

    const _showCurrentDns = (dnNum) => {
        for (let i = 1; i <= dnNum; i++) {
            gr.lib['_collectDownIcon0' + i].show(true);
        }
    };

    const updateDnWinTextStyle = () => {
        const { _collectDnText, _collectDownWinLight }  = gr.lib;
        gr.animMap._scaleDnWinText.play();
        gr.animMap._scaleDnWinText._onComplete = function(){
            _collectDnText.updateCurrentStyle({_top: _collectDnText._currentStyle._top - 4});
            gameUtils.setTextStyle(_collectDnText, textStyle.upDnAccEinstant_win);
            _collectDownWinLight.show(true);
            gr.animMap._winDownEW.play(Infinity);
            _showCurrentDns(4);
            for(let i = 1; i < 5; i++){
                gr.lib['_collectDownLight_0'+i].show(true);
            }
            gr.animMap._dnLightAnimation.play(Infinity);
        };
    };
	
    const initialDnWhenGIP = (dnNum) => {
        if(dnNum === 4){
            const { _collectDnText }  = gr.lib;
            _collectDnText.updateCurrentStyle({_transform:{_scale:{_x:1.3,_y:1.3}}});
            updateDnWinTextStyle();
        }else{
            _showCurrentDns(dnNum);
        }
    };

    const _downToDestinationAnimation = (value) => {
        const currentDnListSprite = gr.lib['_collectDownIcon0' + value];
        currentDnListSprite.show(true);
        gr.animMap['_dnScale_0'+value].play();
        gr.animMap._dnShake.play();
        gr.animMap['_dnScale_0'+value]._onComplete = () => {
            gr.lib['_collectDownAperture_0'+value].show(true);
            gr.lib['_collectDownAperture_0'+value].gotoAndPlay('CollectLight', 0.5, false);
        };
    };

    const doDnReaction = function(value, keyFrameIconPosition, completeCallback) {
        const { autoPlay, gameCurrentScene } = this.appStore;
        if(autoPlay){
            const sprite = keyFrameIconContainer.updateKeyFrameIconAutoPlay(keyFrameIconPosition, 'hillIcon04Light');
            const currentDnListSprite = gr.lib['_collectDownIcon0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", this.landAudioIndex);
                this.landAudioIndex++;
                if(this.landAudioIndex > 7){
                    this.landAudioIndex = 4;
                }
                sprite.show(false);
                _downToDestinationAnimation(value);
                if(completeCallback){ completeCallback.call(this); }
            };
            const { _mesteryLight } = gr.lib;
            if(_mesteryLight.pixiContainer.visible){
                _mesteryLight.show(false);
            }
            let startCoord = sprite.toGlobal({ x: 0, y: 0 });
            startCoord.x += sprite._currentStyle._width/2;
            startCoord.y += sprite._currentStyle._height/2;
            let endCoord = currentDnListSprite.toGlobal({ x: 0, y: 0 });
            endCoord.x += currentDnListSprite._currentStyle._width/2;
            endCoord.y += currentDnListSprite._currentStyle._height/2;
            tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback, sprite);
        }else{
            keyFrameIconContainer.updateKeyFrameIconContainer(keyFrameIconPosition, 'hillIcon04Light');
            const currentDnListSprite = gr.lib['_collectDownIcon0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", 1);
                keyFrameIconContainer.hideKeyFrameIcon();
                //gr.animMap._gameShock.play();
                _downToDestinationAnimation(value);
                if(completeCallback){ completeCallback(); }
            };
            let tween;
            if( gameCurrentScene === 'baseGame' ){
                tween = gr.animMap._tweenIconFlash;
            }else{
                tween = gr.animMap._tweenIconFlashBonus;
            }
            tween.play();
            tween._onComplete = function () {
                this._onComplete = null;
                const { _mesteryLight, _keyFrameIcon } = gr.lib;
                _mesteryLight.show(false);
                let startCoord = _keyFrameIcon.toGlobal({ x: 0, y: 0 });
                startCoord.x += _keyFrameIcon._currentStyle._width/2;
                startCoord.y += _keyFrameIcon._currentStyle._height/2;
                let endCoord = currentDnListSprite.toGlobal({ x: 0, y: 0 });
                endCoord.x += currentDnListSprite._currentStyle._width/2;
                endCoord.y += currentDnListSprite._currentStyle._height/2;
                tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback);
            };
        }
    }; 
    return {
        hideAllDnSprites,
        initialDnWhenGIP,
        updateDnWinTextStyle,
        doDnReaction,
        resetDnSprites
    };
});