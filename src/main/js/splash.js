define([
    'skbJet/componentCRDC/splash/splashLoadController',
    'skbJet/componentCRDC/splash/splashUIController'
], function(splashLoadController, splashUIController) {
    var predefinedData = {
		swirlName: "swirl",
        splashLogoName: "loadLogo",
		backgroundSize: "100% 100%",
        landscape: {
			canvas: {
				width: 1440,
				height: 810,
				landscapeMargin: 0
			},
			gameImgDiv: {
				width: 1440,
				height: 810,
				top: 0
			},
            gameLogoDiv: {
                width: 810,
                height: 630,
                y: 250,
                scale: {
                    x: 0.8,
                    y: 0.8
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.8,
                loop: true,
                y: 679,
                scale: {
                    x: 0.7,
                    y: 0.7
                }
            },
			copyRightDiv: {
                bottom: 20,
                fontSize: 24,
                color: "#002397",
                fontFamily: "Oswald",
                miterLimit: 2.6,
			},
            progressTextDiv: {
                y: 679,
                style: {
                    fontSize: 30,
                    fill: "#1635b8",
                    fontWeight: 600,
                    fontFamily: "Oswald"
                }
            }
        },
        portrait: {
			canvas: {
				width: 810,
				height: 1228,
				landscapeMargin: 0
			},
			gameImgDiv: {
				width: 810,
				height: 1228,
				top: 0
			},
            gameLogoDiv: {
                width: 810,
                height: 630,
                y: 300
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.8,
                loop: true,
                y: 879,
                scale: {
                    x: 0.8,
                    y: 0.8
                }
            },
     
			copyRightDiv: {
                bottom: 20,
                fontSize: 24,
                color: "#002397",
                fontFamily: "Oswald",
                miterLimit: 2.6,
			},
            progressTextDiv: {
                y: 879,
                style: {
                    fontSize: 30,
                    fill: "#1635b8",
                    fontWeight: 600,
                    fontFamily: "Oswald"
                }
            }
        }
//        }
    };
 
    var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
    var showCopyRight = false;
    if(softId){
        if(softId[1].split('-')[2].charAt(0) !== '0'){
            showCopyRight = true;
        }                
    }  

    function onLoadDone() {
        splashUIController.onSplashLoadDone();
        window.postMessage('splashLoaded', window.location.origin);
    }

    function init() {
        splashUIController.init({ layoutType: 'IW' , predefinedData:predefinedData, showCopyRight:showCopyRight});
        splashLoadController.load(onLoadDone);
    }
    init();
    return {};
});