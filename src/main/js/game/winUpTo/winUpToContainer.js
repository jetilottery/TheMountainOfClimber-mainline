define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/tutorial/config',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
], function (gr, config, SKBeInstant, loader) {

        const hideAllWinUpTo = function(){
            Object.keys(this.container.sprites).forEach((sprite) => {
                gr.lib[sprite].show(false);
            });
        };

        const setWinUpToText = function (index, winMaxPrize){
            gr.lib['_winUpTo_' + index].setText(loader.i18n.Game.winUpTo.win_up_to + SKBeInstant.formatCurrency(winMaxPrize).formattedAmount + loader.i18n.Game.winUpTo.win_up_to_mark);
            gr.lib['_winUpTo_' + index].show(true);
        };

        return {
            hideAllWinUpTo,
            setWinUpToText
        };

});