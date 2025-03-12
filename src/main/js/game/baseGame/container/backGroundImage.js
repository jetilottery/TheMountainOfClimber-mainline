define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/componentCRDC/gladRenderer/Tween',
    'skbJet/component/gameMsgBus/GameMsgBus',
], function(gr, Tween, msgBus) {
    
    const backGroundOriginPosition = {
        'landscape': {
            _left: -10,
            _top: -1054
        },
        'portrait': {
            _left: 0, 
            _top: -700
        }
    };

    const moveDistance = {
        'landscape': 22,
        'portrait': 18
    };

    const backGroundMoveDown = (orientation) => {
        const { _background } = gr.lib;
        let { _left, _top } = _background._currentStyle;
        _left -= 1.5;
        _top += moveDistance[orientation];
        Tween.to(_background, { 
            left: _left,
            top: _top
        }, 400);
    };

    const backGroundFlyDown = (flyUpNum, orientation) => {
        const { _background } = gr.lib;
        let { _left, _top } = _background._currentStyle;
        _left -= flyUpNum;
        _top += moveDistance[orientation]*flyUpNum;
        Tween.to(_background, { 
            left: _left,
            top: _top
        }, flyUpNum*100);
    };

    const backGroundFlyUp = (flyUpNum, orientation) => {
        const { _background } = gr.lib;
        let { _left, _top } = _background._currentStyle;
        _left += flyUpNum;
        _top -= moveDistance[orientation]*flyUpNum;
        Tween.to(_background, { 
            left: _left,
            top: _top
        }, flyUpNum*100);
    };

    const resetBackGround = (orientation) => {
        const { _background } = gr.lib;
        _background.updateCurrentStyle({_left:backGroundOriginPosition[orientation]._left, _top:backGroundOriginPosition[orientation]._top});
    };

    msgBus.subscribe("MOUNTAIN.UP.ONESTEP", backGroundMoveDown);
    msgBus.subscribe("GOAT.MOUNTAIN.UP.ONESTEP", backGroundMoveDown);

    return {
        backGroundFlyDown,
        resetBackGround,
        backGroundFlyUp
    };
});