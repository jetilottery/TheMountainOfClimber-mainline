define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/resourceLoader/resourceLib',
    'com/pixijs/pixi',
], function (gr, resLib, PIXI) {
        class ClimberMan {
            constructor(x, y, scalex, scaley, parent, addChildAtIndex) {
                this.x = x;
                this.y = y;
                this.scalex = scalex;
                this.scaley = scaley;
                this.parent = parent;
                this.addChildAtIndex = addChildAtIndex;
                this.spineContianer = null;
                this.create();
            }
            
            create() {
                const { x, y, scalex, scaley, parent, addChildAtIndex } = this;
                this.climberMan = new PIXI.spine.Spine(resLib.spine.game_A.spineData);
                this.stop();
                this.spineContianer = new PIXI.Container();
                this.spineContianer.addChild(this.climberMan);
                this.spineContianer.pivot.x = this.spineContianer.width/2;
                this.spineContianer.pivot.y = this.spineContianer.height/2;
                //sp.x = Number(sst._left)+sp.pivot.x;
                //sp.y = Number(sst._top)+sp.pivot.y;
                const localRect = this.climberMan.getLocalBounds();
                this.climberMan.position.set(-localRect.x, -localRect.y);
                this.spineContianer.setTransform(x, y, scalex, scaley);
                if(addChildAtIndex){
                    parent.pixiContainer.addChildAt(this.spineContianer, addChildAtIndex);
                }else{
                    parent.pixiContainer.addChild(this.spineContianer);
                }
            }

            play(animation, speed) {
                this.climberMan.state.setAnimation(0, animation, true);
                this.climberMan.state.timeScale = speed;
            }

            stop() {
                this.climberMan.state.setEmptyAnimations(0.2);
                this.climberMan.skeleton.setToSetupPose();
                this.climberMan.update(0);
            }
        }

        return ClimberMan;

});