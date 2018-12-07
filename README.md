# Healthcheck monitor

[![Greenkeeper badge](https://badges.greenkeeper.io/hisco/healthcheck-monitor.svg)](https://greenkeeper.io/)

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Core functionality of monitoring healthcheck.

## Features
  * Retries for failled check
  * Timeout monitoring
  * Healthy after X checks
  * Unhealthy after Y checks
  * Pause between failled checks
  * Everything is super configurable - with resolved functions as options
  * Fully unit tested
  * TypeScript support


## Simple to use
If you have any requests/issues please open an issue at Github.
```js
    //All fields with defaults
    const {HealthCheckMonitor , STATUS} = require('healthcheck-monitor');
    const healthCheckMonitor = new HealthCheckMonitor({
            interval : 5000, //MS, Interval between definitive results
            //BTW any field will be resovled if it's a function
            //It gives you total control on the values at any time
            //An example to a changin interval 1-3 seconds:
            // interval : ()=>{return (Math.floor(Math.random()*3) + 1)*1000},
            timeout :   5000, //MS, Time to wait till decided an action will be dicarded due to a timeout
            startPeriod :   0, //MS, Time to ater start() called
            retries :  1, //If service is unhealthy how many retry action to preform till definitive test result.
            retryPauseTime :  0,//MS, how much time to wait between each retry
            healthyAfter :  2, //How many consecutive healty action recorded before deciding the status is healty
            unhealthyAfter :  1,//How many consecutive unhealty action recorded before deciding the status is unhealty
            action :  (testInfo , onResponse)=>{
                //Synchronous / Asynchronous action
                onResponse(STATUS.UNHEALTHY);
            })
    });

function statusCheckAction(testInfo , onResponse){
    //Synchronous / Asynchronous action
    //If success
    onResponse(STATUS.HEALTHY)
    //If error
    onResponse(STATUS.UNHEALTHY)
}

//Simple to start
healthCheckMonitor.start();
//You can wait for the first definitive status when starting
healthCheckMonitor.start((testResult)=>{
    //You will also get that first status testResult

});
//You can pause the helthcheck at any time
healthCheckMonitor.pause();
//After pausing you can simply resume
healthCheckMonitor.resume();
//Or get notfied on the first definitive answer after resuming
healthCheckMonitor.resume((testResult)=>{
    //You will also get that first status testResult

});
//You can even invok a manual test
healthCheckMonitor.test((testResult)=>{
    //You will also get that first status testResult

});
//Listen to events
healthCheckMonitor.on('statusChange' , (status)=>{
    //For any change of status after 
    //waiting `healthyAfter` or `unhealthyAfter`
    //will be called with the new status (enum STATUS)

});
healthCheckMonitor.on('testResult' , (testResult)=>{
    //For every single check you will get an event with a `TestResult`

});

//You can also get information about the status at any time
healthCheckMonitor.isChanging //true, if it's currently transitioning to a different status
healthCheckMonitor.transitionStatus //enum STATUS, the status we are currently transitioning to.



```

## How can it help
Health checking is known to be an important part of service integration, in addition it's an important part of any integration, even internal one.
Some common use cases:
   * Monitor an HTTP backend.
   * Montior a Websocket backend.
   * Monitor a file on the system.
   * Monitor an IPC connection.
   * Monitor a (node)cluster worker.

Because this gives you the core functinality of testing, you are left to decide only what is the action you are testing.

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/healthcheck-monitor.svg
[npm-url]: https://npmjs.org/package/healthcheck-monitor
[travis-image]: https://img.shields.io/travis/hisco/healthcheck-monitor/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/healthcheck-monitor
[coveralls-image]: https://coveralls.io/repos/github/hisco/healthcheck-monitor/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/hisco/healthcheck-monitor?branch=master





