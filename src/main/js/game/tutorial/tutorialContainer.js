define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tutorial/config'
], function (gr, config) {

        const showCurrentPage = (index, maxIndex) => {
            const iconOffImage = config.iconOffImage,
                iconOnImage = config.iconOnImage;
            for (let i = 0; i < maxIndex; i++) {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
                }
            }
            gr.lib['_tutorialPage_0' + index].show(true);
            gr.lib['_tutorialPage_0' + index + '_Text_00'].show(true);
            gr.lib['_tutorialPageIcon_0' + index].setImage(iconOnImage);
        };

        const showVersioText = (isWLA) => {
            if (isWLA) {
                gr.lib._versionText.show(true);
            } else {
                gr.lib._versionText.show(false);
            }
        };

        const showTutorial = function(bool, ticketReadyForDress) {
            if (bool) {
                this.buttonInfo.show(false);
                gr.lib._BG_dim.show(true);
                gr.lib._tutorial.show(true);
            } else {                
                if (this.appStore.gameCurrentScene === 'baseGame') {
                    this.buttonInfo.show(true);
                }
                if (this.resultIsShown) {
                    gr.lib._BG_dim.show(true);
                } else {
                    gr.lib._BG_dim.show(false);
                }
                if(!this.resultIsShown && ticketReadyForDress){
                    if(this.appStore.gameCurrentScene === 'baseGame'){
                        gr.lib._BG_dim.show(true);
                    }else{
                        gr.lib._BG_dim.show(false);
                    }
                }
                gr.lib._tutorial.show(false);
            }
        };

        return {
            showCurrentPage,
            showVersioText,
            showTutorial
        };

});