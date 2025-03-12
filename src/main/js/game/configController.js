/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    style: {
        'buttonStyle': {
            strokeThickness: 2,
        },
        'buttonDisableStyle': {
            strokeThickness: 0,
        },
        "ticketCostLevelIcon": {
            "_width": "30",
            "_height": "6",
            "_top": "140"
        },
        'simpleWinText': {
            "dropShadow": true,
            "dropShadowAngle": 4.7,
            "dropShadowBlur": -8,
            "dropShadowColor": "#bc5a04",
            "dropShadowDistance": -6,
            "lineJoin": "round",
            "miterLimit": 11,
        },
        'simpleWinValue': {
            "dropShadow": true,
            "dropShadowAngle": 4.7,
            "dropShadowBlur": -5,
            "dropShadowColor": "#bc5a04",
            "dropShadowDistance": -7,
            "miterLimit": 9,
            "fontVariant": "small-caps",
        },
        'buttonPlayDisable': { stroke: '#585756' },
        'buttonPlayEnable': { stroke: '#0b552e' },
        'tutorialTextStyle': {
            fontFamily: 'Oswald',
            fontWeight: "600",
            //fill: ['#fff0d0','#ecbd86'],
            //fillGradientStops:[0,1],
            //fillGradientType:0,
            fill: ['#ecbd86'],
            dropShadow: true,
            dropShadowDistance: 2.5,
            fontSize: 32,
            strokeThickness: 2,
            miterLimit: 28,
            padding: 41,
            stroke: "#000000"
        },
    },
    textAutoFit: {
        "autoPlayText": {
            "isAutoFit": true
        },
        "autoPlayMTMText": {
            "isAutoFit": true
        },
        "buyText": {
            "isAutoFit": true
        },
        "tryText": {
            "isAutoFit": true
        },
        "warningExitText": {
            "isAutoFit": true
        },
        "warningContinueText": {
            "isAutoFit": true
        },
        "errorExitText": {
            "isAutoFit": true
        },
        "errorTitle": {
            "isAutoFit": true
        },
        "exitText": {
            "isAutoFit": true
        },
        "playAgainText": {
            "isAutoFit": true
        },
        "playAgainMTMText": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "win_Text": {
            "isAutoFit": true
        },
        "win_Try_Text": {
            "isAutoFit": true
        },
        "win_Value": {
            "isAutoFit": true
        },
        "closeWinText": {
            "isAutoFit": true
        },
        "nonWin_Text": {
            "isAutoFit": true
        },
        "closeNonWinText": {
            "isAutoFit": true
        },
        "win_Value_color": {
            "isAutoFit": true
        },
        "ticketCostText": {
            "isAutoFit": true
        },
        "ticketCostValue": {
            "isAutoFit": true
        },
        "tutorialTitleText": {
            "isAutoFit": true
        },
        "closeTutorialText": {
            "isAutoFit": true
        },
        "winUpToText": {
            "isAutoFit": true
        },
        "winUpToValue": {
            "isAutoFit": true
        }
    },
    audio: {
        //"gameInit": {
        // "name": "GameInit",
        // "channel": "0"
        //},
        "gameLoop": {
            "name": "MusicLoop",
            "channel": "0"
        },
        "gameLoopAmbience": {
            "name": "AmbienceMainLoop_ocean",
            "channel": "1"
        },
        //"gameWin": {
        //"name": "CongratulationsResultScreen",
        // "channel": "3"
        //},
        "gameNoWin": {
            "name": "BaseMusicLoopTermLose",
            "channel": "0"
        },
        "ButtonBuy": {
            "name": "buy_ok",
            "channel": "4"
        },
        "ButtonGeneric": {
            "name": "buy_ok",
            "channel": "4"
        },
        "HelpPageOpen": {
            "name": "buy_ok",
            "channel": "4"
        },
        "HelpPageClose": {
            "name": "buy_ok",
            "channel": "4"
        },
        "ButtonBetMax": {
            "name": "buy_ok",
            "channel": "4"
        },
        "ButtonBetUp": {
            "name": "buy_ok",
            "channel": "4"
        },
        "ButtonBetDown": {
            "name": "buy_ok",
            "channel": "4"
        },
        "PaytableOpen": {
            "name": "buy_ok",
            "channel": "4"
        },
        "PaytableClose": {
            "name": "buy_ok",
            "channel": "4"
        }
    },
    gladButtonImgName: {
        //audioController
        "buttonAudioOn": "soundOnButton",
        "buttonAudioOff": "soundOffButton",
        //buyAndTryController
        "buttonTry": "mainButton",
        "buttonBuy": "mainButton",
        //errorWarningController
        "warningContinueButton": "mainButton",
        "warningExitButton": "mainButton",
        "errorExitButton": "mainButton",
        //exitAndHomeController
        "buttonExit": "mainButton",
        "buttonHome": "homeButton",
        //playAgainController
        "buttonPlayAgain": "mainButton",
        "buttonPlayAgainMTM": "mainButton",
        //playWithMoneyController
        "buttonMTM": "mainButton",
        //resultController
        "buttonWinClose": "mainButton",
        "buttonNonWinClose": "mainButton",
        //ticketCostController
        "ticketCostPlus": "ticketCostPlus",
        "ticketCostMinus": "ticketCostMinus",
        //tutorialController
        "iconOff": "ticketCostLevelIconOff",
        "iconOn": "ticketCostLevelIconOn",
        "tutorialButtonClose": "mainButton",
        //revealAllController
        "buttonAutoPlay": "mainButton",
        "buttonAutoPlayMTM": "mainButton"
    },
    gameParam: {
        //tutorialController
        "pageNum": 3,
        //ticketCostController
        "arrowPlusSpecial": true
    },
    winUpAndDnTextStyle_win: {
        fontFamily: 'Oswald',
        fontWeight: "600",
        fill: ['#ffffff', '#fdf93b', '#ffa415', '#ffa415'],
        fillGradientStops: [0, 0.2, 0.8, 1],
        fillGradientType: 0,
        padding: 2,
        dropShadow: true,
        dropShadowDistance: 2,
        fontSize: 24,
        strokeThickness: 2,
        miterLimit: 2.6,
        stroke: "#000000"
    },
    winUpAndDnTextStyle_nowin: {
        fontFamily: 'Oswald',
        fontWeight: "600",
        fill: ['#ffffff', '#ffffff', '#9fcefc', '#ffffff', '#ffffff'],
        fillGradientStops: [0, 0.4, 0.5, 0.7, 1],
        fillGradientType: 0,
        padding: 2,
        dropShadow: false,
        dropShadowDistance: 2,
        fontSize: 24,
        strokeThickness: 2,
        miterLimit: 2.6,
        stroke: "#637b91"
    },
    predefinedStyle: {
        swirlName: "swirl",
        splashLogoName: "loadLogo",
        landscape: {
            canvas: {
                width: 1440,
                height: 810
            },
            gameLogoDiv: {
                width: 810,
                height: 630,
                y: 250,
                scale: {
                    x: 0.8,
                    y: 0.8
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.8,
                loop: true,
                y: 679,
                scale: {
                    x: 0.7,
                    y: 0.7
                }
            },
            brandCopyRightDiv: {
                bottom: 20,
                fontSize: 24,
                color: "#002397",
                fontFamily: "Oswald",
                miterLimit: 2.6,
            },
            progressTextDiv: {
                y: 679,
                style: {
                    fontSize: 30,
                    fill: "#1635b8",
                    fontWeight: 600,
                    fontFamily: "Oswald"
                }
            }
        },
        portrait: {
            canvas: {
                width: 810,
                height: 1228
            },
            gameLogoDiv: {
                width: 810,
                height: 630,
                y: 300
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.8,
                loop: true,
                y: 879,
                scale: {
                    x: 0.8,
                    y: 0.8
                }
            },
            brandCopyRightDiv: {
                bottom: 20,
                fontSize: 24,
                color: "#002397",
                fontFamily: "Oswald",
                miterLimit: 2.6,
            },
            progressTextDiv: {
                y: 879,
                style: {
                    fontSize: 30,
                    fill: "#1635b8",
                    fontWeight: 600,
                    fontFamily: "Oswald"
                }
            }
        }
    }
});