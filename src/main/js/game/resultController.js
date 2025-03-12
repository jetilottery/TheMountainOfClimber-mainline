define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    var winClose, nonWinClose, simpleWin;
    var resultData = null;
    var resultPlaque = null;
    var retryButton = null;

    function onGameParametersUpdated() {
        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        winClose = new gladButton(gr.lib._buttonWinClose, config.gladButtonImgName.buttonWinClose, scaleType);
        nonWinClose = new gladButton(gr.lib._buttonNonWinClose, config.gladButtonImgName.buttonNonWinClose, scaleType);
        simpleWin = new gladButton(gr.lib._simpleWinClickArea);
        winClose.click(closeResultPlaque);
        nonWinClose.click(closeResultPlaque);
        simpleWin.click(closeResultPlaque);


        retryButton = new gladButton(gr.lib._retryButton, "mainButton" /*'AutospinButton'*/ , scaleType);
        retryButton.show(false);
        gr.lib._retryText.setText(loader.i18n.Game.button_retry);
        retryButton.click(reSendRequest);

        if (config.textAutoFit.win_Text) {
            gr.lib._win_Text.autoFontFitText = config.textAutoFit.win_Text.isAutoFit;
        }

        if (config.textAutoFit.win_Try_Text) {
            gr.lib._win_Try_Text.autoFontFitText = config.textAutoFit.win_Try_Text.isAutoFit;
        }

        if (config.textAutoFit.win_Value) {
            gr.lib._win_Value.autoFontFitText = config.textAutoFit.win_Value.isAutoFit;
        }

        if (config.textAutoFit.closeWinText) {
            gr.lib._closeWinText.autoFontFitText = config.textAutoFit.closeWinText.isAutoFit;
        }

        if (config.textAutoFit.nonWin_Text) {
            gr.lib._nonWin_Text.autoFontFitText = config.textAutoFit.nonWin_Text.isAutoFit;
        }

        if (config.textAutoFit.closeNonWinText) {
            gr.lib._closeNonWinText.autoFontFitText = config.textAutoFit.closeNonWinText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinText) {
            gr.lib._simpleWinText.autoFontFitText = config.textAutoFit.simpleWinText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinTryText) {
            gr.lib._simpleWinTryText.autoFontFitText = config.textAutoFit.simpleWinTryText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinValue) {
            gr.lib._simpleWinValue.autoFontFitText = config.textAutoFit.simpleWinValue.isAutoFit;
        }

        if (SKBeInstant.config.wagerType === 'TRY') {
            if (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
                gr.lib._win_Try_Text.setText(loader.i18n.Game.message_anonymousTryWin);
                gr.lib._simpleWinTryText.setText(loader.i18n.Game.simple_anonymousTrywin);
            } else {
                gr.lib._win_Try_Text.setText(loader.i18n.Game.message_tryWin);
                gr.lib._simpleWinTryText.setText(loader.i18n.Game.simple_trywin);
            }
        }

        gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
        gr.lib._simpleWinText.setText(loader.i18n.Game.simple_buywin);

        if (config.style.win_Text) {
            gameUtils.setTextStyle(gr.lib._win_Text, config.style.win_Text);
        }

        if (config.style.win_Try_Text) {
            gameUtils.setTextStyle(gr.lib._win_Try_Text, config.style.win_Try_Text);
        }
        if (config.style.win_Value) {
            gameUtils.setTextStyle(gr.lib._win_Value, config.style.win_Value);
        }

        if (config.style.closeWinText) {
            gameUtils.setTextStyle(gr.lib._closeWinText, config.style.closeWinText);
        }

        if (config.style.simpleWinText) {
            gameUtils.setTextStyle(gr.lib._simpleWinText, config.style.simpleWinText);
        }

        if (config.style.simpleWinText) {
            gameUtils.setTextStyle(gr.lib._simpleWinTryText, config.style.simpleWinText);
        }

        if (config.style.simpleWinValue) {
            gameUtils.setTextStyle(gr.lib._simpleWinValue, config.style.simpleWinValue);
        }

        if (config.style.nonWin_Text) {
            gameUtils.setTextStyle(gr.lib._nonWin_Text, config.style.nonWin_Text);
        }

        if (config.style.closeNonWinText) {
            gameUtils.setTextStyle(gr.lib._closeNonWinText, config.style.closeNonWinText);
        }

        if (config.style.win_Value_color) {
            gameUtils.setTextStyle(gr.lib._win_Value, config.style.win_Value_color);
        }

        gr.lib._closeWinText.setText(loader.i18n.Game.message_close);
        gr.lib._nonWin_Text.setText(loader.i18n.Game.message_nonWin);
        gr.lib._closeNonWinText.setText(loader.i18n.Game.message_close);

        hideDialog();
    }

    function reSendRequest() {
        retryButton.show(false);
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });
    }

    function closeResultPlaque() {
        gr.lib._BG_dim.show(false);
        hideDialog();
        if (config.audio && config.audio.ButtonGeneric) {
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        }
        // Publish a message when result dialog is closed by user.
        // 21.june 5:50
        msgBus.publish('resultDialogClosed');
    }

    function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
        gr.lib._simpleWin.show(false);
    }

    function showWinResultScreen() {
        gr.lib._BG_dim.show(true);
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._win_Try_Text.show(false);
            gr.lib._win_Text.show(true);
        } else {
            gr.lib._win_Try_Text.show(true);
            gr.lib._win_Text.show(false);
        }
        gr.lib._win_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
        gr.lib._winPlaque.show(true);
        gr.lib._nonWinPlaque.show(false);
        msgBus.publish('standardWinShown');
    }

    function showSimpleWin() {
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._simpleWinText.show(true);
            gr.lib._simpleWinTryText.show(false);
        } else {
            gr.lib._simpleWinTryText.show(true);
            gr.lib._simpleWinText.show(false);
        }
        gr.lib._simpleWinValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
        gr.lib._simpleWin.show(true);
        msgBus.publish('simpleWinShown');
    }

    function showNoWinResultScreen() {

        if (loader.i18n.gameConfig.suppressNonWinResultPlaque === false) {

            gr.lib._BG_dim.show(true);
            gr.lib._winPlaque.show(false);
            gr.lib._nonWinPlaque.show(true);
        }

    }

    function showDialog() {
        if (resultData.playResult === 'WIN') {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.showResultScreen === true) {
                    showWinResultScreen();
                } else {
                    showSimpleWin();
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.showResultScreen === true) {
                    showWinResultScreen();
                } else {
                    showSimpleWin();
                }
            } else {
                showWinResultScreen();
            }
        } else {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.showResultScreen === true) {
                    showNoWinResultScreen();
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.showResultScreen === true) {
                    showNoWinResultScreen();
                }
            } else {
                showNoWinResultScreen();
            }
        }
    }

    function onStartUserInteraction(data) {
        resultData = data;
        //  gr.lib._BG_dim.show(false);
        hideDialog();
    }

    function playerWantsToMoveToMoneyGame() {
        hideDialog();
    }

    function onAllRevealed() {
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });

        msgBus.publish('disableUI');
    }

    function onEnterResultScreenState() {
        showDialog();
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        gr.lib._BG_dim.show(false);
        hideDialog();
    }


    function onPlayerWantsPlayAgain() {
        gr.lib._BG_dim.show(false);
        hideDialog();
    }

    function onTutorialIsShown() {
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible ? gr.lib._winPlaque : gr.lib._nonWinPlaque;
            hideDialog();
            gr.lib._BG_dim.show(true);
        }
    }

    function onTutorialIsHide() {
        if (resultPlaque) {
            resultPlaque.show(true);
            if (resultData.playResult === 'WIN') {
                // gr.lib._fire.gotoAndPlay('fire', 0.5, true);
            }
            resultPlaque = null;
        }
    }

    function onRetry() {
        retryButton.show(true);
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', playerWantsToMoveToMoneyGame);

    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('jLotterySKB.retry', onRetry);

    return {};
});