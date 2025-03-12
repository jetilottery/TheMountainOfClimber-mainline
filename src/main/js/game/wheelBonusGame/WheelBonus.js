define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'com/pixijs/pixi',
    'com/mobx/mobx',
    'game/gladButton',
    'game/wheelBonusGame/wheelBonusContainer',
    'game/RotaryTable',
    'game/baseGame/container/accListContainer',
    'game/baseGame/container/dnListContainer',
    'game/baseGame/container/upListContainer',
    'game/baseGame/container/transitionContainer',
    'game/configController',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/Particle',
    'game/baseGame/snowParticleData',
], function(
    gr,
    loader,
    PIXI,
    mobx,
    GladButton,
    wheelBonusContainer,
    RotaryTable,
    accListContainer,
    dnListContainer,
    upListContainer,
    transitionContainer,
    configController,
    msgBus,
    resLib,
    gameUtils,
    audio,
    Particle,
    snowParticleData,
) {
    const {
        reaction
    } = mobx;
    const TRANS_BASE_TIMER = 2000;
    class WheelBonus {
        constructor(appStore) {
            this.appStore = appStore;
            this.bonusScene = 'wheelBonus';
            this.wheelButton = null;
            this.bonusType = 2;
            this.bonusWinType = '';
            this.bonusWinIndexFromMessUpData = 0;
            this.spineLights = [];
            this.textOriginPosition = [
                { top: 166, left: 270 },
                { top: 390, left: 276 },
                { top: 388, left: 48 },
                { top: 170, left: 56 }
            ];
            this.particleImageArray = [
                'SnowParticles',
                'SnowParticles02',
                'SnowParticles03'
            ];
            this.snowParticles = null;
            this.bgStarTimer = null;
            this.createRotaryPoint();
            this.bindReaction();
            msgBus.subscribe('tutorialIsShown', this.onTutorialIsShown.bind(this));
            msgBus.subscribe('tutorialIsHide', this.onTutorialIsHide.bind(this));
        }

        createAndStartSnowParticles() {
            const { _wheelSnowContainer } = gr.lib;
            this.snowParticles = new Particle(
                _wheelSnowContainer.pixiContainer,
                '',
                this.particleImageArray,
                snowParticleData.configuration3,
                false
            );
            _wheelSnowContainer.show(true);
            this.snowParticles.start();
        }

        cloneAnimation() {}

        defineAnimationComplete() {
            const { _baseGameScreen, _climberTotalContainer } = gr.lib;
            gr.animMap['_translateToBase_02']._onStart = () => {
                if (this.appStore.RDS.revealDataSave) {
                    this.appStore.RDS.revealDataSave[this.appStore.ticketID]['winBonus'] = false;
                    this.appStore.RDS.revealDataSave[this.appStore.ticketID]['bonusType'] = 0;
                }
                this.appStore.setOnceClimbeComplete(true);
                const { _opacity } = gr.lib._collect._currentStyle;
                if (_opacity !== 1) { gr.animMap._collectTransitonToBase.play(); }
                _baseGameScreen.updateCurrentStyle({ _opacity: 0 });
                _baseGameScreen.show(true);
                _climberTotalContainer.updateCurrentStyle({ _opacity: 0 });
                _climberTotalContainer.show(true);
            };
            gr.animMap['_translateToBase_02']._onComplete = () => {
                const { _wheelSnowContainer } = gr.lib;
                _wheelSnowContainer.show(false);
                this.snowParticles.stop();
                const { bonusWinIndexFromMessUpData, /*spineLights*/ } = this;
                gr.lib['_wheelWinLight_0' + bonusWinIndexFromMessUpData].show(false);
                gr.lib['_wheelWinLight_0' + bonusWinIndexFromMessUpData].stopPlay();
                gr.lib["_wheelTextContainer_0" + bonusWinIndexFromMessUpData].updateCurrentStyle({
                    _left: this.textOriginPosition[bonusWinIndexFromMessUpData].left,
                    _top: this.textOriginPosition[bonusWinIndexFromMessUpData].top,
                    _transform: {
                        _scale: {
                            _x: 1,
                            _y: 1
                        }
                    }
                });
                wheelBonusContainer.stopAllAnimation.call(this);
            };
            
        }

        onTutorialIsShown() {
            this.wheelButton.show(false);
        }

        onTutorialIsHide() {
            this.wheelButton.show(true);
        }

        createRotaryPoint() {
            this.rotaryPoint = new RotaryTable({
                sprite: gr.lib._wheelPoint,
                callback: () => {
                    audio.stopChannel(8);
                    wheelBonusContainer.stopPointLightAnimation();
                    gr.lib._wheelFlash.show(false);
                    gr.lib._wheelFlash.stopPlay();
                    wheelBonusContainer.doReactionForBonusWin.call(this, this.bonusWinType, this.bonusWinIndexFromMessUpData);
                },
                flash: gr.lib._wheelFlash
            });
        }

        completeBonusGame() {
            this.appStore.setGameScene('baseGame');
            gr.getTimer().setTimeout(() => { this.appStore.setGameIsInReveal(false); }, 2800);
        }

        setTextAndStyle() {
            const { _wheelButtonText } = gr.lib;
            gameUtils.setTextStyle(_wheelButtonText, configController.buttonStyle);
            _wheelButtonText.autoFontFitText = true;
            _wheelButtonText.setText(loader.i18n.Game.wheelSpin);
            for (let i = 0; i < 4; i++) { gr.lib['_wheelText_0' + i].autoFontFitText = true; }
        }

        setGladButton() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
            const { _wheelButton } = gr.lib;
            this.wheelButton = new GladButton(_wheelButton, "mainButton", scaleType);
            this.wheelButton.click(() => {
                audio.play('buy_ok', 4);
                wheelBonusContainer.hideRevealButton(this.wheelButton);
                msgBus.publish('disableButtonInfo');
                wheelBonusContainer.stopWheelUpAndDown(orientation);
                wheelBonusContainer.pointLightAnimation();
                this.rotaryPoint.begin();
                gr.lib._wheelFlash.show(true);
                gr.lib._wheelFlash.gotoAndPlay('PointerLight', 0.5, true);
                gr.getTimer().setTimeout(() => {
                    this.rotaryPoint.stop(this.bonusWinIndexFromMessUpData);
                }, 300);
                audio.play('compassSpin', 8);
            });
        }

        messUpRevealData(bonusRevealData) {
            let messUpRevealData = [];
            let randomNums = [];
            for (let i = 0, len = bonusRevealData.length; i < len; i++) {
                let randomIndex = Math.floor(Math.random() * 4);
                while ((function(randomNums, randomIndex) {
                        for (let j = 0; j < randomNums.length; j++) {
                            if (randomNums[j] === randomIndex) {
                                return true;
                            }
                        }
                        return false;
                    })(randomNums, randomIndex)) {
                    randomIndex = Math.floor(Math.random() * 4);
                }
                randomNums.push(randomIndex);
                messUpRevealData.push(bonusRevealData[randomIndex]);
            }
            return messUpRevealData;
        }

        getKeyFramIconPosition(index) {
            return gr.lib['_wheelPic_0' + index].toGlobal({ x: 0, y: 0 });
        }

        bindReaction() {
            reaction(
                () => this.appStore.SKBState,
                (SKBState) => {
                    switch (SKBState) {
                        case 'gameParametersUpdated':
                            {
                                this.setTextAndStyle();
                                this.setGladButton();
                                this.cloneAnimation();
                                this.defineAnimationComplete();
                                break;
                            }
                        case 'playerWantsPlayAgain':
                            {
                                break;
                            }
                        default:
                            break;
                    }
                }
            );
            reaction(
                () => this.appStore.gameCurrentScene,
                (gameCurrentScene) => {
                    const { SKBState, gameBonusType, RDSFlag } = this.appStore;
                    if (RDSFlag) {
                        if (gameCurrentScene === 'wheelBonus') {
                            wheelBonusContainer.initialWheelBonusScreen.call(this);
                            this.createAndStartSnowParticles();
                            const { _wheelBonusScreen, _collect } = gr.lib;
                            _collect.updateCurrentStyle({ _opacity: 0 });
                            _wheelBonusScreen.show(true);
                        } else {
                            wheelBonusContainer.hideWheelBonus();
                        }
                    } else {
                        if (SKBState === 'gameParametersUpdated') {
                            if (gameCurrentScene === 'wheelBonus') {
                                wheelBonusContainer.initialWheelBonusScreen.call(this);
                                this.createAndStartSnowParticles();
                                const { _wheelBonusScreen, _collect } = gr.lib;
                                _collect.updateCurrentStyle({ _opacity: 0 });
                                _wheelBonusScreen.show(true);
                            } else {
                                wheelBonusContainer.hideWheelBonus();
                            }
                        } else {
                            if (gameBonusType === this.bonusType) {
                                if (gameCurrentScene === 'baseGame') {
                                    let orientation;
                                    if (this.appStore.SKBeInstant.isSKB()) {
                                        orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                                    } else {
                                        orientation = this.appStore.SKBeInstant.getGameOrientation();
                                    }
                                    transitionContainer.translateToBaseGame(this.bonusType, orientation);
                                    gr.getTimer().setTimeout(() => {
                                        const { spinsLeft } = this.appStore;
                                        if (spinsLeft === 0) {
                                            this.appStore.setEndGame(true);
                                            return;
                                        }
                                    }, 2500);
                                } else {
                                    wheelBonusContainer.initialWheelBonusScreen.call(this);
                                    this.createAndStartSnowParticles();
                                }
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.bonusRevealData,
                () => {
                    const _messUpRevealData = this.messUpRevealData(this.appStore.bonusRevealData);
                    this.bonusWinType = this.appStore.bonusRevealData[0];
                    this.bonusWinIndexFromMessUpData = _messUpRevealData.indexOf(this.bonusWinType);
                    wheelBonusContainer.initialWheelBonusScene.call(this, _messUpRevealData);
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.upList,
                (upList) => {
                    const { gameCurrentScene, RDSFlag } = this.appStore;
                    if (gameCurrentScene === this.bonusScene) {
                        if (RDSFlag) {
                            upListContainer.initialUpWhenGIP(upList);
                        } else {
                            const keyIconFramePosition = this.getKeyFramIconPosition(this.bonusWinIndexFromMessUpData);
                            const upReactionComplete = () => {
                                this.appStore.baseGameStore.addUpListForDress();
                                if (upList >= 4) {
                                    audio.play('rewardSparkle', 3);
                                    const { gamePriceMap, currentPricePoint } = this.appStore;
                                    upListContainer.updateUpWinTextStyle(configController.winUpAndDnTextStyle);
                                    this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Up']);
                                }
                                gr.getTimer().setTimeout(() => { this.completeBonusGame(); }, TRANS_BASE_TIMER);
                            };
                            upListContainer.doUpReaction.call(
                                this,
                                upList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                upReactionComplete
                            );
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.dnList,
                (dnList) => {
                    const { gameCurrentScene, RDSFlag } = this.appStore;
                    if (gameCurrentScene === this.bonusScene) {
                        if (RDSFlag) {
                            dnListContainer.initialDnWhenGIP(dnList);
                        } else {
                            const keyIconFramePosition = this.getKeyFramIconPosition(this.bonusWinIndexFromMessUpData);
                            const dnReactionComplete = () => {
                                this.appStore.baseGameStore.addDnListForDress();
                                if (dnList >= 4) {
                                    audio.play('rewardSparkle', 3);
                                    const { gamePriceMap, currentPricePoint } = this.appStore;
                                    dnListContainer.updateDnWinTextStyle(configController.winUpAndDnTextStyle);
                                    this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Dn']);
                                }
                                gr.getTimer().setTimeout(() => { this.completeBonusGame(); }, TRANS_BASE_TIMER);
                            };
                            dnListContainer.doDnReaction.call(
                                this,
                                dnList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                dnReactionComplete
                            );
                        }
                    }
                }
            );
            reaction(
                () => this.appStore.baseGameStore.data.accList,
                (accList) => {
                    const { gameCurrentScene, RDSFlag } = this.appStore;
                    if (gameCurrentScene === this.bonusScene) {
                        if (RDSFlag) {
                            accListContainer.initialAccWhenGIP(accList);
                        } else {
                            const keyIconFramePosition = this.getKeyFramIconPosition(this.bonusWinIndexFromMessUpData);
                            const accReactionComplete = () => {
                                this.appStore.baseGameStore.addAccListForDress();
                                if (accList >= 4) {
                                    const { gamePriceMap, currentPricePoint } = this.appStore;
                                    accListContainer.updateAccWinTextStyle(accList, configController.winUpAndDnTextStyle);
                                    if (isNaN(gamePriceMap[currentPricePoint]['Acc'][accList - 2])) {
                                        this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Acc'][accList - 1]);
                                    } else {
                                        this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Acc'][accList - 1] - gamePriceMap[currentPricePoint]['Acc'][accList - 2]);
                                    }
                                }
                                gr.getTimer().setTimeout(() => { this.completeBonusGame(); }, TRANS_BASE_TIMER);
                            };
                            accListContainer.doAccReaction.call(
                                this,
                                accList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                accReactionComplete
                            );
                        }
                    }
                }
            );
        }
    }

    return WheelBonus;
});