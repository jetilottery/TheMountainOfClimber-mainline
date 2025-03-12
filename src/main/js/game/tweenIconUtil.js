define([
    'com/pixijs/pixi',
    'com/pixijs/pixi-tween',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
], function(PIXI, TWEEN, gr) {
    /**
     * ------------------------------- Tween Icon Animation --------------------------
     */
	const _createIconPath = (startCoord, endCoord) => {
        let iconPath = null;
        iconPath = new PIXI.tween.TweenPath();
        iconPath.moveTo(startCoord.x, startCoord.y);
        iconPath.lineTo(endCoord.x, endCoord.y);
        iconPath.closed = false;

/*         var gPath = new PIXI.Graphics();
        gPath.lineStyle(1, 0x000000, 1);
        gPath.drawPath(iconPath);
        gr.lib._gameScreen.pixiContainer.addChild(gPath);  */

        return iconPath;
    };

    const createIconTweenAnimation = (startCoord, endCoord, sprite, config) => {
        let iconTween = null;
        const path = _createIconPath(startCoord, endCoord);
        iconTween = PIXI.tweenManager.createTween(sprite.pixiContainer, {
            path: path,
            time: config.time,
            easing: config.easing,
            loop: false
        });
        return iconTween;
    };
     
    let particlePool = [];
    let gladParticle = {
        "_SPRITES": [],
        "_style": {
            "_width": "150",
            "_height": "150",
            "_top": "1500",
            "_left": "296"
        }
    };
    let index = 0;
    const createParticleTweenAnimation = (startCoord, endCoord, config) => {
        const { _tweenParticleContainer } = gr.lib;
        const randomIamge = Math.floor(Math.random()*4)+1;
        const _obj = Object.assign({},gladParticle,{
            "_id": "_20zwnvxy"+index,
            "_name": "_tweenParticle"+index,
            "_style": Object.assign({},gladParticle._style,{
                "_background": {
                    "_imagePlate": "SpinsLight0"+randomIamge
                },
            })
        });
        const sprite = _tweenParticleContainer.addChildFromData(_obj);
        const _availableIconTween = createIconTweenAnimation(startCoord, endCoord, sprite, config);
        particlePool.push(sprite);
        _availableIconTween.start();
        _availableIconTween.on('end', function(){
            sprite.show(false);
        });
    };

    let particleTimer = null;

    const tweenIconAnimation = (startCoord, endCoord, callback, sprite) => {
        let _keyFrameIcon = sprite || gr.lib._keyFrameIcon;
        let _availableIconTween;
        if(particlePool.length){
            let i = 0;
            _availableIconTween = createIconTweenAnimation(startCoord, endCoord, _keyFrameIcon, {time:500, easing: PIXI.tween.Easing.inOutSine()});
            _availableIconTween.start();
            particleTimer = gr.getTimer().setInterval(() => {
                if(particlePool[i]){
                    let _i = i;
                    particlePool[_i].updateCurrentStyle({_left:startCoord.x-75,_top:endCoord-75});
                    particlePool[_i].setImage("SpinsLight0"+Number(Math.floor(Math.random()*4)+1));
                    _availableIconTween = createIconTweenAnimation(startCoord, endCoord, particlePool[_i], {time:500, easing: PIXI.tween.Easing.inOutSine()});
                    _availableIconTween.start();
                    particlePool[_i].show(true);
                    _availableIconTween.on('end', function(){
                        particlePool[_i].show(false);
                    });
                    i++;
                }
            }, 100);
        }else{
            _availableIconTween = createIconTweenAnimation(startCoord, endCoord, _keyFrameIcon, {time:500, easing: PIXI.tween.Easing.inOutSine()});
            _availableIconTween.start();
            particleTimer = gr.getTimer().setInterval(() => {
                createParticleTweenAnimation(startCoord, endCoord, {time:500, easing: PIXI.tween.Easing.inOutSine()});
                index++;
            }, 100);
        }
        //gr.animMap._scaleKeyFrameIcon.play();
        _availableIconTween.on('end', function(){
            callback();
            gr.getTimer().clearInterval(particleTimer);
            particleTimer = null;
        });
    };

    const tweenAutoPointerAnimation = (startCoord, endCoord, callback) => {
        const { _autoPointer } = gr.lib;
        const { _width, _height } = _autoPointer._currentStyle;
        const _availableIconTween = createIconTweenAnimation(startCoord, endCoord, _autoPointer, {time:500, easing: PIXI.tween.Easing.outQuad()});
        _availableIconTween.start();
        _availableIconTween.on('end', function(){
            _autoPointer.updateCurrentStyle({_left: endCoord.x - _width/2, _top: endCoord.y - _height/2});
            callback();
        });
    };

    return {
        tweenIconAnimation,
        tweenAutoPointerAnimation
    };
});