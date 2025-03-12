define([
    'skbJet/component/SKBeInstant/SKBeInstant'
    ], function(SKBeInstant){
        
        /**
         * @function obtainRandomElementOfArray
         * @description return a random element of an array.
         * @instance
         * @param arr {array} - source array
         * @return a random element in the source array
         */
        function obtainRandomElementOfArray(arr){
            return arr[Math.floor(Math.random() * arr.length)];
        }
    
        function setTextStyle(Sprite, style){
            for(var key in style){
                Sprite.pixiContainer.$text.style[key] = style[key];
            }
        }
        
        //ramdom sort Array
        function randomSort(Array){
            var len = Array.length;
            var i, j, k;
            var temp;
            
            for(i=0; i < Math.floor(len/2);i++){
                j = Math.floor((Math.random()*len));
                k = Math.floor((Math.random()*len));
                while(k === j){
                    k = Math.floor((Math.random()*len));
                }
                temp = Array[j];
                Array[j] = Array[k];
                Array[k] = temp;            
            }
        }
		
		function getOrientation(){
			var orientation;
			if(SKBeInstant.isSKB()){
				orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
			}else{
				orientation = SKBeInstant.getGameOrientation();
			}
			return orientation;
		}
    
        function fixMeter(gr) {//suggested font size is 20, _meterDivision0 and _meterDivision1 use font size 28
            var balanceText = gr.lib._balanceText;
            var balanceValue = gr.lib._balanceValue;
            balanceValue.pixiContainer.$text.style.wordWrap = false;
            var meterDivision0 = gr.lib._meterDivision0;
            var ticketCostMeterText = gr.lib._ticketCostMeterText;
            var ticketCostMeterValue = gr.lib._ticketCostMeterValue;
            ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
            var meterDivision1 = gr.lib._meterDivision1;
            var winsText = gr.lib._winsText;
            var winsValue = gr.lib._winsValue;
            var metersBG = gr.lib._metersBG;
    
            var len = metersBG._currentStyle._width;
            var temp/*, balanceLeft*/;
            var top4OneLine = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight) / 2 + 6;
            var top4TwoLine0 = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight * 2) / 2 + 4;
            var top4TwoLine1 = top4TwoLine0 + balanceText._currentStyle._text._lineHeight + 1;
            var nspliceWidth = len / 3;
            var left0, left1;
            if (balanceText.pixiContainer.visible) {
                if (getOrientation() === 'portrait') {
                     left0 = (nspliceWidth - balanceText._currentStyle._width) / 2;
                    balanceText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1});
                     left1 = (nspliceWidth - balanceValue._currentStyle._width) / 2;
                    balanceValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0});
                    meterDivision0.updateCurrentStyle({'_left': nspliceWidth - meterDivision0._currentStyle._width/2, '_top': (top4OneLine - 20)});
                } else {
                    temp = (nspliceWidth - (balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + 10)) / 2;
                    //if (temp >= 6) {
                        balanceText.updateCurrentStyle({'_left': temp, '_top': top4OneLine});
                        balanceValue.updateCurrentStyle({'_left': balanceText._currentStyle._left + balanceText.pixiContainer.$text.width + 10, '_top': top4OneLine});
                    /* } else {
                         left0 = (nspliceWidth - balanceText.pixiContainer.$text.width) / 2;
                        balanceText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1});
                         left1 = (nspliceWidth - balanceValue.pixiContainer.$text.width) / 2;
                        balanceValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0});
                    } */
                    meterDivision0.updateCurrentStyle({'_left': nspliceWidth - 1, '_top': (top4OneLine - 8)});
                }
    
                if (getOrientation() === 'portrait') {
                     left0 = (nspliceWidth - ticketCostMeterText._currentStyle._width) / 2;
                    ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1});
                     left1 = (nspliceWidth - ticketCostMeterValue._currentStyle._width) / 2;
                    ticketCostMeterValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0});
                    meterDivision1.updateCurrentStyle({'_left': nspliceWidth * 2 - meterDivision1._currentStyle._width/2, '_top': (top4OneLine - 20)});
                } else {
                    temp = (nspliceWidth - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + 10)) / 2;
                    //if (temp >= 6) {
                        ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + temp, '_top': top4OneLine});
                        ticketCostMeterValue.updateCurrentStyle({'_left': ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + 10, '_top': top4OneLine});
                    /* } else {
                         left0 = (nspliceWidth - ticketCostMeterText.pixiContainer.$text.width) / 2;
                        ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1});
                         left1 = (nspliceWidth - ticketCostMeterValue.pixiContainer.$text.width) / 2;
                        ticketCostMeterValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0});
                    } */
                    meterDivision1.updateCurrentStyle({'_left': nspliceWidth * 2 - 1, '_top': (top4OneLine - 8)});
                }
    
                if (getOrientation() === 'portrait') {
                     left0 = (nspliceWidth - winsText._currentStyle._width) / 2;
                    winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + left0, '_top': top4TwoLine1});
                     left1 = (nspliceWidth - winsValue._currentStyle._width) / 2;
                    winsValue.updateCurrentStyle({'_left': nspliceWidth * 2 + left1, '_top': top4TwoLine0});
                } else {
                    temp = (nspliceWidth - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width + 10)) / 2;
                    //if (temp >= 6) {
                        winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + temp, '_top': top4OneLine});
                        winsValue.updateCurrentStyle({'_left': winsText._currentStyle._left + winsText.pixiContainer.$text.width + 10, '_top': top4OneLine});
                    /* } else {
                         left0 = (nspliceWidth - winsText.pixiContainer.$text.width) / 2;
                        winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + left0, '_top': top4TwoLine1});
                         left1 = (nspliceWidth - winsValue.pixiContainer.$text.width) / 2;
                        winsValue.updateCurrentStyle({'_left': nspliceWidth * 2 + left1, '_top': top4TwoLine0});
                    } */
                }
            } else {//balanceDisplayInGame is false
                meterDivision0.show(false);
                nspliceWidth = len / 2;
                if (getOrientation() === 'portrait') {
                     left0 = (nspliceWidth - ticketCostMeterText._currentStyle._width) / 2;
                    ticketCostMeterText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1});
                     left1 = (nspliceWidth - ticketCostMeterValue._currentStyle._width) / 2;
                    ticketCostMeterValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0});
                    meterDivision1.updateCurrentStyle({'_left': nspliceWidth - meterDivision1._currentStyle._width/2, '_top': (top4OneLine - 20)});
                } else {
                    temp = (nspliceWidth - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + 10)) / 2;
                    //if (temp >= 6) {
                        ticketCostMeterText.updateCurrentStyle({'_left': temp, '_top': top4OneLine});
                        ticketCostMeterValue.updateCurrentStyle({'_left': ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + 10, '_top': top4OneLine});
                    /* } else {
                         left0 = (nspliceWidth - ticketCostMeterText.pixiContainer.$text.width) / 2;
                        ticketCostMeterText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1});
                         left1 = (nspliceWidth - ticketCostMeterValue.pixiContainer.$text.width) / 2;
                        ticketCostMeterValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0});
                    } */
                    meterDivision1.updateCurrentStyle({'_left': nspliceWidth - 1, '_top': (top4OneLine - 8)});
                }
    
                if (getOrientation() === 'portrait') {
                     left0 = (nspliceWidth - winsText._currentStyle._width) / 2;
                    winsText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1});
                     left1 = (nspliceWidth - winsValue._currentStyle._width) / 2;
                    winsValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0});
                } else {
                    temp = (nspliceWidth - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width + 10)) / 2;
                    //if (temp >= 6) {
                        winsText.updateCurrentStyle({'_left': nspliceWidth + temp, '_top': top4OneLine});
                        winsValue.updateCurrentStyle({'_left': winsText._currentStyle._left + winsText.pixiContainer.$text.width + 10, '_top': top4OneLine});
                    /* } else {
                         left0 = (nspliceWidth - winsText.pixiContainer.$text.width) / 2;
                        winsText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1});
                         left1 = (nspliceWidth - winsValue.pixiContainer.$text.width) / 2;
                        winsValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0});
                    } */
                }
            }
        }
        /**
         * @function fontFitWithAutoWrap
         * @description Adjust text with style 'wordWrap = true' to fit its container's size
         * @instance
         * @param sprite{object} - the child node $text of which needs to fit its size
         */
        function fontFitWithAutoWrap(sprite, minFontSize){
            var txtSpr = sprite.pixiContainer.$text;
            if(txtSpr){
                var ctnHeight = sprite._currentStyle._height;
                var txtHeight = txtSpr.height;
                while(txtHeight > ctnHeight){
                    txtSpr.style.fontSize--;
                    txtHeight = txtSpr.height;
                    if(txtSpr.style.fontSize <= minFontSize){
                        break;
                    }
                }
                if(txtHeight > ctnHeight){
                    var scale = ctnHeight/txtHeight;
                    txtSpr.scale.set(scale);
                }
                txtSpr.y = Math.floor((ctnHeight - txtSpr.height)/2);
            }
        }
        
        /**
         * @function keepSameSizeWithMTMText
         * @description keep some sprite font size is the same as MTM text
         * @instance
         * @param sprite{object} - the sprite needs to keep same as MTM text
         * @gladPixiRenderer gladPixiRenderer{object}
         */
        function keepSameSizeWithMTMText(sprite, gladPixiRenderer) {
            var gr = gladPixiRenderer;
            if (gr.lib._MTMText) {
                var xScale = gr.lib._MTMText.pixiContainer.$text.scale._x;
                var sText;
                if (sprite) {
                    var sp = sprite.pixiContainer;
                    sText = sp.$text;
                    sText.scale.set(xScale);
                }
            }
        }
       
    
        return{
            obtainRandomElementOfArray: obtainRandomElementOfArray,
            setTextStyle: setTextStyle,
            randomSort: randomSort,
            fixMeter: fixMeter,
            fontFitWithAutoWrap: fontFitWithAutoWrap,
            keepSameSizeWithMTMText:keepSameSizeWithMTMText
        };
    });
    
    