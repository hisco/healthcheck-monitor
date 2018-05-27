const {
    HealthCheckMonitor,
    Utils,
    STATUS
} = require('../../src/index');

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

describe('HealthCheckMonitor' , ()=>{
    let i = 0;
    class UtilsWithoutTimeout extends Utils{
        static setTimeout(cb){
            //setTimout only on retry and not on timeout
            const triggeredTest = /triggeredTest/.test(cb.toString());
            const isActionTimeout = /onResponse/.test(cb.toString());
            const isRetry = /tatusMonitor\._test/.test(cb.toString());
            if (isActionTimeout )
                cb; 
            else if(triggeredTest){
                if (i++ < 3)
                    cb();
            }
            else if(triggeredTest)
                cb();
            else{
                cb();
            }

        }
        static clearTimeout(){
            return ()=>{}
        }
    }
    class HealthCheckMonitorWithoutTimeout extends HealthCheckMonitor{
        get Utils(){
            return UtilsWithoutTimeout;
        }
    }
    describe('Status monitor improtant flows' , ()=>{
        it('Should get healthy after failures' , ()=>{
            let i = 0;
            const healthCheckMonitor = new HealthCheckMonitorWithoutTimeout({
                retries : 5,
                healthyAfter : 4,
                action : (testRunInfo , onResponse)=>{
                    if (i++>2){
                        onResponse(STATUS.HEALTHY)
                    }
                    else
                        onResponse(STATUS.UNHEALTHY)

                }
            });
            let statusAtStartUp;
            let transitionStatusAtStartUp;
            let statusAtChange;
            let transitionStatusAtChange;
            let error;
            healthCheckMonitor.on('statusChange' , (testStatus)=>{
                statusAtStartUp = healthCheckMonitor.status;
                transitionStatusAtStartUp = healthCheckMonitor.transitionStatus;
            
                healthCheckMonitor.pause();

                statusAtChange = healthCheckMonitor.status;
                transitionStatusAtChange = healthCheckMonitor.transitionStatus;
            });
            healthCheckMonitor.start(()=>{
                try {
                    //It's already a in try/catch
                    //Because everything is sync it will be easy to throw if needed
                    expect(i).eq( 2 /*2 failures */ + 1 /* First success */+ 4 /*4 healthy after*/)
                    expect(statusAtStartUp).eq('HEALTHY')
                    expect(transitionStatusAtStartUp).eq('HEALTHY');
                    //When I did pause it reset the status...
                    expect(statusAtChange).eq('UNKNOWN');
                    expect(transitionStatusAtChange).eq('UNKNOWN');
                }
                catch(err){
                    error = err;
                }
                
            });
            if (error)
                throw error;
        })
    });
})