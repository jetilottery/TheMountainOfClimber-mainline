define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gladButton',
    'game/gameUtils',
    'game/ticket/config',
    'game/ticket/ticketContainer',
    "skbJet/component/gladPixiRenderer/Sprite",
    'com/mobx/mobx',
    'com/pixijs/pixi',
    'skbJet/component/resourceLoader/resourceLib',
    'game/Particle',
    'game/ticket/configCoinTicketData',
], function(
    msgBus,
    audio,
    gr,
    loader,
    SKBeInstant,
    gladButton,
    gameUtils,
    config,
    ticketContainer,
    Sprite,
    mobx,
    PIXI,
    resLib,
    Particle,
    configCoinTicketData
) {
    const {
        reaction
    } = mobx;
    class GameTicket {
        constructor(appStore) {
            this.appStore = appStore;
            this.ticketIconsContainer = gr.lib._ticketIcons;
            this.logoAnimation = gr.lib._logoAnimation;

            this.MTMReinitial = false;
            this.boughtTicket = false;
            this.currentPricePoint = 0;
            this.pricePointList = [];
            this.pricePointListLength = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
            this.setTicketCostLevelIcon();
            this.getPricePointList();
            this.registerControl();
            this.bindEventListener();
            this.onTutorialIsShown = this.onTutorialIsShown.bind(this);
            this.onTutorialIsHide = this.onTutorialIsHide.bind(this);
            this.onConsoleControlChanged = this.onConsoleControlChanged.bind(this);
            this.onplayerWantsToMoveToMoneyGame = this.onplayerWantsToMoveToMoneyGame.bind(this);
            this.disableTicketButtons = this.disableTicketButtons.bind(this);
            msgBus.subscribe('tutorialIsShown', this.onTutorialIsShown);
            msgBus.subscribe('tutorialIsHide', this.onTutorialIsHide);
            msgBus.subscribe('jLotterySKB.onConsoleControlChanged', this.onConsoleControlChanged);
            msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', this.onplayerWantsToMoveToMoneyGame);
            msgBus.subscribe('buyOrTryHaveClicked', this.disableTicketButtons);
            this.bindReaction();
            this.initialSpineSprite();
        }

        onConsoleControlChanged(data) {
            if (data.option === 'price') {
                this.setPricePoint(Number(data.value));
            }
        }

        initialSpineSprite() {
            this.ticketLogo = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
            //this.ticketLogo.state.setEmptyAnimations(0.2);
            this.ticketLogo.skeleton.setToSetupPose();
            this.ticketLogo.update(0);
            this.logoAnimation.pixiContainer.addChild(this.ticketLogo);
            let localRect = this.ticketLogo.getLocalBounds();
            this.ticketLogo.position.set(-localRect.x, -localRect.y);
            this.ticketLogo.state.setAnimation(0, '01LogoA', true);
            this.ticketLogo.state.timeScale = 1;
        }

        createCoinShower() {
            this.coinParticle = new Particle(
                gr.lib._goldCoinContainer.pixiContainer,
                'coinOne',
                [],
                configCoinTicketData.configuration,
                true, { startFrame: 1, endFrame: 11, isSingleNumFormat: false, frameRate: 30 }
            );
            this.coinParticle.start();
        }

        setTextStyle() {
            if (config.textStyle) {
                Object.keys(config.textStyle).forEach((text) => {
                    gameUtils.setTextStyle(gr.lib[text], config.textStyle[text]);
                });
            }
            if (config.textAutoFit) {
                Object.keys(config.textAutoFit).forEach((text) => {
                    gr.lib[text].autoFontFitText = config.textAutoFit[text];
                });
            }
        }

        setText() {
            gr.lib._ticketCostText.setText(loader.i18n.Game.wager);
        }

        setTicketCostLevelIcon() {
            const { gladData, iconSpace } = config.ticketCostLevelICon;
            const length = this.pricePointListLength;
            const width = Number(gladData._style._width) * Number(gladData._style._transform._scale._x);
            const left = (this.ticketIconsContainer._currentStyle._width - (length * width + (length - 1) * iconSpace)) / 2;
            for (let i = 0; i < this.pricePointListLength; i++) {
                const spData = JSON.parse(JSON.stringify(gladData));
                spData._id = spData._id + i;
                spData._name = spData._name + i;
                spData._style._left = left + (width + iconSpace) * i;
                this.ticketIconsContainer.addChildFromData(spData);
            }
        }

        setGladButton() {
            const scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
            this.plusButton = new gladButton(gr.lib._ticketCostPlus, config.gladButtonImgName.ticketCostPlus, scaleType);
            this.minusButton = new gladButton(gr.lib._ticketCostMinus, config.gladButtonImgName.ticketCostMinus, scaleType);
        }

        bindEventListener() {
            this.setGladButton();
            this.plusButton.click(() => {
                let index = this.pricePointList.indexOf(this.currentPricePoint);
                index++;
                this.setPricePoint(this.pricePointList[index]);
                if (index === this.pricePointList.length - 1) {
                    audio.play("prizeLand", 7);
                } else {
                    audio.play("arrowUp", 6);
                }
            });

            this.minusButton.click(() => {
                let index = this.pricePointList.indexOf(this.currentPricePoint);
                index--;
                this.setPricePoint(this.pricePointList[index]);
                audio.play("arrowDown", 5);
            });

        }

        getPricePointList() {
            for (let i = 0; i < this.pricePointListLength; i++) {
                const price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
                this.pricePointList.push(price);
            }
        }

        registerControl() {
            let formattedPrizeList = [];
            let strPrizeList = [];
            for (let i = 0; i < this.pricePointListLength; i++) {
                formattedPrizeList.push(SKBeInstant.formatCurrency(this.pricePointList[i]).formattedAmount);
                strPrizeList.push(this.pricePointList[i] + '');
            }
            let priceText, stakeText;
            if (SKBeInstant.isWLA()) {
                priceText = loader.i18n.MenuCommand.WLA.price;
                stakeText = loader.i18n.MenuCommand.WLA.stake;
            } else {
                priceText = loader.i18n.MenuCommand.Commercial.price;
                stakeText = loader.i18n.MenuCommand.Commercial.stake;
            }

            msgBus.publish("jLotteryGame.registerControl", [{
                name: 'price',
                text: priceText,
                type: 'list',
                enabled: 1,
                valueText: formattedPrizeList,
                values: strPrizeList,
                value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
            }]);
            msgBus.publish("jLotteryGame.registerControl", [{
                name: 'stake',
                text: stakeText,
                type: 'stake',
                enabled: 0,
                valueText: '0',
                value: 0
            }]);
        }

        gameControlChanged(value) {
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'stake',
                event: 'change',
                params: [SKBeInstant.formatCurrency(value).amount / 100, SKBeInstant.formatCurrency(value).formattedAmount]
            });

            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'price',
                event: 'change',
                params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
            });
        }

        enableConsole() {
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "price", "event": "enable", "params": [1] }
            });
        }

        disableConsole() {
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "price", "event": "enable", "params": [0] }
            });
        }

        setPricePoint(pricePoint) {
            ticketContainer.showCurrentPricePoint.call(this, pricePoint, this.pricePointList, SKBeInstant.config.wagerType);
            this.currentPricePoint = pricePoint;
            msgBus.publish('ticketCostChanged', pricePoint);
            this.gameControlChanged(pricePoint);
        }

        bindReaction() {
            reaction(
                () => this.appStore.SKBState,
                (SKBState) => {
                    switch (SKBState) {
                        case 'gameParametersUpdated':
                            {
                                this.createCoinShower();
                                const { pricePointGameDefault } = SKBeInstant.config.gameConfigurationDetails;
                                this.setTextStyle();
                                this.setText();
                                ticketContainer.showTicketIconsContainer(this.pricePointListLength);
                                if (SKBeInstant.config.gameType !== 'ticketReady') {
                                    this.setPricePoint(pricePointGameDefault);
                                }
                                gameUtils.fixMeter(gr);
                                break;
                            }
                        case 'initialize':
                            {
                                ticketContainer.hideTicketContainer();
                                break;
                            }
                        case 'startUserInteraction':
                            {
                                const { scenarioResponse } = this.appStore;
                                ticketContainer.hideTicketContainer();
                                this.disableConsole();
                                this.boughtTicket = true;
                                if (scenarioResponse.price) {
                                    this.setPricePoint(scenarioResponse.price);
                                }
                                this.coinParticle.stop();
                                break;
                            }
                        case 'enterResultScreenState':
                            {

                                break;
                            }
                        case 'playerWantsPlayAgain':
                            {
                                this.createCoinShower();
                                this.boughtTicket = false;
                                this.enableConsole();
                                this.setPricePoint(this.currentPricePoint);
                                ticketContainer.showTicketContainer();
                                break;
                            }
                        case 'reInitialize':
                            {
                                this.createCoinShower();
                                if (this.MTMReinitial) {
                                    const { pricePointGameDefault } = SKBeInstant.config.gameConfigurationDetails;
                                    this.enableConsole();
                                    this.boughtTicket = false;
                                    this.MTMReinitial = false;
                                    this.setPricePoint(pricePointGameDefault);
                                    ticketContainer.hideTicketContainer();
                                } else {
                                    this.enableConsole();
                                    if (this.currentPricePoint) {
                                        this.setPricePoint(this.currentPricePoint);
                                    } else {
                                        const { pricePointGameDefault } = SKBeInstant.config.gameConfigurationDetails;
                                        this.setPricePoint(pricePointGameDefault);
                                    }
                                    this.boughtTicket = false;
                                    ticketContainer.showTicketContainer();
                                }
                                break;
                            }
                        case 'playerWantsToMoveToMoneyGame':
                            {
                                //ticketContainer.hideTicketContainer();
                                this.MTMReinitial = true;
                                break;
                            }
                        case 'reStartUserInteraction':
                            {
                                const { scenarioResponse } = this.appStore;
                                ticketContainer.hideTicketContainer();
                                this.disableConsole();
                                this.boughtTicket = true;
                                if (scenarioResponse.price) {
                                    this.setPricePoint(scenarioResponse.price);
                                }
                                this.coinParticle.stop();
                                break;
                            }
                        case 'reset':
                            {
                                this.createCoinShower();
                                this.enableConsole();
                                if (this.currentPricePoint) {
                                    this.setPricePoint(this.currentPricePoint);
                                } else {
                                    const { pricePointGameDefault } = SKBeInstant.config.gameConfigurationDetails;
                                    this.setPricePoint(pricePointGameDefault);
                                }
                                this.boughtTicket = false;
                                ticketContainer.showTicketContainer();
                                break;
                            }
                        default:
                            break;
                    }
                }
            );
            reaction(
                () => this.appStore.currentPricePoint,
                () => {
                    /*                         this.coinShower.stop();
                                            const { _goldCoinContainer } = gr.lib;
                                            const { _width, _height } = _goldCoinContainer._currentStyle;
                                            this.coinShower.options.visibleRange =  [0, _width, 0, _height*2];
                                            this.coinShower.options.coinAnimatSpeed = [0.7, 0.8];
                                            this.coinShower.options.coinPerTime = 6;
                                            this.coinShower.options.popPosition = [ _width / 2, _height,_width / 2,_height];
                                            this.coinShower.options.rotation = [90,100];
                                            this.coinShower.options.Sy = [-14,-16];
                                            this.coinShower.start();  */
                }
            );
        }

        onTutorialIsShown() {
            if (!this.boughtTicket) {
                ticketContainer.hideTicketContainer();
            }
        }

        onTutorialIsHide() {
            if (!this.boughtTicket) {
                ticketContainer.showTicketContainer();
            }
        }

        onplayerWantsToMoveToMoneyGame() {
            this.plusButton.enable(false);
            this.minusButton.enable(false);



            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "howToPlay", "event": "enable", "params": [0] }
            });
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "paytable", "event": "enable", "params": [0] }
            });

            //disable ticket spot controls
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "price", "event": "enable", "params": [0] }
            });
        }

        disableTicketButtons() {
            this.plusButton.enable(false);
            this.minusButton.enable(false);
        }
    }

    return GameTicket;
});