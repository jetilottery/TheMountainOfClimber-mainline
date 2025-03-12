define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/baseGame/drawLine',
    'game/baseGame/container/accListContainer',
    'game/baseGame/container/upListContainer',
    'game/baseGame/container/dnListContainer',
    'game/gameUtils',
    'game/Particle',
    'game/baseGame/coinParticleData',
    'game/baseGame/container/gameLogoContainer',
    'game/gameConfig/textStyle',
    'game/gameConfig/gameConfiguration',
    'game/baseGame/container/backGroundImage',
    'game/baseGame/container/birdsContainer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function (
    gr, 
    SKBeInstant, 
    drawLine,
    accListContainer,
    upListContainer,
    dnListContainer,
    gameUtils,
    Particle,
    coinParticleData,
    gameLogoContainer,
    textStyle,
    gameConfiguration,
    backGroundImage, 
    birdsContainer,
    audio
    ) {

    const showBaseGame = () => {
        const { _baseGameScreen, _climberTotalContainer } = gr.lib;
        _baseGameScreen.show(true);
        _climberTotalContainer.show(true);
    };

    const hideBaseGame = () => {
        const { _baseGameScreen, _climberTotalContainer } = gr.lib;
        _baseGameScreen.show(false);
        _climberTotalContainer.show(false);
    };

    const hideTargetWinAward = function (currentTotalStep) {
        currentTotalStep = currentTotalStep < 10? '0'+ currentTotalStep : currentTotalStep;
        if(gr.lib['_awardGridContainer_' + currentTotalStep]){
            gr.lib['_awardGridContainer_' + currentTotalStep].show(false);
        }
    };

    const upToDestinationUIReaction = function(){
        const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
        const { _coverClimberMan, _coverSnowMan, _boyUpHook, _lineContainer, _climberManContainer, _hookContainer } = gr.lib;
        _boyUpHook.show(false);
        if(_coverClimberMan.pixiContainer.visible){
            _coverClimberMan.show(false);
        }else{
            _coverSnowMan.show(false);
        }
        this.currentClimberSpine.spineContianer.visible = true;
        this.currentClimberSpine.play(standing, 1, true);
        _climberManContainer.updateCurrentStyle({_left: 0, _top: 0});
        _lineContainer.updateCurrentStyle({_left: 0, _top: 0});
        _hookContainer.updateCurrentStyle({_left: 0, _top: 0});
    };

    const showCoverClimberManAndPlay = function (endx, endy, callback, flyUpNum) {
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        }
        const { coverAnimation1, coverAnimation2 } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
        const { _coverClimberMan, _boyUpHook} = gr.lib;
        _boyUpHook.setImage('BoyUp04');
        _coverClimberMan.show(true);
        audio.play('grappling_AccumulatingForce', 4);
        _coverClimberMan.gotoAndPlay(coverAnimation1, 0.4, false);
        _coverClimberMan.onComplete = () => {
            _coverClimberMan.gotoAndPlay(coverAnimation2, 0.6, false);
            _coverClimberMan.onComplete = null;
            audio.stopChannel(4);
            audio.play('grappling_ThrowingUp', 6);
            drawLine.throwFlyLine.call(this, endx, endy, callback);
            backGroundImage.backGroundFlyDown(flyUpNum, orientation);
            birdsContainer.birdsFlyDown(flyUpNum, orientation);
        };
    };

    const showCoverSnowManAndPlay = function(callback, flyUpNum){
        const { coverAnimation } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
        const { _coverSnowMan } = gr.lib;
        this.snowMan.play(coverAnimation, 0.6, true);
        _coverSnowMan.show(true);
        _coverSnowMan.gotoAndPlay('SownManUPLight', 0.6, true);
        audio.play('goatRun_faster', 4, true);
        const callbackWrap = () => {
            callback();
            audio.stopChannel(4);
        };
        this.mountain.moveDownStepByStep1(flyUpNum, callbackWrap);
    };

    const showCoverGoatAndPlay = function(callback, flyUpNum){
        const { coverAnimation1, coverAnimation2 } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
        const { _coverGoat } = gr.lib;
        _coverGoat.show(true);
        _coverGoat.gotoAndPlay(coverAnimation2, 0.8, true);
        audio.play('goatRun_faster', 4, true);
        this.goat.spineContianer.rotation = -(30*Math.PI/180);
        this.goat.play(coverAnimation1, 1, true);
        const callbackWrap = () => {
            callback();
            audio.stopChannel(4);
        };
        this.mountain.moveDownStepByStep1(flyUpNum, callbackWrap);
    };

    /**
     * 
     * @param {String} pricePoint 
     * @param {Object} gamePrizeTable 
     * @description gamePrizeTable
     * {
     *      '50': {
     *          'Up': 1000,
     *          'Dn': 1000,
     *          'Acc': ['--', '--', '100']        
     *       },
     * }
     */

    const updatedPrizeByPricePoint = function (currentPriceMap) {
        for (let key in currentPriceMap) {
            const value = currentPriceMap[key];
            let container;
			if(key === 'Up'){
				container = gr.lib['_collectUpText'];
				container.setText(SKBeInstant.formatCurrency(value).formattedAmount);
			}else if(key === 'Dn'){
				container = gr.lib['_collectDnText'];
				container.setText(SKBeInstant.formatCurrency(value).formattedAmount);
			}else if(key === 'Acc'){
				value.forEach((item, index) => {
					index++;
					container = gr.lib['_collectGemText0' + index];
					if (isNaN(item)) {
						container.setText(item);
					} else {
						container.setText(SKBeInstant.formatCurrency(item).formattedAmount);
					}
				});
			}
        }
    };

    //Show mestery light and play animation 
    const DO_MESTERY_ANIMATION_TIME = 1000;
    const doMesteryReaction = (cb) => {
        const { _mesteryAnim } = gr.lib;
        _mesteryAnim.show(true);
        gr.animMap._mesteryLightBreath.play(Infinity);
        _mesteryAnim.gotoAndPlay('QuestionRotation', 0.5, true);
        gr.getTimer().setTimeout(() => {
            _mesteryAnim.show(false);
            _mesteryAnim.stopPlay();
            gr.animMap._mesteryLightBreath.stop();
            cb();
        }, DO_MESTERY_ANIMATION_TIME);
    };
    
    const fadeInAndOutForBirds = () => {
        const fadeOutTimer = Math.floor(Math.random()*4) + 5;
        gr.getTimer().setTimeout(() => {
            gr.animMap._birdsHide.play();
            gr.animMap._birdsHide._onComplete = () => {
                const fadeInTimer = Math.floor(Math.random()*3) + 4;
                gr.getTimer().setTimeout(() => {
                    gr.animMap._birdsShow.play();
                    gr.animMap._birdsShow._onComplete = () => {
                        fadeInAndOutForBirds();
                    };
                }, fadeInTimer*1000);
            };
        }, fadeOutTimer*1000);
    };
    /**
     * @public
     * @description Init game scene 
     */

    const initialGameScene = () => {
        const { 
            _boyUpHook, 
            _coverClimberMan, 
            _keyFrameIcon, 
            _mesteryAnim, 
            _mesteryLight, 
            _transtionContainer,
            _rollDownContainer, 
            _spinsLeftImage2,
            _birdsContainer,
            _waterfall_00,
            _coverSnowMan,
            _coverGoat,
            _winUpToStar,
            _buttonAutoPlayStar,
            _buttonPlayStar,
            _buttonPlayCenterStar,
            _climberTotalText,
            _climberManHover,
            _snowManHover,
            _goatHover,
            _mapHover,
            _closeAutoMapHover,
            _windContainer_00,
            _windContainer_01,
            _windContainer_02,
            _winBoxLight,
            _climberManUnlockIcon,
            _snowManUnlockIcon,
            _goatManUnlockIcon
        } = gr.lib;
        _boyUpHook.show(false);
        _coverClimberMan.show(false);
        _coverSnowMan.show(false);
        _keyFrameIcon.show(false);
        _mesteryAnim.show(false);
        _mesteryLight.show(false);
        _transtionContainer.show(false);
        _rollDownContainer.show(false);
        _spinsLeftImage2.show(false);
        _climberTotalText.show(false);
        _coverGoat.show(false);
        _winUpToStar.show(false);
        _buttonAutoPlayStar.show(false);
        _buttonPlayStar.show(false);
        _buttonPlayCenterStar.show(false);
        _climberManHover.show(false);
        _snowManHover.show(false);
        _goatHover.show(false);
        _mapHover.show(false);
        _closeAutoMapHover.show(false);
        _windContainer_00.show(false);
        _windContainer_01.show(false);
        _windContainer_02.show(false);
        _climberManUnlockIcon.show(false);
        _snowManUnlockIcon.show(false);
        _goatManUnlockIcon.show(false);

        _birdsContainer.gotoAndPlay('Bird', 0.1, true);
        fadeInAndOutForBirds();
        _waterfall_00.gotoAndPlay('Waterfall', 0.1, true);
        _winBoxLight.gotoAndPlay('TreasureChestLight', 0.5, true);

        accListContainer.hideAllAccSprites();
        upListContainer.hideAllUpSprites();
        dnListContainer.hideAllDnSprites();
        gameLogoContainer.initialLogoSpine();
    };

    const updateIWText = function (currentPriceMap, IWPrizes) {
        const { IW } = currentPriceMap;
        for (let i = 0, len = IWPrizes.length; i < len; i++) {
            gr.lib['_awardGrid_'+IWPrizes[i]].setText(SKBeInstant.formatCurrency(IW[i]).formattedAmount);
        }
    };

    const updateWinMeterText = (value) => {
        const { _winsValue,  } = gr.lib;
        _winsValue.setText(SKBeInstant.formatCurrency(value).formattedAmount);
        gameUtils.fixMeter(gr);
    };

    const updateIWWinTextStyle = function(step){
        step = step < 10?'0'+step : step;
        gameUtils.setTextStyle(gr.lib['_awardGrid_'+step], textStyle.eInstantWin_win);
        gr.lib['_awardContainer_'+step].updateCurrentStyle({_top:-10});
    };

    const playAwardGridIdleAnimation = function(){
        this.ups.forEach((up) => {
            up = up < 10?'0'+up : up;
            gr.animMap['_idleLightFlash'+up].play(Infinity);
        });
        this.dns.forEach((dn) => {
            dn = dn < 10?'0'+dn : dn;
            gr.animMap['_idleLightFlash'+dn].play(Infinity);
        });
        this.mys.forEach((my) => {
            my = my < 10?'0'+my : my;
            gr.animMap['_mesteryIdle'+my].play();
            gr.animMap['_mesteryIdle'+my]._onComplete = () => {
                const myTimer = gr.getTimer().setTimeout(() => {
                    gr.animMap['_mesteryIdle'+my].play();
                }, 500);
                this.mysTimers.push(myTimer);
            };
        });
        this.bonus.forEach((b) => {
            b = b < 10?'0'+b : b;
            gr.lib['_awardGrid_'+b].gotoAndPlay('CaveBonus', 0.3, true);
        });
        this.xs.forEach((x) => {
            x = x < 10?'0'+x : x;
            gr.lib['_awardGrid_'+x].gotoAndPlay('SpinIcon', 0.25, true);
        });
        this.accs.forEach((acc) => {
            acc = acc < 10?'0'+acc : acc;
            gr.lib['_awardGridStar_'+acc].gotoAndPlay('StarsFlash', 0.5, true);
        });
    };

    const stopAwardGridIdleAnimation = function(){
        this.ups.forEach((up) => {
            up = up < 10?'0'+up : up;
            gr.animMap['_idleLightFlash'+up].stop();
        });
        this.dns.forEach((dn) => {
            dn = dn < 10?'0'+dn : dn;
            gr.animMap['_idleLightFlash'+dn].stop();
        });
        this.mys.forEach((my) => {
            my = my < 10?'0'+my : my;
            gr.animMap['_mesteryIdle'+my].stop();
        });
        this.mysTimers.forEach((timer) => {
            if(timer){ gr.getTimer().clearTimeout(timer); }
        });
        this.mysTimers = [];
        this.bonus.forEach((b) => {
            b = b < 10?'0'+b : b;
            gr.lib['_awardGrid_'+b].stopPlay();
        });
        this.xs.forEach((x) => {
            x = x < 10?'0'+x : x;
            gr.lib['_awardGrid_'+x].stopPlay();
        });
        this.accs.forEach((acc) => {
            acc = acc < 10?'0'+acc : acc;
            gr.lib['_awardGridStar_'+acc].stopPlay();
        });
    };

    const coinParticleAnimation = (TotalStep) => {
        const coinParticle = new Particle(
            gr.lib['_awardCoinParticle_'+TotalStep].pixiContainer,
            'coinOne', 
            [],
            coinParticleData.configuration,
            true,
            {startFrame: 1, endFrame: 11, isSingleNumFormat: false, frameRate: 30}
        );
        coinParticle.start();
        gr.getTimer().setTimeout(()=>{
            coinParticle.stop();
        },2000); 
    };

    const resetEwTextStyle = function(){
        for(let i = 0, len = this.awardIWPrize.length - 1; i < len; i++){
            gr.lib['_awardContainerBG_'+this.awardIWPrize[i]].setImage('instantWinLight01');
            gr.lib['_awardContainer_'+this.awardIWPrize[i]].updateCurrentStyle({_top:0});
            gameUtils.setTextStyle(gr.lib['_awardGrid_'+this.awardIWPrize[i]], textStyle.eInstantWin_nowin);
        }
    };
    
    const playStarAnimation = function() {
        const index = Math.floor(Math.random()*4);
        this.starsArray[index].show(true);
        this.starsArray[index].gotoAndPlay('StarsFlash', 0.5, false);
        this.starTimer = gr.getTimer().setTimeout(() => {
            playStarAnimation.call(this);
        }, 2000);
    };

    const stopStarAnimation = function(){
        if(this.starTimer){
            gr.getTimer().clearTimeout(this.starTimer);
            this.starTimer = null;
        }
    };

    const coinDownAnimation = function() {
        this.coinDownParticle = new Particle(
            gr.lib['_coinDownContainer'].pixiContainer, 
            'coinOne', 
            [],
            coinParticleData.configurationDown,
            true,
            {startFrame: 1, endFrame: 11, isSingleNumFormat: false, frameRate: 11}
        );
        this.coinDownParticle.start();
        this.coinDownParticleTimer = gr.getTimer().setTimeout(()=>{
            this.coinDownParticle.stopAndNotDestory();
            this.coinDownParticleTimer = gr.getTimer().setTimeout(()=>{
                this.coinDownParticle.stop();
            },4000); 
        },6000); 
    };

    const doReactionForClimberTotalText = (totalClimberStep) => {
        const { _climberTotalText, _climberTotalText01 } = gr.lib;
        if(gr.animMap._climberTotalTextAnimation){
            _climberTotalText.show(true);
            _climberTotalText.setText(totalClimberStep);
            gr.animMap._climberTotalTextAnimation.play();
            gr.animMap._climberTotalTextAnimation._onComplete = () => {
                _climberTotalText01.updateCurrentStyle({
                    _opacity: 1,
                    _transform: {
                        _scale: {
                            _x: 1,
                            _y: 1
                        }
                    }
                });
                _climberTotalText01.setText(totalClimberStep);
                _climberTotalText.show(false);
            };
        }else{
            _climberTotalText01.setText(totalClimberStep);
            _climberTotalText01.show(true);
            _climberTotalText.show(false);
        }
    };

    const updateIWTextWhenGIP = (step) => {
        updateIWWinTextStyle(step);
        gr.lib['_awardContainerBG_'+step].setImage('instantWinLight02');
    };

    const updateIWInAutoSpin = (value) => {
        const { _iwWinText, _iwWinCoins } = gr.lib;
        _iwWinText.setText(SKBeInstant.formatCurrency(value).formattedAmount);
        const coinParticle = new Particle(
            _iwWinCoins.pixiContainer,
            'coinOne', 
            [],
            coinParticleData.configurationAutoMap,
            true,
            {startFrame: 1, endFrame: 11, isSingleNumFormat: false, frameRate: 60}
        );
        coinParticle.start();
    };

    const showAndPlayWind = () => {
        const { _windContainer_00 } = gr.lib;
        _windContainer_00.show(true);
        _windContainer_00.gotoAndPlay('Wind02', 0.1, true);
    };
    
    const showAndPlaySnow = function(){
        const { _windContainer_01, _windContainer_02 } = gr.lib;
        _windContainer_01.show(true);
        _windContainer_02.show(true);
        _windContainer_01.gotoAndPlay('Wind', 0.2, false);
        _windContainer_01.onComplete = function(){ 
            this.gotoAndPlay('Wind', 0.2, false);
            this.onComplete = function(){
                this.onComplete = function(){ this.show(false);  };
                this.gotoAndPlay('Wind', 0.2, false);
            };
        };
        _windContainer_02.gotoAndPlay('WindSnow', 0.3, false);
        this.playSnowWindTimer = gr.getTimer().setTimeout(() => {
            showAndPlaySnow.call(this);
        }, 4500);
    };

    const resetGame = function(){
        const { 
            _windContainer_00,
            _windContainer_01,
            _windContainer_02
        } = gr.lib;
        _windContainer_00.show(false);
        _windContainer_00.stopPlay();
        _windContainer_01.show(false);
        _windContainer_02.show(false);
        if(_windContainer_01.pixiContainer.$sprite.playing){ _windContainer_01.stopPlay(); }
        if(_windContainer_02.pixiContainer.$sprite.playing){ _windContainer_02.stopPlay(); }
    };

    const winBoxErrorHandler = (defaultWinsValue) => {
        const { _winsValue} = gr.lib;
		_winsValue.setText(defaultWinsValue);
        gameUtils.fixMeter(gr);
    };

    return {
        showCoverClimberManAndPlay,
        showCoverSnowManAndPlay,
        hideTargetWinAward,
        updatedPrizeByPricePoint,
        updateIWText,
        updateWinMeterText,
        doMesteryReaction,
        showBaseGame,
        hideBaseGame,
        initialGameScene,
        updateIWWinTextStyle,
        playAwardGridIdleAnimation,
        coinParticleAnimation,
        resetEwTextStyle,
        stopAwardGridIdleAnimation,
        upToDestinationUIReaction,
        showCoverGoatAndPlay,
        playStarAnimation,
        stopStarAnimation,
        coinDownAnimation,
        doReactionForClimberTotalText,
        updateIWTextWhenGIP,
        updateIWInAutoSpin,
        showAndPlayWind,
        showAndPlaySnow,
        resetGame,
        winBoxErrorHandler
    };

});