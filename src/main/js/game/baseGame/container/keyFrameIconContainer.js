define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
], function(gr) {

    const updateKeyFrameIconContainer = (keyFrameIconPosition, imageName) => {
        const { _keyFrameIcon, _keyFrameIconContainer } = gr.lib;
        _keyFrameIconContainer.updateCurrentStyle({_transform:{_scale:{_x:1,_y:1}}});
        _keyFrameIcon.updateCurrentStyle({_left: keyFrameIconPosition.x, _top: keyFrameIconPosition.y});
        _keyFrameIcon.setImage(imageName);
        _keyFrameIcon.show(true);
    };

    const hideKeyFrameIcon = () => {
        const { _keyFrameIcon } = gr.lib;
        _keyFrameIcon.show(false);
    };

    let _iconIndexAutoPlay = 0;
    const updateKeyFrameIconAutoPlay = (keyFrameIconPosition, imageName) => {
        const { _keyMapIconsContainer } = gr.lib;
        const sprite = gr.lib['_keyMapIcon_0'+_iconIndexAutoPlay];
        _keyMapIconsContainer.updateCurrentStyle({_transform:{_scale:{_x:1,_y:1}}});
        sprite.updateCurrentStyle({_left: keyFrameIconPosition.x, _top: keyFrameIconPosition.y});
        sprite.setImage(imageName);
        sprite.show(true);
        _iconIndexAutoPlay++;
        if(_iconIndexAutoPlay > 4){
            _iconIndexAutoPlay = 0;
        }
        return sprite;
    };

    return {
        updateKeyFrameIconContainer,
        hideKeyFrameIcon,
        updateKeyFrameIconAutoPlay
    };
});