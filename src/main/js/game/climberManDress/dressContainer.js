define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/baseGame/ClimberMan',
    'game/baseGame/SnowMan',
    'game/baseGame/Goat',
    'game/gameConfig/gameConfiguration'
], function (gr, ClimberMan, SnowMan, Goat, gameConfiguration) {
    let _dressPages = null;
    let climberSpines = [];

    const _addClimberMan = (parent) => { return new ClimberMan(110, 40, 0.5, 0.5, parent, 2); };

    const _addSnowMan = (parent) => { return new SnowMan(130, 80, 0.5, 0.5, parent, 2); };

    const _addGoat = (parent) => { return new Goat(130, 80, 0.5, 0.5, parent, 2); };

    const _showCurrentSelectBox = (index) => {
        for(let i = 1; i < 5; i++){ gr.lib['_dressSelectBox_0'+i].show(false); }
        gr.lib['_dressSelectBox_0'+(index)].show(true);
    };

    const renderSkinPages = (dressPages) => {
        const { climberSkinConfiguration } = gameConfiguration.universal;
        if (_dressPages) {
            dressPages.forEach((page, index) => {
                const i = index + 1;
                const { spineSkinName, unlockConditionName } = page;
                if (page.select) {
                    _showCurrentSelectBox(i);
                    climberSpines[index].play(climberSkinConfiguration[spineSkinName].climb, 1, true);
                } else {
                    climberSpines[index].play(climberSkinConfiguration[spineSkinName].standing, 1, true);
                }
                if (page === _dressPages[index]) {
                    return;
                } else {
                    if (!page.lock) {
                        if(i > 1){
                            gr.lib['_dressClothing0' + i + 'C'].show(false);
                            gr.lib['_dressClothing0' + i + 'D'].show(false);
                            gr.lib['_dressClothing0' + i + 'E'].show(false);
                            gr.lib['_dressClothing0' + i + 'F'].show(false);
                            gr.lib['_dressClothing0' + i + 'G'].show(false);
                        }
                    } else {
                        gr.lib['_dressClothing0' + i + 'D'].setImage(unlockConditionName);
                    }
                    _dressPages[index] = page;
                }
            });
        } else {
            _dressPages = Object.assign({}, dressPages);
            dressPages.forEach((page, index) => {
                const { spineSkinName, unlockConditionName } = page;
                const i = index + 1;
                let climberSpine = null;
                if(i >= 1 && i < 3){
                    climberSpine = _addClimberMan(gr.lib['_dressClothing0' + i], page.spineSkinName);
                }else if(i >= 3 && i < 4){
                    climberSpine = _addSnowMan(gr.lib['_dressClothing0' + i], page.spineSkinName);
                }else{
                    climberSpine = _addGoat(gr.lib['_dressClothing0' + i], page.spineSkinName);
                }
                if (!page.lock) {
                    if(i > 1){
                        gr.lib['_dressClothing0' + i + 'C'].show(false);
                        gr.lib['_dressClothing0' + i + 'D'].show(false);
                        gr.lib['_dressClothing0' + i + 'E'].show(false);
                        gr.lib['_dressClothing0' + i + 'F'].show(false);
                        gr.lib['_dressClothing0' + i + 'G'].show(false);
                    }
                    if (page.select) {
                        _showCurrentSelectBox(i);
                        climberSpine.play(climberSkinConfiguration[spineSkinName].climb, 1, true);
                    } else {
                        climberSpine.play(climberSkinConfiguration[spineSkinName].standing, 1, true);
                    }
                } else {
                    gr.lib['_dressClothing0' + i + 'D'].setImage(unlockConditionName);
                    climberSpine.play(climberSkinConfiguration[spineSkinName].standing, 1, true);
                }
                climberSpines.push(climberSpine);
            });
        }
    };

    const hideDressAndShowGameScene = () => {
        const {
            _dress,
            _BG_dim
        } = gr.lib;
        _dress.show(false);
        _BG_dim.show(false);
    };

    const renderDressPage = function(visible){
        const {
            _dress,
            _buttons,
            _BG_dim,
            _tutorial
        } = gr.lib;
        if (visible) {
            if(this.appStore.gameCurrentScene === 'baseGame'){
                _buttons.show(false);
            }
            _BG_dim.show(true);
        } else {
            if(this.appStore.gameCurrentScene === 'baseGame'){
                _buttons.show(true);
            }
            if(!_tutorial.pixiContainer.visible){
                _BG_dim.show(false);
            }
        }
        _dress.show(visible);
        _dress.updateCurrentStyle({
            _opacity: 1
        });
        _BG_dim.updateCurrentStyle({
            _opacity: 0.7
        });
    };

    const setInteractiveOfDress = function (bool) {
        this.okButton.enable(!bool);
        this.dressElements.forEach((element) => {
            element.enable(!bool);
        });
    };

    const showCurrentPage = (index) => {
        const { _dressClothing } = gr.lib;
        if(index === 1){
            _dressClothing.updateCurrentStyle({_left:0});
        }else{
            _dressClothing.updateCurrentStyle({_left:-624});
        }
    };

    const initial = () => {
        for(let i = 2; i < 5; i++){
            gr.lib['_dressClothing0'+i+'G'].show(false);
            gr.lib['_dressClothing0'+i+'H'].show(false);
        }
    };

    const doReactionForUpList = function(upList){
        const { _dressPriceList03C } = gr.lib;
        _dressPriceList03C.setText(upList);    
        for(let i = 0; i < this.upDress.length; i++){
            const { lock, unlockConditionNum } = this.appStore.dressStore.dressPages[this.upDress[i]];
            if(lock && upList <= unlockConditionNum){
                const index = this.upDress[i] + 1;
                gr.lib['_dressClothing0' + index + 'E'].autoFontFitText = true;
                gr.lib['_dressClothing0' + index + 'E'].setText(upList + '/' + unlockConditionNum);
            }
        }
    };

    const doReactionForDnList = function(dnList){
        const { _dressPriceList02C } = gr.lib;
        _dressPriceList02C.setText(dnList);    
        for(let i = 0; i < this.dnDress.length; i++){
            const { lock, unlockConditionNum } = this.appStore.dressStore.dressPages[this.dnDress[i]];
            if(lock && dnList <= unlockConditionNum){
                const index = this.dnDress[i] + 1;
                gr.lib['_dressClothing0' + index + 'E'].autoFontFitText = true;
                gr.lib['_dressClothing0' + index + 'E'].setText(dnList + '/' + unlockConditionNum);
            }
        }
    };

    const doReactionForAccList = function(accList){
        const { _dressPriceList01C } = gr.lib;
        _dressPriceList01C.setText(accList);    
        for(let i = 0; i < this.accDress.length; i++){
            const { lock, unlockConditionNum } = this.appStore.dressStore.dressPages[this.accDress[i]];
            if(lock && accList <= unlockConditionNum){
                const index = this.accDress[i] + 1;
                gr.lib['_dressClothing0' + index + 'E'].autoFontFitText = true;
                gr.lib['_dressClothing0' + index + 'E'].setText(accList + '/' + unlockConditionNum);
            }
        }
    };

    return {
        renderSkinPages,
        hideDressAndShowGameScene,
        renderDressPage,
        setInteractiveOfDress,
        showCurrentPage,
        initial,
        doReactionForUpList,
        doReactionForDnList,
        doReactionForAccList
    };
});