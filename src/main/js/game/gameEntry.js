define(function(require) {
    const PIXI = require('com/pixijs/pixi');
    require('game/loadController');
    require('game/paytableHelpController');
    require('game/audioController');
    require('game/buyAndTryController');
    require('game/errorWarningController');
    require('skbJet/componentCRDC/IwGameControllers/exitAndHomeController');
    require('skbJet/componentCRDC/IwGameControllers/gameSizeController');
    require('game/playAgainController');
    require('game/playWithMoneyController');
    require('game/metersController');
    require('game/resultController');
    require('skbJet/componentCRDC/IwGameControllers/jLotteryInnerLoarderUIController');
    require('game/rotateController');
    require('game/baseGame/container/rollAndSlideDownContainer');
    require('com/pixijs/pixi-tween');
    require('com/pixijs/pixi-spine');
    const Skateboard = require('game/Skateboard');
    const WinUpTo = require('game/winUpTo/WinUpTo');
    const GameTicket = require('game/ticket/GameTicket');
    const GameTutorial = require('game/tutorial/GameTutorial');
    const BaseGame = require('game/baseGame/BaseGame');
    const PickBonus = require('game/pickBonusGame/PickBonus');
    const WheelBonus = require('game/wheelBonusGame/WheelBonus');
    const Dress = require('game/climberManDress/Dress');
    const msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
    const Reveal = require('game/reveal/Reveal');
    const AutoMap = require('game/autoMap/AutoMap');
    const gr = require('skbJet/component/gladPixiRenderer/gladPixiRenderer');
    const AppStore = require('game/AppStore');
    let SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
	
    function gameParametersUpdated() {
        SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
        gr.getTicker().add(function(){ PIXI.tweenManager.update(); });
        const appStore = new AppStore(SKBeInstant);
        new Skateboard(appStore);
        new GameTutorial(appStore);
        new GameTicket(appStore);
        new WinUpTo(appStore);
        new BaseGame(appStore);
        new PickBonus(appStore);
        new WheelBonus(appStore);
        new Dress(appStore);
        new Reveal(appStore);
        new AutoMap(appStore);
    }
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', gameParametersUpdated);
    msgBus.subscribe('onStartGameInitial', function(){ SKBeInstant.parseOdeResp(true); });
    return {};
});