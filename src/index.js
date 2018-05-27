
const TEST_STATE = {
    INITIALIZING : 0,
    STARTING : 1,
    RUNINNG : 2,
    PAUSED : 3
};
const STATUS = {
    'STARTING':'STARTING',
    'UNKNOWN':'UNKNOWN',
    'HEALTHY':'HEALTHY',
    'UNHEALTHY':'UNHEALTHY'
}
const EVENTS = ['testResult' , 'statusChange'];

class HealthCheckMonitor{
    get Utils(){
        return Utils;
    }
    get Error(){
        return Error;
    }
    get EVENTS(){
        return EVENTS;
    }
    get STATUS(){
        return STATUS;
    }
    get TEST_STATE(){
        return TEST_STATE;
    }
    get DEFAULT_INTERVAL(){
        return 5000;
    }
    get DEFAULT_TIMEOUT(){
        return 5000;
    }
    get TestRunInfo(){
        return TestRunInfo;
    }
    get TestResult(){
        return TestResult;
    }

    getTestOptions(options){
        const Utils = this.Utils;
        return Utils.defaults(options,{
            interval : Utils.defaultValueFunction(this.DEFAULT_INTERVAL),
            timeout :   Utils.defaultValueFunction(this.DEFAULT_TIMEOUT),
            startPeriod :   Utils.defaultValueFunction(0),
            retries :   Utils.defaultValueFunction(1),
            retryPauseTime :  Utils.defaultValueFunction(0),
            healthyAfter :  Utils.defaultValueFunction(2),
            unhealthyAfter :  Utils.defaultValueFunction(1),
            action :  Utils.defaultValueFunction(options.action , (testInfo , onResponse)=>{onResponse(STATUS.UNHEALTHY)})
        });
    }
    constructor(options){
        this._testState = this.TEST_STATE.INITIALIZING;
        this.isChanging = false;
        this.testOptions = this.getTestOptions(options);
        this.listeners = {
            [this.EVENTS[0]]:[],
            [this.EVENTS[1]]:[]
        };

    }
    start(onStart){
        this._testState = this.TEST_STATE.STARTING;
        this.status = this.STATUS.STARTING;
        this.transitionStatus = this.STATUS.STARTING;
        this.isChanging = true;

        this.Utils.setTimeout(()=>{
            this.test( 'init' ,  function startCb(testResult){
                try{
                    if (onStart)
                        onStart(testResult);
                }
                catch(err){
    
                }
            });
        } , Utils.safeGetUserNumber(this.testOptions.startPeriod , 0))
        
        return this;
    }
    pause(){
        this._testState = this.TEST_STATE.PAUSED;
        this.status = this.STATUS.UNKNOWN;
        this.transitionStatus = this.STATUS.UNKNOWN;

        if (this._timeout){
            this.Utils.clearTimeout(this._timeout);
            this._timeout = null;
        }
        return this;
    }
    resume(onResume){
        this._testState = TEST_STATE.STARTING;
        this.status = STATUS.UNKNOWN;
        this.transitionStatus = STATUS.UNKNOWN;
        
        this.test( 'resume' , function resumeCb(testResult){
            try{
                if (onResume)
                    onResume(testResult);
            }
            catch(err){
                /*
                    I cannot control what user will enter
                    as a callback - Therefore ignoring erros.
                */
            }
        });
        return this;
    }

