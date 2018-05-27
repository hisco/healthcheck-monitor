
const {
    TEST_STATE,
    STATUS,
    EVENTS,
    Utils,
    HealthCheckMonitor,
    TestRunInfo,
    TestResult
} = require('../../src/index');

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));
const {MockedClassService} = require('unit-test-class');
const mockService = new MockedClassService(chai.spy);

describe('TEST_STATE' , ()=>{
    it('Should have only 4 keys' , ()=>{
        expect(Object.keys(TEST_STATE).length).eq(4);
    });
    it('Should INITIALIZING=0' , ()=>{
        expect(TEST_STATE.INITIALIZING).eq(0)
    })
    it('Should STARTING=1' , ()=>{
        expect(TEST_STATE.STARTING).eq(1)
    })
    it('Should RUNINNG=2' , ()=>{
        expect(TEST_STATE.RUNINNG).eq(2)
    })
    it('Should PAUSED=3' , ()=>{
        expect(TEST_STATE.PAUSED).eq(3)
    })
});
describe('STATUS' , ()=>{
    it('Should have only 4 keys' , ()=>{
        expect(Object.keys(STATUS).length).eq(4);
    });
    it('Should STARTING=STARTING' , ()=>{
        expect(STATUS.STARTING).eq('STARTING')
    })
    it('Should UNKNOWN=UNKNOWN' , ()=>{
        expect(STATUS.UNKNOWN).eq('UNKNOWN')
    })
    it('Should HEALTHY=HEALTHY' , ()=>{
        expect(STATUS.HEALTHY).eq('HEALTHY')
    })
    it('Should UNHEALTHY=UNHEALTHY' , ()=>{
        expect(STATUS.UNHEALTHY).eq('UNHEALTHY')
    })
});
describe('EVENTS' , ()=>{
    it('Should have only to events' , ()=>{
        expect(EVENTS.length).eq(2);
    });
    it('Should have first event `testResult`' , ()=>{
        expect(EVENTS[0]).eq('testResult');
    })
    it('Should have first event `statusChange`' , ()=>{
        expect(EVENTS[1]).eq('statusChange');
    })
});
describe('TestRunInfo' , ()=>{
    describe('#constructor' , ()=>{
        let testRunInfo
        beforeEach(()=>{
            testRunInfo = new TestRunInfo('t1' , 't2' , 't3');
        });
        it('Should set `triggeredBy`' , ()=>{
            expect(testRunInfo.triggeredBy).eq('t1');
        });
        it('Should set `at`' , ()=>{
            expect(testRunInfo.at).eq('t2');
        });
        it('Should set `runNumber`' , ()=>{
            expect(testRunInfo.runNumber).eq('t3');
        });
    })
});


describe('TestResult' , ()=>{
    const mockFactory = mockService.mock(TestResult);
    describe('static get Utils' , ()=>{
        it('Should be Utils' , ()=>{
            const mockView = mockFactory.test('Utils').create();

            expect(mockView.instance.Utils).eq(Utils);
        })
    });
    describe('static get STATUS' , ()=>{
        it('Should be STATUS' , ()=>{
            const mockView = mockFactory.test('STATUS').create();

            expect(mockView.instance.STATUS).eq(STATUS);
        })
    });
    describe('#constructor' , ()=>{
        let data;
        let testRunInfo;
        let mockView;
        let result;
        let testResult;
        beforeEach(()=>{
            testRunInfo = {
                triggeredBy : 'test',
                at : 9,
                result : 0,
                runNumber : 8
            }
            data = {};
            result = 'UNKNOWN';
            mockView = mockFactory.spies({
                get Utils(){
                    return {
                        Date : {
                            now(){
                                return 9
                            }
                        }
                    }
                }
            }).test(['constructor' , 'STATUS']);
            testResult = mockView.create(
                testRunInfo ,
                result , 
                data 
            ).instance;
        });
        it('Should set `triggeredBy` ' , ()=>{
            expect(testResult.triggeredBy).eq(testRunInfo.triggeredBy);
        });
        it('Should set `at` ' , ()=>{
            expect(testResult.at).eq(testRunInfo.at);
        });
        it('Should set `duration` ' , ()=>{
            expect(testResult.duration).eq(0);
        });
        it('Should set `retries` ' , ()=>{
            expect(testResult.retries).eq(testRunInfo.runNumber);
        });
        it('Should set `status` ' , ()=>{
            expect(testResult.status).eq(result);
        });
        it('Should set `status` to `UNHEALTHY` when not status found' , ()=>{
            result = "fasdfdsf";
            testResult = mockView.create(
                testRunInfo ,
                result , 
                data 
            ).instance;
            expect(testResult.status).eq('UNHEALTHY');
        });
        it('Should set `data` ' , ()=>{
            expect(testResult.data).eq(data);
        });
    });
});

