define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gameUtils',
    'game/gameConfig/textStyle',
    'game/baseGame/container/transitionContainer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gameMsgBus/GameMsgBus',

], function(gr, SKBeInstant, gameUtils, textStyle, transitionContainer, audio, msgBus) {

    const showAnd0AlphaPickBonus = () => {
        const { _pickBonusScreen } = gr.lib;
        _pickBonusScreen.show(true);
        enableConsole();



    };

    const hidePickBonus = function() {
        const { _pickBonusScreen } = gr.lib;
        _pickBonusScreen.show(false);
        disableConsole();
    };

    const initialPickBonus = () => {
        for (let i = 0; i < 4; i++) {
            gr.lib['_stoneClickTool_0' + i].show(false);
            gr.lib['_stonesSplit_0' + i].show(false);
            gr.lib['_pickText_0' + i].show(false);
            gr.lib['_pickPic_0' + i].show(false);
            gr.lib['_pickWinContainerBack_0' + i].show(false);
            gr.lib['_pickWinContainerFront_0' + i].show(false);
            gr.lib['_stoneClickParticles_0' + i].show(false);
        }
        for (let i = 0; i < 3; i++) {
            gr.lib['_stoneClickParticles_0' + i].show(false);
        }
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

    const playCurrentStoneAnimation = function(index) {
        gr.lib['_stoneClickParticles_0' + index].show(true);
        for (let i = 0; i < 3; i++) {
            gr.lib['_stoneClickParticles_0' + index + '_0' + i].show(true);
            gr.lib['_stoneClickParticles_0' + index + '_0' + i].gotoAndPlay('SelectedLight', true, 0.5);
        }
    };

    const stopCurrentStoneAnimation = function(index) {
        gr.lib['_stoneClickParticles_0' + index].show(false);
        for (let i = 0; i < 3; i++) {
            gr.lib['_stoneClickParticles_0' + index + '_0' + i].show(false);
            gr.lib['_stoneClickParticles_0' + index + '_0' + i].stopPlay();
        }
    };

    const playStoneFlashAnimation = function() {
        for (let i = 0; i < 4; i++) {
            const timer = Math.floor(Math.random() * 500) + 100;
            this.stoneFlashBeginTimer[i] = gr.getTimer().setTimeout(() => {
                gr.lib['_stone_0' + i].show(true);
                gr.animMap['_stoneAnimation_0' + i].play();
            }, timer);
        }
    };

    const stopStoneFlashAndHide = function() {
        for (let i = 0; i < 4; i++) {
            if (this.stoneFlashTimer[i]) {
                gr.getTimer().clearTimeout(this.stoneFlashTimer[i]);
                this.stoneFlashTimer[i] = null;
            }
            if (gr.animMap['_stoneAnimation_0' + i].isPlaying()) {
                gr.animMap['_stoneAnimation_0' + i].stop();
            }
            gr.lib['_stone_0' + i].show(false);
            gr.lib['_stone_0' + i].updateCurrentStyle({ _opacity: 0 });
        }
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
            const prize = IW.slice().reverse()[bonusWinType - 1];
            const originText = gr.lib['_pickText_0' + bonusWinIndex];
            originText.updateCurrentStyle({ _transform: { _scale: { _x: 1, _y: 1 } } });
            originText.autoFontFitText = true;
            gameUtils.setTextStyle(originText, textStyle.eInstantWin_win);
            originText.setText(SKBeInstant.formatCurrency(prize).formattedAmount);
            originText.show(true);
            gr.animMap['_pickTextZoomIn_' + bonusWinIndex].play();
            this.appStore.setGameTotalWin(prize);
            gr.animMap['_pickTextZoomIn_' + bonusWinIndex]._onComplete = () => {
                gr.getTimer().setTimeout(() => {
                    this.completeBonusGame();
                }, 3000);
            };
        }
    };

    const playFrontAnimation = function(index) {
        gr.lib['_pickWinContainerFront_0' + index].show(true);
        gr.lib['_pickWinContainerFront_0' + index + '_00'].show(true);
        gr.lib['_pickWinContainerFront_0' + index + '_00'].gotoAndPlay('StoneExplosion01', 0.3, false);
        gr.lib['_pickWinContainerFront_0' + index + '_01'].show(true);
        gr.lib['_pickWinContainerFront_0' + index + '_01'].gotoAndPlay('StoneExplosion00', 0.3, false);
    };

    const playBackAnimation = function(index) {
        gr.lib['_pickWinContainerBack_0' + index].show(true);
        gr.lib['_pickWinContainerBack_0' + index + '_00'].show(true);
        gr.lib['_pickWinContainerBack_0' + index + '_00'].gotoAndPlay('StoneExplosion02', 0.3, false);
        gr.lib['_pickWinContainerBack_0' + index + '_01'].show(true);
        gr.lib['_pickWinContainerBack_0' + index + '_02'].show(true);
        gr.lib['_pickWinContainerBack_0' + index + '_02'].gotoAndPlay('SelectedLight', 0.4, true);
    };

    const lastClickReaction = function(_this) {
        stopCurrentStoneAnimation(this.index);
        _this.winBonusIndex = this.index;
        for (let i = 0; i < 4; i++) {
            gr.lib['_stoneClickTool_0' + i].show(false);
        }
        const clickTool = gr.lib['_stoneClickTool_0' + this.index];
        clickTool.show(true);
        if (this.clickTimer) {
            gr.getTimer().clearTimeout(this.clickTimer);
            clickTool.updateCurrentStyle({ _transform: { _rotate: 24 } });
            this.clickTimer = null;
        }
        if (gr.animMap._pickBonusShock.isPlaying()) {
            gr.animMap._pickBonusShock.stop();
        }
        gr.animMap._pickBonusShock.play();
        clickTool.updateCurrentStyle({ _transform: { _rotate: -25 } });
        this.clickTimer = gr.getTimer().setTimeout(() => {
            this.clickTimer = null;
            clickTool.updateCurrentStyle({ _transform: { _rotate: 24 } });
            gr.lib['_stoneClickTool_0' + this.index].show(false);
            stopStoneFlashAndHide.call(_this);
            gr.lib['_stonesSplit_0' + this.index].show(false);
            playFrontAnimation(this.index);
            gr.getTimer().setTimeout(() => {
                playBackAnimation(this.index);
                if (_this.spineLights[this.index]) {
                    _this.spineLights[this.index].state.setAnimation(0, '07BonusWinLight', true);
                } else {
                    _this.initialSpine(this.index);
                    _this.spineLights[this.index].state.setAnimation(0, '07BonusWinLight', true);
                }
                doReactionForBonusWin.call(_this, _this.bonusWinType, this.index);
            }, 0);
        }, 100);
    };

    const mouseoverReaction = function(_this) {
        stopStoneFlashAndHide.call(_this);
        playCurrentStoneAnimation(this.index);
        gr.lib['_stone_0' + this.index].updateCurrentStyle({ _opacity: 1 });
        gr.lib['_stone_0' + this.index].show(true);
        gr.lib['_stoneClickTool_0' + this.index].show(true);
    };

    const mouseoutReaction = function() {
        stopCurrentStoneAnimation(this.index);
        gr.lib['_stone_0' + this.index].show(false);
        gr.lib['_stone_0' + this.index].updateCurrentStyle({ _opacity: 0 });
        gr.lib['_stoneClickTool_0' + this.index].show(false);
    };

    const translateToBaseOnStartReaction = () => {
        const { _baseGameScreen, _climberTotalContainer } = gr.lib;
        const { _opacity } = gr.lib._collect._currentStyle;
        if (_opacity !== 1) { gr.animMap._collectTransitonToBase.play(); }
        _baseGameScreen.updateCurrentStyle({ _opacity: 0 });
        _baseGameScreen.show(true);
        _climberTotalContainer.updateCurrentStyle({ _opacity: 0 });
        _climberTotalContainer.show(true);
    };

    const translateToBaseOnCompleteReaction = function() {
        const { spineLights, winBonusIndex, clickGraphicsArea } = this;
        hidePickBonus.call(this);
        spineLights[winBonusIndex].state.setEmptyAnimations(0.2);
        spineLights[winBonusIndex].skeleton.setToSetupPose();
        spineLights[winBonusIndex].update(0);
        gr.lib['_pickWinContainerBack_0' + winBonusIndex + '_01'].show(false);
        gr.lib['_pickWinContainerBack_0' + winBonusIndex + '_02'].show(false);
        gr.lib['_pickWinContainerBack_0' + winBonusIndex + '_02'].gotoAndStop(1);
        clickGraphicsArea.forEach((area) => {
            area.count = 0;
            area.interactive = true;
        });
    };

    return {
        showAnd0AlphaPickBonus,
        hidePickBonus,
        initialPickBonus,
        playStoneFlashAnimation,
        stopStoneFlashAndHide,
        doReactionForBonusWin,
        playFrontAnimation,
        playBackAnimation,
        lastClickReaction,
        mouseoverReaction,
        mouseoutReaction,
        translateToBaseOnStartReaction,
        translateToBaseOnCompleteReaction
    };
});