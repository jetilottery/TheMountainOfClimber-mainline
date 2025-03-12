define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tweenIconUtil',
    'game/gameUtils',
    'game/baseGame/container/keyFrameIconContainer',
    'game/gameConfig/textStyle',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(gr, tweenIconUtil, gameUtils, keyFrameIconContainer, textStyle, audio) {
    let spritesPosition = null;
    const getAccSpritesTopAndLeft = () => {
        let positions = {};
        let tops = [];
        let lefts = [];
        for(let i = 4; i < 9; i++){
            tops[i] = gr.lib['_collectGemText0'+i]._currentStyle._top;
            lefts[i] = gr.lib['_collectGemText0'+i]._currentStyle._left;
        }
        positions['tops'] = tops;
        positions['lefts'] = lefts;
        return positions;
    };

    const hideAllAccSprites = () => {
        if(!spritesPosition){ spritesPosition = getAccSpritesTopAndLeft(); }
        console.log(spritesPosition);
        for(let i = 1; i < 9; i++){
            gr.lib['_collectGem0'+i].show(false);
            gr.lib['_collectGemLight_0'+i].show(false);
            gr.lib['_collectAccAperture_0'+i].show(false);
            gr.lib['_collectStarFlash_0'+i].show(false);
        }
        for(let i = 4; i < 9; i++){
            gr.lib['_collectGemFlash_0'+i].show(false);
        }
    };
    
    const resetAccSprites = () => {
        hideAllAccSprites();
        for(let i = 1; i < 9; i++){
            if(gr.lib['_collectStarFlash_0'+i].pixiContainer.$sprite.playing){
                gr.lib['_collectStarFlash_0'+i].stopPlay();
            }
        }   
        for(let i = 4; i < 9; i++){
            gameUtils.setTextStyle(gr.lib['_collectGemText0'+i], textStyle.upDnAccEinstant_nowin);
            gr.lib['_collectGemText0'+i].updateCurrentStyle({
                _transform:{
                    _scale:{_x:1,_y:1}
                },
                _left:spritesPosition['lefts'][i],
                _top:spritesPosition['tops'][i]
            });
            if(gr.lib['_collectGemFlash_0'+i].pixiContainer.$sprite.playing){
                gr.lib['_collectGemFlash_0'+i].stopPlay();
            }
        }
    };

    const initialAccWhenGIP = (accNum) => {
        for (let i = 1; i <= accNum; i++) {
            gr.lib['_collectGem0' + i].show(true);
            gr.lib['_collectGemLight_0' + i].show(true);
        }
        if(gr.animMap['_winTextPingpong_0'+accNum]){
            const sprite = gr.lib['_collectGemText0'+accNum];
            gr.animMap['_winTextPingpong_0'+accNum].updateStyleToTime(1000);
            gameUtils.setTextStyle(sprite, textStyle.upDnAccEinstant_win);
            gr.lib['_collectStarFlash_0'+accNum].show(true);
            gr.lib['_collectStarFlash_0'+accNum].gotoAndPlay('GemLight', 0.5, true);
        }
    };

    const updateAccWinTextStyle  = (acc) => {
        if(acc-1 >= 4){
            if(gr.animMap['_winTextPingpong_0'+(acc-1)].isPlaying()){
                gr.animMap['_winTextPingpong_0'+(acc-1)]._onComplete = null;
                gr.animMap['_winTextPingpong_0'+(acc-1)].stop();
            }
            const sprite = gr.lib['_collectGemText0'+(acc-1)];
            gameUtils.setTextStyle(sprite, textStyle.upDnAccEinstant_nowin);
            sprite.updateCurrentStyle({
                _transform:{
                    _scale:{_x:1,_y:1}
                },
                _left:spritesPosition['lefts'][(acc-1)],
                _top:spritesPosition['tops'][(acc-1)]
            });
            gr.lib['_collectGemFlash_0'+(acc-1)].show(false);
            gr.lib['_collectGemFlash_0'+(acc-1)].stopPlay();
            gr.lib['_collectStarFlash_0'+(acc-1)].show(false);
            gr.lib['_collectStarFlash_0'+(acc-1)].stopPlay();
        }
        gr.animMap['_winTextPingpong_0'+acc].play();
        gr.lib['_collectGemFlash_0'+acc].show(true);
        gr.lib['_collectGemFlash_0'+acc].gotoAndPlay('CollectFlash', 0.5 ,true);
        gr.lib['_collectStarFlash_0'+acc].show(true);
        gr.lib['_collectStarFlash_0'+acc].gotoAndPlay('GemLight', 0.5, true);
        gr.animMap['_winTextPingpong_0'+acc]._onComplete = () => {
            gameUtils.setTextStyle(gr.lib['_collectGemText0'+acc], textStyle.upDnAccEinstant_win);
        };
    };

    const _accToDestinationAnimation = (value) => {
        const currentAccListSprite = gr.lib['_collectGem0' + value];
        currentAccListSprite.show(true);
        gr.animMap['_accScale_0'+value].play();
        gr.animMap['_accScale_0'+value]._onComplete = () => {
            gr.lib['_collectGemLight_0'+value].show(true);
            gr.lib['_collectAccAperture_0'+value].show(true);
            gr.lib['_collectAccAperture_0'+value].gotoAndPlay('CollectLight', 0.5, false);
        };
    };

    const doAccReaction = function(value, keyFrameIconPosition, completeCallback) {
        const { autoPlay, gameCurrentScene } = this.appStore;
        if(autoPlay){
            const sprite = keyFrameIconContainer.updateKeyFrameIconAutoPlay(keyFrameIconPosition, 'hillIcon03Light');
            const currentAccListSprite = gr.lib['_collectGem0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", this.landAudioIndex);
                this.landAudioIndex++;
                if(this.landAudioIndex > 7){
                    this.landAudioIndex = 4;
                }
                sprite.show(false);
                _accToDestinationAnimation(value);
                if(completeCallback){ completeCallback.call(this); }
            };
            const { _mesteryLight } = gr.lib;
            if(_mesteryLight.pixiContainer.visible){
                _mesteryLight.show(false);
            }
            let startCoord = sprite.toGlobal({ x: 0, y: 0 });
            startCoord.x += sprite._currentStyle._width/2;
            startCoord.y += sprite._currentStyle._height/2;
            let endCoord = currentAccListSprite.toGlobal({ x: 0, y: 0 });
            endCoord.x += currentAccListSprite._currentStyle._width/2;
            endCoord.y += currentAccListSprite._currentStyle._height/2;
            tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback, sprite);
        }else{
            keyFrameIconContainer.updateKeyFrameIconContainer(keyFrameIconPosition, 'hillIcon03Light');
            const currentAccListSprite = gr.lib['_collectGem0' + value];
            const _decoratorCallback = () => {
                audio.play("prizeLand", 1);
                keyFrameIconContainer.hideKeyFrameIcon();
                _accToDestinationAnimation(value);
                if(completeCallback){ completeCallback.call(this); }
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
                let endCoord = currentAccListSprite.toGlobal({ x: 0, y: 0 });
                endCoord.x += currentAccListSprite._currentStyle._width/2;
                endCoord.y += currentAccListSprite._currentStyle._height/2;
                tweenIconUtil.tweenIconAnimation(startCoord, endCoord, _decoratorCallback);
            };
        }
    };

    return {
        hideAllAccSprites,
        initialAccWhenGIP,
        doAccReaction,
        resetAccSprites,
        updateAccWinTextStyle
    };
});