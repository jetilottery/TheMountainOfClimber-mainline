define([
    'com/mobx/mobx'
], function (mobx) {

        const { 
		decorate, 
		observable, 
		//autorun, 
		action,
		//when, 
		//toJS, 
		computed
		} = mobx;

        class BaseGameStore {
            constructor(rootStore) {
                this.appStore = rootStore;
                this.scenarioData = [];
                this.awardsSteps = [];
                this.data = {
                    upList: 0,
                    dnList: 0,
                    accList: 0,
                    totalClimberStep: -1,
                    upListForDress: 0,
                    dnListForDress: 0,
                    accListForDress: 0
                };
            }
            /**
             * @returns
             * @description Get store from system when game assetLoadedAndGameReady
             * */

            setScenarioData(scenarioData){
                let _scenarioData = [];
                for (let i = 0; i < scenarioData.length; i++) {
                    const splitScenario  = scenarioData[i].split(',');
                    const result = splitScenario[1].split(':');
                    let obj = {};
                    obj['climbeStep'] = Number(splitScenario[0]);
                    obj['currentTotalStep'] = Number(result[0]);
                    this.awardsSteps.push(obj['currentTotalStep']);
                    obj['targetWin'] = result[1];
                    if(splitScenario[2]){
                        const nextResult = splitScenario[2].split(':');
                        obj['nextCurrentTotalStep'] = Number(nextResult[0]);
                        this.awardsSteps.push(obj['nextCurrentTotalStep']);
                        obj['nextTargetWin'] = nextResult[1];
                    }
                    _scenarioData.push(obj);
                }
                this.scenarioData = _scenarioData;
            }

            /**
             * @action
             * @description Action for when spin button clicked
             */

            addDnList(){
                this.data.dnList++;
            }

            addUpList(){
                this.data.upList++;
            }

            addAccList(){
                this.data.accList++;
            }
            
            addDnListForDress(){
                this.data.dnListForDress++;
            }

            addUpListForDress(){
                this.data.upListForDress++;
            }

            addAccListForDress(){
                this.data.accListForDress++;
            }

            setAccListForDress(value){
                this.data.accListForDress = value;
            }

            setUpListForDress(value){
                this.data.upListForDress = value;
            }

            setDnListForDress(value){
                this.data.dnListForDress = value;
            }

            setDnList(value){
                this.data.dnList = value;
            }

            setUpList(value){
                this.data.upList = value;
            }

            setAccList(value){
                this.data.accList = value;
            }

            setTotalClimberStep(value){
                this.data.totalClimberStep = value;
            }
            
            /**
             * @computed  
             * @returns 
             * @description Return once data from scenario data when reveal button clicked
             */
            get onceScenarioData() {
                return this.scenarioData[this.appStore.stepIndex];
            }
        }


        decorate(BaseGameStore, {
            data: observable,
            doClimbing: action,
            onceScenarioData: computed,
            addDnList: action,
            addUpList: action,
            addAccList: action,
            setDnList: action,
            setUpList: action,
            setAccList: action,
            setAccListForDress: action,
            setUpListForDress: action,
            setDnListForDress: action,
            setTotalClimberStep: action,
            totalClimberStep: observable,
            addDnListForDress: action,
            addUpListForDress: action,
            addAccListForDress: action,
        });


        return BaseGameStore;
});