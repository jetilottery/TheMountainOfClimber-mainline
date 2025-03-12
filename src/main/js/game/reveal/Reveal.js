define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'com/mobx/mobx',
    'game/reveal/revealContainer',
    'game/gladButton',
    'game/gameUtils',
    'game/configController',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
], function(
    gr,
    loader,
    mobx,
    revealContainer,
    GladButton,
    gameUtils,
    gameConfiguration,
    audio
    ) {
        const {
            reaction
        } = mobx;
        var lastTimeStamp = 0;
        class Reveal{
            constructor(appStore){
                this.appStore = appStore;
                // Blow is for gladButton
                this.buttonPlay = null;
                this.buttonAutoPlay = null;
                this.buttonPlayCenter = null;
                this.curTimeStamp = 0;
                this.bindReaction();
            }

            setTextAndStyle(){
                const { _buttonPlayText, _buttonPlayCenterText, _autoPlayText } = gr.lib;
                _buttonPlayText.autoFontFitText = true;
                _autoPlayText.autoFontFitText = true;
                _buttonPlayCenterText.autoFontFitText = true;
                gameUtils.setTextStyle(_autoPlayText, gameConfiguration.style.buttonStyle);
                gameUtils.setTextStyle(_buttonPlayCenterText, gameConfiguration.style.buttonStyle);
                gameUtils.setTextStyle(_buttonPlayText, gameConfiguration.style.buttonStyle);
                _buttonPlayText.setText(loader.i18n.Game.button_play);
                _autoPlayText.setText(loader.i18n.Game.button_autoPlay);
                _buttonPlayCenterText.setText(loader.i18n.Game.button_play);
            }

            setGladButton(){
                const scaleType = {'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
                const { _buttonPlay, _buttonAutoPlay, _buttonPlayCenter } = gr.lib;
                this.buttonPlay = new GladButton(_buttonPlay, "mainButton", scaleType);
                this.buttonAutoPlay = new GladButton(_buttonAutoPlay, "mainButton", scaleType);
                this.buttonPlayCenter = new GladButton(_buttonPlayCenter, "mainButton", scaleType);
                this.buttonPlay.click(()=>{
                    _buttonPlay.pixiContainer.$sprite.interactive = false;
                    this.playButtonAction();
                    _buttonPlay.pixiContainer.$sprite.interactive = true;
                });
                this.buttonAutoPlay.click(()=>{
                    _buttonAutoPlay.pixiContainer.$sprite.interactive = false;
                    this.autoPlayButtonAction();
                    _buttonAutoPlay.pixiContainer.$sprite.interactive = true;
                });
                this.buttonPlayCenter.click(()=>{
                    _buttonPlayCenter.pixiContainer.$sprite.interactive = false;
                    this.playButtonAction();
                    _buttonPlayCenter.pixiContainer.$sprite.interactive = true;
                });
            }   

            /**
             * Action
             */

            playButtonAction(){
                this.curTimeStamp = Date.now();
                var intervalTime = this.curTimeStamp-lastTimeStamp;
                lastTimeStamp = this.curTimeStamp;
                if(intervalTime <= 1000){ 
					gr.lib._buttonPlay.updateCurrentStyle({'_transform':{'_scale':{'_x':1,'_y':1}}});
					return ;
				}
                this.appStore.setGameIsInReveal(true);
                this.appStore.decrementSpinsLeft();         
                if (gameConfiguration.audio && gameConfiguration.audio.ButtonGeneric) {
                    audio.play(gameConfiguration.audio.ButtonGeneric.name, gameConfiguration.audio.ButtonGeneric.channel);
                }
            }

            autoPlayButtonAction(){ 
                this.curTimeStamp = Date.now();
                var intervalTime = this.curTimeStamp-lastTimeStamp;
                lastTimeStamp = this.curTimeStamp;
                if(intervalTime <= 1000){ 
					gr.lib._buttonAutoPlay.updateCurrentStyle({'_transform':{'_scale':{'_x':1,'_y':1}}});
					return ;
				}
                this.appStore.setShowAutoMap(true);
                this.appStore.setAutoPlay(true);
                this.appStore.setGameIsInReveal(true);
                gr.getTimer().setTimeout(()=>{ this.appStore.decrementSpinsLeft(); },0);           
                if (gameConfiguration.audio && gameConfiguration.audio.ButtonGeneric) {
                    audio.play(gameConfiguration.audio.ButtonGeneric.name, gameConfiguration.audio.ButtonGeneric.channel);
                }
            }

            /**
             * Reaction
             */

            bindReaction(){
                reaction(
                    () => this.appStore.SKBState,
                    () => {
                        switch (this.appStore.SKBState) {
                            case 'gameParametersUpdated':
                                this.setTextAndStyle();
                                this.setGladButton();
                                revealContainer.initialUI.call(this);
                                break;
                            case 'startUserInteraction':{
                                revealContainer.showPlayButtonByAutoRevealEnabled.call(this);
                                break;
                            }
                            case 'playerWantsPlayAgain':{
                                revealContainer.disableAllButton.call(this);
                                break;
                            }                            
                            case 'reStartUserInteraction':{
                                revealContainer.showPlayButtonByAutoRevealEnabled.call(this);
                                break;
                            }
                            case 'reset': {
                                this.appStore.setAutoPlay(false);
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
                        const { SKBState } = this.appStore;
                        if(SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction'){
                            if(showAutoMap){
                                revealContainer.disableAllButton.call(this);
                            }else{
                                revealContainer.showPlayButtonByAutoRevealEnabled.call(this);
                            }
                        }
                    }
                );
                
                reaction(
                    () => this.appStore.gameIsInReveal,
                    () => {
                        revealContainer.updateRevealUIWhenGameReveal.call(this, this.appStore.gameIsInReveal);
                    }
                );

                reaction(
                    () => this.appStore.autoPlay,
                    () => {
                        if(this.appStore.autoPlay){
                            revealContainer.updateRevealUIWhenGameAutoPlay.call(this, this.appStore.autoPlay);
                        }
                    }
                );

                reaction(
                    () => this.appStore.gameCurrentScene,
                    () => {
                        const { SKBState } = this.appStore;
                        if(SKBState === 'startUserInteraction' || SKBState === 'reStartUserInteraction'){
                            if(this.appStore.gameCurrentScene === 'baseGame'){
                                gr.getTimer().setTimeout(() => {
                                    if(!this.appStore.endGame){
                                        revealContainer.showPlayButtonByAutoRevealEnabled.call(this);
                                    }
                                }, 2800);
                            }else{
                                revealContainer.disableAllButton.call(this);
                            }
                        }
                    }
                );

                reaction(
                    () => this.appStore.endGame,
                    () => {
                        if(this.appStore.endGame){
                            revealContainer.disableAllButton.call(this);
                        }
                    }
                );

            }
        }
        
        return Reveal;
});