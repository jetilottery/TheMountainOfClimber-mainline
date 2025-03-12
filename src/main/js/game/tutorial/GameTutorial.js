define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/TextMatchToImages',
    'game/tutorial/config',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gladButton',
    'game/tutorial/tutorialContainer',
    'game/gameUtils',
    'com/mobx/mobx',
], function(
    msgBus,
    gr,
    loader,
    audio,
    TextMatchToImages,
    config,
    SKBeInstant,
    gladButton,
    tutorialContainer,
    gameUtils,
    mobx,
) {
    const {
        reaction
    } = mobx;
    class GameTutorial {
        constructor(appStore) {
            this.appStore = appStore;
            this.container = gr.lib._tutorial;
            this.backgroundDim = gr.lib._BG_dim;
            this.versionText = gr.lib._versionText;
            this.tutorialPage = gr.lib._tutorialPage;
            this.i18n = this.getTutorialContentFromi18n();
            this.showTutorialAtBeginning = true;
            this.resultIsShown = false;
            this.shouldShowTutorialWhenReinitial = false;
            this.currentIndex = 0;
            this.maxIndex = Number(config.totalPageNum);
            this.enableButtonInfo = this.enableButtonInfo.bind(this);
            this.disableButtonInfo = this.disableButtonInfo.bind(this);
            this.onTutorialIsHide = this.onTutorialIsHide.bind(this);
            this.onTutorialIsShown = this.onTutorialIsShown.bind(this);
            this.onplayerWantsToMoveToMoneyGame = this.onplayerWantsToMoveToMoneyGame.bind(this);
            this.ticketReadyForDress = false;
            //this.bindEventListener = this.bindEventListener.bind(this);
            this.showButtonInfoTimer = null;

            this.ownSubscribe();
            this.bindReaction();
        }

        ownSubscribe() {
            msgBus.subscribe('tutorialIsHide', this.onTutorialIsHide);
            msgBus.subscribe('enableButtonInfo', this.enableButtonInfo);
            msgBus.subscribe('disableButtonInfo', this.disableButtonInfo);
            msgBus.subscribe('allRevealedForInfoButton', this.onTutorialIsShown);
            msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', this.onplayerWantsToMoveToMoneyGame);
        }

        setTextStyle() {
            const textAutoFitContainers = config.textAutoFit;
            Object.keys(textAutoFitContainers).forEach((container) => {
                if (textAutoFitContainers[container]) {
                    gr.lib[container].autoFontFitText = true;
                }
            });
            gameUtils.setTextStyle(gr.lib._versionText, config.vartionTextStyle);
            gameUtils.setTextStyle(gr.lib._tutorialTitleText, config.tutorialTitleTextStyle);
            gameUtils.setTextStyle(gr.lib._closeTutorialText, config.buttonStyle);
            for (let i = 0; i < this.maxIndex; i++) {
                const pageText = gr.lib['_tutorialPage_0' + i + '_Text_00'];
                gameUtils.setTextStyle(pageText, config.pageTextStyle);
            }
        }

        init() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            this.setTextStyle();
            this.versionText.setText(window._cacheFlag.gameVersion + ".CL" + window._cacheFlag.changeList + "_" + window._cacheFlag.buildNumber);
            for (let i = 0; i < this.maxIndex; i++) {
                const pageText = gr.lib['_tutorialPage_0' + i + '_Text_00'];
                pageText.setText(this.i18n.tutorial_content[i]);
            }
            gr.lib._tutorialTitleText.setText(this.i18n.tutorial_title);
            gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
            Object.keys(this.tutorialPage.sprites).forEach((page, index) => {
                const spriteName = Object.getOwnPropertyNames(gr.lib[page].sprites);
                new TextMatchToImages(gr.lib[spriteName], this.i18n.tutorial_content[index], config.pageTextStyle[orientation], config.textConvertImageMap).updateStyle();
            });

            this.initialGladButton();
            this.bindEventListener();
            this.defineAnimComplete();
        }

        bindEventListener() {
            this.backgroundDim.on('click', (e) => {
                e.stopPropagation();
            });
            this.tutorialPage.on('click', (e) => {
                e.stopPropagation();
            });
            this.buttonInfo.click(() => {
                this.show();
                //TODO Audio play
                audio.play("buy_ok", 4);
            });
            this.buttonClose.click(() => {
                this.hide();
                //TODO Audio play
                audio.play("buy_ok", 4);
                if (this.appStore.SKBState === 'initialize' && !audio.currentPlaying(1)) {
                    audio.play("musicIntroLoop", 1, true);
                }
            });
            this.arrowLeft.click(() => {
                this.currentIndex--;
                if (this.currentIndex < 0) {
                    this.currentIndex = this.maxIndex - 1;
                }
                tutorialContainer.showCurrentPage(this.currentIndex, this.maxIndex);
                //TODO Audio play     
                audio.play("arrowDown", 5);
            });
            this.arrowRight.click(() => {
                this.currentIndex++;
                if (this.currentIndex >= this.maxIndex) {
                    this.currentIndex = 0;
                }
                tutorialContainer.showCurrentPage(this.currentIndex, this.maxIndex);
                //TODO Audio play            
                audio.play("arrowUp", 6);
            });
        }

        getTutorialContentFromi18n() {
            const i18n = {};
            const tutorialContents = loader.i18n.Game.tutorial;
            for (let key in tutorialContents) {
                if (typeof tutorialContents[key] === 'string') {
                    i18n[key] = tutorialContents[key];
                } else {
                    i18n[key] = [];
                    Object.keys(tutorialContents[key]).forEach((content) => {
                        i18n[key].push(tutorialContents[key][content]);
                    });
                }
            }
            return i18n;
        }

        initialGladButton() {
            const scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
            this.buttonInfo = new gladButton(gr.lib._buttonInfo, "tutorialButton", scaleType);
            this.buttonClose = new gladButton(gr.lib._buttonCloseTutorial, 'mainButton', scaleType);
            this.arrowLeft = new gladButton(gr.lib._buttonTutorialArrowLeft, "tutorialLeftButton", scaleType);
            this.arrowRight = new gladButton(gr.lib._buttonTutorialArrowRight, "tutorialRightButton", scaleType);
        }

        defineAnimComplete() {
            const tutorialUpOnComplete = () => {
                const _ticketReadyForDress = this.ticketReadyForDress;
                if (this.ticketReadyForDress) {
                    this.ticketReadyForDress = false;
                    msgBus.publish('tutorialIsForTicketReady');
                }
                msgBus.publish('tutorialIsHide');
                tutorialContainer.showTutorial.call(this, false, _ticketReadyForDress);
                this.currentIndex = 0; //Xiaoxin let me update this feature.
                tutorialContainer.showCurrentPage(this.currentIndex, this.maxIndex);
            };
            gr.animMap._tutorialUP._onComplete = tutorialUpOnComplete.bind(this);

        }

        show() {
            this.backgroundDim.off('click');
            if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
                this.resultIsShown = true;
            } else {
                this.resultIsShown = false;
            }
            tutorialContainer.showTutorial.call(this, true);
            gr.animMap._tutorialDn.play();
            if (config.audio.HelpPageOpen) {
                //TODO 
                //audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
            }
            msgBus.publish('tutorialIsShown');
        }

        hide() {
            gr.animMap._tutorialUP.play();
            if (config.audio.HelpPageClose) {
                //TODO
                //audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
            }
        }

        clearTimer() {
            if (this.showButtonInfoTimer) {
                gr.getTimer().clearTimeout(this.showButtonInfoTimer);
                this.showButtonInfoTimer = null;
            }
        }

        onTutorialIsHide() {
            if (!this.showButtonInfoTimer && this.appStore.gameCurrentScene === 'baseGame') {
                this.buttonInfo.show(true);
            }
        }

        onTutorialIsShown() {
            this.buttonInfo.show(false);
        }

        disableButtonInfo() {
            this.buttonInfo.enable(false);
        }

        enableButtonInfo() {
            this.buttonInfo.enable(true);
        }

        onplayerWantsToMoveToMoneyGame() {
            this.buttonInfo.enable(false);
        }

        bindReaction() {
            reaction(
                () => this.appStore.SKBState,
                (SKBState) => {
                    switch (SKBState) {
                        case 'gameParametersUpdated':
                            {
                                this.init();
                                //Version test should show in WLA env, not in COM env
                                tutorialContainer.showVersioText(SKBeInstant.isWLA());
                                tutorialContainer.showCurrentPage(this.currentIndex, this.maxIndex);
                                if (SKBeInstant.config.customBehavior) {
                                    if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
                                        this.showTutorialAtBeginning = false;
                                    }
                                } else if (loader.i18n.gameConfig) {
                                    if (loader.i18n.gameConfig.showTutorialAtBeginning === false) {
                                        this.showTutorialAtBeginning = false;
                                    }
                                }
                                tutorialContainer.showTutorial.call(this, this.showTutorialAtBeginning);
                                msgBus.publish('tutorialIsShown');
                                // TODO
                                //gr.lib._dress.show(false);
                                break;
                            }
                        case 'initialize':
                            {
                                if (this.showTutorialAtBeginning) {
                                    tutorialContainer.showTutorial.call(this, this.showTutorialAtBeginning);
                                } else {
                                    msgBus.publish('tutorialIsHide');
                                }
                                break;
                            }
                        case 'startUserInteraction':
                            {
                                if (SKBeInstant.config.gameType === 'ticketReady') {
                                    if (this.showTutorialAtBeginning) {
                                        this.ticketReadyForDress = true;
                                        tutorialContainer.showTutorial.call(this, this.showTutorialAtBeginning);
                                    } else {
                                        msgBus.publish('tutorialIsHide');
                                    }
                                }
                                break;
                            }
                        case 'enterResultScreenState':
                            {
                                this.showButtonInfoTimer = gr.getTimer().setTimeout(() => {
                                    this.clearTimer();
                                    const visible = gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible;
                                    if (visible) {
                                        this.enableButtonInfo();
                                        this.buttonInfo.show(true);
                                    }
                                }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
                                break;
                            }
                        case 'playerWantsPlayAgain':
                            {
                                break;
                            }
                        case 'reInitialize':
                            {
                                this.clearTimer();
                                this.enableButtonInfo();
                                msgBus.publish('tutorialIsHide');
                                break;
                            }
                        case 'playerWantsToMoveToMoneyGame':
                            {
                                this.clearTimer();
                                this.shouldShowTutorialWhenReinitial = true;
                                if (this.showTutorialAtBeginning) {
                                    //this.buttonInfo.show(false);
                                }
                                break;
                            }
                        case 'reStartUserInteraction':
                            {
                                this.clearTimer();
                                break;
                            }
                        case 'reset':
                            {
                                this.buttonInfo.show(true);
                                break;
                            }
                        case 'error':
                            {
                                this.buttonInfo.show(false);
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
                    const { SKBState } = this.appStore;
                    if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                        if (gameCurrentScene === 'baseGame') {
                            gr.getTimer().setTimeout(() => {
                                if (!this.appStore.endGame) {
                                    this.enableButtonInfo();
                                    this.buttonInfo.show(true);
                                }
                            }, 2800);
                        } else {
                            this.buttonInfo.show(false);
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.gameIsInReveal,
                () => {
                    if (this.appStore.gameIsInReveal) {
                        this.buttonInfo.enable(false);
                    } else {
                        if (this.appStore.gameCurrentScene === 'baseGame') {
                            this.buttonInfo.enable(true);
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.autoPlay,
                () => {
                    if (this.appStore.autoPlay) {
                        this.buttonInfo.show(!this.appStore.autoPlay);
                    }
                }
            );
        }
    }

    return GameTutorial;
});