define([
    'com/pixijs/pixi',
    'com/pixijs/pixi-tween',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'game/gameConfig/gameConfiguration'
], function(PIXI, TWEEN, gr, audio, gameConfiguration) {

/*     function quadraticBezier(p0, p1, p2, t) {
        let k = 1 - t;
        return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2; // 二次贝赛尔曲线方程
    } */

    function _drawCurvePath( ctx, start, end, curveness, t ) {
        let cp = [
             ( start[ 0 ] + end[ 0 ] ) / 2 - ( start[ 1 ] - end[ 1 ] ) * curveness,
             ( start[ 1 ] + end[ 1 ] ) / 2 - ( end[ 0 ] - start[ 0 ] ) * curveness
        ];
        let p0 = start;
        let p1 = cp;
        let p2 = end;
        
        let v01 = [ p1[ 0 ] - p0[ 0 ], p1[ 1 ] - p0[ 1 ] ];     // 向量<p0, p1>
        let v12 = [ p2[ 0 ] - p1[ 0 ], p2[ 1 ] - p1[ 1 ] ];     // 向量<p1, p2>
    
        let q0 = [ p0[ 0 ] + v01[ 0 ] * t, p0[ 1 ] + v01[ 1 ] * t ];
        let q1 = [ p1[ 0 ] + v12[ 0 ] * t, p1[ 1 ] + v12[ 1 ] * t ];
        
        let v = [ q1[ 0 ] - q0[ 0 ], q1[ 1 ] - q0[ 1 ] ];       // 向量<q0, q1>
    
        let b = [ q0[ 0 ] + v[ 0 ] * t, q0[ 1 ] + v[ 1 ] * t ];
        
        ctx.moveTo( p0[ 0 ], p0[ 1 ] );
    
        ctx.quadraticCurveTo( 
            q0[ 0 ], q0[ 1 ],
            b[ 0 ], b[ 1 ]
        );
        return {
            x: b[ 0 ],
            y: b[ 1 ]
        };
    }

    let graphics = null;
    let originThrowCP = null;
    let color = '';
	
	const drawFlyLine = (graphics, endx, endy, callback) => {
        let curveness = 0.5,
            upCurveness = 0.5,
            dnCurveness = -0.5,
            direaction = true;
        let tickerForDraw = 2;
        const animate = () => {
            let cp = [
                ( originThrowCP[0] + endx ) / 2 - ( originThrowCP[1] - endy ) * curveness,
                ( originThrowCP[1] + endy ) / 2 - ( endx - originThrowCP[0] ) * curveness
            ];
            graphics.clear();
            graphics.lineStyle(3, color, 1.0); 
            graphics.moveTo(originThrowCP[0], originThrowCP[1]);            
            graphics.bezierCurveTo(originThrowCP[0], originThrowCP[1], cp[0], cp[1], endx, endy);
            if(direaction){
                curveness -= 0.2;
                if(curveness <= dnCurveness){
                    dnCurveness += 0.1;
                    direaction = false;
                }
            }else{
                curveness += 0.2;
                if(curveness >= upCurveness){
                    upCurveness -= 0.1;
                    direaction = true;
                }
            }
            if(dnCurveness >= 0 || upCurveness <= 0){
                curveness = 0;
                graphics.clear();
                graphics.lineStyle(3, color, 1.0);
                graphics.moveTo(originThrowCP[0], originThrowCP[1]); 
                graphics.lineTo(endx, endy);
                gr.getTicker().remove(animate, tickerForDraw);
                if(callback){
                    callback();
                }
            }
        };
        gr.getTicker().add(animate ,tickerForDraw);
    };

    const throwFlyLine = function(endx, endy, callback) {  
        const { _boyUpHook, _climberManContainer, _lineContainer, _hookContainer, _coverClimberMan, _coverSnowMan} = gr.lib;
        const { _width, _height } = _boyUpHook._currentStyle;
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        }
        if(!graphics){    
            const { _lineContainer } = gr.lib;
            graphics = new PIXI.Graphics();  
            _lineContainer.pixiContainer.addChild(graphics);
        }
        if(_coverClimberMan.pixiContainer.visible){
            const { x, y } = gameConfiguration[orientation].originThrowCoordinate.climberMan;
            originThrowCP = [x, y];
            color = '0x000000';
        }else if(_coverSnowMan.pixiContainer.visible){
            const { x, y } = gameConfiguration[orientation].originThrowCoordinate.snowMan;
            originThrowCP = [x, y];
            color = '0xffffff';
        }     
        graphics.lineStyle(3, color, 1.0); 
        let percent = 0;
        let tickerForThrow = 1;
        let [flyMoveLeft, flyMoveTop] = originThrowCP;
        let _left,_top;
        const animate = () => {
            const obj = _drawCurvePath(
                graphics,  
                [ originThrowCP[0], originThrowCP[1] ],
                [ endx, endy ],
                0.5,
                percent
            );
            _boyUpHook.updateCurrentStyle({_left:obj.x - _width/2, _top:obj.y - _height/2});
            _boyUpHook.show(true);
            flyMoveLeft -= obj.x;
            flyMoveTop -= obj.y;
            this.mountain.flyDown(flyMoveLeft, flyMoveTop);
            _left = _climberManContainer._currentStyle._left;
            _top = _climberManContainer._currentStyle._top;
            _climberManContainer.updateCurrentStyle({_left: flyMoveLeft+_left, _top: flyMoveTop+_top});
            _left = _lineContainer._currentStyle._left;
            _top = _lineContainer._currentStyle._top;
            _lineContainer.updateCurrentStyle({_left: flyMoveLeft+_left, _top: flyMoveTop+_top});
            _left = _hookContainer._currentStyle._left;
            _top = _hookContainer._currentStyle._top;
            _hookContainer.updateCurrentStyle({_left: flyMoveLeft+_left, _top: flyMoveTop+_top});
            flyMoveLeft = obj.x;
            flyMoveTop = obj.y;
            percent += 0.05;
            if(percent >= 1+0.05){
                audio.stopChannel(6);
                audio.play("grappling_FlyingClawCatchMountain", 5);
                _left = this.mountain.currentMoveLeft - this.mountain.container._currentStyle._left;
                _top = this.mountain.currentMoveTop - this.mountain.container._currentStyle._top;
                _climberManContainer.updateCurrentStyle({_left: _climberManContainer._currentStyle._left+_left, _top: _climberManContainer._currentStyle._top+_top});
                _lineContainer.updateCurrentStyle({_left: _lineContainer._currentStyle._left+_left, _top: _lineContainer._currentStyle._top+_top});
                _hookContainer.updateCurrentStyle({_left: _hookContainer._currentStyle._left+_left, _top: _hookContainer._currentStyle._top+_top});
                this.mountain.container.updateCurrentStyle({_left: this.mountain.currentMoveLeft, _top: this.mountain.currentMoveTop});
                gr.getTicker().remove(animate, tickerForThrow);
                drawFlyLine(graphics, endx, endy, callback);
            }
        };
        gr.getTicker().add(animate ,tickerForThrow);
    };

    const flyHookAnimation = function(endx, endy, flyUpNum, completeCallBack){
        const { _climberManContainer, _coverClimberMan, _coverSnowMan } = gr.lib;
        const startCoord = _climberManContainer.toGlobal({x:0,y:0});
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        }
        startCoord.x += _climberManContainer._currentStyle._width/2;
        startCoord.y += _climberManContainer._currentStyle._height/2;
        let iconPath = null;
        iconPath = new PIXI.tween.TweenPath();
        iconPath.moveTo(startCoord.x, startCoord.y);        
        if(_coverClimberMan.pixiContainer.visible){
            const { x, y } = gameConfiguration[orientation].climberManPathDestination;
            iconPath.lineTo(x, y);
        }else if(_coverSnowMan.pixiContainer.visible){
            const { x, y } = gameConfiguration[orientation].snowManPathDestination;
            iconPath.lineTo(x, y);
        }    
        iconPath.closed = false;

        var tween2 = PIXI.tweenManager.createTween(_climberManContainer.pixiContainer,{
            path: iconPath,
            time: flyUpNum*30,
            loop: false
        });
        
        let _left = _climberManContainer.pixiContainer.x, _top =  _climberManContainer.pixiContainer.y;

        tween2.on('update',function(){
            const coordX = originThrowCP[0] + _climberManContainer.pixiContainer.x - _left;
            const coordY = originThrowCP[1] + _climberManContainer.pixiContainer.y - _top;
            graphics.clear();
            graphics.lineStyle(3, color, 1.0);
            graphics.moveTo(coordX, coordY); 
            graphics.lineTo(endx, endy);
        });
        tween2.on('end',()=>{
            audio.stopChannel(7);
            graphics.moveTo(originThrowCP[0], originThrowCP[1]); 
            graphics.clear();
            if(completeCallBack){
                completeCallBack();
            }
        });

        tween2.start();
    };

    return {
        throwFlyLine,
        flyHookAnimation
    };

    
});