describe('Utils' , ()=>{
    describe('#isNaN' , ()=>{
        it('Should be isNaN' , ()=>{
            expect(Utils.isNaN).eq(isNaN);
        })
    });
    describe('#Date' , ()=>{
        it('Should be Date' , ()=>{
            expect(Utils.Date).eq(Date);
        })
    });
    describe('#getNumberOrDefault' , ()=>{
        it('Should return number if it\'s a number' , ()=>{
            expect(Utils.getNumberOrDefault(1 , ()=>9)).eq(1);
        });
        it('Should return defualtNumber if it\'s not a number' , ()=>{
            expect(Utils.getNumberOrDefault('df' , 9)).eq(9);
        });
    });
    describe('#isFunction' , ()=>{
        it('Should return true if it\'s a function' , ()=>{
            expect(Utils.isFunction(()=>9)).eq(true);
        });
        it('Should return true if it\'s a function' , ()=>{
            expect(Utils.isFunction(9)).eq(false);
        });
    });
    describe('#safeGetUserNumber' , ()=>{
        it('Should return result if it\'s a function' , ()=>{
            expect(Utils.safeGetUserNumber(()=>9 , 7)).eq(9);
        });
        it('Should return number if it\'s a number' , ()=>{
            expect(Utils.safeGetUserNumber(9 , 7)).eq(9);
        });
        it('Should return defualtNumber if it\'s not a number' , ()=>{
            expect(Utils.safeGetUserNumber('asdf', 7)).eq(7);
        });
    });
    describe('#defaultValueFunction' , ()=>{
        it('Should wrap value in function' , ()=>{
            expect(Utils.defaultValueFunction(1)()).to.eq(1);
        });
    });
    describe('#defaults' , ()=>{
        it('Should return defaults' , ()=>{
            const current = {
                'key1' : '1_v1',
                'key2' : '2_v1'
            }
            const defaultValues = {
                'key1' : '1_v2',
                'key3' : '3_v1',
            }
            const result = Utils.defaults(current , defaultValues);

            expect(result.key1).eq('1_v1');
            expect(result.key2).eq('2_v1');
            expect(result.key3).eq('3_v1');
        })
    });
});

