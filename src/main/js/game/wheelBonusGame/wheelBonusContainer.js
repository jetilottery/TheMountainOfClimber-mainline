define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gameUtils',
    'game/wheelBonusGame/config',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gameMsgBus/GameMsgBus',
], function(gr, SKBeInstant, gameUtils, config, audio, msgBus) {

    const stopPosition = {
        'landscape': 72,
        'portrait': 350
    };

    const showAnd0AlphaWheelBonus = () => {
        const { _wheelBonusScreen } = gr.lib;
        _wheelBonusScreen.show(true);
        enableConsole();

    };

    const hideWheelBonus = () => {
        const { _wheelBonusScreen } = gr.lib;
        _wheelBonusScreen.show(false);
        disableConsole();
    };


    function enableConsole() {
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
    }

    function disableConsole() {
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
    }

    /**
     * 
     * @param {Array} bonusRevealData 
     */
    const _sourceMap = {
        'A': 'hillIcon03_01',
        'D': 'hillIcon04_01',
        'U': 'hillIcon05_01',
    };

    const initialWheelBonusScene = function(bonusRevealData) {
        for (let i = 0; i < 4; i++) {
            gr.lib['_wheelPic_0' + i].show(false);
            gr.lib['_wheelText_0' + i].show(false);
            gr.lib['_wheelWinLight_0' + i].show(false);
            gameUtils.setTextStyle(gr.lib['_wheelText_0' + i], config.textStyle.einstantWinText);
            gr.lib['_wheelText_0' + i].updateCurrentStyle({ _transform: { _scale: { _x: 1, _y: 1 } } });
        }
        bonusRevealData.forEach((data, index) => {
            if (isNaN(data)) {
                const sprite = gr.lib['_wheelPic_0' + index];
                sprite.setImage(_sourceMap[data]);
                sprite.show(true);
            } else {
                const textSprite = gr.lib['_wheelText_0' + index];
                let { IW } = this.appStore.currentPriceMap;
                IW = IW.slice().reverse();
                textSprite.setText(SKBeInstant.formatCurrency(IW[data - 1]).formattedAmount);
                textSprite.show(true);
            }
        });
        gr.lib._wheelFlash.show(false);
    };

    const initialWheelBonusScreen = function() {
        const { _wheelPoint } = gr.lib;
        this.wheelButton.show(true);
        _wheelPoint.updateCurrentStyle({ _transform: { _rotate: 0 } });
        gr.animMap._wheelUpAndDown.play(Infinity);
    };

    const stopAllAnimation = function() {
        if (this.bgStarTimer) {
            gr.getTimer().clearTimeout(this.bgStarTimer);
            this.bgStarTimer = null;
        }
    };

    const pointLightAnimation = () => {
        const { _wheelPointLight } = gr.lib;
        _wheelPointLight.show(true);
        gr.animMap._wheelCircleFlash.play(Infinity);
    };

    const stopPointLightAnimation = () => {
        const { _wheelPointLight } = gr.lib;
        _wheelPointLight.show(false);
        gr.animMap._wheelCircleFlash.stop();
    };

    const stopWheelUpAndDown = (orientation) => {
        const { _wheel } = gr.lib;
        gr.animMap._wheelUpAndDown.stop();
        _wheel.updateCurrentStyle({ _top: stopPosition[orientation] });
    };

    const hideRevealButton = (gladButton) => {
        gladButton.show(false);
    };

    const doReactionForBonusWin = function(bonusWinType, bonusWinIndex) {
        if (isNaN(bonusWinType)) {
            gr.animMap._showCollectInBonus.play();
            audio.play("prizeSelected", 5);
            switch (bonusWinType) {
                case 'A':
                    this.appStore.baseGameStore.addAccList();
                    break;
                case 'D':
                    this.appStore.baseGameStore.addDnList();
                    break;
                case 'U':
                    this.appStore.baseGameStore.addUpList();
                    break;
                default:
                    break;
            }
        } else {
            audio.play('winCoins', 1);
            let { IW } = this.appStore.currentPriceMap;
            IW = IW.slice().reverse();
            this.appStore.setGameTotalWin(IW[bonusWinType - 1]);
            gr.animMap['_scaleBonusTextWin_0' + bonusWinIndex].play();
            gr.animMap['_scaleBonusTextWin_0' + bonusWinIndex]._onComplete = () => {
                gr.lib['_wheelWinLight_0' + bonusWinIndex].show(true);
                gr.lib['_wheelWinLight_0' + bonusWinIndex].gotoAndPlay('PointerLight02', 0.5, true);
                gr.getTimer().setTimeout(() => {
                    this.completeBonusGame();
                }, 3000);
            };
        }
    };

    return {
        showAnd0AlphaWheelBonus,
        hideWheelBonus,
        initialWheelBonusScene,
        stopWheelUpAndDown,
        hideRevealButton,
        doReactionForBonusWin,
        initialWheelBonusScreen,
        pointLightAnimation,
        stopPointLightAnimation,
        stopAllAnimation
    };
});