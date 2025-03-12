define([
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'com/pixijs/pixi',
    'com/mobx/mobx',
    'game/gladButton',
    'game/autoMap/autoMapContainer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(
    loader,
    gr,
    PIXI,
    mobx,
    gladButton,
    autoMapContainer,
    msgBus,
    resLib,
    audio
    ) {
        const {
            reaction
        } = mobx;
        const AUTOPLAY_DELAY_TIMER = 400;
        class AutoMap{
            constructor(appStore){
                this.appStore = appStore;
                this.container = gr.lib._autoMap;
                this.setText();
                this.initialSpine();
                this.initialGladButton();
                this.bindReaction();
                this.customSubscribe();
            }

            customSubscribe(){
                msgBus.subscribe('tutorialIsShown', () => {
                    const { SKBState, showAutoMap } = this.appStore;
                    if(SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction'){
                        if(showAutoMap){
                            autoMapContainer.hideAutoMapContainer.call(this);
                        }
                    }
                });
                msgBus.subscribe('tutorialIsHide', () => {
                    const { SKBState, showAutoMap } = this.appStore;
                    if(SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction'){
                        if(showAutoMap){
                            autoMapContainer.showAutoMapContainer.call(this);
                        }
                    }
                });
            }

            initialSpine(){
                const { _map, _closeAutoMap, _disableMapIcon } = gr.lib;
                let localRect;
                this.mapSpine = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
                this.mapSpine.interactive = true;
                this.mapSpine.cursor = "pointer";
                this.mapSpine.skeleton.setToSetupPose();
                this.mapSpine.update(0);
                _map.pixiContainer.addChildAt(this.mapSpine, 0);
                localRect = this.mapSpine.getLocalBounds();
                this.mapSpine.position.set(-localRect.x, -localRect.y);
                this.mapSpine.state.setAnimation(0, '08map01', true);
                this.mapSpine.state.timeScale = 1;
                
                this.closeMapSpine = new PIXI.spine.Spine(resLib.spine.SpinsAspine.spineData);
                this.closeMapSpine.interactive = true;
                this.closeMapSpine.cursor = "pointer";
                this.closeMapSpine.skeleton.setToSetupPose();
                this.closeMapSpine.update(0);
                _closeAutoMap.pixiContainer.addChildAt(this.closeMapSpine, 0);
                localRect = this.closeMapSpine.getLocalBounds();
                this.closeMapSpine.position.set(-localRect.x, -localRect.y);

                this.mapSpineInAutoMap = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
                this.mapSpineInAutoMap.skeleton.setToSetupPose();
                this.mapSpineInAutoMap.update(0);
                _disableMapIcon.pixiContainer.addChildAt(this.mapSpineInAutoMap, 0);
                localRect = this.mapSpineInAutoMap.getLocalBounds();
                this.mapSpineInAutoMap.position.set(-localRect.x, -localRect.y);
                this.mapSpineInAutoMap.state.setAnimation(0, '09map02', false);
            }

            initialGladButton(){
                const { _autoRevealMap, _closeAutoMapHover, _mapHover } = gr.lib;
                const scaleType = {'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
                this.mapSpine.on('click', () => {
                    this.mapSpine.scale = {x:1,y:1};
                    audio.play("buy_ok", 4); 
                    this.appStore.setShowAutoMap(true);
                    _mapHover.show(false);
                });
                this.mapSpine.on('mouseover', () => {
                    _mapHover.show(true);
                });
                this.mapSpine.on('mouseout', () => {
                    _mapHover.show(false);
                });        
                this.mapSpine.on('mouseDown', () => {
                    this.mapSpine.scale = {x:0.95,y:0.95};
                });     
                this.mapSpine.on('mouseup', () => {
                    this.mapSpine.scale = {x:1,y:1};
                });  
                
                this.mapSpine.on('touchendoutside', () => {
                    this.mapSpine.scale = {x:1,y:1};
                    _mapHover.show(false);
                });        
                this.mapSpine.on('touchstart', () => {
                    this.mapSpine.scale = {x:0.95,y:0.95};
                });     
                this.mapSpine.on('touchend', () => {
                    this.mapSpine.scale = {x:1,y:1};
                    audio.play("buy_ok", 4); 
                    this.appStore.setShowAutoMap(true);
                    _mapHover.show(false);
                });


                this.closeMapSpine.on('click', () => {
                    this.closeMapSpine.scale = {x:1,y:1};
                    audio.play("buy_ok", 4); 
                    this.appStore.setShowAutoMap(false);
                    _closeAutoMapHover.show(false);
                });
                this.closeMapSpine.on('mouseover', () => {
                    _closeAutoMapHover.show(true);
                });
                this.closeMapSpine.on('mouseout', () => {
                    _closeAutoMapHover.show(false);
                });
                this.closeMapSpine.on('mouseDown', () => {
                    this.closeMapSpine.scale = {x:0.95,y:0.95};
                });     
                this.closeMapSpine.on('mouseup', () => {
                    this.closeMapSpine.scale = {x:1,y:1};
                });  

                this.closeMapSpine.on('touchendoutside', () => {
                    this.closeMapSpine.scale = {x:1,y:1};
                    _closeAutoMapHover.show(false);
                });
                this.closeMapSpine.on('touchstart', () => {
                    this.closeMapSpine.scale = {x:0.95,y:0.95};
                });     
                this.closeMapSpine.on('touchend', () => {
                    this.closeMapSpine.scale = {x:1,y:1};
                    audio.play("buy_ok", 4); 
                    this.appStore.setShowAutoMap(false);
                    _closeAutoMapHover.show(false);
                }); 


                this.autoRevealButton = new gladButton(_autoRevealMap, 'mainButton', scaleType);
                this.autoRevealButton.click(()=>{
                    audio.play("buy_ok", 4); 
                    this.appStore.setShowAutoMap(true);
                    this.appStore.setAutoPlay(true);
                    this.appStore.setGameIsInReveal(true);
                    gr.getTimer().setTimeout(()=>{ this.appStore.decrementSpinsLeft(); },AUTOPLAY_DELAY_TIMER);
                });
            }

            setText(){
                const { _autoRevealMapText, _topAward } = gr.lib;
                _autoRevealMapText.autoFontFitText = true;
                _topAward.autoFontFitText = true;
                _autoRevealMapText.setText(loader.i18n.Game.button_autoPlay);
            }
            /**
             * Reaction
             */

            bindReaction(){
                reaction(
                    () => this.appStore.SKBState,
                    () => {
                        switch (this.appStore.SKBState) {
                            case 'gameParametersUpdated':{
                                let orientation;
                                if(this.appStore.SKBeInstant.isSKB()){
                                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                                }else{
                                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                                }
                                autoMapContainer.hideAutoMapContainer.call(this);
                                autoMapContainer.initialAutoPointerPosition(orientation);
                                this.mapSpine.interactive = false;
                                autoMapContainer.disableMapButton.call(this);
                            }
                            break;

                            case 'playerWantsPlayAgain':{
                                let orientation;
                                if(this.appStore.SKBeInstant.isSKB()){
                                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                                }else{
                                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                                }
                                this.appStore.setShowAutoMap(false);
                                autoMapContainer.initialAutoPointerPosition(orientation);
                            }
                            break;

                            case 'startUserInteraction': {
                                this.mapSpine.interactive = true;
                                autoMapContainer.enableMapButton.call(this);
                                break;
                            }

                            case 'reStartUserInteraction': {
                                this.mapSpine.interactive = true;
                                autoMapContainer.enableMapButton.call(this);
                                break;
                            }

                            case 'reInitialize':{
                                let orientation;
                                if(this.appStore.SKBeInstant.isSKB()){
                                    orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
                                }else{
                                    orientation = this.appStore.SKBeInstant.getGameOrientation();
                                }
                                this.appStore.setShowAutoMap(false);
                                autoMapContainer.initialAutoPointerPosition(orientation);
                                break;
                            }
                            default:
                                break;
                        }
                    }
                );

                reaction(
                    () => this.appStore.showAutoMap,
                    (showAutoMap) => {
                        if(showAutoMap){
                            this.closeMapSpine.state.setAnimation(0, 'return', true);
                            this.closeMapSpine.state.timeScale = 1;
                            autoMapContainer.showAutoMapContainer.call(this);
                            gr.lib._spinsLeft.show(false);
                        }else{
                            autoMapContainer.hideAutoMapContainer.call(this);
                            gr.lib._spinsLeft.show(true);
                        }
                    }
                );

                reaction(
                    () => this.appStore.autoPlay,
                    () => {
                        autoMapContainer.hideContainerInAutoPlay.call(this);
                        this.closeMapSpine.skeleton.setToSetupPose(0.2);
                        this.closeMapSpine.update(0);
                    }
                );

                reaction(
                    () => this.appStore.gameIsInReveal,
                    (gameIsInReveal) => {
                        const { SKBState, autoPlay, endGame } = this.appStore;
                        if(!autoPlay){
                            if(SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction'){
                                if(gameIsInReveal){
                                    this.mapSpine.interactive = false;
                                    autoMapContainer.disableMapButton.call(this);
                                }else{
                                    if(!endGame){
                                        this.mapSpine.interactive = true;
                                        autoMapContainer.enableMapButton.call(this);
                                    }
                                }
                            }
                        }
                    }
                );               

                reaction(
                    () => this.appStore.currentPriceMap,
                    (currentPriceMap) => {
                        autoMapContainer.updateTopAward.call(this, currentPriceMap);
                    }
                );

                reaction(
                    () => this.appStore.endGame,
                    (endGame) => {
                        if(endGame){
                            const { _iwWinText } = gr.lib;
                            _iwWinText.setText('');
                            this.mapSpine.interactive = false;
                            autoMapContainer.disableMapButton.call(this);
                        }
                    }
                );
                
            }

        }
        
        return AutoMap;
});