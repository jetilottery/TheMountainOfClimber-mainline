define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
], function(gr) {
    /**
     * For spinLeft animation
     */
    const doSpinLeftReact = function(value){
        const { _spinsLeftImage1, _spinsLeftImage2 } = gr.lib;
        _spinsLeftImage2.show(true);
        _spinsLeftImage2.setImage('spineLeftNumer_0' + value);
        gr.animMap._spinLeftAnimation.play();
        gr.animMap._spinLeftAnimation._onComplete = () => {
            _spinsLeftImage1.updateCurrentStyle({
                _opacity: 1,
                _transform: {
                    _scale: {
                        _x: 1.3,
                        _y: 1.3
                    }
                }
            });
            _spinsLeftImage1.setImage('spineLeftNumer_0' + value);
            _spinsLeftImage2.show(false);
        };
    };

    const setSpinLeft = function(value){
        const { _spinsLeftN01, _spinsLeftImage1 } = gr.lib;
        _spinsLeftN01.setText('');
        _spinsLeftImage1.setImage('spineLeftNumer_0'+value);
    };

    return {
        doSpinLeftReact,
        setSpinLeft
    };
});