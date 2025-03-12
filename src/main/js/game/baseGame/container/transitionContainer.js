define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'com/pixijs/pixi',
    'com/pixijs/pixi-tween',
], function(gr, audio, PIXI) {
    const pathCoord = {
        'portrait': [
            {
                start: [-1096, 240],
                end: [315, 164]
            },
            {
                start: [-840, 520],
                end: [210, 520]
            },
            {
                start: [1240, 620],
                end: [520, 620]
            },
            {
                start: [1600, 862],
                end: [315, 862]
            },
            {
                start: [1200, 350],
                end: [800, 350]
            },
            {
                start: [-1096, 350],
                end: [215, 350]
            },
        ],
        'landscape':  [
            {
                start: [-1002, 250],
                end: [630, 250]
            },
            {
                start: [-804, 613],
                end: [400, 613]
            },
            {
                start: [1858, 343],
                end: [1000, 343]
            },
            {
                start: [1996, 600],
                end: [1200, 600]
            },
            {
                start: [1858, 100],
                end: [1200, 100]
            },
            {
                start: [-1002, 400],
                end: [400, 400]
            }
        ],
    };
    const pathCoord1 = {
        'portrait': [
            {
                end: [-1096, 240],
                start: [315, 164]
            },
            {
                end: [-840, 520],
                start: [210, 520]
            },
            {
                end: [1240, 620],
                start: [520, 620]
            },
            {
                end: [1600, 862],
                start: [315, 862]
            },
            {
                end: [1200, 350],
                start: [800, 350]
            },
            {
                end: [-1096, 350],
                start: [215, 350]
            },
        ],
        'landscape':  [
            {
                end: [-1002, 250],
                start: [630, 250]
            },
            {
                end: [-804, 613],
                start: [400, 613]
            },
            {
                end: [1858, 343],
                start: [1000, 343]
            },
            {
                end: [1996, 600],
                start: [1200, 600]
            },
            {
                end: [1858, 100],
                start: [1200, 100]
            },
            {
                end: [-1002, 400],
                start: [400, 400]
            }
        ],
    };
    let cloudPath = null,
    cloudTween = null,
    currentPathCloud = null;
    let cloudPath1 = null,
    cloudTween1 = null,
    currentPathCloud1 = null;
    const createCloudPath = (orientation) => {
        let _cloudPath = [];
        currentPathCloud = pathCoord[orientation];
        for(let i = 0; i < 6; i++){
            const path = new PIXI.tween.TweenPath();
            path.moveTo(currentPathCloud[i].start[0],currentPathCloud[i].start[1]);
            path.lineTo(currentPathCloud[i].end[0],currentPathCloud[i].end[1]);
            path.closed = false;
            _cloudPath.push(path);
        }
        return _cloudPath;
    };
    const createCloudPath1 = (orientation) => {
        let _cloudPath = [];
        currentPathCloud1 = pathCoord1[orientation];
        for(let i = 0; i < 6; i++){
            const path = new PIXI.tween.TweenPath();
            path.moveTo(currentPathCloud1[i].start[0],currentPathCloud1[i].start[1]);
            path.lineTo(currentPathCloud1[i].end[0],currentPathCloud1[i].end[1]);
            path.closed = false;
            _cloudPath.push(path);
        }
        return _cloudPath;
    };
    const createCloudTween = () => {
        let _cloudTween = [];
        const { _transtionContainer } = gr.lib;
        Object.keys(_transtionContainer.sprites).forEach((cloudSprite, index)=>{
            const pixiSprite = gr.lib[cloudSprite].pixiContainer;
            const tween = PIXI.tweenManager.createTween(pixiSprite, {
                path: cloudPath[index],
                time: 1000,
                easing: PIXI.tween.Easing.outQuart(),
                loop: false
            });
            tween.on('start', function(){
                gr.lib[cloudSprite].show(true);
            });
            _cloudTween.push(tween);
        });
        return _cloudTween;
    };
    const createCloudTween1 = () => {
        let _cloudTween = [];
        const { _transtionContainer } = gr.lib;
        Object.keys(_transtionContainer.sprites).forEach((cloudSprite, index)=>{
            const pixiSprite = gr.lib[cloudSprite].pixiContainer;
            const tween = PIXI.tweenManager.createTween(pixiSprite, {
                path: cloudPath1[index],
                time: 1000,
                easing: PIXI.tween.Easing.outQuart(),
                loop: false
            });
            tween.on('start', function(){
                gr.lib[cloudSprite].show(true);
            });
            tween.on('end', function(){
                gr.lib[cloudSprite].show(false);
            });
            _cloudTween.push(tween);
        });
        return _cloudTween;
    };

    const cloudStartPlay = (orientation) => {
        const { _transtionContainer } = gr.lib;
        if(!cloudPath){
            cloudPath = createCloudPath(orientation);
            cloudTween = createCloudTween();
        }
        _transtionContainer.show(true);
        audio.play('cloudTransition', 1);
        for(let i = 0; i < 6; i++){
            cloudTween[i].start();
        }
    };

    const cloudStartPlay1 = (orientation) => {
        const { _transtionContainer } = gr.lib;
        if(!cloudPath1){
            cloudPath1 = createCloudPath1(orientation);
            cloudTween1 = createCloudTween1();
        }
        _transtionContainer.show(true);
        audio.play('cloudTransition', 1);
        for(let i = 0; i < 6; i++){
            cloudTween1[i].start();
        }
    };

    const translateToBonusGame = (type, orientation) => {
        cloudStartPlay(orientation);
        gr.getTimer().setTimeout(() => {
            if(type === 1){
                gr.animMap._translateToBonus_01.play();
            }else{
                gr.animMap._translateToBonus_02.play();
            }
        }, 1200);
        gr.getTimer().setTimeout(() => {
            cloudStartPlay1(orientation);
        }, 1700);
    };

    const translateToBaseGame = (type, orientation) => {
        cloudStartPlay(orientation);
        gr.getTimer().setTimeout(() => {
            if(type === 1){
                gr.animMap._translateToBase_01.play();
            }else{
                gr.animMap._translateToBase_02.play();
            }
        }, 1200);
        gr.getTimer().setTimeout(() => {
            cloudStartPlay1(orientation);
        }, 1700);
    };

    const resetTransitionContainer = () => {
        const { _transtionContainer } = gr.lib;
        _transtionContainer.show(false);
        _transtionContainer.updateCurrentStyle({_opacity:1});
        Object.keys(_transtionContainer.sprites).forEach((cloud, index)=>{
            const left = currentPathCloud[index].start[0];
            const top = currentPathCloud[index].start[1];
            gr.lib[cloud].updateCurrentStyle({_left: left, _top: top});
        });
    };

    return {
        translateToBonusGame,
        translateToBaseGame,
        resetTransitionContainer,
        cloudStartPlay1
    };
});