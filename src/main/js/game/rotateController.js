define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant'
], function(msgBus, SKBeInstant) {
    'use strict';
	
	var oriEnum = {
		ALL:0,
		LANDSCAPE:1,
		PORTRAIT:2
	};
	var orientation = oriEnum.ALL;
	var rotateMsg;
	var onRotate;
	var base64Pngs = {
		rotate:'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAADaCAYAAAB+Z8bDAAAGmElEQVR4nO3Zv29SaxzH8c9z0jgR8GFhgdgbN0lsR3Gxd6FrF1htbNivfwHwF+huY+qKS0fLcuvSOhaTY1zMrYGFhaeYzjx3kNOc4ilQpdRP/Lymnuc8Jd/knfOD1uAaBoNBxhizNRqN1o0x67FT6wDuXuezBGcATqID7/1JEAQn3vv9bDY7nPdDzDybnHNPRqPRtjFm+/pzynV57/eCINiz1r6ftXdqQOfcvdFo1FC42zEO2bDWfr1qz5UBnXNPvPf7uOLWGIYhhsPhxc/fvn371Xn/KOl0GsViEQCQyWQufk5wZozZuupqTAzonHvqvd+bXD86OkKr1cLBwYGCLVg6ncbm5iaq1SoeP378w3ljzLa19s0P65MLzrk17/0hYldeGIao1+s4Pj5e8NiSpFQqodlsTl6VZ8aYDWttJ754KaBz7p73/gSxeK1WC/V6XVfckqXTaTSbTVSr1fjymTFmPf5MvBRwMBj8C2AjOj46OkKlUrnpWWWKt2/fTt5SD7PZ7N/RQRD94JyrIxYvDEPs7OwsY0aZYmdnB2EYxpc2xq0AjK/AwWCQAXCK8a1zOByiXC6j1+stcVS5Sj6fR7vdRiaTiZbOAKxms9lhAADGmH8Qe+7V63XF+430ej3U6/X40t1xs4sr8D8AqwDQ7Xbx6NGjZc+4MLlcDrlcLvFcv99Hv99f8kSL8+HDBxQKhejwNJvN/rUy/tqwGq3u7u7eynCLkMvlUC6Xp+5pt9u0EXd3d9FsNqPDVefcWoDYiwsAvHv3btlzLYy1diF7flcJbTZWxv9ZAPD95YX52ff582cAwJ07d2buYdTr9TAcDi9eZkaj0fqKMWY12jDxukqJOdA8wjC8+F5ojFkNZuyX35wCklNAcgpIbmXayWlfimU5Zv3xYWbAtbW1hQ8l8+t0Oj8fMHJ+fo7z8/OFDSWzpVIppFKpmfvmCvjlyxd8/Pjxl4eS+T18+HCuu59eYsgpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJKeA5BSQnAKSU0ByCkhOAckpIDkFJLcyz6b79+8jl8vd9CwSk0ql5to3V8BUKjX3B8pyTQ3Y7/fR6XSWNYsk6Pf7U8/PDDjrA+R26SWGnAKSU0ByCkgu8N6fRAfFYvE2Z5E5xBt570+CIAhOo4VMJoN8Pn8bc8kc8vk8MpnMxXEQBKcBgMP4plKptOSxZF4JbQ4Da20HwGm0UqvVljmTXMNEm1NrbScAAO/9YbRaLBZ1Ff6GSqXS5PPvEAAMADjn7nnvT6OTYRiiXC4veUSZpt1uXwpojFm11n4NAMBa+9V7/zI6WSwW0Wg0lj+lJGo0GpNX30tr7Vcg9j3QGNMAcBYd12o1VCqVJY4pSSqVyuSz72zcCsD4Fhpxzj2JPw8BoNVq4fnz5zc5o1zhxYsXqFarl9aMMRvW2vcXx5O/5Jx76r3fi6+FYYhnz56h1+vd1KwSk8/n8fr16x/+sGKM2bbWvrm0lvQB4ytxH8DdaG04HOLg4ACvXr3Cp0+fbmLuP96DBw9Qq9Wwubl56Qs7vt82t+JXXiQxIAA459bGt9O7k+e63S6Oj4/R7XYXMfcfr1AooFQqoVAoJJ0+G982E/+zfmVA4PvXi9Fo1DDGbC9gTrkm7/1eEASN6I0zydSAkfEttQFgY0GzyXSHxphG0i1z0lwBI865NQBb3vstAOs/O50kOjHG7APYv+p2meR/Z1/Al2A+X/IAAAAASUVORK5CYII=)',
		'overlay':'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk2A8AAMUAwUPJ2C4AAAAASUVORK5CYII=)'
	};
	/**
	 * @function setLandscapeOnly
	 * @description set game to support landscape only.
	 * @instance
	 */
	function setLandscapeOnly(){
		orientation = oriEnum.LANDSCAPE;
	}
	/**
	 * @function setPortraitOnly
	 * @description set game to support portrait only.
	 * @instance
	 */
	function setPortraitOnly(){
		orientation = oriEnum.PORTRAIT;
	}
	
	function getSize(){
		if (SKBeInstant.config.screenEnvironment === 'device') {
                if(SKBeInstant.isSKB()){
                    return {width: Number(window.innerWidth), height: Number(window.innerHeight)};
                }else{
                    var gameWidth = Number(window.innerWidth), gameHeight = Number(window.innerHeight);
                    var targetDivElem = document.getElementById(SKBeInstant.config.targetDivId); //add for parent is not body and device orientation is different from parent.
                    var parentElem = targetDivElem.parentElement;
                    if (parentElem !== document.body) {
                        var parentWidth = parentElem.clientWidth;
                        var parentHeight = parentElem.clientHeight;
						if(parentWidth > 0){
							gameWidth = gameWidth > parentWidth ? parentWidth : gameWidth;
						}
                        if(parentHeight > 0){
							gameHeight = gameHeight > parentHeight ? parentHeight : gameHeight;
						}
                        
                    }
                    return {width: gameWidth, height: gameHeight};
                }
//			}
		} else {//desktop
            if(SKBeInstant.isSKB()){
                return {width: Number(window.innerWidth), height: Number(window.innerHeight)};
            }else{
                return {width: Number(SKBeInstant.config.revealWidthToUse), height: Number(SKBeInstant.config.revealHeightToUse)};
            }
		}
	}
	
	function windowResized(){
		var size = getSize();
		var winW = size.width;
		var winH = size.height;
		var rotateMsgContainer = document.getElementById('_rotateMessageWrapper');
		if((winH>winW&&orientation===oriEnum.LANDSCAPE)||(winH<winW&&orientation===oriEnum.PORTRAIT)){
			rotateMsgContainer.style.width = winW + 'px';
			rotateMsgContainer.style.height = winH + 'px';
			rotateMsgContainer.style.visibility = 'visible';
			if(onRotate){
				onRotate(true);
			}
		}else{
			rotateMsgContainer.style.visibility='hidden';
			if(onRotate){
				onRotate(false);
			}
		}
	}
	
	/**
	 * @function init
	 * @description init. This function should be invoked when onBeforeShowStage message arrived.
	 * @param rotateMessage {string} - rotate message to shown on screen.
	 * @param onRotateCallBack {function} - call back function, invoked when device rotated. function(rotateMsgShowFlag){...}
	 * @instance
	 */
	function init(rotateMessage, onRotateCallBack){
		if(orientation===oriEnum.ALL){
			return;
		}
		rotateMsg = rotateMessage;
		var rotateStyleElem = document.createElement('style');
		var bgRotate = orientation===oriEnum.PORTRAIT?0:90;
		onRotate = onRotateCallBack;
		
		rotateStyleElem.innerHTML = '#_rotateMessageWrapper {' +
			'visibility: hidden;' +
			'position: absolute;' +
			'top: 0;' +
			'left: 0;' +
			'background-color: #000000;' +
		'}' +
		'#_rotateMessageBG {' +
			'margin-left: auto;' +
			'margin-right: auto;' +
			'margin-top: -30vmin;' +
			'width: 60vmin;' +
			'height: 60vmin;' +
			'position: relative;' +
			'top: 50%;' +
			'background-image: ' + base64Pngs.overlay + ', ' + base64Pngs.rotate + ';' +
			'background-size: contain;' +
			'background-position: center;' +
			'background-repeat: no-repeat;' +
			'-webkit-transform: rotate(' + bgRotate + 'deg);' +
			'transform: rotate(' + bgRotate + 'deg);' +
		'}' +
		'#_rotateMessageAnim {' +
			'position: relative;' +
			'opacity: 1;' +
			'width: 100%;' +
			'height: 100%;' +
			'background-image: ' + base64Pngs.rotate + ';' +
			'background-size: contain;' +
			'background-position: center;' +
			'background-repeat: no-repeat;' +
			'-webkit-animation: rotateDeviceAnim 4s infinite;' +
			'animation: rotateDeviceAnim 4s infinite;' +
		'}' +
		'@-webkit-keyframes rotateDeviceAnim {' +
			'0% {' +
				'opacity: 0;' +
				'-webkit-transform: rotate(90deg);' +
			'}' +
			'9% {' +
				'opacity: 1;' +
			'}' +
			'10% {' +
				'-webkit-transform: rotate(90deg);' +
			'}' +
			'50% {' +
				'-webkit-transform: rotate(0deg);' +
			'}' +
			'90% {' +
				'opacity: 1;' +
			'}' +
			'100% {' +
				'opacity: 0;' +
				'-webkit-transform: rotate(0deg);' +
			'}' +
		'}' +
		'#_rotateMessageText {' +
			'top: 50%;' +
			'position: relative;' +
			'text-align: center;' +
			'font-family: sans-serif;' +
			'color: #fff;' +
			'font-size: 1.4em;' +
		'}';

		var rotateDivElem = document.createElement('div');
		rotateDivElem.id = '_rotateMessageWrapper';
		rotateDivElem.innerHTML = '<div id="_rotateMessageBG"><div id="_rotateMessageAnim"></div></div><div id="_rotateMessageText">'+rotateMsg+'</div>';
		document.getElementById(SKBeInstant.config.targetDivId).appendChild(rotateDivElem);
		document.head.appendChild(rotateStyleElem);
		
		window.addEventListener('resize',windowResized);
		windowResized();
	}
	
    function onAssetsLoadedAndGameReady() {
		if (!SKBeInstant.isSKB()) {
            return;
        }
		if(SKBeInstant.config.screenEnvironment === 'device') {
			var orientation = Number(window.innerWidth) > Number(window.innerHeight) ? 'landscape' : 'portrait';
			if (orientation === "landscape") {
				setLandscapeOnly();
			} else {
				setPortraitOnly();
			}
			init('', function(rotateMsgShowFlag) {
				if (rotateMsgShowFlag) {
					document.getElementById(SKBeInstant.config.targetDivId).style.visibility = 'hidden';
				} else {
					document.getElementById(SKBeInstant.config.targetDivId).style.visibility = 'visible';
				}
			});
		}
    }
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	msgBus.subscribe('jLotteryGame.playerWantsToExit', function() {
        if (SKBeInstant.isSKB()) {
            document.getElementById('_rotateMessageWrapper').style.visibility = 'hidden';
        }
	});

});