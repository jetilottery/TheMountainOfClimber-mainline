define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/gameConfig/gameConfiguration',
], function(gr, SKBeInstant, gameConfiguration) {

    const hideAutoMap = function(){
        const { _autoMapContainer, _keyMapIconsContainer } = gr.lib;
        _autoMapContainer.show(false);
        Object.keys(_keyMapIconsContainer.sprites).forEach((element)=>{
            gr.lib[element].show(false);
        });
    };

    const showAutoMap = function(){
        const { _autoMapContainer } = gr.lib;
        _autoMapContainer.show(true);
    };

    const updateAutoPointerPosition = function(orientation, lineStep){
        const currentStep = this.appStore.baseGameStore.data.totalClimberStep;
        const pointerOriginTop = gameConfiguration[orientation].pointerOriginTop;
        const { _autoPointer, _iwWinContainer } = gr.lib;
        const _top = pointerOriginTop - currentStep * lineStep;
        _autoPointer.updateCurrentStyle({_top:_top});
        _iwWinContainer.updateCurrentStyle({_top:_top});
    };

    const initialAutoPointerPosition = function(orientation){
        const pointerOriginTop = gameConfiguration[orientation].pointerOriginTop;
        const { _autoPointer, _iwWinContainer } = gr.lib;
        _autoPointer.updateCurrentStyle({_top:pointerOriginTop});
        _iwWinContainer.updateCurrentStyle({_top:pointerOriginTop});
    };

    const showAutoMapContainer = function(){
        let orientation;
        if(this.appStore.SKBeInstant.isSKB()){
            orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
        }else{
            orientation = this.appStore.SKBeInstant.getGameOrientation();
        }
        const lineStep = gameConfiguration[orientation].lineStep;
        const pointerOriginTop = gameConfiguration[orientation].pointerOriginTop;
        const { _map,_closeAutoMap, _disableMapIcon } = gr.lib;
        _map.show(false);
        _closeAutoMap.show(true);
        _disableMapIcon.show(false);
        updateAutoPointerPosition.call(this, orientation, lineStep, pointerOriginTop);
        showAutoMap.call(this);
        this.autoRevealButton.show(true);
        this.closeMapSpine.visible = true;
    };

    const hideAutoMapContainer = function(){
        const { _autoMapContainer, _keyMapIconsContainer, _map } = gr.lib;
        _map.show(true);
        _autoMapContainer.show(false);
        Object.keys(_keyMapIconsContainer.sprites).forEach((element)=>{
            gr.lib[element].show(false);
        });
    };

    const hideContainerInAutoPlay = function(){
        const { _closeAutoMap, _disableMapIcon } = gr.lib;
        _closeAutoMap.show(false);
        _disableMapIcon.show(true);
        this.autoRevealButton.show(false);
        this.closeMapSpine.visible = false;
    };

    const enableMapButton = function(){
        this.mapSpine.visible = true;
        this.mapSpine.state.setAnimation(0, '08map01', true);
    };

    const disableMapButton = function(){
        this.mapSpine.visible = true;
        this.mapSpine.state.setAnimation(0, '09map02', false);
    };

    const updateTopAward = function(currentPriceMap){
        const { IW } = currentPriceMap;
        const { _topAward } = gr.lib;
        _topAward.setText(SKBeInstant.formatCurrency(IW[IW.length-1]).formattedAmount);
    };

    return {
        hideAutoMap,
        showAutoMap,
        updateAutoPointerPosition,
        initialAutoPointerPosition,
        showAutoMapContainer,
        hideAutoMapContainer,
        hideContainerInAutoPlay,
        enableMapButton,
        disableMapButton,
        updateTopAward
    };
});