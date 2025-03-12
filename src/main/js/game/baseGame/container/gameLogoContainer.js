define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/resourceLoader/resourceLib',
    'com/pixijs/pixi',
], function(gr, resLib, PIXI) {

    let logoSpine = null;

    const initialLogoSpine = () => {
        const { _gameLogo } = gr.lib;
        logoSpine = new PIXI.spine.Spine(resLib.spine.LogoAspine.spineData);
        logoSpine.skeleton.setToSetupPose();
        logoSpine.update(0);
        _gameLogo.pixiContainer.addChild(logoSpine);
        let localRect = logoSpine.getLocalBounds();
        logoSpine.position.set(-localRect.x, -localRect.y);
        logoSpine.state.setAnimation(0, '02LogoB', true);
        logoSpine.state.timeScale = 1;
    };

    return {
        initialLogoSpine
    };
});