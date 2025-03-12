define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/componentCRDC/gladRenderer/Tween',
    'skbJet/component/gameMsgBus/GameMsgBus',
], function(gr, Tween, msgBus) {
    
    const birdsOriginPosition = {
        'landscape': {
            _left: 358,
            _top: 286
        },
        'portrait': {
            _left:198, 
            _top:372
        }
    };

    const birdsMoveDown = () => {
        const { _birdsContainer } = gr.lib;
        let { _left, _top } = _birdsContainer._currentStyle;
        _left -= 6;
        _top += 10;
        Tween.to(_birdsContainer, { 
            left: _left,
            top: _top
        }, 400);
    };

    const birdsFlyDown = (flyUpNum) => {
        const { _birdsContainer } = gr.lib;
        let { _left, _top } = _birdsContainer._currentStyle;
        _left -= flyUpNum*2;
        _top += 4*flyUpNum;
        Tween.to(_birdsContainer, { 
            left: _left,
            top: _top
        }, flyUpNum*100);
    };

    const birdsFlyUp = (flyUpNum) => {
        const { _birdsContainer } = gr.lib;
        let { _left, _top } = _birdsContainer._currentStyle;
        _left += flyUpNum*2;
        _top -= 4*flyUpNum;
        Tween.to(_birdsContainer, { 
            left: _left,
            top: _top
        }, flyUpNum*100);
    };

    const resetBirds = (orientation) => {
        const { _birdsContainer } = gr.lib;
        _birdsContainer.updateCurrentStyle({_left:birdsOriginPosition[orientation]._left, _top:birdsOriginPosition[orientation]._top});
    };

    msgBus.subscribe("MOUNTAIN.UP.ONESTEP", birdsMoveDown);
    msgBus.subscribe("GOAT.MOUNTAIN.UP.ONESTEP", birdsMoveDown);

    return {
        birdsFlyDown,
        resetBirds,
        birdsFlyUp
    };
});