define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tweenIconUtil',
    'game/baseGame/container/keyFrameIconContainer',
    'game/baseGame/container/spinLeftContainer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(gr, tweenIconUtil, keyFrameIconContainer, spinLeftContainer, audio) {

    const doWinXReact = function(value, keyFrameIconPosition, completeCallback){
        if(this.appStore.autoPlay){
            const sprite = keyFrameIconContainer.updateKeyFrameIconAutoPlay(keyFrameIconPosition, 'turnAgainIcon06Light');
            const cb = () => {
                audio.play("prizeLand", this.landAudioIndex);
                this.landAudioIndex++;
                if(this.landAudioIndex > 7){
                    this.landAudioIndex = 4;
                }
                sprite.show(false);
                spinLeftContainer.doSpinLeftReact(value);
                if(completeCallback){ completeCallback(); }
            };
            const { _spinsLeftImage2 } = gr.lib;
            let startCoord = sprite.toGlobal({ x: 0, y: 0 });
            startCoord.x += sprite._currentStyle._width/2;
            startCoord.y += sprite._currentStyle._height/2;
            let endCoord = _spinsLeftImage2.toGlobal({ x: 0, y: 0 });
            endCoord.x += _spinsLeftImage2._currentStyle._width/2;
            endCoord.y += _spinsLeftImage2._currentStyle._height/2;
            tweenIconUtil.tweenIconAnimation(startCoord, endCoord, cb, sprite);
        }else{
            keyFrameIconContainer.updateKeyFrameIconContainer(keyFrameIconPosition, 'turnAgainIcon06Light');
            const cb = () => {
                audio.play("prizeLand", 1);
                gr.animMap._gameShock.play();
                keyFrameIconContainer.hideKeyFrameIcon();
                spinLeftContainer.doSpinLeftReact(value);
                if(completeCallback){ completeCallback(); }
            };
            gr.animMap._tweenIconFlash.play();
            gr.animMap._tweenIconFlash._onComplete = function(){
                this._onComplete = null;
                const { _spinsLeftImage2, _keyFrameIcon } = gr.lib;
                let startCoord = _keyFrameIcon.toGlobal({ x: 0, y: 0 });
                startCoord.x += _keyFrameIcon._currentStyle._width/2;
                startCoord.y += _keyFrameIcon._currentStyle._height/2;
                let endCoord = _spinsLeftImage2.toGlobal({ x: 0, y: 0 });
                endCoord.x += _spinsLeftImage2._currentStyle._width/2;
                endCoord.y += _spinsLeftImage2._currentStyle._height/2;
                tweenIconUtil.tweenIconAnimation(startCoord, endCoord, cb);
            };
        }
    };

    return {
        doWinXReact
    };
});