describe('HealthCheckMonitor' , ()=>{
    const mockFactory = mockService.mock(HealthCheckMonitor);
    describe('get Utils' , ()=>{
        it('Should be Utils' , ()=>{
            const mockView = mockFactory.test('Utils').create();

            expect(mockView.instance.Utils).eq(Utils);
        })
    });
    describe('get STATUS' , ()=>{
        it('Should be STATUS' , ()=>{
            const mockView = mockFactory.test('STATUS').create();

            expect(mockView.instance.STATUS).eq(STATUS);
        })
    });
    describe('get Error' , ()=>{
        it('Should be Error' , ()=>{
            const mockView = mockFactory.test('Error').create();

            expect(mockView.instance.Error).eq(Error);
        })
    });
    describe('get EVENTS' , ()=>{
        it('Should be EVENTS' , ()=>{
            const mockView = mockFactory.test('EVENTS').create();

            expect(mockView.instance.EVENTS).eq(EVENTS);
        })
    });
    describe('get TEST_STATE' , ()=>{
        it('Should be TEST_STATE' , ()=>{
            const mockView = mockFactory.test('TEST_STATE').create();

            expect(mockView.instance.TEST_STATE).eq(TEST_STATE);
        })
    });
    describe('get DEFAULT_INTERVAL' , ()=>{
        it('Should be DEFAULT_INTERVAL' , ()=>{
            const mockView = mockFactory.test('DEFAULT_INTERVAL').create();

            expect(mockView.instance.DEFAULT_INTERVAL).eq(5000);
        })
    });
    describe('get DEFAULT_TIMEOUT' , ()=>{
        it('Should be DEFAULT_TIMEOUT' , ()=>{
            const mockView = mockFactory.test('DEFAULT_TIMEOUT').create();

            expect(mockView.instance.DEFAULT_TIMEOUT).eq(5000);
        })
    });
    describe('get TestRunInfo' , ()=>{
        it('Should be TestRunInfo' , ()=>{
            const mockView = mockFactory.test('TestRunInfo').create();

            expect(mockView.instance.TestRunInfo).eq(TestRunInfo);
        })
    });
    describe('get TestResult' , ()=>{
        it('Should be TestResult' , ()=>{
            const mockView = mockFactory.test('TestResult').create();

            expect(mockView.instance.TestResult).eq(TestResult);
        })
    });
    describe('static #getTestOptions' , ()=>{
        it('Should return default values if non was defined' , ()=>{
            const mockView = mockFactory.test(['getTestOptions','Utils' , 'DEFAULT_INTERVAL' , 'DEFAULT_TIMEOUT']).create();

            const result = mockView.instance.getTestOptions({})

            expect(result.timeout()).eq(5000);
            expect(result.interval()).eq(5000);
            expect(result.startPeriod()).eq(0);
            expect(result.retries()).eq(1);
            expect(result.retryPauseTime()).eq(0);
            expect(result.healthyAfter()).eq(2);
            expect(result.unhealthyAfter()).eq(1);
            expect(result.action).be.a('function');
        });
    });
    describe('#constructor' , ()=>{
        const testOptions = {};
        const mockView = mockFactory
                .test(['constructor','TEST_STATE' , 'EVENTS'])
                .spies({
                    getTestOptions : chai.spy(()=>{
                        return testOptions 
                    })
                })
                .create();
        const healthCheckMonitor = mockView.instance;
        it('Should set `_testState` ' , ()=>{
            expect(healthCheckMonitor._testState).eq(TEST_STATE.INITIALIZING);
        });
        it('Should set `isChanging` ' , ()=>{
            expect(healthCheckMonitor.isChanging).eq(false);
        });
        it('Should set `testOptions` ' , ()=>{
            expect(healthCheckMonitor.getTestOptions).to.have.been.called();
            expect(healthCheckMonitor.testOptions).eq(testOptions);
        });
        it('Should set `listeners` ' , ()=>{
            expect(healthCheckMonitor.listeners[EVENTS[0]].length).eq(0);
            expect(healthCheckMonitor.listeners[EVENTS[1]].length).eq(0);
        });
    });

    describe('#start' , ()=>{
        const startMockFactory = mockFactory
                .test(['start','TEST_STATE' , 'STATUS'])
                .spies({
                    get Utils(){
                        return {
                            setTimeout : (cb)=>{cb()}
                        }
                    },
                    getTestOptions : chai.spy(()=>{
                        return testOptions 
                    })
                });
            
        
        it('Should set `_testState`' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            expect(healthCheckMonitor._testState).not.eq(TEST_STATE.STARTING);
            healthCheckMonitor.start();
            expect(healthCheckMonitor._testState).eq(TEST_STATE.STARTING);
        });
        it('Should set `status`' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            expect(healthCheckMonitor.status).not.eq(STATUS.STARTING);
            healthCheckMonitor.start();
            expect(healthCheckMonitor.status).eq(STATUS.STARTING);
        });
        it('Should set `transitionStatus`' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            expect(healthCheckMonitor.transitionStatus).not.eq(STATUS.STARTING);
            healthCheckMonitor.start();
            expect(healthCheckMonitor.transitionStatus).eq(STATUS.STARTING);
        });
        it('Should set `isChanging`' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            expect(healthCheckMonitor.isChanging).not.eq(true);
            healthCheckMonitor.start();
            expect(healthCheckMonitor.isChanging).eq(true);
        });

        it('Should call #test' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            let innerStartCb;
            const testResult = {};
            healthCheckMonitor.test = chai.spy((str , cb)=>{
                innerStartCb = cb;
            });
            const startCb = chai.spy();
            const result = healthCheckMonitor.start(startCb);

            expect(healthCheckMonitor.test).to.have.been.called.with('init' , innerStartCb);
            expect(result).eq(healthCheckMonitor);
            expect(startCb).not.to.have.been.called();
            innerStartCb(testResult);
            expect(startCb).to.have.been.called.with(testResult)
        });
        it('Should call #test and not fail if onStart fail' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            let innerStartCb;
            const testResult = {};
            healthCheckMonitor.test = chai.spy((str , cb)=>{
                innerStartCb = cb;
            });
            const startCb = chai.spy(()=>{
                throw new Error('sdfs')
            });
            const result = healthCheckMonitor.start(startCb);

            expect(healthCheckMonitor.test).to.have.been.called.with('init' , innerStartCb);
            expect(result).eq(healthCheckMonitor);
            expect(startCb).not.to.have.been.called();
            innerStartCb(testResult);
            expect(startCb).to.have.been.called.with(testResult)
        });
        it('Should call #test and not fail if onStart not passed' , ()=>{
            const healthCheckMonitor = startMockFactory.create().instance;
            healthCheckMonitor.testOptions = {};

            let innerStartCb;
            const testResult = {};
            healthCheckMonitor.test = chai.spy((str , cb)=>{
                innerStartCb = cb;
            });

            const result = healthCheckMonitor.start();

            expect(healthCheckMonitor.test).to.have.been.called.with('init' , innerStartCb);
            expect(result).eq(healthCheckMonitor);
            innerStartCb(testResult);
        });
    });
    describe('#pause' , ()=>{
        const pauseMockFactory = mockFactory
                .test(['pause','TEST_STATE' , 'STATUS']);
        
        it('Should set `_testState`' , ()=>{
            const healthCheckMonitor = pauseMockFactory.create().instance;
            
            healthCheckMonitor.pause();

            expect(healthCheckMonitor._testState).eq(TEST_STATE.PAUSED)
        });
        it('Should set `status`' , ()=>{
            const healthCheckMonitor = pauseMockFactory.create().instance;
            
            healthCheckMonitor.pause();

            expect(healthCheckMonitor.status).eq(STATUS.UNKNOWN)
        });
        it('Should set `transitionStatus`' , ()=>{
            const healthCheckMonitor = pauseMockFactory.create().instance;
            
            healthCheckMonitor.pause();

            expect(healthCheckMonitor.transitionStatus).eq(STATUS.UNKNOWN)
        });
        it('Should return pause' , ()=>{
            const clearTimeout = chai.spy();
            const healthCheckMonitor = pauseMockFactory
                .create().instance;
            
            healthCheckMonitor._timeout = null;
            const result = healthCheckMonitor.pause();

            expect(result).eq(healthCheckMonitor);
        });
        it('Should clear _timeout' , ()=>{
            const clearTimeout = chai.spy();
            const healthCheckMonitor = pauseMockFactory
                .spies({
                    get Utils(){
                        return {
                            clearTimeout
                        }
                    }
                }).create().instance;
            
            const timeoutMock = {};
            healthCheckMonitor._timeout = timeoutMock;

            healthCheckMonitor.pause();

            expect(clearTimeout).to.have.been.called.with(timeoutMock)
            expect(healthCheckMonitor._timeout).eq(null);
        });
        it('Shouldn\'t call clear timeout if null' , ()=>{
            const clearTimeout = chai.spy();
            const healthCheckMonitor = pauseMockFactory
                .spies({
                    get Utils(){
                        return {
                            clearTimeout
                        }
                    }
                }).create().instance;
            healthCheckMonitor._timeout = null;

            healthCheckMonitor.pause();

            expect(clearTimeout).not.to.have.been.called();
            expect(healthCheckMonitor._timeout).eq(null);
        });
    });
    describe('#test' , ()=>{
        let mockView;
        let testOptions;
        let setTimeout;
        let clearTimeout;
        let onResult;
        let TestRunInfo = chai.spy();
        beforeEach(()=>{
            onResult = chai.spy();
            setTimeout = chai.spy((cb)=>{cb()});
            clearTimeout = chai.spy();
            safeGetUserNumber = chai.spy();
            testOptions = {};
            
            mockView = mockFactory.spies({
                get TestRunInfo(){
                    return TestRunInfo
                },
                get testOptions(){
                    return testOptions;
                },
                get Utils(){
                    return {
                        safeGetUserNumber,
                        Date : {
                            now(){
                                return 1
                            }
                        },
                        setTimeout,
                        clearTimeout
                    }
                }
            })
            .test(['test' , 'TEST_STATE' , 'DEFAULT_INTERVAL']).create();
            mockView.instance.testOptions = testOptions;
        });
        //testOptions
        it('Should create TestRunInfo' , ()=>{
            mockView.instance.test('reason' , onResult);

            expect(mockView.instance.TestRunInfo).to.have.been.called.with('reason' , 1 , 0);
        });
        it('Should call #_test' , ()=>{
            mockView.instance.test('reason' , onResult);
            
            expect(mockView.instance._test).to.have.been.called();
        });
        it('Shouldn\'t create a timeout if test is paused ' , ()=>{
            mockView.instance.test('reason' , onResult);
            
            expect(mockView.instance._test).to.have.been.called();
        });
        it('Should call #_triggeredTest once timeout finish' , ()=>{
            let _testOnResult;
            const result = {};
            const healthCheckMonitor = mockView.instance;
            healthCheckMonitor._test = chai.spy((testInfo , cb)=>{
                _testOnResult = cb;
            });
            healthCheckMonitor._testState = TEST_STATE.RUNINNG;


            healthCheckMonitor.test('reason' , onResult);
            expect(onResult).to.not.have.been.called();
            _testOnResult();
            
            expect(safeGetUserNumber).to.have.been.called(undefined , healthCheckMonitor.DEFAULT_INTERVAL);
            expect(setTimeout).to.have.been.called();
            expect(onResult).to.have.been.called();
            expect(healthCheckMonitor._triggeredTest).to.have.been.called();
        });
        it('Shouldn\'t set timeout with PAUSED status' , ()=>{
            let _testOnResult;
            const result = {};
            const healthCheckMonitor = mockView.instance;
            healthCheckMonitor._test = chai.spy((testInfo , cb)=>{
                _testOnResult = cb;
            });
            healthCheckMonitor._testState = TEST_STATE.PAUSED;


            healthCheckMonitor.test('reason' , onResult);
            expect(onResult).to.not.have.been.called();
            _testOnResult();
            
            expect(safeGetUserNumber).to.not.have.been.called(undefined , healthCheckMonitor.DEFAULT_INTERVAL);
            expect(setTimeout).to.not.have.been.called();
            expect(onResult).to.have.been.called();
            expect(healthCheckMonitor._triggeredTest).to.not.have.been.called();
        });
        it('Should call #_analyzeStatus' , ()=>{
            let _testOnResult;
            const result = {};
            const healthCheckMonitor = mockView.instance;
            healthCheckMonitor._test = chai.spy((testInfo , cb)=>{
                _testOnResult = cb;
            });
            healthCheckMonitor._testState = TEST_STATE.RUNINNG;


            healthCheckMonitor.test('reason' , onResult);
            expect(onResult).to.not.have.been.called();
            _testOnResult();
            
            expect(healthCheckMonitor._analyzeStatus).to.have.been.called();
        });
        it('Should call onResult' , ()=>{
            let _testOnResult;
            const result = {};
            const healthCheckMonitor = mockView.instance;
            healthCheckMonitor._test = chai.spy((testInfo , cb)=>{
                _testOnResult = cb;
            });
            healthCheckMonitor._testState = TEST_STATE.RUNINNG;


            healthCheckMonitor.test('reason' , onResult);
            expect(onResult).to.not.have.been.called();
            _testOnResult();
            
            expect(onResult).to.have.been.called();
        });
    });
    describe('#_analyzeStatus' , ()=>{
        let mockView;
        let testOptions;
        let emit;
        let transitionStatus;
        let status;
        let testResult;
        let resultValue;
        beforeEach(()=>{
            emit = chai.spy();
            testOptions = {
                healthyAfter : 9,
                unhealthyAfter : 7,
            };
            status = STATUS.RUNINNG;
            transitionStatus = STATUS.RUNINNG;
            testResult = {};
            resultValue = chai.spy(n => n);
            
            mockView = mockFactory.spies({
                get Utils(){
                    return {
                        resultValue
                    }
                }
            })
            .test(['_analyzeStatus' , 'STATUS' ]).create();
            mockView.instance.testOptions = testOptions;
            mockView.instance.transitionStatus = transitionStatus;
            mockView.instance.emit = emit;
            mockView.instance.status = status;
        });

        it('Should emit testResult if no change detected and return func' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor.status = healthCheckMonitor.transitionStatus = testResult.status = STATUS.UNHEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);

            expect(emit).to.have.been.called.with('testResult' , testResult);
            expect(emit).to.have.been.called.exactly(1);
        });
        it('Should increase `_statusTransitionCount` and set `isChanging` if alredy in transition' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor._statusTransitionCount = 4;
            healthCheckMonitor.status = STATUS.HEALTHY;
            healthCheckMonitor.transitionStatus = STATUS.UNHEALTHY;
            testResult.status = STATUS.UNHEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);
            expect(healthCheckMonitor.isChanging).eq(true);
            expect(healthCheckMonitor._statusTransitionCount).eq(5)
        });
        it('Should reset `_statusTransitionCount` and set `isChanging` , `transitionStatus` if just started transition' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor._statusTransitionCount = 9;
            healthCheckMonitor.status = STATUS.HEALTHY;
            healthCheckMonitor.transitionStatus = STATUS.UNHEALTHY;
            testResult.status = STATUS.HEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);

            expect(healthCheckMonitor._statusTransitionCount).eq(0)
            expect(healthCheckMonitor.isChanging).eq(true);
            expect(healthCheckMonitor.transitionStatus).eq( STATUS.HEALTHY)
        });
        it('Should use `healtyAfter` if transitioning to healthy' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor._statusTransitionCount = 9;
            healthCheckMonitor.status = STATUS.UNHEALTHY;
            healthCheckMonitor.transitionStatus = STATUS.HEALTHY;
            testResult.status = STATUS.HEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);

            expect(resultValue).to.have.been.called.with(testOptions.healthyAfter)
        });
        it('Should use `healtyAfter` if transitioning to unhealthy' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor._statusTransitionCount = 9;
            healthCheckMonitor.status = STATUS.HEALTHY;
            healthCheckMonitor.transitionStatus = STATUS.UNHEALTHY;
            testResult.status = STATUS.UNHEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);

            expect(resultValue).to.have.been.called.with(testOptions.unhealthyAfter)
        });
        it('Should notify run status change action when required diff was achived' , ()=>{
            const healthCheckMonitor = mockView.instance;

            healthCheckMonitor._statusTransitionCount = 11;
            healthCheckMonitor.status = STATUS.HEALTHY;
            healthCheckMonitor.transitionStatus = STATUS.UNHEALTHY;
            testResult.status = STATUS.UNHEALTHY;

            healthCheckMonitor._analyzeStatus(testResult);

            expect(healthCheckMonitor.status).eq(STATUS.UNHEALTHY);
            expect(healthCheckMonitor.transitionStatus).eq(STATUS.UNHEALTHY);
            expect(healthCheckMonitor._statusTransitionCount).eq(0);
            expect(healthCheckMonitor.isChanging).eq(false);
            expect(emit).to.have.been.called.with('statusChange' , STATUS.UNHEALTHY);
        });
    });
    describe('#_triggeredTest' , ()=>{
        let test;
        let _analyzeStatus;
        let testResult = {};
        beforeEach(()=>{
            test = chai.spy();
            _analyzeStatus = chai.spy();
            mockView = mockFactory
            .test(['_triggeredTest' ]).create();
            
            mockView.instance.test = test;
            mockView.instance._analyzeStatus = _analyzeStatus;
        });
        it('Should call #test' , ()=>{
            const healthCheckMonitor  = mockView.instance;
            
            healthCheckMonitor._triggeredTest();

            expect(healthCheckMonitor.test).to.have.been.called.with('interval' )
        });
    });
    describe('#_test' , ()=>{
        let test;
        let _analyzeStatus;
        let testResult = {};
        let clearTimeout;
        let resultValue;
        let safeGetUserNumber;
        let setTimeout;
        let testOptions;
        let testRunInfo;
        let onResult;
        let runNumber
        let runNumberSpy;
        let resultData;
        beforeEach(()=>{
            resultData = {};
            runNumber = 2;
            runNumberSpy = chai.spy();
            testRunInfo = {
                get runNumber(){
                    return runNumber;
                },
                set runNumber(i){
                    runNumber = i;
                    runNumberSpy(i);
                }
            };
            onResult = chai.spy();
            clearTimeout = chai.spy();
            resultValue = chai.spy(((v)=>v));
            safeGetUserNumber = chai.spy();
            testOptions = {
                action : chai.spy((testRunInfo,cb)=>cb(resultData)),
                timeout : 7,
                retryPauseTime : 5
            }
            setTimeout = chai.spy((cb)=>cb())
            mockView = mockFactory.spies({
                get TestResult(){
                    return TestResult
                },
                get testOptions(){
                    return testOptions;
                },
                get Utils(){
                    return {
                        safeGetUserNumber,
                        Date : {
                            now(){
                                return 1
                            }
                        },
                        setTimeout,
                        clearTimeout,
                        resultValue
                    }
                }
            })
            .test(['_test' , 'STATUS' ,'TestResult' , 'Error']).create();
            
            mockView.instance.testOptions = testOptions;
        });
        it('Should setTimeout' , ()=>{
            const healthCheckMonitor  = mockView.instance;
            let timoutMs ;
            setTimeout = chai.spy((cb , ms)=>{
                timoutMs = ms;
            });

            healthCheckMonitor._test(testRunInfo,onResult);

            expect(setTimeout).to.have.been.called();
            expect(timoutMs).to.equal(7);
        });
        it('Should retry on timeout' , ()=>{
            const healthCheckMonitor  = mockView.instance;

            runNumber = 0;
            testOptions.retries = 4;
            healthCheckMonitor._test(testRunInfo,onResult);
            
            expect(runNumberSpy).to.have.been.called().exactly(4);
            expect(testRunInfo.runNumber).eq(4);
            expect(setTimeout).to.have.been.called.exactly(9);
            expect(clearTimeout).to.have.been.called();
            expect(safeGetUserNumber).to.have.been.called.with(5,healthCheckMonitor.DEFAULT_TIMEOUT);
        });
        it('Should return unhealthy on timeout ' , ()=>{
            const healthCheckMonitor  = mockView.instance;

            runNumber = 4;
            testOptions.retries = 4;
            let finalTestResult;
            onResult = chai.spy((testR)=>{
                finalTestResult = testR;
            });
            healthCheckMonitor._test(testRunInfo,onResult);
            
            expect(setTimeout).to.have.been.called.exactly(1);
            expect(clearTimeout).to.have.been.called();
            expect(finalTestResult).not.eq(undefined);
            expect(finalTestResult.retries).eq(4);
            expect(finalTestResult.data).to.be.a('Error');
            expect(finalTestResult.data.message).eq('timeout');
        });
        it('Should return healty on success' , ()=>{
            const healthCheckMonitor  = mockView.instance;

            runNumber = 4;
            testOptions.retries = 4;
            let finalTestResult;
            setTimeout = ()=>{};
            onResult = chai.spy((testR)=>{
                finalTestResult = testR;
            });
            testOptions.action = chai.spy((testRunInfo,cb)=>{
                cb(STATUS.HEALTHY , resultData)
            });
            healthCheckMonitor._test(testRunInfo,onResult);
            
            expect(clearTimeout).to.have.been.called();
            expect(finalTestResult).not.eq(undefined);
            expect(finalTestResult.retries).eq(4);
            expect(finalTestResult.data).eq(resultData);
        });
        it('Should retry on unhealty' , ()=>{
            const healthCheckMonitor  = mockView.instance;

            runNumber = 0;
            testOptions.retries = 4;
            setTimeout = function(cb){
                //setTimout only on retry and not on timeout
                if (!/onResponse/.test(cb.toString()))
                    cb();
            }
            testOptions.action = chai.spy((testRunInfo,cb)=>{
                cb(STATUS.UNHEALTHY , resultData)
            });
            healthCheckMonitor._test(testRunInfo,onResult);
            
            expect(runNumberSpy).to.have.been.called().exactly(4);
            expect(testRunInfo.runNumber).eq(4);
            expect(clearTimeout).to.have.been.called();
            expect(safeGetUserNumber).to.have.been.called.with(5,healthCheckMonitor.DEFAULT_TIMEOUT);
        });
        it('Should retry on exception' , ()=>{
            const healthCheckMonitor  = mockView.instance;

            runNumber = 0;
            testOptions.retries = 4;
            setTimeout = function(cb){
                //setTimout only on retry and not on timeout
                if (!/onResponse/.test(cb.toString()))
                    cb();
            }
            testOptions.action = chai.spy((testRunInfo,cb)=>{
                throw new Error('Error')
            });
            healthCheckMonitor._test(testRunInfo,onResult);
            
            expect(runNumberSpy).to.have.been.called().exactly(4);
            expect(testRunInfo.runNumber).eq(4);
            expect(clearTimeout).to.have.been.called();
            expect(safeGetUserNumber).to.have.been.called.with(5,healthCheckMonitor.DEFAULT_TIMEOUT);
        });
    });
    describe('#on' , ()=>{
        beforeEach(()=>{
            mockView = mockFactory
            .test(['on' , 'EVENTS' , 'Utils' , 'Error']).create();
            mockView.instance.listeners =  {
                [EVENTS[0]]:[],
                [EVENTS[1]]:[]
            };
        });
        it('Should throw if event is not part of events' , ()=>{

            function shouldThrow(){
                mockView.instance.on('sdfasdf' , ()=>{})
            }
            expect(shouldThrow).to.throw()
        });
        it('Should throw  cb is not a function' , ()=>{

            function shouldThrow(){
                mockView.instance.on(EVENTS[0] ,'not a function')
            }
            expect(shouldThrow).to.throw()
        });
        it('Should add listener' , ()=>{
            const cb = ()=>{}
            mockView.instance.on(EVENTS[0] ,cb)

            expect(mockView.instance.listeners[EVENTS[0]].length).eq(1);
            expect(mockView.instance.listeners[EVENTS[0]][0]).eq(cb);
        });
    });
    describe('#emit' , ()=>{
        let listenCb = chai.spy();
        beforeEach(()=>{
            listenCb = chai.spy();
            mockView = mockFactory
            .test(['emit' , 'EVENTS' , 'Error']).create();
            mockView.instance.listeners =  {
                [EVENTS[0]]:[listenCb],
                [EVENTS[1]]:[]
            };
        });
        it('Should throw if event is not part of events' , ()=>{

            function shouldThrow(){
                mockView.instance.emit('sdfasdf')
            }
            expect(shouldThrow).to.throw()
        });
        it('Should emit if have a cb' , ()=>{
            const data = {};
            mockView.instance.emit(EVENTS[0] , data);

            expect(listenCb).to.have.been.called.once;
        })
    });
    describe('#removeEventListener' , ()=>{
        let listenerOne = ()=>{};
        let listenerTwo = ()=>{};
        beforeEach(()=>{
            
            mockView = mockFactory
            .test(['removeEventListener' , 'EVENTS' ]).create();
            mockView.instance.listeners =  {
                [EVENTS[0]]:[listenerOne,listenerTwo],
                [EVENTS[1]]:[]
            };
        });
        it('Should remove only the required listener' , ()=>{
            mockView.instance.removeEventListener(EVENTS[0] , listenerTwo);

            expect(mockView.instance.listeners[EVENTS[0]].length).eq(1);
            expect(mockView.instance.listeners[EVENTS[0]][0]).eq(listenerOne);
        })
    });
    describe('#removeEventListeners' , ()=>{
        let listenerOne = ()=>{};
        let listenerTwo = ()=>{};
        beforeEach(()=>{
            
            mockView = mockFactory
            .test(['removeEventListeners' , 'EVENTS' ]).create();
            mockView.instance.listeners =  {
                [EVENTS[0]]:[listenerOne,listenerTwo],
                [EVENTS[1]]:[]
            };
        });
        it('Should remove only the required listener' , ()=>{
            mockView.instance.removeEventListeners(EVENTS[0]);

            expect(mockView.instance.listeners[EVENTS[0]].length).eq(0);
        })
    });
})