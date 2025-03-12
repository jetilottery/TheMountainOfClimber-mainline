define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/baseGame/baseGameContainer',
    'game/baseGame/mountain/Mountain',
    'game/baseGame/ClimberMan',
    'game/baseGame/SnowMan',
    'game/baseGame/Goat',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'com/mobx/mobx',
    'game/gameScenarioReact',
    'game/baseGame/container/accListContainer',
    'game/baseGame/container/dnListContainer',
    'game/baseGame/container/upListContainer',
    'game/baseGame/container/transitionContainer',
    'game/baseGame/container/spinLeftContainer',
    'game/baseGame/container/xContainer',
    'skbJet/component/resourceLoader/resourceLib',
    'game/gameConfig/gameConfiguration',
    'game/gameConfig/textStyle',
    'com/pixijs/pixi',
    'game/Particle',
    'game/baseGame/snowParticleData',
    'game/baseGame/container/backGroundImage',
    'game/baseGame/container/birdsContainer',
    'game/pickBonusGame/pickBonusContainer',
    'game/wheelBonusGame/wheelBonusContainer',
    'game/gameUtils',
    "skbJet/componentCRDC/pixiCoinShower/PixiCoinShower",
    "skbJet/component/gladPixiRenderer/Sprite",
], function(
    gr,
    audio,
    baseGameContainer,
    Mountain,
    ClimberMan,
    SnowMan,
    Goat,
    loader,
    msgBus,
    mobx,
    gameScenarioReact,
    accListContainer,
    dnListContainer,
    upListContainer,
    transitionContainer,
    spinLeftContainer,
    xContainer,
    resLib,
    gameConfiguration,
    textStyle,
    PIXI,
    Particle,
    snowParticleData,
    backGroundImage,
    birdsContainer,
    pickBonusContainer,
    wheelBonusContainer,
    gameUtils,
    CoinShower,
    Sprite,
) {
    const { reaction, autorun } = mobx;
    class BaseGame {
        constructor(appStore) {
            this.appStore = appStore;
            this.currentClimberStep = 0;
            this.appStore.ticketID = '';
            this.awardIWPrize = [13, 23, 31, 44, 54, 64, 71, 80];
            this.ups = [4, 14, 18, 25, 35, 42, 53, 66];
            this.dns = [16, 28, 37, 46, 56, 63, 73, 79];
            this.mys = [7, 10, 20, 27, 34, 39, 49, 57, 69, 75];
            this.bonus = [17, 36, 51, 61];
            this.xs = [15, 24, 40, 52, 65];
            this.accs = [5, 12, 21, 33, 45, 58, 67, 77];

            this.currentSpinsLeft = this.appStore.spinsLeft;
            //For audio
            this.playOnceForestAmbienceAudio = false;
            this.stopOnceForestAmbienceAudio = false;
            this.revealAward = new Set();
            this.snowParticles = [];
            this.particleImageArray = [
                'SnowParticles',
                'SnowParticles02',
                'SnowParticles03'
            ];
            this.landAudioIndex = 4;
            this.climberManSkin = '';
            this.currentClimberSpine = null;
            this.climberMan = null;
            this.snowMan = null;
            this.goat = null;
            this.goatButton = null;
            this.coinDownParticle = null;
            this.coinDownParticleTimer = null;
            this.mysTimers = [];

            this.newGame = false;
            this.autoPlayTimer = null;
            // Functions blow is for game initial
            this.starsArray = [
                gr.lib._winUpToStar,
                gr.lib._buttonAutoPlayStar,
                gr.lib._buttonPlayStar,
                gr.lib._buttonPlayCenterStar
            ];
            this.starTimer = null;
            this.resultTimer = null;
            this.playSnowWindTimer = null;
            this.ticketCostChanged = this.ticketCostChanged.bind(this);
            this.drawlineDemand = this.drawlineDemand.bind(this);
            this.subscribe();
            this.bindReaction();
        }

        subscribe() {
            msgBus.subscribe('ticketCostChanged', this.ticketCostChanged);
            msgBus.subscribe('MOUNTAIN.UP.ONESTEP', this.drawlineDemand);
            msgBus.subscribe("CLIMBERMAN.STOP", () => { this.climberMan.stop(); });
            msgBus.subscribe('simpleWinShown', () => {
                const { _simpleWinCircleLight, _simpleBG, _simpleBG2 } = gr.lib;
                this.simpleWinLight.state.setAnimation(0, '03Win02A', true);
                this.simpleWinLight.state.timeScale = 2;
                _simpleWinCircleLight.show(true);
                _simpleBG.show(true);
                _simpleBG2.show(true);
                gr.animMap._simpleWinBreath.play(Infinity);
                this.resultTimer = gr.getTimer().setTimeout(() => {
                    this.resultTimer = null;
                    gr.animMap._simpleWinBreath.stop();
                    _simpleWinCircleLight.show(false);
                    _simpleBG.show(false);
                    _simpleBG2.show(false);
                    this.simpleWinLight.state.setEmptyAnimations(0.2);
                    this.simpleWinLight.skeleton.setToSetupPose();
                    this.simpleWinLight.update(0);
                }, 6000);
            });
            msgBus.subscribe("resultDialogClosed", () => {
                const { _simpleBG, _simpleBG2 } = gr.lib;
                _simpleBG.show(false);
                _simpleBG2.show(false);
                gr.animMap._simpleWinBreath.stop();
                if (this.resultTimer) {
                    gr.getTimer().clearTimeout(this.resultTimer);
                    this.resultTimer = null;
                    this.simpleWinLight.state.setEmptyAnimations(0.2);
                    this.simpleWinLight.skeleton.setToSetupPose();
                    this.simpleWinLight.update(0);
                }
                if (this.coinDownParticle) {
                    this.coinDownParticle.stop();
                    gr.getTimer().clearTimeout(this.coinDownParticleTimer);
                    this.coinDownParticleTimer = null;
                }
            });
            msgBus.subscribe("tutorialIsShown", () => {
                if (this.appStore.SKBState === "enterResultScreenState") {
                    gr.lib['_coinDownContainer'].show(false);
                }
            });
            msgBus.subscribe("tutorialIsHide", () => {
                if (this.appStore.SKBState === "enterResultScreenState") {
                    gr.lib['_coinDownContainer'].show(true);
                }
            });
        }

        createCoinShower() {
            const { _coinShowContainer } = gr.lib;
            var frames = [];
            for (var i = 0; i < Sprite.getSpriteSheetAnimationFrameArray("coinOne").length; i++) {
                frames.push(PIXI.Texture.fromFrame(Sprite.getSpriteSheetAnimationFrameArray("coinOne")[i] + ".png"));
            }
            this.coinShower = new CoinShower({
                parentContain: _coinShowContainer.pixiContainer,
                frames: frames,
                ticker: gr.getTicker(),
                visibleRange: [-200, 1500, -200, 1200],
                popPosition: [
                    _coinShowContainer._currentStyle._width / 2,
                    _coinShowContainer._currentStyle._height / 2,
                    _coinShowContainer._currentStyle._width / 2,
                    _coinShowContainer._currentStyle._height,
                ],
                coinPerTime: 5,
                initScale: 0.3,
                coinAnimatSpeed: [0.1, 0.3],
                rotation: [0, 180]
            });
        }

        initialSpine() {
            const { _spinsLeftDi, _simpleWinCircleLight, _80Box, _80Flag } = gr.lib;
            let localRect;
            this.spinsLeftSpine = new PIXI.spine.Spine(resLib.spine.SpinsAspine.spineData);
            this.spinsLeftSpine.skeleton.setToSetupPose();
            this.spinsLeftSpine.update(0);
            _spinsLeftDi.pixiContainer.addChild(this.spinsLeftSpine);
            localRect = this.spinsLeftSpine.getLocalBounds();
            this.spinsLeftSpine.position.set(-localRect.x, -localRect.y);
            this.spinsLeftSpine.state.setAnimation(0, 'spinsA02', true);
            this.spinsLeftSpine.state.timeScale = 1;

            this.awardBoxSpine = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
            this.awardBoxSpine.skeleton.setToSetupPose();
            this.awardBoxSpine.update(0);
            _80Box.pixiContainer.addChild(this.awardBoxSpine);
            localRect = this.awardBoxSpine.getLocalBounds();
            this.awardBoxSpine.position.set(-localRect.x, -localRect.y);
            this.awardBoxSpine.state.timeScale = 1;

            this.awardFlagSpine = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
            this.awardFlagSpine.skeleton.setToSetupPose();
            this.awardFlagSpine.update(0);
            _80Flag.pixiContainer.addChildAt(this.awardFlagSpine, 0);
            localRect = this.awardFlagSpine.getLocalBounds();
            this.awardFlagSpine.position.set(-localRect.x, -localRect.y);
            this.awardFlagSpine.state.setAnimation(0, '10flag', true);
            this.awardFlagSpine.state.timeScale = 1;

            this.simpleWinLight = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
            this.simpleWinLight.skeleton.setToSetupPose();
            this.simpleWinLight.update(0);
            _simpleWinCircleLight.pixiContainer.addChild(this.simpleWinLight);
            localRect = this.simpleWinLight.getLocalBounds();
            this.simpleWinLight.position.set(-localRect.x, -localRect.y);
        }

        createClimberMan() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const { x, y } = gameConfiguration[orientation].climberManCoordinate;
            const { _climberManContainer, _climberManHover } = gr.lib;
            this.climberMan = new ClimberMan(x, y, 0.6, 0.6, _climberManContainer);
            this.climberMan.on('click', () => { this.appStore.dressStore.setDressPageVisibility(true); });
            this.climberMan.on('mouseover', () => { _climberManHover.show(true); });
            this.climberMan.on('mouseout', () => { _climberManHover.show(false); });
        }

        createSnowMan() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const { x, y } = gameConfiguration[orientation].snowManCoordinate;
            const { _climberManContainer, _snowManHover } = gr.lib;
            this.snowMan = new SnowMan(x, y, 0.5, 0.5, _climberManContainer);
            this.snowMan.on('click', () => { this.appStore.dressStore.setDressPageVisibility(true); });
            this.snowMan.on('mouseover', () => { _snowManHover.show(true); });
            this.snowMan.on('mouseout', () => { _snowManHover.show(false); });
        }

        createGoat() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const { x, y } = gameConfiguration[orientation].goatCoordinate;
            const { _climberManContainer, _goatHover } = gr.lib;
            this.goat = new Goat(x, y, 0.6, 0.6, _climberManContainer);
            this.goat.on('click', () => { this.appStore.dressStore.setDressPageVisibility(true); });
            this.goat.on('mouseover', () => { _goatHover.show(true); });
            this.goat.on('mouseout', () => { _goatHover.show(false); });
        }

        createMountain() {
            this.mountain = new Mountain(this.appStore);
        }

        drawlineDemand() {
            const { climberSkinConfiguration } = gameConfiguration.universal;
            this.currentClimberSpine.play(climberSkinConfiguration[this.climberManSkin].climb, 1.6, false);
            audio.play("climb", 9);
        }
        /**
         * 
         * @param {string} pricePoint 
         * @description Subscirbe ticket cost changed when ticket was changed by user action
         */
        ticketCostChanged(pricePoint) {
            this.appStore.setGamePrice(pricePoint);
        }

        cloneAnimation() {
            let numberNameList,
                AnimationName;
            const {
                _idleLightFlash,
                _mesteryIdle,
                _winIWScaleAnimation,
                _upOrDnScale,
                _upLightAnimation,
                _winUpEW,
                _scaleUpWinText,
                _spinLeftAnimation
            } = gr.animMap;
            this.ups.forEach((up) => {
                up = up < 10 ? '0' + up : up;
                numberNameList = ['_awrdGridLight_' + up];
                AnimationName = '_idleLightFlash' + up;
                _idleLightFlash.clone(numberNameList, AnimationName);
            });
            this.dns.forEach((dn) => {
                dn = dn < 10 ? '0' + dn : dn;
                numberNameList = ['_awrdGridLight_' + dn];
                AnimationName = '_idleLightFlash' + dn;
                _idleLightFlash.clone(numberNameList, AnimationName);
            });
            this.mys.forEach((my) => {
                my = my < 10 ? '0' + my : my;
                numberNameList = ['_awardGrid_' + my];
                AnimationName = '_mesteryIdle' + my;
                _mesteryIdle.clone(numberNameList, AnimationName);
            });
            this.awardIWPrize.forEach((iw) => {
                numberNameList = ['_awardGridContainer_' + iw];
                AnimationName = '_winIWScaleAnimation_' + iw;
                _winIWScaleAnimation.clone(numberNameList, AnimationName);
            });

            for (let i = 1; i < 5; i++) {
                numberNameList = ['_collectUpIcon0' + i];
                AnimationName = '_upScale_0' + i;
                _upOrDnScale.clone(numberNameList, AnimationName);
                numberNameList = ['_collectDownIcon0' + i];
                AnimationName = '_dnScale_0' + i;
                _upOrDnScale.clone(numberNameList, AnimationName);
            }

            numberNameList = ['_collectDownLight_01', '_collectDownLight_02', '_collectDownLight_03', '_collectDownLight_04', ];
            AnimationName = '_dnLightAnimation';
            _upLightAnimation.clone(numberNameList, AnimationName);

            for (let i = 1; i < 9; i++) {
                numberNameList = ['_collectGem0' + i];
                AnimationName = '_accScale_0' + i;
                _upOrDnScale.clone(numberNameList, AnimationName);
            }

            _winUpEW.clone(['_collectDownWinLight'], '_winDownEW');
            _scaleUpWinText.clone(['_collectDnText'], '_scaleDnWinText');
            _spinLeftAnimation.clone(['_climberTotalText', '_climberTotalText01'], '_climberTotalTextAnimation');
        }

        defineAnimComplete() {
            const {
                _collectUpWinLight,
                _collectDownWinLight,
                _mesteryLight,
                _coinShowContainer,
                _windContainer_02
            } = gr.lib;
            const {
                _translateToBonus_01,
                _translateToBonus_02,
                _mesteryLightBreath,
                _winUpToShow,
                _winUpEW,
                _winDownEW,
                _winTopAwardHillMove,
                _hideCloud
            } = gr.animMap;
            _translateToBonus_01._onStart = () => {
                pickBonusContainer.showAnd0AlphaPickBonus();
            };
            _translateToBonus_01._onComplete = () => {
                // if (this.appStore.RDS.revealDataSave) {
                //   this.appStore.RDS.revealDataSave[this.appStore.ticketID].winBonus = true;
                // this.appStore.RDS.revealDataSave[this.appStore.ticketID].bonusType = 1;
                //his.appStore.RDS.revealDataSave[this.appStore.ticketID].bonusRevealData = this.appStore.bonusRevealData;
                //}
                this.appStore.setOnceClimbeComplete(true);
            };
            _translateToBonus_02._onStart = () => {
                wheelBonusContainer.showAnd0AlphaWheelBonus();
            };
            _translateToBonus_02._onComplete = () => {
                //if (this.appStore.RDS.revealDataSave) {
                //  this.appStore.RDS.revealDataSave[this.appStore.ticketID].winBonus = true;
                // this.appStore.RDS.revealDataSave[this.appStore.ticketID].bonusType = 2;
                //his.appStore.RDS.revealDataSave[this.appStore.ticketID].bonusRevealData = this.appStore.bonusRevealData;
                //}
                this.appStore.setOnceClimbeComplete(true);
            };
            _mesteryLightBreath._onStart = () => { _mesteryLight.show(true); };
            _mesteryLightBreath._onEnd = () => {
                _mesteryLight.show(false);
                _mesteryLight.updateCurrentStyle({ _opacity: 1 });
            };
            _winUpToShow._onComplete = () => { this.resetGame(); };
            _winUpEW._onComplete = () => { _collectUpWinLight.updateCurrentStyle({ _opacity: 1 }); };
            _winDownEW._onComplete = () => { _collectDownWinLight.updateCurrentStyle({ _opacity: 1 }); };
            _winTopAwardHillMove._onComplete = () => {
                audio.play('finalTreasureChestGold', 1);
                _coinShowContainer.show(true);
                this.coinShower.start();
            };
            for (let i = 1; i < 5; i++) {
                gr.lib['_collectUpAperture_0' + i].onComplete = function() { this.show(false); };
                gr.lib['_collectDownAperture_0' + i].onComplete = function() { this.show(false); };
            }
            for (let i = 1; i < 9; i++) {
                gr.lib['_collectAccAperture_0' + i].onComplete = function() { this.show(false); };
            }
            this.starsArray.forEach((item) => {
                item.onComplete = () => {
                    item.show(false);
                };
            });
            _hideCloud._onComplete = () => {
                transitionContainer.resetTransitionContainer();
            };
            _windContainer_02.onComplete = function() { this.show(false); };
        }

        winBoxErrorComplete() {
            if (this.autoPlayTimer !== null) {
                gr.getTimer().clearTimeout(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
            baseGameContainer.winBoxErrorHandler(this.appStore.SKBeInstant.config.defaultWinsValue);
            msgBus.publish('winboxError', { errorCode: "29000" });
            msgBus.publish('onDisableUI');
        }

        resetGame() {
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const { standing } = gameConfiguration.universal.climberSkinConfiguration[this.climberManSkin];
            this.appStore.baseGameStore.setDnList(0);
            this.appStore.baseGameStore.setUpList(0);
            this.appStore.baseGameStore.setAccList(0);
            this.mountain.resetPosition();
            this.appStore.setSpinsLeft(8);
            this.appStore.setStepIndex(-1);
            this.appStore.setGameTotalWin(0);
            this.appStore.baseGameStore.setTotalClimberStep(0);
            this.revealAward.forEach(element => {
                element = element < 10 ? '0' + element : element;
                if (gr.lib['_awardGridContainer_' + element]) {
                    gr.lib['_awardGridContainer_' + element].show(true);
                }
            });
            this.revealAward.clear();
            baseGameContainer.resetEwTextStyle.call(this);
            backGroundImage.resetBackGround(orientation);
            birdsContainer.resetBirds(orientation);
            const { _hill, _climberManContainer } = gr.lib;
            _climberManContainer.updateCurrentStyle({ _left: 0, _top: 0, _transform: { _scale: { _x: 1, _y: 1 } } });
            _hill.updateCurrentStyle({ _transform: { _scale: { _x: 1, _y: 1 } } });
            this.currentClimberSpine.play(standing, 1, true);
            this.appStore.setAutoPlay(false);
            this.appStore.setGameIsInReveal(false);
            this.snowParticles.forEach((snowParticle) => { snowParticle.stop(); });
            this.snowParticles = [];
            this.playOnceForestAmbienceAudio = false;
            this.stopOnceForestAmbienceAudio = false;
            if (this.playSnowWindTimer) {
                gr.getTimer().clearTimeout(this.playSnowWindTimer);
                this.playSnowWindTimer = null;
            }
            baseGameContainer.resetGame();
        }

        setTextStyle() {
            const { _spinsLeftText, _collectDnText, _collectUpText, _climberTotalText, _climberTotalText01, _climber80 } = gr.lib;
            gameUtils.setTextStyle(_spinsLeftText, textStyle.spinLeft);
            for (let i = 1; i < 9; i++) {
                gameUtils.setTextStyle(gr.lib['_collectGemText0' + i], textStyle.upDnAccEinstant_nowin);
            }
            gameUtils.setTextStyle(_collectDnText, textStyle.upDnAccEinstant_nowin);
            gameUtils.setTextStyle(_collectUpText, textStyle.upDnAccEinstant_nowin);
            for (let i = 0; i < this.awardIWPrize.length; i++) {
                gameUtils.setTextStyle(gr.lib['_awardGrid_' + this.awardIWPrize[i]], textStyle.eInstantWin_win);
                gr.lib['_awardGrid_' + this.awardIWPrize[i]].autoFontFitText = true;
            }
            gameUtils.setTextStyle(_climberTotalText, textStyle.climberTotalText);
            gameUtils.setTextStyle(_climberTotalText01, textStyle.climberTotalText);
            gameUtils.setTextStyle(_climber80, textStyle.climberTotalText);
        }

        setText() {
            const { _spinsLeftText, _spinsLeftN01, _climber80 } = gr.lib;
            _spinsLeftText.autoFontFitText = true;
            _spinsLeftN01.autoFontFitText = true;
            _spinsLeftText.setText(loader.i18n.Game.spinsLeft);
            _climber80.setText(' /' + 80);
        }

        getkeyIconFramePosition() {
            const { autoPlay } = this.appStore;
            let orientation;
            if (this.appStore.SKBeInstant.isSKB()) {
                orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
            } else {
                orientation = this.appStore.SKBeInstant.getGameOrientation();
            }
            const { x, y } = gameConfiguration[orientation].keyIconFramePosition;
            let keyIconFramePosition = { 'x': x, 'y': y };
            if (autoPlay) {
                const { _autoPointer } = gr.lib;
                keyIconFramePosition = _autoPointer.toGlobal({ x: 0, y: 0 });
                keyIconFramePosition.x -= _autoPointer._currentStyle._width / 3;
                keyIconFramePosition.y -= _autoPointer._currentStyle._height / 3;
            }
            return keyIconFramePosition;
        }

        init() {
            this.setTextStyle();
            this.setText();
            this.cloneAnimation();
            this.defineAnimComplete();
            this.createCoinShower();
            this.createMountain();
            this.initialSpine();
        }

        startUserInteraction() {
            const { scenarioResponse, SKBeInstant } = this.appStore;
            let _ticketReadyID;
            this.appStore.ticketID = scenarioResponse.ticketId || scenarioResponse.scenario;
            if (scenarioResponse.revealData && scenarioResponse.revealData !== 'null') {
                if (!SKBeInstant.isSKB()) {
                    const _revealData = JSON.parse(scenarioResponse.revealData.replace(/\\/g, ''));
                    if (_revealData && _revealData.revealDataSave) {
                        if (_revealData.revealDataSave[3]) {
                            _ticketReadyID = _revealData.revealDataSave[3];
                        } else {
                            _ticketReadyID = scenarioResponse.scenario || scenarioResponse.ticketId;
                        }
                    }
                } else {
                    _ticketReadyID = scenarioResponse.ticketId;
                }
            }
            //scenarioResponse.revealData='{\"revealDataSave\":{\"upListForDress\":0,\"dnListForDress\":1,\"accListForDress\":2,\"16,16:D,5:A|5,10:MX|2,12:A|8,20:MU|2,22:0|5,27:MX|15,42:U,57:MD|7,64:I3|15,79:D,67:A|8,75:MU\":{\"upList\":0,\"dnList\":1,\"accList\":2,\"totalClimberSteps\":12,\"spinsLeft\":6,\"stepIndex\":2,\"climberSkin\":0,\"gameTotalWins\":0,\"revealAward\":[16,5,10,12]}},\"wagerDataSave\":\"\",\"spots\":0,\"amount\":0}';
            //\"upList\":0,\"dnList\":1,\"accList\":0,\"totalClimberSteps\":7,\"spinsLeft\":7,\"stepIndex\":0,\"climberSkin\":0,\"upListForDress\":10,\"dnListForDress\":10,\"accListForDress\":10,
            if (SKBeInstant.config.wagerType === "BUY" &&
                SKBeInstant.config.gameType === "ticketReady" &&
                // RevealData is undefined when buy ticket outside of game.
                scenarioResponse.revealData &&
                scenarioResponse.revealData !== "" &&
                !this.newGame &&
                this.appStore.ticketID === _ticketReadyID
            ) {
                this.appStore.setRDSFlag(true);
            } else {

                if (SKBeInstant.isSKB()) {
                    const { upListForDress, dnListForDress, accListForDress } = this.appStore.baseGameStore.data;
                    this.appStore.RDS.revealDataSave = {};
                    this.appStore.RDS.revealDataSave.upListForDress = upListForDress;
                    this.appStore.RDS.revealDataSave.dnListForDress = dnListForDress;
                    this.appStore.RDS.revealDataSave.accListForDress = accListForDress;
                    this.appStore.RDS.revealDataSave[this.appStore.ticketID] = {};
                } else {
                    if (scenarioResponse.revealData && scenarioResponse.revealData !== 'null' && JSON.parse(scenarioResponse.revealData.replace(/\\/g, '')).revealDataSave) {
                        const _revealData = JSON.parse(scenarioResponse.revealData.replace(/\\/g, ''));
                        this.appStore.RDS.revealDataSave = {};
                        this.appStore.RDS.revealDataSave.upListForDress = _revealData.revealDataSave['upListForDress'];
                        this.appStore.RDS.revealDataSave.dnListForDress = _revealData.revealDataSave['dnListForDress'];
                        this.appStore.RDS.revealDataSave.accListForDress = _revealData.revealDataSave['accListForDress'];
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID] = {};
                    } else {
                        const { upListForDress, dnListForDress, accListForDress } = this.appStore.baseGameStore.data;
                        this.appStore.RDS.revealDataSave = {};
                        this.appStore.RDS.revealDataSave.upListForDress = upListForDress;
                        this.appStore.RDS.revealDataSave.dnListForDress = dnListForDress;
                        this.appStore.RDS.revealDataSave.accListForDress = accListForDress;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID] = {};
                    }
                }
                //if (SKBeInstant.config.wagerType === 'TRY') {
                //NOTHING TODO;
                //} else {
                //if (SKBeInstant.isSKB()) {
                //  msgBus.publish('jLotteryGame.revealDataSave', this.appStore.RDS);
                //} else {
                //  const str = JSON.stringify(this.appStore.RDS).replace(/\"/g, '\\"');
                //msgBus.publish('jLotteryGame.revealDataSave', { revealDataSave: str });
                //}
                //}
            }
            baseGameContainer.playAwardGridIdleAnimation.call(this);
            baseGameContainer.playStarAnimation.call(this);
            this.awardBoxSpine.state.setAnimation(0, '04TreasureChest01', true);
            this.appStore.setEndGame(false);
            this.appStore.baseGameStore.setScenarioData(scenarioResponse.scenario.split("|"));
        }

        bindReaction() {
            reaction(
                () => this.appStore.SKBState,
                (SKBState) => {
                    switch (SKBState) {
                        case 'gameParametersUpdated':
                            {
                                this.init();
                                this.appStore.setGameScene('baseGame');
                                this.appStore.setSpinsLeft(8);
                                baseGameContainer.initialGameScene.call(this);
                                this.appStore.baseGameStore.setTotalClimberStep(0);
                                break;
                            }
                        case 'startUserInteraction':
                            {
                                this.startUserInteraction();
                                break;
                            }
                        case 'enterResultScreenState':
                            {
                                if (this.appStore.gameTotalWin > 0 && this.appStore.baseGameStore.data.totalClimberStep < 80) {
                                    audio.play('finalTreasureChestGold', 1);
                                    baseGameContainer.coinDownAnimation.call(this);
                                }
                                baseGameContainer.stopAwardGridIdleAnimation.call(this);
                                baseGameContainer.stopStarAnimation.call(this);
                                break;
                            }
                        case 'playerWantsPlayAgain':
                            {
                                this.newGame = true;
                                gr.lib._coinShowContainer.show(false);
                                this.coinShower.stop();
                                if (this.coinDownParticle) {
                                    this.coinDownParticle.stop();
                                    gr.getTimer().clearTimeout(this.coinDownParticleTimer);
                                    this.coinDownParticleTimer = null;
                                }
                                break;
                            }
                        case 'reStartUserInteraction':
                            {
                                this.startUserInteraction();
                                break;
                            }
                        case 'reInitialize':
                            {
                                this.resetGame();
                                if (this.coinDownParticle) {
                                    this.coinDownParticle.stop();
                                    gr.getTimer().clearTimeout(this.coinDownParticleTimer);
                                    this.coinDownParticleTimer = null;
                                }
                                this.appStore.setAutoPlay(false);
                                this.appStore.setGameIsInReveal(false);
                                this.snowParticles.forEach((snowParticle) => { snowParticle.stop(); });
                                this.snowParticles = [];
                                this.playOnceForestAmbienceAudio = false;
                                this.stopOnceForestAmbienceAudio = false;
                                break;
                            }
                        default:
                            break;
                    }
                }
            );

            reaction(
                () => this.appStore.RDSFlag,
                (RDSFlag) => {
                    if (RDSFlag) {
                        gr.getTimer().setTimeout(() => { this.appStore.setRDSFlag(false); }, 0);
                        const {
                            SKBeInstant,
                            baseGameStore,
                            dressStore,
                            scenarioResponse,
                        } = this.appStore;
                        let revealData;
                        if (SKBeInstant.isSKB()) {
                            this.appStore.RDS.revealDataSave = scenarioResponse.revealData;
                        } else {
                            if (!scenarioResponse.revealData.replace) {
                                return;
                            }
                            this.appStore.RDS = JSON.parse(scenarioResponse.revealData.replace(/\\/g, ''));
                        }
                        if (!this.appStore.RDS.revealDataSave) { return; }
                        revealData = this.appStore.RDS.revealDataSave[this.appStore.ticketID];
                        if (!revealData) {
                            this.appStore.RDS.revealDataSave = Object.assign({}, {
                                upListForDress: this.appStore.RDS.revealDataSave.upListForDress,
                                dnListForDress: this.appStore.RDS.revealDataSave.dnListForDress,
                                accListForDress: this.appStore.RDS.revealDataSave.accListForDress,
                            });
                            this.appStore.RDS.revealDataSave[this.appStore.ticketID] = {};
                            revealData = this.appStore.RDS.revealDataSave[this.appStore.ticketID];
                        }
                        if (Object.keys(revealData).length === 0) { return; }
                        const {
                            upList,
                            dnList,
                            accList,
                            totalClimberSteps,
                            spinsLeft,
                            stepIndex,
                            climberSkin,
                            winBonus,
                            bonusType,
                            gameTotalWins,
                            revealAward,
                            bonusRevealData
                        } = revealData;
                        const splitScenario = this.appStore.scenarioResponse.scenario.split("|");
                        let XNumber = 0;
                        splitScenario.slice(0, stepIndex + 1).forEach(function(scenario) {
                            if (scenario.indexOf("X") > -1) {
                                XNumber++;
                            }
                        });
                        if (spinsLeft <= 0 || (spinsLeft + stepIndex) !== 7 + XNumber) {
                            baseGameStore.setUpList(0);
                            baseGameStore.setDnList(0);
                            baseGameStore.setAccList(0);
                            this.mountain.resetPosition();
                            this.appStore.setSpinsLeft(8);
                            this.appStore.setStepIndex(-1);
                            this.appStore.setGameTotalWin(0);
                            this.appStore.baseGameStore.setTotalClimberStep(0);
                            this.revealAward = new Set();
                            if (climberSkin) { dressStore.setCurrentSelectSkin(climberSkin); }
                        } else {
                            if (upList > 0) { baseGameStore.setUpList(upList); }
                            if (dnList > 0) { baseGameStore.setDnList(dnList); }
                            if (accList > 0) { baseGameStore.setAccList(accList); }
                            if (totalClimberSteps > 0) { baseGameStore.setTotalClimberStep(totalClimberSteps); }
                            if (spinsLeft > 0) { this.appStore.setSpinsLeft(spinsLeft); }
                            if (stepIndex >= 0) { this.appStore.setStepIndex(stepIndex); }
                            if (climberSkin) { dressStore.setCurrentSelectSkin(climberSkin); }
                            if (gameTotalWins > 0) { this.appStore.setGameTotalWin(gameTotalWins); }
                            if (revealAward && revealAward.length) {
                                this.revealAward = new Set(revealAward);
                                revealAward.forEach((item) => {
                                    if (this.awardIWPrize.includes(item)) {
                                        baseGameContainer.updateIWTextWhenGIP(item);
                                    } else if (this.bonus.includes(item)) {
                                        // Nothing TODO
                                    } else {
                                        baseGameContainer.hideTargetWinAward(item);
                                    }
                                });
                            }
                            if (winBonus) {
                                this.appStore.setGameBonusData(bonusRevealData);

                                if (bonusType === 1) {
                                    this.appStore.setGameBonusType(1);
                                    this.appStore.setGameScene('pickBonus');
                                } else {
                                    this.appStore.setGameBonusType(2);
                                    this.appStore.setGameScene('wheelBonus');
                                }
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.onceClimbeComplete,
                (onceClimbeComplete) => {
                    if (onceClimbeComplete && !this.appStore.autoPlay) {
                        const {
                            SKBeInstant,
                            spinsLeft,
                            stepIndex,
                            gameTotalWin,
                            gameCurrentScene
                        } = this.appStore;
                        const { SKBState, scenarioResponse } = this.appStore;
                        if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                            if ((gameTotalWin > scenarioResponse.prizeValue) || (spinsLeft === 0 && gameTotalWin !== scenarioResponse.prizeValue && gameCurrentScene === 'baseGame')) {
                                this.winBoxErrorComplete();
                                return;
                            }
                        }
                        if (SKBeInstant.config.wagerType === 'TRY') {
                            return;
                        }
                        const {
                            upList,
                            dnList,
                            accList,
                            totalClimberStep,
                            upListForDress,
                            dnListForDress,
                            accListForDress
                        } = this.appStore.baseGameStore.data;
                        const { currentSelectSkin } = this.appStore.dressStore;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].upList = upList;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].dnList = dnList;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].accList = accList;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].totalClimberSteps = totalClimberStep;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].spinsLeft = spinsLeft;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].stepIndex = stepIndex;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].climberSkin = currentSelectSkin;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].gameTotalWins = gameTotalWin;
                        this.appStore.RDS.revealDataSave[this.appStore.ticketID].revealAward = [...this.revealAward];
                        this.appStore.RDS.revealDataSave.upListForDress = upListForDress;
                        this.appStore.RDS.revealDataSave.dnListForDress = dnListForDress;
                        this.appStore.RDS.revealDataSave.accListForDress = accListForDress;
                        //if (SKBeInstant.isSKB()) {
                        //  msgBus.publish('jLotteryGame.revealDataSave', this.appStore.RDS);
                        //} else {
                        //  const str = JSON.stringify(this.appStore.RDS).replace(/\"/g, '\\"');
                        //msgBus.publish('jLotteryGame.revealDataSave', { revealDataSave: str });
                        //}
                    }
                }
            );

            reaction(
                () => this.appStore.gameIsInReveal,
                (gameIsInReveal) => {
                    if (gameIsInReveal) {
                        this.currentClimberSpine.spine.interactive = false;
                    } else {
                        if (!this.appStore.endGame) {
                            this.currentClimberSpine.spine.interactive = true;
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.autoPlay,
                (autoPlay) => {
                    if (autoPlay) {
                        this.currentClimberSpine.spine.interactive = false;
                    }
                }
            );

            reaction(
                () => this.appStore.showAutoMap,
                (showAutoMap) => {
                    if (showAutoMap) {
                        this.currentClimberSpine.spine.interactive = false;
                    } else {
                        this.currentClimberSpine.spine.interactive = true;
                    }
                }
            );

            reaction(
                () => this.appStore.gameCurrentScene,
                (gameCurrentScene) => {
                    const { SKBState, gameBonusType, RDSFlag } = this.appStore;
                    if (RDSFlag) {
                        if (gameCurrentScene === 'baseGame') {
                            baseGameContainer.showBaseGame();
                        } else {
                            baseGameContainer.hideBaseGame();
                        }
                    } else {
                        if (SKBState === 'gameParametersUpdated') {
                            if (gameCurrentScene === 'baseGame') {
                                baseGameContainer.showBaseGame();
                            } else {
                                baseGameContainer.hideBaseGame();
                            }
                        } else {
                            if (gameCurrentScene !== 'baseGame') {
                                let orientation;
                                if (this.appStore.SKBeInstant.isSKB()) {
                                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                                } else {
                                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                                }
                                transitionContainer.translateToBonusGame(gameBonusType, orientation);
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.currentPriceMap,
                (currentPriceMap) => {
                    const { awardIWPrize } = this;
                    baseGameContainer.updatedPrizeByPricePoint(currentPriceMap);
                    baseGameContainer.updateIWText(currentPriceMap, awardIWPrize);
                }
            );

            reaction(
                () => this.appStore.spinsLeft,
                (spinsLeft) => {
                    const { SKBState, RDSFlag } = this.appStore;
                    if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                        const { autoPlay } = this.appStore;
                        if (RDSFlag) {
                            spinLeftContainer.setSpinLeft(spinsLeft);
                        } else {
                            if (this.currentSpinsLeft > spinsLeft) {
                                spinLeftContainer.doSpinLeftReact(spinsLeft);
                                if (!autoPlay) {
                                    audio.play("spin", 1);
                                }
                            } else {
                                const keyIconFramePosition = this.getkeyIconFramePosition();
                                if (autoPlay) {
                                    spinLeftContainer.doSpinLeftReact(spinsLeft);
                                } else {
                                    xContainer.doWinXReact.call(
                                        this,
                                        spinsLeft, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                        () => {
                                            this.appStore.setGameIsInReveal(false);
                                            this.appStore.setOnceClimbeComplete(true);
                                        }
                                    );
                                }
                            }
                        }
                    } else {
                        spinLeftContainer.setSpinLeft(spinsLeft);
                    }
                    this.currentSpinsLeft = spinsLeft;
                }
            );

            reaction(
                () => this.appStore.baseGameStore.onceScenarioData,
                (onceScenarioData) => {
                    const { autoPlay } = this.appStore;
                    if (autoPlay) {
                        let AUTOPLAY_DELAY_TIMER = 300;
                        if (this.appStore.SKBeInstant.config.customBehavior) {
                            if (this.appStore.SKBeInstant.config.customBehavior.AUTOPLAY_DELAY_TIMER) {
                                AUTOPLAY_DELAY_TIMER = this.appStore.SKBeInstant.config.customBehavior.AUTOPLAY_DELAY_TIMER;
                            }
                        } else if (loader.i18n.gameConfig) {
                            if (loader.i18n.gameConfig.AUTOPLAY_DELAY_TIMER) {
                                AUTOPLAY_DELAY_TIMER = loader.i18n.gameConfig.AUTOPLAY_DELAY_TIMER;
                            }
                        }
                        gameScenarioReact.doScenarioReactForAutoReveal.call(this, onceScenarioData, AUTOPLAY_DELAY_TIMER);
                    } else {
                        gameScenarioReact.doScenarioReact.call(this, onceScenarioData);
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.upList,
                (upList) => {
                    const { SKBState, RDSFlag } = this.appStore;
                    if ((SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction')) {
                        if (RDSFlag) {
                            upListContainer.initialUpWhenGIP(upList);
                        } else {
                            const { gameCurrentScene } = this.appStore;
                            if (gameCurrentScene === 'baseGame') {
                                const keyIconFramePosition = this.getkeyIconFramePosition();
                                upListContainer.doUpReaction.call(this,
                                    upList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                    () => {
                                        this.appStore.baseGameStore.addUpListForDress();
                                        if (upList >= 4) {
                                            audio.play('rewardSparkle', 3);
                                            const { gamePriceMap, currentPricePoint } = this.appStore;
                                            upListContainer.updateUpWinTextStyle();
                                            this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Up']);
                                        }
                                    }
                                );
                            }
                        }
                    } else {
                        upListContainer.resetUpSprites();
                    }
                }
            );
            reaction(
                () => this.appStore.baseGameStore.data.dnList,
                (dnList) => {
                    const { SKBState, RDSFlag } = this.appStore;
                    if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                        if (RDSFlag) {
                            dnListContainer.initialDnWhenGIP(dnList);
                        } else {
                            const { gameCurrentScene } = this.appStore;
                            if (gameCurrentScene === 'baseGame') {
                                const keyIconFramePosition = this.getkeyIconFramePosition();
                                dnListContainer.doDnReaction.call(this,
                                    dnList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                    () => {
                                        this.appStore.baseGameStore.addDnListForDress();
                                        if (dnList >= 4) {
                                            audio.play('rewardSparkle', 3);
                                            const { gamePriceMap, currentPricePoint } = this.appStore;
                                            dnListContainer.updateDnWinTextStyle();
                                            this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Dn']);
                                        }
                                    }
                                );
                            }
                        }
                    } else {
                        dnListContainer.resetDnSprites();
                    }
                }
            );
            reaction(
                () => this.appStore.baseGameStore.data.accList,
                (accList) => {
                    const { SKBState, RDSFlag } = this.appStore;
                    if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                        if (RDSFlag) {
                            accListContainer.initialAccWhenGIP(accList);
                        } else {
                            const { gameCurrentScene } = this.appStore;
                            if (gameCurrentScene === 'baseGame') {
                                const keyIconFramePosition = this.getkeyIconFramePosition();
                                accListContainer.doAccReaction.call(this,
                                    accList, { x: keyIconFramePosition.x, y: keyIconFramePosition.y },
                                    () => {
                                        this.appStore.baseGameStore.addAccListForDress();
                                        if (accList >= 4) {
                                            const { gamePriceMap, currentPricePoint } = this.appStore;
                                            accListContainer.updateAccWinTextStyle(accList);
                                            if (isNaN(gamePriceMap[currentPricePoint]['Acc'][accList - 2])) {
                                                this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Acc'][accList - 1]);
                                            } else {
                                                this.appStore.setGameTotalWin(gamePriceMap[currentPricePoint]['Acc'][accList - 1] - gamePriceMap[currentPricePoint]['Acc'][accList - 2]);
                                            }
                                        }
                                    }
                                );
                            }
                        }
                    } else {
                        accListContainer.resetAccSprites();
                    }
                }
            );

            reaction(
                () => this.appStore.gameTotalWin,
                (gameTotalWin) => {
                    const { SKBState, scenarioResponse } = this.appStore;
                    if (SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') {
                        if (gameTotalWin > scenarioResponse.prizeValue) {
                            this.winBoxErrorComplete();
                            return;
                        }
                        baseGameContainer.updateWinMeterText(gameTotalWin);
                    } else {
                        //NOTHING TODO
                        return;
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.totalClimberStep,
                (totalClimberStep) => {
                    const { SKBState, autoPlay } = this.appStore;
                    if ((SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') && !autoPlay) {
                        if (window.navigator.userAgent.indexOf('SM-G960') > -1) {
                            return;
                        } else {
                            if (!this.snowParticles[0] && totalClimberStep >= 20) {
                                const { _snowContainer_02 } = gr.lib;
                                const snowParticle = new Particle(
                                    _snowContainer_02.pixiContainer,
                                    '',
                                    this.particleImageArray,
                                    snowParticleData.configuration1,
                                    false
                                );
                                _snowContainer_02.show(true);
                                snowParticle.start();
                                this.snowParticles.push(snowParticle);
                            } else if (!this.snowParticles[1] && totalClimberStep >= 45) {
                                const { _snowContainer_01, _snowContainer_02 } = gr.lib;
                                this.snowParticles[0].stopAndNotDestory();
                                gr.getTimer().setTimeout(() => {
                                    _snowContainer_02.show(false);
                                    this.snowParticles[0].stop();
                                }, 3000);
                                const snowParticle = new Particle(
                                    _snowContainer_01.pixiContainer,
                                    '',
                                    this.particleImageArray,
                                    snowParticleData.configuration2,
                                    false
                                );
                                _snowContainer_01.show(true);
                                snowParticle.start();
                                this.snowParticles.push(snowParticle);

                            } else if (!this.snowParticles[2] && totalClimberStep >= 60) {
                                const { _snowContainer_01, _snowContainer_00 } = gr.lib;
                                this.snowParticles[1].stopAndNotDestory();
                                gr.getTimer().setTimeout(() => {
                                    _snowContainer_01.show(false);
                                    this.snowParticles[1].stop();
                                }, 3000);
                                const snowParticle = new Particle(
                                    _snowContainer_00.pixiContainer,
                                    '',
                                    this.particleImageArray,
                                    snowParticleData.configuration3,
                                    false
                                );
                                _snowContainer_00.show(true);
                                snowParticle.start();
                                this.snowParticles.push(snowParticle);
                                baseGameContainer.showAndPlayWind();
                                baseGameContainer.showAndPlaySnow.call(this);
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.totalClimberStep,
                (totalClimberStep) => {
                    if (!this.playOnceForestAmbienceAudio) {
                        const { SKBState, autoPlay } = this.appStore;
                        if ((SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') && !autoPlay) {
                            if (totalClimberStep <= 10) {
                                this.playOnceForestAmbienceAudio = true;
                                audio.play("forestAmbience", 3, true);
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.totalClimberStep,
                (totalClimberStep) => {
                    if (!this.stopOnceForestAmbienceAudio) {
                        const { SKBState, autoPlay } = this.appStore;
                        if ((SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') && !autoPlay) {
                            if (totalClimberStep > 10) {
                                this.stopOnceForestAmbienceAudio = true;
                                audio.fadeOut(3, 2000);
                                audio.play('snowyAmbience', 8, true);
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.baseGameStore.data.totalClimberStep,
                (totalClimberStep) => {
                    const { SKBState, RDSFlag } = this.appStore;
                    if ((SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction') && RDSFlag) {
                        this.mountain.setCurrentStep(totalClimberStep);
                    }
                }
            );

            autorun(
                () => {
                    const totalClimberStep = this.appStore.baseGameStore.data.totalClimberStep;
                    baseGameContainer.doReactionForClimberTotalText(totalClimberStep);
                }
            );

            reaction(
                () => this.appStore.endGame,
                (endGame) => {
                    if (endGame) {
                        const { autoPlay, SKBeInstant, gameTotalWin, scenarioResponse } = this.appStore;
                        if (this.climberMan) { this.climberMan.spine.interactive = false; }
                        if (this.snowMan) { this.snowMan.spine.interactive = false; }
                        if (this.goat) { this.goat.spine.interactive = false; }
                        if (gameTotalWin !== scenarioResponse.prizeValue || gameTotalWin > scenarioResponse.prizeValue) {
                            this.winBoxErrorComplete();
                            return;
                        }
                        if (autoPlay) {
                            if (SKBeInstant.config.wagerType === 'TRY') {
                                msgBus.publish("allRevealed");
                                msgBus.publish('allRevealedForInfoButton');
                                return;
                            }
                            //const { upListForDress, dnListForDress, accListForDress } = this.appStore.baseGameStore.data;
                            //if (this.appStore.RDS.revealDataSave) {
                            //  this.appStore.RDS.revealDataSave.upListForDress = upListForDress;
                            // this.appStore.RDS.revealDataSave.dnListForDress = dnListForDress;
                            //his.appStore.RDS.revealDataSave.accListForDress = accListForDress;
                            //if (SKBeInstant.isSKB()) {
                            //  msgBus.publish('jLotteryGame.revealDataSave', this.appStore.RDS);
                            //} else {
                            //  const str = JSON.stringify(this.appStore.RDS).replace(/\"/g, '\\"');
                            //msgBus.publish('jLotteryGame.revealDataSave', { revealDataSave: str });
                            //}
                            //}
                        }
                        msgBus.publish("allRevealed");
                        msgBus.publish('allRevealedForInfoButton');
                    }
                }
            );

            reaction(
                () => this.appStore.dressStore.currentDressPages,
                (currentDressPages) => {
                    const { climberSkinConfiguration } = gameConfiguration.universal;
                    for (let i = 0; i < 4; i++) {
                        if (currentDressPages[i].select) {
                            const { spineSkinName } = currentDressPages[i];
                            if (i <= 1) {
                                if (!this.climberMan) { this.createClimberMan(); }
                                this.currentClimberSpine = this.climberMan;
                                this.climberManSkin = spineSkinName;
                                if (this.snowMan) { this.snowMan.hide(); }
                                if (this.goat) { this.goat.hide(); }
                            } else if (i > 1 && i <= 2) {
                                if (!this.snowMan) { this.createSnowMan(); }
                                this.currentClimberSpine = this.snowMan;
                                this.climberManSkin = spineSkinName;
                                if (this.climberMan) { this.climberMan.hide(); }
                                if (this.goat) { this.goat.hide(); }
                            } else {
                                if (!this.goat) { this.createGoat(); }
                                this.currentClimberSpine = this.goat;
                                this.climberManSkin = spineSkinName;
                                if (this.climberMan) { this.climberMan.hide(); }
                                if (this.snowMan) { this.snowMan.hide(); }
                            }
                            this.currentClimberSpine.show();
                            this.currentClimberSpine.spine.interactive = true;
                            this.currentClimberSpine.play(climberSkinConfiguration[spineSkinName].standing, 1, true);
                            break;
                        }
                    }
                }
            );
        }
    }


    return BaseGame;
});