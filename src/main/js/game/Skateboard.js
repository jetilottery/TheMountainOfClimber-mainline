define(['skbJet/component/gameMsgBus/GameMsgBus'], function (msgBus) {
    class Skateboard {
        constructor(appStore) { 
            this.appStore = appStore;
            this.onGameParametersUpdated = this.onGameParametersUpdated.bind(this);
            this.onInitialize = this.onInitialize.bind(this);
            this.onStartUserInteraction = this.onStartUserInteraction.bind(this);
            this.onReStartUserInteraction = this.onReStartUserInteraction.bind(this);
            this.onPlayerWantsPlayAgain = this.onPlayerWantsPlayAgain.bind(this);
            this.onReInitialize = this.onReInitialize.bind(this);
            this.onReset = this.onReset.bind(this);
            this.onError = this.onError.bind(this);
            this.onPlayerWantsToMoveToMoneyGame = this.onPlayerWantsToMoveToMoneyGame.bind(this);
            this.onEnterResultScreenState = this.onEnterResultScreenState.bind(this);
            this.subscribe();
        }

        onGameParametersUpdated(){
            this.appStore.setGameState('gameParametersUpdated');
        }

        onInitialize(){
            this.appStore.setGameState('initialize');
        }

        onStartUserInteraction(data){
            this.appStore.scenarioResponse = data;
            this.appStore.setGameState('startUserInteraction');
        }

        onReStartUserInteraction(data){
            this.appStore.scenarioResponse = data;
            this.appStore.setGameState('reStartUserInteraction');
        }

        onPlayerWantsPlayAgain(){
            this.appStore.setGameState('playerWantsPlayAgain');
        }

        onReInitialize(){
            this.appStore.setGameState('reInitialize');
        }

        onReset(){
            this.appStore.setGameState('reset');
        }

        onError(data){
            this.appStore.errorResponse = data;
            this.appStore.setGameState('error');
        }

        onPlayerWantsToMoveToMoneyGame(){
            this.appStore.setGameState('playerWantsToMoveToMoneyGame');
        }

        onEnterResultScreenState(){
            this.appStore.setGameState('enterResultScreenState');
        }

        subscribe() {
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', this.onGameParametersUpdated);
            msgBus.subscribe('jLottery.startUserInteraction', this.onStartUserInteraction);
            msgBus.subscribe('jLottery.reStartUserInteraction', this.onReStartUserInteraction);
            msgBus.subscribe('playerWantsPlayAgain', this.onPlayerWantsPlayAgain);
            msgBus.subscribe('jLottery.initialize', this.onInitialize);
            msgBus.subscribe('jLottery.reInitialize', this.onReInitialize);
            msgBus.subscribe('jLotterySKB.reset', this.onReset);
            msgBus.subscribe('jLottery.error', this.onError);
            msgBus.subscribe('winboxError', this.onError);
            msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', this.onPlayerWantsToMoveToMoneyGame);
            msgBus.subscribe('jLottery.enterResultScreenState', this.onEnterResultScreenState);

        }
    }

    return Skateboard;

});