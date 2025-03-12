define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/reveal/config',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/gameUtils',
    'game/configController'
], function(gr, config, msgBus, gameUtils, gameConfiguration) {


    const disableAutoPlayButton = function() {
        this.buttonPlay.show(false);
        this.buttonAutoPlay.show(false);
        this.buttonPlayCenter.show(true);
    };

    const initialUI = function() {
        this.buttonPlay.show(false);
        this.buttonAutoPlay.show(false);
        this.buttonPlayCenter.show(false);
    };

    const disableRevealButton = function() {
        const {
            _buttonPlay,
            _buttonPlayCenter,
            _buttonPlayText,
            _buttonPlayCenterText
        } = gr.lib;
        msgBus.publish('disableButtonInfo');
        _buttonPlay.pixiContainer.interactive = false;
        _buttonPlayCenter.pixiContainer.interactive = false;
        this.buttonPlay.enable(false);
        this.buttonPlayCenter.enable(false);
        gameUtils.setTextStyle(_buttonPlayText, config.style.buttonPlayDisable);
        gameUtils.setTextStyle(_buttonPlayCenterText, config.style.buttonPlayDisable);
    };

    const enableRevealButton = function() {
        const {
            _buttonPlay,
            _buttonPlayCenter,
            _buttonPlayText,
            _buttonPlayCenterText
        } = gr.lib;
        _buttonPlay.pixiContainer.interactive = true;
        _buttonPlayCenter.pixiContainer.interactive = true;
        this.buttonPlay.enable(true);
        this.buttonPlayCenter.enable(true);
        gameUtils.setTextStyle(_buttonPlayText, config.style.buttonPlayEnable);
        gameUtils.setTextStyle(_buttonPlayCenterText, config.style.buttonPlayEnable);
        msgBus.publish('enableButtonInfo');

        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [1] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [1] }
        });
    };

    const disableAllButton = function() {
        this.buttonPlay.show(false);
        this.buttonPlay.enable(true);
        this.buttonPlayCenter.show(false);
        this.buttonPlayCenter.enable(true);
        this.buttonAutoPlay.show(false);
        this.buttonAutoPlay.enable(true);

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
    };

    const resetUI = () => {
        const {
            _buttonPlay,
            _buttonPlayCenter,
            _buttonPlayText,
            _buttonPlayCenterText
        } = gr.lib;
        gameUtils.setTextStyle(_buttonPlayText, config.style.buttonPlayEnable);
        gameUtils.setTextStyle(_buttonPlayCenterText, config.style.buttonPlayEnable);
        this.buttonPlay.enable(true);
        this.buttonPlayCenter.enable(true);
        _buttonPlay.pixiContainer.interactive = true;
        _buttonPlayCenter.pixiContainer.interactive = true;
        msgBus.publish('enableButtonInfo');

        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [1] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [1] }
        });

    };

    const showPlayButtonByAutoRevealEnabled = function() {
        const { autoRevealEnabled } = this.appStore.SKBeInstant.config;
        if (autoRevealEnabled) {
            this.buttonPlay.show(true);
            this.buttonAutoPlay.show(true);

            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "howToPlay", "event": "enable", "params": [1] }
            });
            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Control",
                data: { "name": "paytable", "event": "enable", "params": [1] }
            });

        } else {
            this.buttonPlayCenter.show(true);
        }
    };

    const updateRevealUIWhenGameReveal = function(gameInReveal) {
        const { _buttonPlayText, _buttonPlayCenterText, _autoPlayText } = gr.lib;
        this.buttonPlay.enable(!gameInReveal);
        this.buttonPlayCenter.enable(!gameInReveal);
        this.buttonAutoPlay.enable(!gameInReveal);



        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [!gameInReveal] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [!gameInReveal] }
        });


        if (gameInReveal) {
            gameUtils.setTextStyle(_buttonPlayText, gameConfiguration.style.buttonDisableStyle);
            gameUtils.setTextStyle(_autoPlayText, gameConfiguration.style.buttonDisableStyle);
            gameUtils.setTextStyle(_buttonPlayCenterText, gameConfiguration.style.buttonDisableStyle);
        } else {
            gameUtils.setTextStyle(_autoPlayText, gameConfiguration.style.buttonStyle);
            gameUtils.setTextStyle(_buttonPlayCenterText, gameConfiguration.style.buttonStyle);
            gameUtils.setTextStyle(_buttonPlayText, gameConfiguration.style.buttonStyle);
        }
    };

    const updateRevealUIWhenGameAutoPlay = function(gameInAutoPlay) {
        const { autoRevealEnabled } = this.appStore.SKBeInstant.config;
        if (gameInAutoPlay) {
            if (autoRevealEnabled) {
                this.buttonPlay.show(false);
                this.buttonAutoPlay.show(false);

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
            } else {
                this.buttonPlayCenter.show(false);
            }
        } else {
            if (autoRevealEnabled) {
                this.buttonPlay.show(true);
                this.buttonAutoPlay.show(true);

                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "howToPlay", "event": "enable", "params": [1] }
                });
                msgBus.publish('toPlatform', {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { "name": "paytable", "event": "enable", "params": [1] }
                });
            } else {
                this.buttonPlayCenter.show(true);
            }
        }
    };

    return {
        disableAutoPlayButton,
        initialUI,
        disableRevealButton,
        enableRevealButton,
        disableAllButton,
        resetUI,
        showPlayButtonByAutoRevealEnabled,
        updateRevealUIWhenGameReveal,
        updateRevealUIWhenGameAutoPlay
    };
});