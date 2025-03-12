define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gameUtils',
    'game/winUpTo/config',
    'game/winUpTo/winUpToContainer',
    'com/mobx/mobx',
], function (msgBus, gr, loader, SKBeInstant, gameUtils, config , winUpToContainer, mobx) {
        const {
            reaction
        } = mobx;
        class WinUpTo{
            constructor(appStore) {
                this.appStore = appStore;
                this.container = gr.lib._winUpToAnimation;
                this.currentPrice = 0;
                this.winDowntoIndex = 0;
                this.winUptoIndex = 0;
                this.onTicketCostChanged = this.onTicketCostChanged.bind(this);
                msgBus.subscribe('ticketCostChanged', this.onTicketCostChanged);
                this.bindReaction();
            }

            setTextStyle() {
                if (config.textStyle.winUpToText) {
                    Object.keys(this.container.sprites).forEach((sprite) => {
                        gameUtils.setTextStyle(gr.lib[sprite], config.textStyle.winUpToText);
                    });
                }
                if(config.textStyle.winUptoTextInGame){
                    const { _baseWinUpToText, _baseWinUpToValue } = gr.lib;
                    gameUtils.setTextStyle(_baseWinUpToText, config.textStyle.winUptoTextInGame);
                    gameUtils.setTextStyle(_baseWinUpToValue, config.textStyle.winUptoTextInGame);
                }
                if (config.textAutoFit.winUpToText) {
                    Object.keys(this.container.sprites).forEach((sprite) => {
                        gr.lib[sprite].autoFontFitText = config.textAutoFit.winUpToText.isAutoFit;
                    });
                }
            }

            setText(){
                const { _baseWinUpToText, _baseWinUpToValue } = gr.lib;
                _baseWinUpToText.autoFontFitText = true;
                _baseWinUpToValue.autoFontFitText = true;
                _baseWinUpToText.setText(loader.i18n.Game.winUpTo.win_up_to);
            }

            defineComplete() {
                const { _baseWinUpToValue } = gr.lib;
                const _this = this;
                const onComplete = function () {
                    gr.lib['_winUpTo_' + this.index].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(_this.topPrizeDetails[_this.currentPrice]).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                    _baseWinUpToValue.setText(SKBeInstant.formatCurrency(_this.topPrizeDetails[_this.currentPrice]).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                };
                for (let i = 0; i < 3; i++) {
                    gr.animMap['_winUpToMinus_' + i]._onComplete = onComplete;
                    gr.animMap['_winUpToPlus_' + i]._onComplete = onComplete;
                }
                gr.animMap._winUpToHide._onComplete = function () {
                    _this.container.parent.show(false);
                };
                gr.animMap._winUpToShow._onStart = function () {
                    _this.container.parent.show(true);
                };
            }

            init() {
                this.setTextStyle();
                this.setText();
                this.defineComplete();
                winUpToContainer.hideAllWinUpTo.call(this);
            }

            showWinUpTo(index) {
                switch (index) {
                    case 0:
                        Object.keys(this.container.sprites).forEach((sprite, i) => {
                            if (i < 2) {
                                gr.lib[sprite].show(true);
                            } else {
                                gr.lib[sprite].show(false);
                            }
                        });
                        break;

                    case 1: 
                        Object.keys(this.container.sprites).forEach((sprite, i) => {
                            if (i > 1 && i < 4) {
                                gr.lib[sprite].show(true);
                            } else {
                                gr.lib[sprite].show(false);
                            }
                        });
                        break;

                    case 2: 
                        Object.keys(this.container.sprites).forEach((sprite, i) => {
                            if (i >= 4) {
                                gr.lib[sprite].show(true);
                            } else {
                                gr.lib[sprite].show(false);
                            }
                        });
                        break;
                    default:
                        break;
                }
            }

            onTicketCostChanged(prizePoint) {
                if (!this.topPrizeDetails) {
                    return;
                }
                const currentPrice = this.currentPrice;
                this.currentPrice = prizePoint;
                const currentPrize = this.topPrizeDetails[currentPrice];
                const levelUpPrize = this.topPrizeDetails[prizePoint];
                if (currentPrize === levelUpPrize) {
                    return;
                }
                if (currentPrice > prizePoint) {
                    this.showWinUpTo(this.winDowntoIndex);
                    gr.lib['_winUpTo_' + this.winDowntoIndex].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(currentPrize).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                    gr.lib['_winUpToT_' + this.winDowntoIndex].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(levelUpPrize).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                    gr.animMap['_winUpToMinus_' + this.winDowntoIndex].play();
                    gr.animMap['_winUpToMinus_' + this.winDowntoIndex].index = this.winDowntoIndex;
                    if (this.winDowntoIndex === 2) {
                        this.winDowntoIndex = 0;
                    } else {
                        this.winDowntoIndex++;
                    }
                } else {
                    this.showWinUpTo(this.winUptoIndex);
                    gr.lib['_winUpTo_' + this.winUptoIndex].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(currentPrize).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                    gr.lib['_winUpToT_' + this.winUptoIndex].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(levelUpPrize).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                    gr.animMap['_winUpToPlus_' + this.winUptoIndex].play();
                    gr.animMap['_winUpToPlus_' + this.winUptoIndex].index = this.winUptoIndex;
                    if (this.winUptoIndex === 2) {
                        this.winUptoIndex = 0;
                    } else {
                        this.winUptoIndex++;
                    }
                }
            }

            bindReaction(){
                reaction(
                    () => this.appStore.SKBState,
                    () => {
                        switch (this.appStore.SKBState) {
                            case 'gameParametersUpdated':{
                                this.init();
                                const { _baseWinUpToValue } = gr.lib;
                                const defaultPrice = SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault;
                                this.currentPrice = defaultPrice;
                                this.topPrizeDetails = {};
                                const revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
                                revealConfigurations.forEach((reveal) => {
                                    const price = reveal['price'];
                                    const topPrize = reveal['prizeStructure'][0]['prize'];
                                    this.topPrizeDetails[price] = topPrize;
                                });
                                winUpToContainer.setWinUpToText.call(this, 0, this.topPrizeDetails[defaultPrice]);                    
                                _baseWinUpToValue.setText(SKBeInstant.formatCurrency(this.topPrizeDetails[defaultPrice]).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
                                break;
                            }
                            case 'startUserInteraction':{
                                gr.animMap._winUpToHide.play();
                                break;
                            }                        
                            case 'playerWantsPlayAgain':{
                                gr.animMap._winUpToShow.play();
                                break;
                            }
                            case 'reStartUserInteraction':{
                                gr.animMap._winUpToHide.play();
                                break;
                            }    
                            case 'reInitialize':{
                                gr.animMap._winUpToShow.play();
                                break;
                            }
                            default:
                                break;
                        }
                    }
                );
            }

        }

        return WinUpTo;
});