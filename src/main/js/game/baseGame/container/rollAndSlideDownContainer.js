define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/gameConfig/gameConfiguration',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'com/pixijs/pixi',
    'com/pixijs/pixi-tween',
], function(gr, gameConfiguration, audio, PIXI) {

    const showRollDownAndPlay_snowScene = function(rollDownNum){
        let xDistance = 30;
        let rotation = 0;
        let { currentSelectSkin }  =  this.appStore.dressStore;
        const { _rollDownContainer, _snowball } = gr.lib;
        _rollDownContainer.show(true);
        _snowball.setImage(gameConfiguration.universal.climberSkinConfiguration[++currentSelectSkin].rollDown);
        _snowball.show(true);
        const startCoord = { x:_snowball.pixiContainer.x, y:_snowball.pixiContainer.y };
        let denamicEndCoord = { x:startCoord.x-xDistance, y:startCoord.y-xDistance*Math.tan(30*Math.PI/180),};
        const tween = PIXI.tweenManager.createTween(_snowball.pixiContainer,{
            from:{ x:startCoord.x, y:startCoord.y, },
            to: { x:denamicEndCoord.x, y:denamicEndCoord.y, },
            time: 160,
            loop: true,
            pingPong: true
        }).start();
        audio.play('snowballRoll', 4, true);
        tween.on('repeat', function(){
            gr.animMap._gameShock.stop();
            gr.animMap._gameShock.play();
            rotation-=90;
        });
        tween.on('update',function(progress){
            console.log(_snowball.pixiContainer.x, _snowball.pixiContainer.y);
            const _ro = rotation - progress*90;
            _snowball.pixiContainer.rotation = _ro*Math.PI/180;
        }); 
        tween.on('end',function(){
            audio.stopChannel(4);
            rotation = 0;
            _snowball.show(false);
            _rollDownContainer.show(false);
            _snowball.pixiContainer.rotation= 0;
            _snowball.pixiContainer.x = 105;
            _snowball.pixiContainer.y = 105;
        });
        gr.getTimer().setTimeout(() => {
            tween.stop(true);
        }, rollDownNum*160);
    };

    const stopSlideDownAnimation = function(){
        const { _rollDownContainer, _slideSnow, } = gr.lib;
        _slideSnow.show(false);
        _rollDownContainer.show(false);
        _slideSnow.gotoAndStop(0);  
    };
    return {
        //slide_snowScene,
        showRollDownAndPlay_snowScene,
        stopSlideDownAnimation
    };
    
});