define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'com/mobx/mobx',
    'game/pickBonusGame/pickBonusContainer',
    'game/baseGame/container/transitionContainer',
    'game/baseGame/container/accListContainer',
    'game/baseGame/container/dnListContainer',
    'game/baseGame/container/upListContainer',
    'game/configController',
    'game/pickBonusGame/config',
    'game/gameUtils',
    'skbJet/component/resourceLoader/resourceLib',
    'com/pixijs/pixi',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',

], function(
    gr,
    loader,
    mobx,
    pickBonusContainer,
    transitionContainer,
    accListContainer,
    dnListContainer,
    upListContainer,
    configController,
    config,
    gameUtils,
    resLib,
    PIXI,
    audio
) {
    const { reaction } = mobx;
    const TRANS_BASE_TIMER = 2000;
    class PickBonus {
        constructor(appStore) {
            this.appStore = appStore;
            this.bonusScene = 'pickBonus';
            this.bonusType = 1;
            this.bonusWinType = '';
            this.stoneFlashTimer = [];
            this.stoneFlashBeginTimer = [];
            this.clickGraphicsArea = [];
            this.preventStoneFlashTimer = null;
            this.winBonusIndex = 0;
            this.bindReaction();
            this.createHitArea();
            this.spineLights = [];
        }

        initialSpine(index) {
            let localRect;
            const spineLight = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
            spineLight.skeleton.setToSetupPose();
            spineLight.update(0);
            gr.lib['_pickWinContainerBack_0' + index + '_03'].pixiContainer.addChild(spineLight);
            localRect = spineLight.getLocalBounds();
            spineLight.position.set(-localRect.x, -localRect.y);
            spineLight.state.timeScale = 1;
            this.spineLights[index] = spineLight;
        }

        cloneAnimation() {
            let numberNameList,
                AnimationName;
            for (let i = 0; i < 4; i++) {
                numberNameList = ['_stone_0' + i];
                AnimationName = '_stoneAnimation_0' + i;
                gr.animMap._stoneAnimation.clone(numberNameList, AnimationName);
                numberNameList = ['_pickText_0' + i];
                AnimationName = '_pickTextZoomIn_' + i;
                gr.animMap._scaleBonusTextWin.clone(numberNameList, AnimationName);
            }
            numberNameList = ['_pickBonusScreen'];
            AnimationName = '_pickBonusShock';
            gr.animMap._gameShock.clone(numberNameList, AnimationName);
        }

        defineAnimationComplete() {
            for (let i = 0; i < 4; i++) {
                gr.animMap['_stoneAnimation_0' + i]._onComplete = () => {
                    const timer = Math.floor(Math.random() * 400) + 800;
                    this.stoneFlashTimer[i] = gr.getTimer().setTimeout(() => {
                        gr.animMap['_stoneAnimation_0' + i].play();
                    }, timer);
                };
                gr.animMap['_stoneAnimation_0' + i]._onEnd = () => {
                    gr.lib['_stone_0' + i].updateCurrentStyle({ _transform: { _rotate: 0 } });
                };
                gr.lib['_pickWinContainerFront_0' + i + '_00'].onComplete = function() {
                    this.show(false);
                };
                gr.lib['_pickWinContainerFront_0' + i + '_01'].onComplete = function() {
                    this.show(false);
                };
                gr.lib['_pickWinContainerBack_0' + i + '_00'].onComplete = function() {
                    this.show(false);
                };
            }
            gr.animMap['_translateToBase_01']._onStart = () => {
                if (this.appStore.RDS.revealDataSave) {
                    this.appStore.RDS.revealDataSave[this.appStore.ticketID]['winBonus'] = false;
                    this.appStore.RDS.revealDataSave[this.appStore.ticketID]['bonusType'] = 0;
                }
                this.appStore.setOnceClimbeComplete(true);
                pickBonusContainer.translateToBaseOnStartReaction();
            };
            gr.animMap['_translateToBase_01']._onComplete = () => {
                pickBonusContainer.translateToBaseOnCompleteReaction.call(this);
            };


        }

        completeBonusGame() {
            this.appStore.setGameScene('baseGame');
            gr.getTimer().setTimeout(() => { this.appStore.setGameIsInReveal(false); }, 2800);
        }

        click(_this) {
            return function() {
                audio.play('stoneSmash2', 9);
                for (let i = 0; i < 4; i++) {
                    _this.clickGraphicsArea[i].interactive = false;
                }
                pickBonusContainer.lastClickReaction.call(this, _this);
            };
        }

        mouseover(_this) {
            return function() {
                if (_this.preventStoneFlashTimer) {
                    gr.getTimer().clearTimeout(_this.preventStoneFlashTimer);
                    _this.preventStoneFlashTimer = null;
                }
                for (let i = 0; i < 4; i++) {
                    if (_this.stoneFlashBeginTimer[i]) {
                        gr.getTimer().clearTimeout(_this.stoneFlashBeginTimer[i]);
                        _this.stoneFlashBeginTimer[i] = null;
                    }
                }
                pickBonusContainer.mouseoverReaction.call(this, _this);
            };
        }

        mouseout(_this) {
            return function() {
                if (_this.clickGraphicsArea.some((cga) => { return cga.interactive; })) {
                    pickBonusContainer.mouseoutReaction.call(this);
                    if (!_this.stoneFlashBeginTimer) {
                        _this.preventStoneFlashTimer = gr.getTimer().setTimeout(() => {
                            pickBonusContainer.playStoneFlashAnimation.call(_this);
                        }, 200);
                    }
                } else {
                    pickBonusContainer.stopStoneFlashAndHide.call(_this);
                }
            };
        }

        createHitArea() {
            const _this = this;
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            for (let i = 0; i < config.polyPts[orientation].length; i++) {
                let graphics = null;
                graphics = new PIXI.Graphics();
                this.clickGraphicsArea.push(graphics);
                graphics.beginFill(0xffffff);
                graphics.drawPolygon(config.polyPts[orientation][i]);
                graphics.endFill();
                graphics.alpha = 0;
                graphics.interactive = true;
                graphics.cursor = "pointer";
                graphics.index = i;
                graphics.clickTimer = null;
                graphics.on('click', this.click(_this));
                graphics.on('mouseover', this.mouseover(_this));
                graphics.on('mouseout', this.mouseout(_this));
                graphics.on('mouseDown', () => {});
                graphics.on('mouseup', () => {});

                graphics.on('touchend', this.click(_this));
                graphics.on('touchstart', this.mouseover(_this));
                graphics.on('touchendoutside', this.mouseout(_this));

                gr.lib._pickBonusScreen.pixiContainer.addChild(graphics);
            }
        }

        setTextStyle() {
            const { _pickBonusTips } = gr.lib;
            gameUtils.setTextStyle(_pickBonusTips, config.textStyle.tipsText);
            for (let i = 0; i < 4; i++) {
                gameUtils.setTextStyle(gr.lib['_pickText_0' + i], config.textStyle.einstantWinText);
                gr.lib['_pickText_0' + i].autoFontFitText = true;
            }
        }

        setText() {
            const { _pickBonusTips } = gr.lib;
            _pickBonusTips.autoFontFitText = true;
            _pickBonusTips.setText(loader.i18n.Game.pickBonusText);
        }

        setGladButton() {

        }

        bindReaction() {
            reaction(
                () => this.appStore.SKBState,
                () => {
                    switch (this.appStore.SKBState) {
                        case 'gameParametersUpdated':
                            {
                                this.setTextStyle();
                                this.setText();
                                this.setGladButton();
                                this.cloneAnimation();
                                this.defineAnimationComplete();
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
                        if (gameCurrentScene === 'pickBonus') {
                            pickBonusContainer.initialPickBonus.call(this);
                            const { _pickBonusScreen, _collect } = gr.lib;
                            _pickBonusScreen.show(true);
                            _collect.updateCurrentStyle({ _opacity: 0 });
                            pickBonusContainer.playStoneFlashAnimation.call(this);
                        } else {
                            pickBonusContainer.hidePickBonus();
                        }
                    } else {
                        if (SKBState === 'gameParametersUpdated') {
                            if (gameCurrentScene === 'pickBonus') {
                                pickBonusContainer.initialPickBonus.call(this);
                                const { _pickBonusScreen, _collect } = gr.lib;
                                _collect.updateCurrentStyle({ _opacity: 0 });
                                _pickBonusScreen.show(true);
                                gr.getTimer().setTimeout(() => {
                                    pickBonusContainer.playStoneFlashAnimation.call(this);
                                }, 1000);
                            } else {
                                pickBonusContainer.hidePickBonus();
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
                                    pickBonusContainer.initialPickBonus.call(this);
                                    gr.getTimer().setTimeout(() => {
                                        pickBonusContainer.playStoneFlashAnimation.call(this);
                                    }, 1000);
                                }
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.bonusRevealData,
                () => {
                    this.bonusWinType = this.appStore.bonusRevealData[0];
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
                            const originSprite = gr.lib['_pickPic_0' + this.winBonusIndex];
                            originSprite.setImage('hillIcon05_01');
                            originSprite.show(true);
                            const keyIconFramePosition = originSprite.toGlobal({ x: 0, y: 0 });
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
                                upReactionComplete //CompleteCallback
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
                            const originSprite = gr.lib['_pickPic_0' + this.winBonusIndex];
                            originSprite.setImage('hillIcon04_01');
                            originSprite.show(true);
                            //originSprite.show(false);
                            const keyIconFramePosition = originSprite.toGlobal({ x: 0, y: 0 });
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
                                dnReactionComplete //CompleteCallback
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
                            const originSprite = gr.lib['_pickPic_0' + this.winBonusIndex];
                            originSprite.setImage('hillIcon03_01');
                            originSprite.show(true);
                            //originSprite.show(false);
                            const keyIconFramePosition = originSprite.toGlobal({ x: 0, y: 0 });
                            const dnReactionComplete = () => {
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
                                dnReactionComplete
                                //CompleteCallback
                            );
                        }
                    }
                }
            );
        }
    }

    return PickBonus;
});