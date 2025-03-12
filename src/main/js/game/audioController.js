define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gladButton',
    'game/configController',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
], function (msgBus, audio, gr, SKBeInstant, gladButton, config, loader) {
    var audioDisabled = false;
    var audioOn, audioOff;
    var MTMReinitial = false;
	var popUpDialog = false;
	
	var hidden = false;
    var playResultAudio = false;
    var buttonClick = true;

    function audioSwitch() {
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
            audioDisabled = false;
        } else {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
            audioDisabled = true;
        }
        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);
        if (buttonClick) {
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        }
        buttonClick = true;
    }

    function onConsoleControlChanged(data) {
        if (data.option === 'sound') {
            var isMuted = audio.consoleAudioControlChanged(data);
            if (isMuted) {
                gr.lib._buttonAudioOn.show(false);
                gr.lib._buttonAudioOff.show(true);
                audioDisabled = true;
            } else {
                gr.lib._buttonAudioOn.show(true);
                gr.lib._buttonAudioOff.show(false);
                audioDisabled = false;
            }
            audio.muteAll(audioDisabled);
        }
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
        if (SKBeInstant.isSKB()) {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.enableAudioDialog === true || SKBeInstant.config.customBehavior.enableAudioDialog === "true" || SKBeInstant.config.customBehavior.enableAudioDialog === 1) {
                    popUpDialog = true;
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.enableAudioDialog === true || loader.i18n.gameConfig.enableAudioDialog === "true" || loader.i18n.gameConfig.enableAudioDialog === 1) {
                    popUpDialog = true;
                }
            }
            if (popUpDialog) {
                audio.enableAudioDialog(true);  //set enable the dialog
            }
        }

        audioDisabled = SKBeInstant.config.soundStartDisabled;
        if (SKBeInstant.config.assetPack !== 'desktop' && popUpDialog) {
            audioDisabled = true;
        }
        audioOn = new gladButton(gr.lib._buttonAudioOn, config.gladButtonImgName.buttonAudioOn, scaleType);
        audioOff = new gladButton(gr.lib._buttonAudioOff, config.gladButtonImgName.buttonAudioOff, scaleType);
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
        }else{
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);            
        }
		audio.muteAll(audioDisabled);
        audioOn.click(audioSwitch);
        audioOff.click(audioSwitch);
    }

    function onStartUserInteraction() {
        audio.stopChannel(1);
        if(SKBeInstant.config.gameType === 'ticketReady'){
            return;
        }else{
            gr.getTimer().setTimeout(function() {
                audio.play("musicLoop", 2, true);
            }, 0);
		}
    }

    function onEnterResultScreenState() {
		if (hidden) {
            playResultAudio = true;
        } else {
            playResultAudio = false;
			audio.stopChannel(1);
            audio.stopChannel(2);
            audio.stopChannel(8);
            audio.play('resultsScreen',3);
		}
    }

    function onReStartUserInteraction() {
        audio.stopChannel(1);
        audio.play("musicLoop", 2, true);
    }            
    
    function onPlayerWantsPlayAgain() {
        audio.play("musicIntroLoop", 1, true);
    }

    function reset() {
        audio.stopAllChannel();
    }
    
    function onReInitialize(){
        audio.stopAllChannel();
        if(MTMReinitial){
            audio.play("musicIntroLoop", 1, true);
            MTMReinitial = false;
        }
    }
    
    function onPlayerSelectedAudioWhenGameLaunch(data){
        if(popUpDialog){
            audioDisabled = data;
            buttonClick = false;
            audioSwitch();
        }else{
            audio.muteAll(audioDisabled);
        }
        
        if (SKBeInstant.config.gameType === 'ticketReady') {
            gr.getTimer().setTimeout(function () {
                audio.play("musicLoop", 2, true);
            }, 0);
        }else{
           /*  gr.getTimer().setTimeout(function () {
                audio.play("musicIntroLoop", 1, true);
            }, 0); */		
        }
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
	
	msgBus.subscribe('jLotteryGame.playerWantsToExit', function(){
        audio.stopAllChannel();
    });
    
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', reset);
    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
//    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	
    msgBus.subscribe('resourceLoaded', function () {
        if (!SKBeInstant.isSKB()) {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.enableAudioDialog === true || SKBeInstant.config.customBehavior.enableAudioDialog === "true" || SKBeInstant.config.customBehavior.enableAudioDialog === 1) {
                    popUpDialog = true;
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.enableAudioDialog === true || loader.i18n.gameConfig.enableAudioDialog === "true" || loader.i18n.gameConfig.enableAudioDialog === 1) {
                    popUpDialog = true;
                }
            }
            if (popUpDialog) {
                audio.enableAudioDialog(true);  //set enable the dialog
            }
        }
    });

    
	document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            hidden = true;
        } else {
            hidden = false;
            if(playResultAudio){
                onEnterResultScreenState();
            }
        }
    });
    
    return {};
});