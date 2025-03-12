define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/baseGame/baseGameContainer',
    'game/baseGame/drawLine',
    'game/tweenIconUtil',
    'game/Particle',
    "skbJet/component/gladPixiRenderer/Sprite",
    'game/baseGame/coinParticleData',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/baseGame/container/rollAndSlideDownContainer',
    'game/gameConfig/gameConfiguration',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/baseGame/container/backGroundImage',
    'game/baseGame/container/birdsContainer',
], function (
    gr, 
    baseGameContainer, 
    drawLine, 
    tweenIconUtil, 
    Particle, 
    Sprite, 
    coinParticleData,
    SKBeInstant,
    rollAndSlideDownContainer,
    gameConfiguration,
    audio,
    backGroundImage,
    birdsContainer
    ) {
    /**
     * 
     * @param {Object} onceScenarioData 
     *  climbeStep: "9"
        currentTotalStep: "42"
        nextCurrentTotalStep: "50"
        nextTargetWin: "0"
        targetWin: "U"
    */
    const _freedGameInteractive = function () {
        this.appStore.setGameIsInReveal(false);
        this.appStore.setOnceClimbeComplete(true);
    };

    const _freedGameInteractiveAutoReveal = function(){
        this.appStore.setOnceClimbeComplete(true);
        this.appStore.decrementSpinsLeft();
    };

    const _judgeEndGame = function(){
        if(this.appStore.spinsLeft === 0){
            return true;
        }
        return false;
    };

    const _doFinalDnReaction = function(){
        audio.play("prizeSelected", 5);
        this.appStore.baseGameStore.addDnList();
        if(_judgeEndGame.call(this)){
            gr.getTimer().setTimeout(() => {
                this.appStore.setOnceClimbeComplete(true);
                this.appStore.setEndGame(true);
            }, 1800);
        }else{
            gr.getTimer().setTimeout(() => {
                _freedGameInteractive.call(this);
            }, 1300);
        }
    };

    
    const _doFinalAccReaction = function(){
        audio.play("prizeSelected", 5);
        this.appStore.baseGameStore.addAccList();
        if(_judgeEndGame.call(this)){
            gr.getTimer().setTimeout(() => {
                this.appStore.setOnceClimbeComplete(true);
                this.appStore.setEndGame(true);
            }, 1800);
        }else{
            gr.getTimer().setTimeout(() => {
                _freedGameInteractive.call(this);
            }, 1300);
        }
    };
        
    const _doFinalUpReaction = function(){
        audio.play("prizeSelected", 5);
        this.appStore.baseGameStore.addUpList();
        if(_judgeEndGame.call(this)){
            gr.getTimer().setTimeout(() => {
                this.appStore.setOnceClimbeComplete(true);
                this.appStore.setEndGame(true);
            }, 1800);
        }else{
            gr.getTimer().setTimeout(() => {
                _freedGameInteractive.call(this);
            }, 1300);
        }
    };

    const _doFinalXReaction = function(){
        audio.play("prizeSelected", 5);
        this.appStore.incrementSpinsLeft();
    };

    const _doEwForMestery = function(value){
        const { _winEwText, _mesteryEwCoin } = gr.lib;
        _winEwText.autoFontFitText = true;
        _winEwText.setText(SKBeInstant.formatCurrency(value).formattedAmount);
        _winEwText.show(true);        
        const coinParticle = new Particle(
            _mesteryEwCoin.pixiContainer, 
            'coinOne', 
            [],
            coinParticleData.configuration,
            true,
            {startFrame: 1, endFrame: 11, isSingleNumFormat: false, frameRate: 11}
        );
        coinParticle.start();
        audio.play('winCoins',1);
        gr.getTimer().setTimeout(()=>{
            coinParticle.stop();
            _winEwText.show(false);
        },2000);
    };

	const _parseRound2ForMestery = function(mysteryWin){
        switch (mysteryWin) {
            case 'D': 
                _doFinalDnReaction.call(this);
                break;
            case 'U': 
                _doFinalUpReaction.call(this);
                break;
            case 'A':
                _doFinalAccReaction.call(this);
                break;
            case 'X':
                _doFinalXReaction.call(this);
                break;
            default: {
                let { IW } = this.appStore.currentPriceMap;
                IW = IW.slice().reverse();
                _doEwForMestery(IW[mysteryWin - 1]);
                this.appStore.setGameTotalWin(IW[mysteryWin - 1]);
                if(_judgeEndGame.call(this)){
                    gr.getTimer().setTimeout(() => {
                        this.appStore.setOnceClimbeComplete(true);
                        this.appStore.setEndGame(true);
                    }, 1800);
                }else{
                    _freedGameInteractive.call(this);
                }
                break;
            }
        }
    };

    const _parseRound3ForUpAndDown = function(targetValue, nextCurrentTotalStep){
        const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
        this.currentClimberSpine.play(standing, 1, true);
        const firstStr = targetValue.slice(0,1);
        switch (firstStr) {
            case 'A':{
                baseGameContainer.hideTargetWinAward(nextCurrentTotalStep);
                _doFinalAccReaction.call(this);
                break;
            }
            case 'D':{
                baseGameContainer.hideTargetWinAward(nextCurrentTotalStep);
                _doFinalDnReaction.call(this);
                break;
            }
            case 'U':{
                baseGameContainer.hideTargetWinAward(nextCurrentTotalStep);
                _doFinalUpReaction.call(this);
                break;  
            }          
            case 'X':{
                baseGameContainer.hideTargetWinAward(nextCurrentTotalStep);
                _doFinalXReaction.call(this);
                break;
            }            
            case 'B':{
                const _bonusRevealData = targetValue.slice(1).split('');
                gr.getTimer().setTimeout(() => {
                    // Init Bonus reveal data
                    this.appStore.setGameBonusData(_bonusRevealData);
                    const type = Math.floor(Math.random() * 2) + 1;
                    if(type === 1){
                        this.appStore.setGameBonusType(1);
                        this.appStore.setGameScene('pickBonus');
                    }else{
                        this.appStore.setGameBonusType(2);
                        this.appStore.setGameScene('wheelBonus');
                    }
                }, 500);
                break;
            }
            case 'M':{
                baseGameContainer.hideTargetWinAward(nextCurrentTotalStep);
                audio.play("prizeShuffle", 7);
                baseGameContainer.doMesteryReaction(() => {
                    _parseRound2ForMestery.call(this, targetValue.slice(1));
                });
                break;
			}
            default: {
                let { IW } = this.appStore.currentPriceMap;
                IW = IW.slice().reverse();
                const instantWinLevel = targetValue.slice(1);
                //gr.animMap['_winIWScaleAnimation_'+nextCurrentTotalStep].play();
                baseGameContainer.updateIWWinTextStyle(nextCurrentTotalStep);
                if(nextCurrentTotalStep >= 80){
                    this.awardBoxSpine.skeleton.setToSetupPose();
                    this.awardBoxSpine.update(0);
                    this.awardBoxSpine.state.setAnimation(0, '05TreasureChest02', true);
                    this.awardBoxSpine.state.timeScale = 1;
                }else{
                    gr.lib['_awardContainerBG_'+nextCurrentTotalStep].setImage('instantWinLight02');
                    audio.play('winCoins',1);
                    baseGameContainer.coinParticleAnimation(nextCurrentTotalStep);
                }
                this.appStore.setGameTotalWin(IW[instantWinLevel - 1]);
                if(_judgeEndGame.call(this)){
                    gr.getTimer().setTimeout(() => {
                        this.appStore.setOnceClimbeComplete(true);
                        this.appStore.setEndGame(true);
                    }, 1800);
                }else{
                    _freedGameInteractive.call(this);
                }
                break;
            }
        }
    };

    const _parseRound2ForUp = function (flyUpNum, nextTargetValue, nextCurrentTotalStep) {
        if((this.climberMan && this.climberMan.getVisible())){
            const { stepLineLeft, stepLineHeight } = this.mountain;
            let { totalClimberStep } = this.appStore.baseGameStore.data;
            let orientation;
            if(this.appStore.SKBeInstant.isSKB()){
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            }else{
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            let x, y;
            x =  gameConfiguration[orientation].climberManThrowLineDiscrepancy.x;
            y =  gameConfiguration[orientation].climberManThrowLineDiscrepancy.y;
            const endx = stepLineLeft[totalClimberStep + flyUpNum - 1] - stepLineLeft[totalClimberStep - 1] + x,
                endy = y - stepLineHeight * (flyUpNum - 1);
            const throwLineComplete = () => {
                totalClimberStep+=flyUpNum;
                this.appStore.baseGameStore.setTotalClimberStep(totalClimberStep);
                audio.play('grappling_RisingAlongWIthTheRope', 7);
                drawLine.flyHookAnimation.call(this, endx, endy, flyUpNum, () => {
                    baseGameContainer.upToDestinationUIReaction.call(this);
                    if(isNaN(nextTargetValue)){
                        gr.getTimer().setTimeout(() => {
                            _parseRound3ForUpAndDown.call(this, nextTargetValue, nextCurrentTotalStep);
                        }, 200);
                    }else{
                        if(_judgeEndGame.call(this)){
                            this.appStore.setOnceClimbeComplete(true);
                            this.appStore.setEndGame(true); 
                        }else{
                            _freedGameInteractive.call(this);
                        }
                    }
                });
            };
            this.mountain.updateFlyUp(flyUpNum);
            this.climberMan.hide();
            baseGameContainer.showCoverClimberManAndPlay.call(this, endx, endy, throwLineComplete, flyUpNum);
            audio.play("grapplingSpin", 7, true);
        }else if((this.snowMan && this.snowMan.getVisible())){
            const throwLineComplete = () => {
                const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
                const { _coverSnowMan } = gr.lib;
                _coverSnowMan.show(false);
                _coverSnowMan.gotoAndStop(0);
                this.currentClimberSpine.play(standing, 1, true);
                if(isNaN(nextTargetValue)){
                    gr.getTimer().setTimeout(() => {
                        _parseRound3ForUpAndDown.call(this, nextTargetValue, nextCurrentTotalStep);
                    }, 200);
                }else{
                    if(_judgeEndGame.call(this)){
                        this.appStore.setOnceClimbeComplete(true);
                        this.appStore.setEndGame(true); 
                    }else{
                        _freedGameInteractive.call(this);
                    }
                }
            };
            baseGameContainer.showCoverSnowManAndPlay.call(this, throwLineComplete, flyUpNum);
        }else{
            const throwLineComplete = () => {
                const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
                const { _coverGoat } = gr.lib;
                _coverGoat.show(false);
                _coverGoat.gotoAndStop(0);
                this.goat.spineContianer.rotation = 0;
                this.currentClimberSpine.play(standing, 1, true);
                if(isNaN(nextTargetValue)){
                    gr.getTimer().setTimeout(() => {
                        _parseRound3ForUpAndDown.call(this, nextTargetValue, nextCurrentTotalStep);
                    }, 200);
                }else{
                    if(_judgeEndGame.call(this)){
                        this.appStore.setOnceClimbeComplete(true);
                        this.appStore.setEndGame(true); 
                    }else{
                        _freedGameInteractive.call(this);
                    }
                }
            };
            baseGameContainer.showCoverGoatAndPlay.call(this, throwLineComplete, flyUpNum);
        }
    };

    const _parseRound2ForDn = function(rollDownNum, nextTargetWin, nextCurrentTotalStep){  
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        } 
        this.mountain.rollDown(rollDownNum, () => {
            this.appStore.baseGameStore.setTotalClimberStep(nextCurrentTotalStep);
            this.currentClimberSpine.show();
            /* if(rollDownNum < 5){
                rollAndSlideDownContainer.stopRollSlideAnimation();
            } */
            if(isNaN(nextTargetWin)){
                gr.getTimer().setTimeout(() => {
                    _parseRound3ForUpAndDown.call(this, nextTargetWin, nextCurrentTotalStep);
                }, 200);
            }else{     
                if(_judgeEndGame.call(this)){
                    this.appStore.setOnceClimbeComplete(true);
                    this.appStore.setEndGame(true);
                }else{
                    _freedGameInteractive.call(this);
                }
            } 
        }, false);
        this.currentClimberSpine.hide();
        rollAndSlideDownContainer.showRollDownAndPlay_snowScene.call(this, rollDownNum);
        backGroundImage.backGroundFlyUp(rollDownNum, orientation);
        birdsContainer.birdsFlyUp(rollDownNum, orientation);
        /* if(rollDownNum>=5){
            if(this.appStore.baseGameStore.data.totalClimberStep > 18){
                rollAndSlideDownContainer.showRollDownAndPlay_snowScene.call(this, rollDownNum);
            }else{
                rollAndSlideDownContainer.showRollDownAndPlay_stoneScene.call(this, rollDownNum);
            }
        }else{
            rollAndSlideDownContainer.slide_snowScene();
        } */
    };

    const _parseRound1Scenario = function (currentPlayScenario) {
        const { targetWin, currentTotalStep } = currentPlayScenario;
        this.revealAward.add(currentTotalStep);
        if(!isNaN(targetWin)){
            return () => {        
                const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
                this.currentClimberSpine.play(standing, 1, true);
                if(_judgeEndGame.call(this)){
                    this.appStore.setOnceClimbeComplete(true);
                    this.appStore.setEndGame(true);
                }else{
                    _freedGameInteractive.call(this);
                }
            };
        }else{
            const winType = targetWin.slice(0, 1);
            return () => {
                const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
                this.currentClimberSpine.play(standing, 1, true);
                switch (winType) {
                    case 'M': {
                        const mesteryWin = targetWin.slice(1);
                        baseGameContainer.hideTargetWinAward(currentTotalStep);
                        audio.play("prizeShuffle", 7);
                        baseGameContainer.doMesteryReaction(() => {
                            _parseRound2ForMestery.call(this, mesteryWin);
                        });
                        break;
                    }
                    case 'A': {
                        baseGameContainer.hideTargetWinAward(currentTotalStep);
                        _doFinalAccReaction.call(this);
                        break;
                    }
                    case 'B': {
                        const _bonusRevealData = targetWin.slice(1).split('');
                        gr.getTimer().setTimeout(() => {
                            // Init Bonus reveal data
                            this.appStore.setGameBonusData(_bonusRevealData);
                            const type = Math.floor(Math.random() * 2) + 1;
                            //TODO
                            if(type === 1){
                                this.appStore.setGameBonusType(1);
                                this.appStore.setGameScene('pickBonus');
                            }else{
                                this.appStore.setGameBonusType(2);
                                this.appStore.setGameScene('wheelBonus');
                            }
                        }, 500);
                        break;
                    }
                    case 'D': {
                        const { nextTargetWin, nextCurrentTotalStep } = currentPlayScenario;
                        const rollDownNum = currentTotalStep - nextCurrentTotalStep;
                        baseGameContainer.hideTargetWinAward(currentTotalStep);
                        this.revealAward.add(nextCurrentTotalStep);
                        audio.play("prizeSelected", 5);
                        this.appStore.baseGameStore.addDnList();
                        gr.getTimer().setTimeout(() => {
                            _parseRound2ForDn.call(this, rollDownNum, nextTargetWin, nextCurrentTotalStep);
                        }, 1000);
                        break;
                    }
                    case 'U': {
                        const { nextTargetWin, nextCurrentTotalStep } = currentPlayScenario;
                        const flyUpNum = nextCurrentTotalStep - currentTotalStep;
                        baseGameContainer.hideTargetWinAward(currentTotalStep);
                        this.revealAward.add(nextCurrentTotalStep);
                        audio.play("prizeSelected", 5);
                        this.appStore.baseGameStore.addUpList();
                        gr.getTimer().setTimeout(() => {
                            _parseRound2ForUp.call(this, flyUpNum, nextTargetWin, nextCurrentTotalStep);
                        }, 1000);
                        break;
                    }
                    case 'X':
                        baseGameContainer.hideTargetWinAward(currentTotalStep);
                        _doFinalXReaction.call(this);
                        break;
                    default:{
                        let { IW } = this.appStore.currentPriceMap;
                        IW = IW.slice().reverse();
                        const instantWinLevel = targetWin.slice(1);
                        baseGameContainer.updateIWWinTextStyle(currentTotalStep);
                        if(currentTotalStep >= 80){
                            const { win } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
                            this.awardBoxSpine.state.setAnimation(0, '05TreasureChest02', true);
                            this.awardBoxSpine.state.timeScale = 0.8;
                            gr.getTimer().setTimeout(() => {
                                gr.animMap._winTopAwardHillMove.play();
                                this.currentClimberSpine.play(win, 0.6, true);
                            }, 200);
                        }else{
                            gr.lib['_awardContainerBG_'+currentTotalStep].setImage('instantWinLight02');
                            audio.play('winCoins',1);
                            baseGameContainer.coinParticleAnimation(currentTotalStep);
                        }
                        this.appStore.setGameTotalWin(IW[instantWinLevel - 1]);        
                        if(_judgeEndGame.call(this)){
                            gr.getTimer().setTimeout(() => {
                                this.appStore.setOnceClimbeComplete(true);
                                this.appStore.setEndGame(true);
                            }, 1800);
                        }else{
                            _freedGameInteractive.call(this);
                        }
                        break;
                    }
                }
            };
        }
    };
    
    function doScenarioReact(currentPlayScenario) {
        if(!currentPlayScenario){return;}
        if(this.appStore.RDSFlag){ return; }
        this.appStore.setOnceClimbeComplete(false);
        const { climbeStep } = currentPlayScenario;
        const { _spinsLeftN01 } = gr.lib;
        _spinsLeftN01.setText('');
        this.spinsLeftSpine.state.setAnimation(0, 'spinsA01', true);
        this.spinsLeftSpine.state.timeScale = 2;
        gr.getTimer().setTimeout(() => {
            this.spinsLeftSpine.state.setAnimation(0, 'spinsA02', true);
            this.spinsLeftSpine.state.timeScale = 1;
            _spinsLeftN01.setText(climbeStep);
            gr.getTimer().setTimeout(() => {
                const climbeCompleteReact = _parseRound1Scenario.call(this, currentPlayScenario);
                this.mountain.moveDownStepByStep(climbeStep, climbeCompleteReact);
            },100);
        }, 600);
    }
    /**
     * @description AutpPlay Game
     * @param {*} currentPlayScenario 
     */
    const _autoPointerTween = (moveSteps, moveCompleteCallback, direction, lineStep) => {
        const { _autoPointer, _iwWinContainer } = gr.lib;
        let endCoord = { x: 0, y: 0 };
        let startCoord = _autoPointer.toGlobal({ x: 0, y: 0 });
        let iw_y = _iwWinContainer._currentStyle._top;
        startCoord.x += _autoPointer._currentStyle._width/2;
        startCoord.y += _autoPointer._currentStyle._height/2;
        endCoord.x = startCoord.x;
        endCoord.y = startCoord.y;
        if(direction){
            endCoord.y -= moveSteps * lineStep;
            iw_y -= moveSteps * lineStep;
        }else{
            endCoord.y += moveSteps * lineStep;
            iw_y += moveSteps * lineStep;
        }
        _iwWinContainer.updateCurrentStyle({_top: iw_y});
        tweenIconUtil.tweenAutoPointerAnimation(startCoord, endCoord, moveCompleteCallback);
        audio.play("climb", 9);
    };

    const _doFinalDnReactionAutoReveal = function(autoSpeed){
        this.appStore.baseGameStore.addDnList();
        gr.getTimer().setTimeout(() => {
            if(_judgeEndGame.call(this)){
                this.autoPlayTimer =gr.getTimer().setTimeout(() => {
                    this.autoPlayTimer = null;
                    this.appStore.setEndGame(true);
                }, 1500);
                return;
            }
            _freedGameInteractiveAutoReveal.call(this);
        }, autoSpeed);
    };

    const _doFinalUpReactionAutoReveal = function(autoSpeed){
        this.appStore.baseGameStore.addUpList();  
        gr.getTimer().setTimeout(() => {
            if(_judgeEndGame.call(this)){
                this.autoPlayTimer =gr.getTimer().setTimeout(() => {
                    this.autoPlayTimer = null;
                    this.appStore.setEndGame(true);
                }, 1500);
                return;
            }
            _freedGameInteractiveAutoReveal.call(this);
        }, autoSpeed);  
    };

    const _doFinalAccReactionAutoReveal = function(autoSpeed){
        this.appStore.baseGameStore.addAccList();
        gr.getTimer().setTimeout(() => {
            if(_judgeEndGame.call(this)){
                this.autoPlayTimer = gr.getTimer().setTimeout(() => {
                    this.autoPlayTimer = null;
                    this.appStore.setEndGame(true);
                }, 1500);
                return;
            }
            _freedGameInteractiveAutoReveal.call(this);
        }, autoSpeed);
    };

    const _parseFinalForAutoReveal = function(winFinal, autoSpeed){
        const firstStr = winFinal.slice(0,1);
        switch (firstStr) {
            case 'M': {
                const type = winFinal.slice(1); 
                _parseFinalForAutoReveal.call(this, type, autoSpeed);
                break;
            }
            case 'D': {
                _doFinalDnReactionAutoReveal.call(this, autoSpeed);
                break;
            }
            case 'U': {
                _doFinalUpReactionAutoReveal.call(this, autoSpeed);   
                break;
            }
            case 'A':{ 
                _doFinalAccReactionAutoReveal.call(this, autoSpeed);
                break;
            }
            case 'B':{
                const _bonusWin = winFinal.slice(1).split('')[0];
                _parseFinalForAutoReveal.call(this, _bonusWin, autoSpeed); 
                break;
            }  
            case 'X':{
                this.appStore.incrementSpinsLeft();  
                gr.getTimer().setTimeout(() => {
                    if(_judgeEndGame.call(this)){
                        this.appStore.setEndGame(true);
                        return;
                    }
                    _freedGameInteractiveAutoReveal.call(this);
                }, autoSpeed);   
                break;
            }            
            case 'I':{
                let { IW } = this.appStore.currentPriceMap;
                IW = IW.slice().reverse();
                const instantWinLevel = winFinal.slice(1,2);
                baseGameContainer.updateIWInAutoSpin(IW[instantWinLevel - 1]);
                audio.play('winCoins',1);
                gr.getTimer().setTimeout(() => {
                    this.autoPlayTimer = gr.getTimer().setTimeout(() => {
                        this.autoPlayTimer = null;
                        if(_judgeEndGame.call(this)){
                            this.appStore.setEndGame(true);
                            return;
                        }
                        _freedGameInteractiveAutoReveal.call(this);
                    }, autoSpeed);
                    this.appStore.setGameTotalWin(IW[instantWinLevel - 1]);
                }, 1000);
                break;
            }
            default: {
                let { IW } = this.appStore.currentPriceMap;
                IW = IW.slice().reverse();
                baseGameContainer.updateIWInAutoSpin(IW[firstStr - 1]);
                audio.play('winCoins',1);
                gr.getTimer().setTimeout(() => {
                    this.autoPlayTimer = gr.getTimer().setTimeout(() => {
                        this.autoPlayTimer = null;
                        if(_judgeEndGame.call(this)){
                            this.appStore.setEndGame(true);
                            return;
                        }
                        _freedGameInteractiveAutoReveal.call(this);
                    }, autoSpeed);
                    this.appStore.setGameTotalWin(IW[firstStr - 1]);
                }, 1000);
                break;
            }
        }
    };

    const _parseRound1ScenarioAutoReaveal = function (currentPlayScenario, lineStep, autoSpeed) {
        const { targetWin, currentTotalStep } = currentPlayScenario;
        this.revealAward.add(currentTotalStep);
        if(!isNaN(targetWin)){
            return () => {
                if(_judgeEndGame.call(this)){
                    this.appStore.setEndGame(true);
                    return;
                }
                _freedGameInteractiveAutoReveal.call(this);
            };
        }else{
            const winType = targetWin.slice(0, 1);
            return () => {
                switch (winType) {
                    case 'M': {
                        const mysteryWin = targetWin.slice(1);
                        _parseFinalForAutoReveal.call(this, mysteryWin, autoSpeed);
                        break;
                    }
                    case 'A': {
                        _doFinalAccReactionAutoReveal.call(this, autoSpeed);
                        break;
                    }
                    case 'B': {
                        _parseFinalForAutoReveal.call(this, targetWin, autoSpeed);
                        break;
                    }
                    case 'D': {
                        this.appStore.baseGameStore.addDnList();
                        const { nextTargetWin, nextCurrentTotalStep } = currentPlayScenario;
                        this.revealAward.add(nextCurrentTotalStep);
                        const rollDownNum = currentTotalStep - nextCurrentTotalStep;
                        gr.getTimer().setTimeout(()=>{
                            this.appStore.baseGameStore.setTotalClimberStep(nextCurrentTotalStep);
                            _autoPointerTween(rollDownNum, ()=>{
                                if(nextTargetWin&&nextTargetWin!=='0'){
                                    _parseFinalForAutoReveal.call(this, nextTargetWin, autoSpeed); 
                                }else{
                                    if(_judgeEndGame.call(this)){
                                        this.appStore.setEndGame(true);
                                        return;
                                    }
                                    _freedGameInteractiveAutoReveal.call(this);
                                }
                            }, false, lineStep);
                        },500);
                        break;
                    }
                    case 'U': {
                        this.appStore.baseGameStore.addUpList();
                        const { nextTargetWin, nextCurrentTotalStep } = currentPlayScenario;
                        this.revealAward.add(nextCurrentTotalStep);
                        const flyUpNum = nextCurrentTotalStep - currentTotalStep;
                        gr.getTimer().setTimeout(()=>{
                            this.appStore.baseGameStore.setTotalClimberStep(nextCurrentTotalStep);
                            _autoPointerTween(flyUpNum, ()=>{
                                if(nextTargetWin&&nextTargetWin!=='0'){
                                    _parseFinalForAutoReveal.call(this, nextTargetWin, autoSpeed); 
                                }else{
                                    if(_judgeEndGame.call(this)){
                                        this.appStore.setEndGame(true);
                                        return;
                                    }
                                    _freedGameInteractiveAutoReveal.call(this);
                                }
                            }, true, lineStep);
                        },500);
                        break;
                    }
                    case 'X':{
                            this.appStore.incrementSpinsLeft();
                            gr.getTimer().setTimeout(() => {
                                _freedGameInteractiveAutoReveal.call(this);
                            }, autoSpeed);
                        break;
                    }
                    default:{
                        let { IW } = this.appStore.currentPriceMap;  
                        IW = IW.slice().reverse();
                        const instantWinLevel = targetWin.slice(1);
                        baseGameContainer.updateIWInAutoSpin(IW[instantWinLevel - 1]);
                        audio.play('winCoins',1);
                        gr.getTimer().setTimeout(() => {
                            this.autoPlayTimer = gr.getTimer().setTimeout(() => {
                                this.autoPlayTimer = null;
                                if(_judgeEndGame.call(this)){
                                    this.appStore.setEndGame(true);
                                    return;
                                }
                                _freedGameInteractiveAutoReveal.call(this);
                            }, autoSpeed);
                            this.appStore.setGameTotalWin(IW[instantWinLevel - 1]);
                        }, 1000);
                        break;
                    }
                }
            };
        }
    };

    function doScenarioReactForAutoReveal(currentPlayScenario, autoSpeed){
        if(!currentPlayScenario){return;}
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        }
        const lineStep = gameConfiguration[orientation].lineStep;
        const { climbeStep } = currentPlayScenario;
        const { _spinsLeftN01, _iwWinText } = gr.lib;
        _spinsLeftN01.setText(climbeStep);
        _iwWinText.setText('');
        const climbeCompleteReact = _parseRound1ScenarioAutoReaveal.call(this, currentPlayScenario, lineStep, autoSpeed);
        _autoPointerTween(climbeStep, climbeCompleteReact, true, lineStep);
        const { totalClimberStep } = this.appStore.baseGameStore.data;
        this.appStore.baseGameStore.setTotalClimberStep(climbeStep + totalClimberStep);
    }

    

    return {
        doScenarioReact,
        doScenarioReactForAutoReveal
    };
});