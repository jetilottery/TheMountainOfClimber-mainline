define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/gladButton',
    'com/mobx/mobx',
    'game/climberManDress/config',
    'game/climberManDress/dressContainer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/configController',
    'skbJet/componentCRDC/IwGameControllers/gameUtils'
], function (
    gr, 
    loader,
    msgBus, 
    GladButton, 
    mobx,
    config,
    dressContainer,
    audio,
    gameConfiguration,
    gameUtils
    ) {
    const {
        autorun,
        reaction,
        when
    } = mobx;
    class Dress {
        constructor(appStore) {
            this.appStore = appStore;
            this.pageCustomConfig = Object.assign({},config);
            this.container = gr.lib._dress;
            this.bgDim = gr.lib._BG_dim;
            this.state = {};
            this.dressElements = [];
            this.unlockSkin = 2;
            this.firstLoadGIP = false;
            this.dressLockAnimationStore = [];
            this.upDress = [1];
            this.dnDress = [2];
            this.accDress = [3];
            this.unlockContainer = [
                '_climberManUnlockIcon',
                '_climberManUnlockIcon',
                '_snowManUnlockIcon',
                '_goatManUnlockIcon'
            ];
            this.shouldPlayClothingAniamtion = false;
            this.showTutorialAtBeginning = true;
            this.customSubscribe();
            this.bindReaction();
        }

        customSubscribe() {
            //Action
            msgBus.subscribe('buyOrTryHaveClicked', () => {
                dressContainer.setInteractiveOfDress.call(this, true);
                //this.appStore.dressStore.setDressPageVisibility(true);
            });
            msgBus.subscribe('tutorialIsForTicketReady', () => {
                if(this.appStore.gameCurrentScene === 'baseGame'){
                    this.appStore.dressStore.setDressPageVisibility(true);
                }
            });
        }

        setTextAndStyle() {
            const { _dressText, _closeDresslText, _unlockDressText } = gr.lib;
            _unlockDressText.show(false);
            gameUtils.setTextStyle(_closeDresslText, gameConfiguration.buttonStyle);
            _dressText.setText(loader.i18n.Game.dressText);
            _closeDresslText.setText(loader.i18n.Game.message_close);
        }

        setTextWhenAllSkinsUnlocked() {
            const { _dressText, _unlockDressText } = gr.lib;
            _dressText.show(false);
            _unlockDressText.setText(loader.i18n.Game.allUnlockedDressText);
            _unlockDressText.show(true);
        }

        cloneAnimation(){
            let numberNameList,
            AnimationName;
            for (let i = 2; i < 5; i++) {
                numberNameList = ['_dressClothing0'+i+'F'];
                AnimationName = '_dressUnlockAnimation_0'+i;
                gr.animMap._dressUnlockAnimation.clone(numberNameList, AnimationName);
                numberNameList = ['_dressClothing0'+i+'C','_dressClothing0'+i+'D','_dressClothing0'+i+'E','_dressClothing0'+i+'F'];
                AnimationName = '_dressFadeOutAnimation_0'+i;
                gr.animMap._dressFadeOutAnimation.clone(numberNameList, AnimationName);
            }
        }

        defineComplete(){
            for (let i = 2; i < 5; i++) {
                gr.animMap['_dressUnlockAnimation_0'+i]._onComplete = () => {
                    gr.lib['_dressClothing0'+i+'F'].show(false);
                    gr.lib['_dressClothing0'+i+'G'].show(true);
                    gr.getTimer().setTimeout(() => {
                        gr.animMap['_dressFadeOutAnimation_0'+i].play();
                    }, 200);
                };
                gr.animMap['_dressFadeOutAnimation_0'+i]._onComplete = () => {
                    this.appStore.dressStore.unlockSkin(i-1);
                    if(this.getAllSkinsUnlocked()){ this.setTextWhenAllSkinsUnlocked(); }
                };
            }
            for(let i = 1; i < 4; i++){
                gr.lib[this.unlockContainer[i]].onComplete = function(){
                    this.show(false);
                };
            }
        }

        initialGladButton() {
            const { _buttonCloseDress } = gr.lib;
            const scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
            this.okButton = new GladButton(_buttonCloseDress, 'mainButton', scaleType);
            this.okButton.click(() => {
                this.okButton.enable(false);
                audio.play("buy_ok", 4); 
                gr.animMap._dressHideAnimation.play();
                gr.animMap._dressHideAnimation._onComplete = () => {
                    this.appStore.dressStore.setDressPageVisibility(false);
                };
            });
        }

        addEventListenerToSkins(){
            const { _dressClothing } = gr.lib;
            Object.keys(_dressClothing.sprites).forEach((element, index)=>{
                const dressElement = new GladButton(gr.lib[element], '', {'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch': true});
                dressElement.click(()=>{
                    if(this.appStore.dressStore.dressPages[index].lock){
                        return;
                    }
                    this.appStore.dressStore.setCurrentSelectSkin(index);
                });
                this.dressElements.push(dressElement);
            });
        }

        getAllSkinsUnlocked(){
            return this.appStore.dressStore.dressPages.every((item) => {
                return item.lock === false;
            });
        }

        getAllDressParaZero(){
            return this.appStore.dressStore.dressPages.every((item) => {
                return item.unlockConditionNum === 0;
            });
        }

        init() {
            this.setTextAndStyle();
            this.initialGladButton();
            this.addEventListenerToSkins();
            this.cloneAnimation();
            this.defineComplete();
            dressContainer.initial();
        }

        bindReaction(){
            reaction(
                () => this.appStore.SKBState,
                (state) => {
                    switch (state) {
                        case 'gameParametersUpdated':{
                            const { SKBeInstant } = this.appStore;
                            this.init();
                            this.appStore.dressStore.setDressPageVisibility(false);
                            this.appStore.dressStore.setCurrentSelectSkin(0);
                            if (SKBeInstant.config.customBehavior) {
                                if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
                                    this.showTutorialAtBeginning = false;
                                }
                            }else if(loader.i18n.gameConfig){
                                if(loader.i18n.gameConfig.showTutorialAtBeginning === false){
                                    this.showTutorialAtBeginning = false;
                                }
                            }
                            break;
                        }
                        case 'startUserInteraction':{           
                            const { scenarioResponse, SKBeInstant, baseGameStore } = this.appStore;
                            this.appStore.ticketID = scenarioResponse.ticketId || scenarioResponse.scenario;
                            let RDS;
                            let revealData;
                            //scenarioResponse.revealData='{\"revealDataSave\":{\"4,4:U,20:MA|1,21:A|12,33:A|12,45:A|6,51:BA642|6,57:M4|9,66:U,75:MA|2,77:A\":{\"upList\":1,\"dnList\":0,\"accList\":2,\"totalClimberSteps\":21,\"spinsLeft\":6,\"stepIndex\":1,\"gameTotalWins\":0,\"revealAward\":[4, 20, 21]}},\"wagerDataSave\":\"\",\"spots\":0,\"amount\":0,\"upListForDress\":2,\"dnListForDress\":0,\"accListForDress\":6}';
                            //\"upList\":0,\"dnList\":1,\"accList\":0,\"totalClimberSteps\":7,\"spinsLeft\":7,\"stepIndex\":0,\"climberSkin\":0,\"upListForDress\":10,\"dnListForDress\":10,\"accListForDress\":10,
                            if(SKBeInstant.config.wagerType === "BUY" &&
                                scenarioResponse.revealData &&
                                scenarioResponse.revealData !== ""
                            ){
                                if (SKBeInstant.isSKB()) {
                                    RDS = scenarioResponse.revealData;
                                } else {
                                    if (!scenarioResponse.revealData.replace) {
                                        return;
                                    }
                                    RDS = JSON.parse(scenarioResponse.revealData.replace(/\\/g, '')).revealDataSave;
                                }
                                if(!RDS){ return; }
                                let {  upListForDress, dnListForDress, accListForDress } = RDS;
                                if(RDS.revealDataSave){ 
                                    revealData = RDS.revealDataSave[this.appStore.ticketID];
                                    if(revealData || Object.keys(revealData).length > 0){ 
                                        const { 
                                            upList,
                                            dnList, 
                                            accList,
											stepIndex,
											spinsLeft
                                        } = revealData;
                                        const splitScenario = this.appStore.scenarioResponse.scenario.split("|");
                                        let XNumber = 0;
                                        splitScenario.slice(0,stepIndex+1).forEach(function(scenario){
                                            if(scenario.indexOf("X") > -1){
                                                XNumber++;
                                            }
                                        });
                                        if(spinsLeft <= 0 || (spinsLeft + stepIndex) !== 7+XNumber){
                                            upListForDress-=upList;
                                            dnListForDress-=dnList;
                                            accListForDress-=accList;
                                        }
                                    }
                                }
                                if(upListForDress >= this.appStore.dressStore.dressPages[1].unlockConditionNum){
                                    this.appStore.dressStore.unlockSkin(1);
                                    if(this.getAllSkinsUnlocked()){ this.setTextWhenAllSkinsUnlocked(); }
                                }
                                if(dnListForDress >= this.appStore.dressStore.dressPages[2].unlockConditionNum){
                                    this.appStore.dressStore.unlockSkin(2);
                                    if(this.getAllSkinsUnlocked()){ this.setTextWhenAllSkinsUnlocked(); }
                                }
                                if(accListForDress >= this.appStore.dressStore.dressPages[3].unlockConditionNum){
                                    this.appStore.dressStore.unlockSkin(3);
                                    if(this.getAllSkinsUnlocked()){ this.setTextWhenAllSkinsUnlocked(); }
                                }
                                if(upListForDress){ baseGameStore.setUpListForDress(upListForDress); }
                                if(dnListForDress){ baseGameStore.setDnListForDress(dnListForDress); }
                                if(accListForDress){ baseGameStore.setAccListForDress(accListForDress); }
                            }
                            if (SKBeInstant.config.gameType === 'ticketReady') {
                                if (this.showTutorialAtBeginning) {
                                    if(!this.firstLoadGIP){
                                        this.appStore.dressStore.setDressPageVisibility(false);
                                    }
                                } else {
                                    if(this.appStore.gameCurrentScene === 'baseGame'){
                                        this.appStore.dressStore.setDressPageVisibility(true);
                                    }
                                }
                                this.firstLoadGIP = true;
                            } else {
                                this.appStore.dressStore.setDressPageVisibility(true);
                            }
                            if(this.getAllDressParaZero()){
                                this.dressElements.forEach((element) => { element.enable(true); });
                            }
                            if( this.okButton ){ this.okButton.enable(true); }
                            break;
                        }
                        case 'playerWantsPlayAgain':{
                            break;
                        }
                        case 'reStartUserInteraction':{
                            this.appStore.dressStore.setDressPageVisibility(true);
                            if(this.getAllDressParaZero()){
                                this.dressElements.forEach((element) => { element.enable(true); });
                            }
                            if( this.okButton ){ this.okButton.enable(true); }
                            break;
                        } 
                        case 'reInitialize': {
                            const {  upListForDress, dnListForDress,  accListForDress } = this.appStore.baseGameStore.data;
                            this.dressLockAnimationStore = [];
                            this.appStore.baseGameStore.setAccListForDress(accListForDress);
                            this.appStore.baseGameStore.setUpListForDress(upListForDress);
                            this.appStore.baseGameStore.setDnListForDress(dnListForDress);
                            this.appStore.dressStore.setDressPageVisibility(false);
                            gr.getTimer().setTimeout(() => {
                                this.appStore.setGameState('noMoneyError');
                            }, 0);
                            break;
                        }
                        case 'reset': {
                            this.appStore.dressStore.setDressPageVisibility(false);
                            gr.getTimer().setTimeout(() => {
                                this.appStore.setGameState('noMoneyError');
                            }, 0);
                            break;
                        }
                        default:
                            break;
                    }
                }
            );

            when(
                () => {
                    return this.appStore.baseGameStore.data.upListForDress >= this.appStore.dressStore.dressPages[1].unlockConditionNum; 
                },
                () => {
                    if(this.appStore.dressStore.dressPages[1].lock){
                        this.dressLockAnimationStore.push(2);
                        if(!this.appStore.autoPlay){
                            if(!this.appStore.gameIsInReveal){
                                gr.getTimer().setTimeout(() => {
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].show(true);
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].gotoAndPlay('ManUnlock', 0.5, false);
                                }, 200);
                            }else{
                                this.shouldPlayClothingAniamtion = true;
                            }
                        }
                    }
                }
            );

            when(
                () => {
                    return this.appStore.baseGameStore.data.dnListForDress >= this.appStore.dressStore.dressPages[2].unlockConditionNum; 
                },
                () => {
                    if(this.appStore.dressStore.dressPages[2].lock){
                        this.dressLockAnimationStore.push(3);
                        if(!this.appStore.autoPlay){
                            if(!this.appStore.gameIsInReveal){
                                gr.getTimer().setTimeout(() => {
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].show(true);
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].gotoAndPlay('ManUnlock', 0.5, false);
                                }, 200);
                            }else{
                                this.shouldPlayClothingAniamtion = true;
                            }
                        }
                    }
                }
            );

            when(
                () => {
                    return this.appStore.baseGameStore.data.accListForDress >= this.appStore.dressStore.dressPages[3].unlockConditionNum; 
                },
                () => {
                    if(this.appStore.dressStore.dressPages[3].lock){
                        this.dressLockAnimationStore.push(4);
                        if(!this.appStore.autoPlay){
                            if(!this.appStore.gameIsInReveal){
                                gr.getTimer().setTimeout(() => {
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].show(true);
                                    gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].gotoAndPlay('ManUnlock', 0.5, false);
                                }, 200);
                            }else{
                                this.shouldPlayClothingAniamtion = true;
                            }
                        }
                    }
                }
            );

            reaction(
                () => this.appStore.dressStore.dressPageVisible,
                (dressPageVisible) => {
                    if(dressPageVisible){
                      if(this.getAllDressParaZero()){
                        this.setTextWhenAllSkinsUnlocked();
                        for(let i = 2; i < this.appStore.dressStore.dressPages.length+1; i++){
                            gr.lib['_dressClothing0'+i+'C'].show(false);
                            gr.lib['_dressClothing0'+i+'D'].show(false);
                            gr.lib['_dressClothing0'+i+'E'].show(false);
                            gr.lib['_dressClothing0'+i+'F'].show(false);
                            gr.lib['_dressClothing0'+i+'G'].show(false);
                            gr.lib['_dressClothing0'+i+'H'].show(false);
                            this.appStore.dressStore.unlockSkin(i-1);
                        }
                        if(this.appStore.SKBState === 'startUserInteraction' || this.appStore.SKBState === 'reStartUserInteraction'){
                            if( this.okButton ){ this.okButton.enable(true); }
                            this.dressElements.forEach((element) => { element.enable(true); });
                        }
                      }else if(this.appStore.SKBState === 'startUserInteraction' || this.appStore.SKBState === 'reStartUserInteraction'){
                        if(this.dressLockAnimationStore.length){
                          audio.play('winCoins',1);
                          for(let i = 0; i < this.dressLockAnimationStore.length; i++){
                              gr.lib['_dressClothing0'+this.dressLockAnimationStore[i]+'H'].show(true);
                              gr.lib['_dressClothing0'+this.dressLockAnimationStore[i]+'H'].gotoAndPlay('ClothingUnlock', 0.5, false);
                              gr.lib['_dressClothing0'+this.dressLockAnimationStore[i]+'H'].onComplete = () => {
                                  gr.lib['_dressClothing0'+this.dressLockAnimationStore[i]+'H'].show(false);
                                  gr.animMap['_dressUnlockAnimation_0'+this.dressLockAnimationStore[i]].play();
                              };
                          }
                          dressContainer.setInteractiveOfDress.call(this, true);
                          gr.getTimer().setTimeout(()=>{
                              this.dressLockAnimationStore = [];
                              this.okButton.enable(true);        
                              this.dressElements.forEach((element) => {
                                  element.enable(true);
                              });
                          },1000);
                        }else{
                            this.okButton.enable(true);
                            this.dressElements.forEach((element) => { element.enable(true); });
                            if(this.getAllSkinsUnlocked()){ this.setTextWhenAllSkinsUnlocked(); }
                        }
                      }
                    }
                    dressContainer.renderDressPage.call(this, dressPageVisible);
                }
            );

            reaction(
                () => this.appStore.dressStore.currentDressPages,
                (currentDressPages) => {
                    dressContainer.renderSkinPages(currentDressPages);          
                }
            );            
            
            reaction(
                () => this.appStore.onceClimbeComplete,
                (onceClimbeComplete) => {
                    if(onceClimbeComplete && this.shouldPlayClothingAniamtion){
                        this.shouldPlayClothingAniamtion = false;
                        gr.getTimer().setTimeout(() => {
                            gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].show(true);
                            gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].gotoAndPlay('ManUnlock', 0.5, false);
                        }, 200);
                    }
                }
            );

            reaction(
                () => this.appStore.endGame,
                (endGame) => {
                    if(endGame && this.shouldPlayClothingAniamtion){
                        this.shouldPlayClothingAniamtion = false;
                        gr.getTimer().setTimeout(() => {
                            gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].show(true);
                            gr.lib[this.unlockContainer[this.appStore.dressStore.currentSelectSkin]].gotoAndPlay('ManUnlock', 0.5, false);
                        }, 200);
                    }
                }
            );

            autorun(
                () => {
                    dressContainer.doReactionForUpList.call(this, this.appStore.baseGameStore.data.upListForDress);
                 }
            ); 
            autorun(
                () => {
                    dressContainer.doReactionForDnList.call(this, this.appStore.baseGameStore.data.dnListForDress);
                 }
            ); 
            autorun(
                () => {
                    dressContainer.doReactionForAccList.call(this, this.appStore.baseGameStore.data.accListForDress);
                 }
            ); 
        }
    }

    return Dress;

});