define([
    'com/mobx/mobx'
], function (mobx) {

    const {
        decorate,
        observable,
        action,
        computed 
    } = mobx;

    class DressStore {
        constructor(rootStore, systemStore) {
            this.rootStore = rootStore;
            this.systemStore = systemStore;
            this.dressPageVisible = true; // false
            this.dressPages = [{
                    spineSkinName: '1',
                    lock: false,
                    unlockConditionName: '',
                    unlockConditionNum: 0,
                    select: false
                },
                {
                    spineSkinName: '2',
                    lock: true,
                    unlockConditionName: 'hillIcon05_01',
                    unlockConditionNum: 10,
                    select: false
                },
                {
                    spineSkinName: '3',
                    lock: true,
                    unlockConditionName: 'hillIcon04_01',
                    unlockConditionNum: 20,
                    select: false
                },
                {
                    spineSkinName: '4',
                    lock: true,
                    unlockConditionName: 'hillIcon03_01',
                    unlockConditionNum: 40,
                    select: false
                }
            ];
            if(this.rootStore.SKBeInstant.config.customBehavior && this.rootStore.SKBeInstant.config.customBehavior.unlockConditionNums){
                this.dressPages.forEach((element, index) => {
                    element.unlockConditionNum = this.rootStore.SKBeInstant.config.customBehavior.unlockConditionNums[index];
                });
            }else if(this.rootStore.gameConfigforNRGS){
                if(this.rootStore.gameConfigforNRGS.unlockConditionNums){
                    this.dressPages.forEach((element, index) => {
                        element.unlockConditionNum = this.rootStore.gameConfigforNRGS.unlockConditionNums[index];
                    });
                }
            }
            this.currentSelectSkin = -2;
        }
        /**
         * action for show dress page
         */
        setDressPageVisibility(value) {
            this.dressPageVisible = value;
        }

        setCurrentSelectSkin(index){
            this.currentSelectSkin = index;
        }

        get currentDressPages() {
            return this.dressPages.map((element, i) => {
                if (element.lock) {
                    return element;
                } else {
                    if (i === this.currentSelectSkin) {
                        if (element.select) {
                            return element;
                        } else {
                            return Object.assign({}, element, {
                                select: true
                            });
                        }
                    } else {
                        if (!element.select) {
                            return element;
                        } else {
                            return Object.assign({}, element, {
                                select: false
                            });
                        }
                    }
                }
            });
        }

        unlockSkin(index) {
            this.dressPages = this.dressPages.map((element, i) => {
                if (i === index) {
                    return Object.assign({}, element, {
                        lock: false
                    });
                }
                return element;
            });
        }

    }

    decorate(DressStore, {
        currentSelectSkin: observable,
        dressPageVisible: observable,
        dressPages: observable,
        setCurrentSelectSkin: action,
        //allSteps: observable,
        setDressPageVisibility: action,
        currentDressPages: computed,
        unlockSkin: action,
        //onceClimberStep: computed
    });


    return DressStore;
});