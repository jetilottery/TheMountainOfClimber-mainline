define([
    'com/mobx/mobx',
    'game/baseGame/BaseGameStore',
    'game/climberManDress/DressStore',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader'
], function(
    mobx,
    BaseGameStore,
    DressStore,
    loader
) {
    const {
        observable,
        action,
        decorate,
        computed
    } = mobx;
    class AppStore {
        constructor(SKBeInstant) {
            this.SKBeInstant = SKBeInstant;
            this.gameConfigforNRGS = loader.i18n.gameConfig;
            this.scenarioResponse = null;
            this.errorResponse = null;
            // Game price map for { UP, DOWN, ACC, IW }
            this.gamePriceMap = this.getGamePriceMap();
            this.baseGameStore = new BaseGameStore(this);
            this.dressStore = new DressStore(this);
            // this is distinguish initial or GIP
            this.initialGame = true;
            // game current price point
            this.currentPricePoint = 0;
            // Is for climberMan color
            this.climberManSkin = 'red';
            // game total WIn
            this.gameTotalWin = 0;
            // When reveal clicked gameIsInReveal will change to true, change to false until once reveal completed
            this.gameIsInReveal = false;
            // Game scene is for distinguishing game state
            this.gameCurrentScene = '';
            // When all animation completed, once climber action completed
            this.onceClimbeComplete = false;
            // Distinguish game autoplay
            this.autoPlay = false;
            // Judge game is ending
            this.endGame = false;
            // Is for reveal all button enable or disable
            this.autoRevealEnabled = false;

            this.gameBonusType = 0;

            this.showAutoMap = false;

            this.bonusRevealData = null;

            this.stepIndex = -1;

            this.spinsLeft = 0;

            this.SKBState = '';

            this.RDSFlag = false;

            this.RDS = {
                revealDataSave: {},
                wagerDataSave: '',
                spots: 0,
                amount: 0,

            };

            this.ticketID = null;
        }
        /**
         * @private
         * @description Get prize map according to price which have Acc Up Dn property from revealConfigurations
         * @returns {"50":{"Acc":["--","--","--",1,2,5,25,100],"Up":5,"Dn":2},"100":{"Acc":["--","--","--",1,2,5,25,100],"Up":5,"Dn":2}
         */

        getGamePriceMap() {
            const { revealConfigurations } = this.SKBeInstant.config.gameConfigurationDetails;
            let gamePriceMap = {};
            const NO_WINING_PRIZE = '--';
            for (let i = 0, rc_len = revealConfigurations.length; i < rc_len; i++) {
                const { price, prizeTable } = revealConfigurations[i];
                gamePriceMap[price] = {};
                gamePriceMap[price]['Acc'] = [];
                gamePriceMap[price]['IW'] = [];
                for (let j = 0, pt_len = prizeTable.length; j < pt_len; j++) {
                    const { description, prize } = prizeTable[j];
                    if (/Acc/.test(description)) {
                        const index = description.match(/\d+/)[0] - 1;
                        gamePriceMap[price]['Acc'][index] = prize;
                    } else if (/Up/.test(description)) {
                        gamePriceMap[price]['Up'] = prize;
                    } else if (/Dn/.test(description)) {
                        gamePriceMap[price]['Dn'] = prize;
                    } else if (/IW/.test(description)) {
                        const index = description.match(/\d+/)[0] - 1;
                        gamePriceMap[price]['IW'][index] = prize;
                    }
                }
                for (let k = 0, acc_len = gamePriceMap[price]['Acc'].length; k < acc_len; k++) {
                    if (!gamePriceMap[price]['Acc'][k]) {
                        gamePriceMap[price]['Acc'][k] = NO_WINING_PRIZE;
                    }
                }
                gamePriceMap[price]['IW'] = gamePriceMap[price]['IW'].reverse();
            }
            return gamePriceMap;
        }

        /** 
         * @description Mobx Action
         */

        setInitialGame(bool) {
            this.initialGame = bool;
        }

        setClimberSkin(skin) {
            this.climberManSkin = skin;
        }

        setGamePrice(price) {
            this.currentPricePoint = price;
        }

        setGameTotalWin(prize) {
            if (prize === 0) {
                this.gameTotalWin = 0;
            } else {
                this.gameTotalWin += prize;
            }
        }

        setGameScene(scene) {
            this.gameCurrentScene = scene;
        }

        setGameIsInReveal(bool) {
            this.gameIsInReveal = bool;
        }

        setOnceClimbeComplete(bool) {
            this.onceClimbeComplete = bool;
        }

        setAutoPlay(bool) {
            this.autoPlay = bool;
        }

        setEndGame(bool) {
            this.endGame = bool;
        }

        setGameBonusType(value) {
            this.gameBonusType = value;
        }

        setGameBonusData(revealData) {
            this.bonusRevealData = revealData;
        }

        setSpinsLeft(value) {
            this.spinsLeft = value;
        }

        setGameState(value) {
            this.SKBState = value;
        }

        setStepIndex(value) {
            this.stepIndex = value;
        }

        setShowAutoMap(value) {
            this.showAutoMap = value;
        }

        setRDSFlag(value) {
            this.RDSFlag = value;
        }

        incrementSpinsLeft() {
            this.spinsLeft++;
        }

        decrementSpinsLeft() {
            this.spinsLeft--;
            this.stepIndex++;
        }

        get currentPriceMap() {
            return this.gamePriceMap[this.currentPricePoint];
        }
    }

    decorate(AppStore, {
        RDSFlag: observable,
        climberManSkin: observable,
        initialGame: observable,
        updateGamePrice: observable,
        currentPricePoint: observable,
        gameCurrentScene: observable,
        gameIsInReveal: observable,
        onceClimbeComplete: observable,
        autoPlay: observable,
        endGame: observable,
        stepIndex: observable,
        spinsLeft: observable,
        setInitialGame: action,
        setClimberSkin: action,
        setGamePrice: action,
        setGameTotalWin: action,
        setGameIsInReveal: action,
        setGameScene: action,
        setOnceClimbeComplete: action,
        setAutoPlay: action,
        setEndGame: action,
        incrementSpinsLeft: action,
        decrementSpinsLeft: action,
        currentPriceMap: computed,
        gameBonusType: observable,
        setGameBonusType: action,
        bonusRevealData: observable,
        setGameBonusData: action,
        gameTotalWin: observable,
        setSpinsLeft: action,
        SKBState: observable,
        setGameState: action,
        showAutoMap: observable,
        setShowAutoMap: action,
        setStepIndex: action,
        setRDSFlag: action

    });

    return AppStore;

});