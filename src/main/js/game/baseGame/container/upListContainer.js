define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tweenIconUtil',
    'game/gameUtils',
    'game/baseGame/container/keyFrameIconContainer',
    'game/gameConfig/textStyle',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(gr, tweenIconUtil, gameUtils, keyFrameIconContainer, textStyle, audio) {

    const hideAllUpSprites = () => {
        const { _collectUpWinLight } = gr.lib;
        for(let i = 1; i < 5; i++){
            gr.lib['_collectUpIcon0'+i].show(false);
            gr.lib['_collectUpLight_0'+i].show(false);
            gr.lib['_collectUpAperture_0'+i].show(false);
        }
        _collectUpWinLight.show(false);
    };

    const resetUpSprites = () => {
        hideAllUpSprites();
        const { _collectUpText } = gr.lib;
        if(gr.animMap._upLightAnimation.isPlaying()){ 
            gr.animMap._upLightAnimation.stop(); 
            for(let i = 1; i < 5; i++){
                gr.lib['_collectUpLight_0'+i].updateCurrentStyle({_transform:{_rotate:0}});
            }
        }
        if(gr.animMap._winUpEW.isPlaying()){ 
            gr.animMap._winUpEW.stop(); 
            gameUtils.setTextStyle(_collectUpText, textStyle.upDnAccEinstant_nowin);
            _collectUpText.updateCurrentStyle({_transform:{_scale:{_x:1,_y:1}},_top: _collectUpText._currentStyle._top + 4});
        }
    };

    const _showCurrentUps = (upNum) => {
        for (let i = 1; i <= upNum; i++) {
            gr.lib['_collectUpIcon0' + i].show(true);
        }
    };

    const updateUpWinTextStyle = () => {
        const { _collectUpText, _collectUpWinLight }  = gr.lib;
        gr.animMap._scaleUpWinText.play();
        gr.animMap._scaleUpWinText._onComplete = function(){
            _collectUpText.updateCurrentStyle({_top: _collectUpText._currentStyle._top - 4});
            gameUtils.setTextStyle(_collectUpText, textStyle.upDnAccEinstant_win);
            _collectUpWinLight.show(true);
            gr.animMap._winUpEW.play(Infinity);
            _showCurrentUps(4);
            for(let i = 1; i < 5; i++){
                gr.lib['_collectUpLight_0'+i].show(true);
            }
            gr.animMap._upLightAnimation.play(Infinity);
        };
    };
	
    const initialUpWhenGIP = (upNum) => {
        if(upNum === 4){
            const { _collectUpText }  = gr.lib;
            _collectUpText.updateCurrentStyle({_transform:{_scale:{_x:1.3,_y:1.3}}});
            updateUpWinTextStyle();
        }else{
            _showCurrentUps(upNum);
        }
    };

    const _upToDestinationAnimation = (value) => {
        const currentUpListSprite = gr.lib['_collectUpIcon0' + value];
        currentUpListSprite.show(true);
        gr.animMap['_upScale_0'+value].play();
        gr.animMap._upShake.play();
        gr.animMap['_upScale_0'+value]._onComplete = () => {
            gr.lib['_collectUpAperture_0'+value].show(true);
            gr.lib['_collectUpAperture_0'+value].gotoAndPlay('CollectLight', 0.5, false);
        };
    };
    
    const doUpReaction = function(value, keyFrameIconPosition, completeCallback) {
        const { autoPlay, gameCurrentScene } = this.appStore;
        if(autoPlay){
            const sprite = keyFrameIconContainer.updateKeyFrameIconAutoPlay(keyFrameIconPosition, 'hillIcon05Light');
            const currentUpListSprite = gr.lib['_collectUpIcon0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", this.landAudioIndex);
                this.landAudioIndex++;
                if(this.landAudioIndex > 7){
                    this.landAudioIndex = 4;
                }
                sprite.show(false);
                _upToDestinationAnimation(value);
                if(completeCallback){ completeCallback(); }
            };
            const { _mesteryLight } = gr.lib;
            _mesteryLight.show(false);
            let startCoord = sprite.toGlobal({ x: 0,y: 0 });
            startCoord.x += sprite._currentStyle._width/2;
            startCoord.y += sprite._currentStyle._height/2;
            let endCoord = currentUpListSprite.toGlobal({ x: 0, y: 0 });
            endCoord.x += currentUpListSprite._currentStyle._width/2;
            endCoord.y += currentUpListSprite._currentStyle._height/2;
            tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback, sprite);
        }else{
            keyFrameIconContainer.updateKeyFrameIconContainer(keyFrameIconPosition, 'hillIcon05Light');
            const currentUpListSprite = gr.lib['_collectUpIcon0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", 1);
                keyFrameIconContainer.hideKeyFrameIcon();
                _upToDestinationAnimation(value);
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
                let startCoord = _keyFrameIcon.toGlobal({ x: 0,y: 0 });
                startCoord.x += _keyFrameIcon._currentStyle._width/2;
                startCoord.y += _keyFrameIcon._currentStyle._height/2;
                let endCoord = currentUpListSprite.toGlobal({ x: 0, y: 0 });
                endCoord.x += currentUpListSprite._currentStyle._width/2;
                endCoord.y += currentUpListSprite._currentStyle._height/2;
                tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback);
            };
        }
    }; 

    return {
        hideAllUpSprites,
        initialUpWhenGIP,
        updateUpWinTextStyle,
        doUpReaction,
        resetUpSprites
    };
});