define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
], function (gr, SKBeInstant, loader) {

        const showTicketIconsContainer = (priceLength) => {
            if (priceLength <= 1) {
                gr.lib._ticketIcons.show(false);
                gr.lib._ticketCostPlus.show(false);
                gr.lib._ticketCostMinus.show(false);
            } else {
                gr.lib._ticketIcons.show(true);
                gr.lib._ticketCostPlus.show(true);
                gr.lib._ticketCostMinus.show(true);
            }
        };

        const showCurrentPricePoint = function(pricePoint, pricePointList, wagerType) {
            const index = pricePointList.indexOf(pricePoint);
            const valueStr = SKBeInstant.formatCurrency(pricePoint).formattedAmount;
            this.plusButton.enable(true);
            this.minusButton.enable(true);
            if (index === 0) {
                this.minusButton.enable(false);
            }
            if (index === (pricePointList.length - 1)) {
                this.plusButton.enable(false);
            } 
            if (wagerType === 'BUY') {
                gr.lib._ticketCostValue.setText(valueStr);
            } else {
                gr.lib._ticketCostValue.setText(loader.i18n.Game.demo + valueStr);
            }   
            for (let i = 0; i < pricePointList.length; i++) {
                Object.keys(this.ticketIconsContainer.sprites).forEach((child, i) => {
                    if (i === index) {
                        gr.lib[child].setImage('ticketCostLevelIconOn');
                        return;
                    }
                    gr.lib[child].setImage('ticketCostLevelIconOff');
                });
            }
        };

        const hideTicketContainer = () => {
            gr.lib._ticketCost.show(false);
        };

        const showTicketContainer = () => {
            gr.lib._ticketCost.show(true);
        };

        return {
            showTicketIconsContainer,
            showCurrentPricePoint,
            hideTicketContainer,
            showTicketContainer
        };

});