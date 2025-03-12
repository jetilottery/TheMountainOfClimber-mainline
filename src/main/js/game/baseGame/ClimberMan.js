define([
    'skbJet/component/resourceLoader/resourceLib',
    'com/pixijs/pixi',
    'game/baseGame/SpineSuper'
], function (resLib, PIXI, SpineSuper) {
        class ClimberMan extends SpineSuper {
            constructor(x, y, scalex, scaley, parent, addChildAtIndex) {
                super(x, y, scalex, scaley, parent, addChildAtIndex);
                this.create();
                this.spine.interactive = true;
                this.spine.cursor = "pointer";
            }
            
            create() {
                const { x, y, scalex, scaley, parent, addChildAtIndex } = this;
                this.spine = new PIXI.spine.Spine(resLib.spine.boy01.spineData);
                this.stop();
                this.spineContianer = new PIXI.Container();
                this.spineContianer.addChild(this.spine);
                this.spineContianer.pivot.x = this.spineContianer.width/2;
                this.spineContianer.pivot.y = this.spineContianer.height/2;
                const localRect = this.spine.getLocalBounds();
                this.spine.position.set(-localRect.x, -localRect.y);
                this.spineContianer.setTransform(x, y, scalex, scaley);
                if(addChildAtIndex){
                    parent.pixiContainer.addChildAt(this.spineContianer, addChildAtIndex);
                }else{
                    parent.pixiContainer.addChild(this.spineContianer);
                }
            }
        }

        return ClimberMan;

});