    test(reason , onResult){
        const Utils = this.Utils;
        const testInfo = new (this.TestRunInfo)(reason , Utils.Date.now() , 0);
        this._test(testInfo , (result)=>{
            //Only if test is not paused continue testing
            if (this._testState != this.TEST_STATE.PAUSED)
                this._timeout = Utils.setTimeout(()=>{
                    this._triggeredTest();
                } , Utils.safeGetUserNumber(this.testOptions.interval , this.DEFAULT_INTERVAL) );

            this._analyzeStatus(result);
            onResult(result);
        });
    }
    _analyzeStatus(testResult){
        const {status , transitionStatus , testOptions} = this;
        const testStatus = testResult.status;

        if (status == transitionStatus && transitionStatus == testStatus){
            return this.emit('testResult' , testResult);
        }

        const Utils = this.Utils;
        const commitStatusChange = ()=>{
            const requiredDiff = (testStatus == this.STATUS.HEALTHY)
                             ? Utils.resultValue(testOptions.healthyAfter) 
                             : Utils.resultValue(testOptions.unhealthyAfter);
            if (this._statusTransitionCount >= requiredDiff){
                this.status = this.transitionStatus = testStatus;
                this._statusTransitionCount = 0;
                this.isChanging = false;
                this.emit('statusChange' ,testStatus );
            }
        }
        if(transitionStatus != status){
            this.isChanging = true;
            //status wasn't fully commited increase number
            this._statusTransitionCount++;
        }
        
        if (testStatus != transitionStatus){
            this.isChanging = true;
            //Status is currently changing
            //any transition count we had is now resting
            this._statusTransitionCount = 0;
            //identify direction and find required diff
            this.transitionStatus = testStatus;
        }
        commitStatusChange();
        this.emit('testResult' , testResult);
    }
    _triggeredTest(){
        this.test('interval' , (testResult)=>{
            this._analyzeStatus(testResult);
        });
    }
    _test(testRunInfo , onResult){
        const testOptions = this.testOptions;
        const healthCheckMonitor = this;
        const STATUS = this.STATUS;
        const Utils = this.Utils;
        const TestResult = this.TestResult;
        let wasAlreadyExexuted = false;
        let timeoutId;

        function onResponse(status , data){
            if (wasAlreadyExexuted)
                return;

            Utils.clearTimeout(timeoutId);
            wasAlreadyExexuted = true;

            if (
                status == STATUS.UNHEALTHY &&
                testRunInfo.runNumber <  Utils.resultValue(testOptions.retries)
            ){
                testRunInfo.runNumber++;
                Utils.setTimeout(()=>{
                    healthCheckMonitor._test(testRunInfo ,onResult);
                } , Utils.safeGetUserNumber(testOptions.retryPauseTime , healthCheckMonitor.DEFAULT_TIMEOUT));
            }
            else if (status == STATUS.HEALTHY){
                onResult(new TestResult(testRunInfo , STATUS.HEALTHY , data ))
            }
            else {
                onResult(new TestResult(testRunInfo,STATUS.UNHEALTHY, data ))
            }
        }
        //Setting timeout interval inc case there is no response in time
        timeoutId = Utils.setTimeout(()=>{
            onResponse(this.STATUS.UNHEALTHY , new (healthCheckMonitor.Error)('timeout'));
        } , Utils.resultValue(testOptions.timeout));
        
        try{
            //action is a user callback so we must try/catch
            testOptions.action.call({},testRunInfo , onResponse);
        }
        catch(err){
            onResponse(this.STATUS.UNHEALTHY , err);
        }
    }
    
    on(eventName , cb){
        if (this.EVENTS.indexOf(eventName) ==-1)
            throw new (this.Error)(`Event _{eventName} is not part of status monitor`);
        
        if (!this.Utils.isFunction(cb))
            throw new (this.Error)(`cb must be a function`);
        
        this.listeners[eventName].push(cb);
        return this;
    }
    emit(eventName , value){
        if (this.EVENTS.indexOf(eventName) ==-1)
            throw new (this.Error)(`Event _{eventName} is not part of status monitor`);
        
        const eventListeners = this.listeners[eventName];
        for (let i=0;i<eventListeners.length;i++)
            eventListeners[i](value);
    }
    removeEventListener(eventName , cb){
        if (this.EVENTS.indexOf(eventName)!=-1){
            const index = this.listeners[eventName].indexOf(cb);
            if (index != -1)
                this.listeners[eventName].splice(index,1);
        }
    }
    removeEventListeners(eventName){
        if (this.EVENTS.indexOf(eventName)!=-1){
           this.listeners[eventName].length = 0;
        }
    }
}
class TestRunInfo{
    constructor(
        triggeredBy,
        at,
        runNumber
    ){
        this.triggeredBy = triggeredBy;
        this.at = at;
        this.runNumber = runNumber;
    }
}
class TestResult{
    get Utils(){
        return Utils;
    }
    get STATUS(){
        return STATUS;
    }
    constructor(
            testRunInfo ,
            result , 
            data 
        ){
            this.triggeredBy = testRunInfo.triggeredBy;
            this.at = testRunInfo.at;
            this.duration = this.Utils.Date.now() - this.at;
            this.retries = testRunInfo.runNumber;
            this.status = this.STATUS[result] || this.STATUS.UNHEALTHY;
            this.data = data;
    }
}
class Utils{
    static get setTimeout(){
        return setTimeout;
    }
    static get clearTimeout(){
        return clearTimeout;
    }
    static get isNaN(){
        return isNaN;
    }
    static get Date(){
        return Date;
    }
    static getNumberOrDefault(value , defaultValue){
        if (isNaN(value+0))
            return defaultValue;
        else
            return value;
    }

    static isFunction(value){
        return typeof value == "function"
    }

    static resultValue(fn){
        return typeof fn == "function" ? fn() : fn;
    }
    static safeGetUserNumber(fn , defaultValue){
        let value;
        try{
            value = Utils.resultValue(fn);
        }
        catch(err){

        }
        return Utils.getNumberOrDefault(value , defaultValue);
    }
    static defaultValueFunction(value){
        function returnValue(){
            return value;
        }
        return returnValue;
    }
    static defaults(obj , defaultValues){
        const newObj = {};
        Object.keys(obj).concat(Object.keys(defaultValues)).forEach((key)=>{
            if (obj.hasOwnProperty(key))
                newObj[key] = obj[key];
            else
                newObj[key] = defaultValues[key];
        });
        return newObj;
    }

}
module.exports = {
    TEST_STATE,
    STATUS,
    Utils,
    EVENTS,
    HealthCheckMonitor,
    TestRunInfo,
    TestResult
};
