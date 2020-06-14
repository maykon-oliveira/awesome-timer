import { expect } from 'chai';
import sinon, { SinonSpy, SinonFakeTimers } from 'sinon';
import { AwesomeTimer } from '../../src/AwesomeTimer';
import { Unit, TimeValues, AwesomeTimerConfig } from '../../src/types';
import { EventTypes } from '../../src/EventEmitter';

let clockTime: AwesomeTimer;
let sinonFakeTimer: SinonFakeTimers;

describe('EasyTimer: new instance', () => {
    beforeEach(() => {
        clockTime = new AwesomeTimer();
    });

    afterEach(() => {
        clockTime.stop();
    });

    describe('default values', () => {
        it('should have counters with 0 values', () => {
            assertTimes(clockTime, [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
        });
    });

    describe('start function', () => {
        let startedListener: SinonSpy;

        beforeEach(() => {
            startedListener = sinon.spy();
            clockTime.addEventListener('started', startedListener);
            clockTime.start();
        });

        it('should start the timer', () => {
            expect(clockTime.isRunning()).true;
        });

        it('should trigger started event', () => {
            sinon.assert.callCount(startedListener, 1);
        });

        describe('with default params', () => {
            it('should have seconds precision', () => {
                expect(clockTime.getConfig().precision).eq(Unit.SECONDS);
            });
            it('should not be countdown timer', () => {
                expect(clockTime.getConfig().countdown).eq(false);
            });
            it('should have default callback empty function', () => {
                expect(clockTime.getConfig().callback).to.instanceOf(Function);
            });
        });
    });

    describe('started', () => {
        describe('regular timer', () => {
            describe('with tenth of seconds precision', () => {
                let params: { precision: Unit; callback: SinonSpy };
                beforeEach(() => {
                    params = { precision: Unit.SECOND_TENTHS, callback: sinon.spy() };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update tenth of seconds every 1 tenth of second', () => {
                    assertEventTriggered(clockTime, 'secondTenthsUpdated', 100, 1);
                    assertTimes(clockTime, [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]);
                });

                it('should update seconds every 1 second', () => {
                    assertEventTriggered(clockTime, 'secondsUpdated', 1000, 1);
                    assertTimes(clockTime, [0, 1, 0, 0, 0], [10, 1, 0, 0, 0]);
                });

                it('should update minutes every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                });

                it('should execute callback every tenth of second', () => {
                    sinonFakeTimer.tick(100);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with seconds precision', () => {
                let params: { precision: Unit; callback: SinonSpy };
                beforeEach(() => {
                    params = { precision: Unit.SECONDS, callback: sinon.spy() };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update seconds every 1 second', () => {
                    assertEventTriggered(clockTime, 'secondsUpdated', 1000, 1);
                    assertTimes(clockTime, [0, 1, 0, 0, 0], [10, 1, 0, 0, 0]);
                });

                it('should update minutes every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                });

                it('should execute callback every second', () => {
                    sinonFakeTimer.tick(1000);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with minutes precision', () => {
                let params: { precision: Unit; callback: SinonSpy };
                beforeEach(() => {
                    params = { precision: Unit.MINUTES, callback: sinon.spy() };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update minute every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                });

                it('should update days every 86400 seconds', () => {
                    assertEventTriggered(clockTime, 'daysUpdated', 86400000, 1);
                    assertTimes(clockTime, [0, 0, 0, 0, 1], [864000, 86400, 1440, 24, 1]);
                });

                it('should execute callback every 60 seconds', () => {
                    sinonFakeTimer.tick(60000);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with hours precision', () => {
                let params: { precision: Unit; callback: SinonSpy };
                beforeEach(() => {
                    params = { precision: Unit.HOURS, callback: sinon.spy() };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                });

                it('should update days every 86400 seconds', () => {
                    assertEventTriggered(clockTime, 'daysUpdated', 86400000, 1);
                    assertTimes(clockTime, [0, 0, 0, 0, 1], [864000, 86400, 1440, 24, 1]);
                });

                it('should execute callback every 3600 seconds', () => {
                    sinonFakeTimer.tick(3600000);
                    sinon.assert.called(params.callback);
                });
            });
        });

        describe('countdown timer', () => {
            describe('with tenth of seconds precision', () => {
                let params: {
                    precision: Unit;
                    callback: SinonSpy;
                    startValues: TimeValues;
                    countdown: boolean;
                };
                beforeEach(() => {
                    params = {
                        precision: Unit.SECOND_TENTHS,
                        callback: sinon.spy(),
                        startValues: { seconds: 7199 },
                        countdown: true,
                    };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update seconds every 10 tenth of seconds', () => {
                    assertEventTriggered(clockTime, 'secondsUpdated', 100, 1);
                    assertTimes(clockTime, [9, 58, 59, 1, 0], [71989, 7198, 119, 1, 0]);
                });

                it('should update seconds every 1 second', () => {
                    assertEventTriggered(clockTime, 'secondsUpdated', 1000, 1);
                    assertTimes(clockTime, [0, 58, 59, 1, 0], [71980, 7198, 119, 1, 0]);
                });

                it('should update minutes every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 59, 58, 1, 0], [71390, 7139, 118, 1, 0]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 59, 59, 0, 0], [35990, 3599, 59, 0, 0]);
                });

                it('should execute callback every second', () => {
                    sinonFakeTimer.tick(1000);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with seconds precision', () => {
                let params: {
                    precision: Unit;
                    callback: SinonSpy;
                    startValues: TimeValues;
                    countdown: boolean;
                };
                beforeEach(() => {
                    params = {
                        precision: Unit.SECONDS,
                        callback: sinon.spy(),
                        startValues: { seconds: 7199 },
                        countdown: true,
                    };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update seconds every 1 second', () => {
                    assertEventTriggered(clockTime, 'secondsUpdated', 1000, 1);
                    assertTimes(clockTime, [0, 58, 59, 1, 0], [71980, 7198, 119, 1, 0]);
                });

                it('should update minutes every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 59, 58, 1, 0], [71390, 7139, 118, 1, 0]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 59, 59, 0, 0], [35990, 3599, 59, 0, 0]);
                });

                it('should execute callback every second', () => {
                    sinonFakeTimer.tick(1000);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with minutes precision', () => {
                let params: {
                    precision: Unit;
                    callback: SinonSpy;
                    startValues: TimeValues;
                    countdown: boolean;
                };
                beforeEach(() => {
                    params = {
                        precision: Unit.MINUTES,
                        callback: sinon.spy(),
                        startValues: { seconds: 172799 },
                        countdown: true,
                    };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update minutes every 60 seconds', () => {
                    assertEventTriggered(clockTime, 'minutesUpdated', 60000, 1);
                    assertTimes(clockTime, [0, 59, 58, 23, 1], [1727390, 172739, 2878, 47, 1]);
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 59, 59, 22, 1], [1691990, 169199, 2819, 46, 1]);
                });

                it('should update days every 86400 seconds', () => {
                    assertEventTriggered(clockTime, 'daysUpdated', 86400000, 1);
                    assertTimes(clockTime, [0, 59, 59, 23, 0], [863990, 86399, 1439, 23, 0]);
                });

                it('should execute callback every 60 seconds', () => {
                    sinonFakeTimer.tick(60000);
                    sinon.assert.called(params.callback);
                });
            });

            describe('with hours precision', () => {
                let params: {
                    precision: Unit;
                    callback: SinonSpy;
                    startValues: TimeValues;
                    countdown: boolean;
                };
                beforeEach(() => {
                    params = {
                        precision: Unit.HOURS,
                        callback: sinon.spy(),
                        startValues: { seconds: 172799 },
                        countdown: true,
                    };
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start(params);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should update hours every 3600 seconds', () => {
                    assertEventTriggered(clockTime, 'hoursUpdated', 3600000, 1);
                    assertTimes(clockTime, [0, 59, 59, 22, 1], [1691990, 169199, 2819, 46, 1]);
                });

                it('should update days every 86400 seconds', () => {
                    assertEventTriggered(clockTime, 'daysUpdated', 86400000, 1);
                    assertTimes(clockTime, [0, 59, 59, 23, 0], [863990, 86399, 1439, 23, 0]);
                });

                it('should execute callback every 3600 seconds', () => {
                    sinonFakeTimer.tick(3600000);
                    sinon.assert.called(params.callback);
                });
            });
        });
    });

    describe('with time target', () => {
        describe('setting target params', () => {
            let target: TimeValues, configTarget: any;
            describe('with object input', () => {
                let emptyObjectTarget = {};
                beforeEach(() => {
                    target = {
                        secondTenths: 5,
                        seconds: 10,
                        minutes: 50,
                        hours: 15,
                        days: 2,
                    };
                    emptyObjectTarget = {};
                });

                it('should set 0 values when other properties is missing', () => {
                    clockTime.start({ target: emptyObjectTarget });
                    configTarget = clockTime.getConfig().target;
                    const configTargetValues = Object.keys(configTarget).map((key) => configTarget[key]);
                    expect(configTargetValues.some((v) => v !== 0)).to.be.false;
                });
                it('should set array in this order [ts, s, m, h, d]', () => {
                    clockTime.start({ target: target });
                    configTarget = clockTime.getConfig().target;
                    expect(configTarget.secondTenths).eq(target.secondTenths);
                    expect(configTarget.seconds).eq(target.seconds);
                    expect(configTarget.minutes).eq(target.minutes);
                    expect(configTarget.hours).eq(target.hours);
                    expect(configTarget.days).eq(target.days);
                });
            });
        });
    });

    describe('with start values', function () {
        describe('setting start values params', function () {
            let startValues: TimeValues, configStartValues;
            describe('with object input', function () {
                let emptyObjectStartValues: any;
                beforeEach(function () {
                    startValues = {
                        secondTenths: 5,
                        seconds: 10,
                        minutes: 50,
                        hours: 15,
                        days: 1,
                    };
                    emptyObjectStartValues = {};
                });

                it('should transform into 0 values array if the object is empty', function () {
                    clockTime.start({ startValues: emptyObjectStartValues });
                    configStartValues = clockTime.getConfig().startValues;
                    expect(configStartValues?.secondTenths).eq(0);
                    expect(configStartValues?.seconds).eq(0);
                    expect(configStartValues?.minutes).eq(0);
                    expect(configStartValues?.hours).eq(0);
                    expect(configStartValues?.days).eq(0);
                });

                it('should set seconds in first position, minutes in second position and hours in third position', function () {
                    clockTime.start({ startValues: startValues });
                    configStartValues = clockTime.getConfig().startValues;
                    expect(configStartValues?.secondTenths).eq(startValues.secondTenths);
                    expect(configStartValues?.seconds).eq(startValues.seconds);
                    expect(configStartValues?.minutes).eq(startValues.minutes);
                    expect(configStartValues?.hours).eq(startValues.hours);
                    expect(configStartValues?.days).eq(startValues.days);
                });
            });
        });

        describe('Time Values Counters', () => {
            it('should have toString function', () => {
                expect(clockTime.getTimeValues().toString).to.be.not.undefined;
                expect(clockTime.getTotalTimeValues().toString).to.be.not.undefined;
            });

            describe('toString function', () => {
                beforeEach(() => {
                    sinonFakeTimer = sinon.useFakeTimers();
                    clockTime.start();
                    sinonFakeTimer.tick(3735000);
                });

                afterEach(() => {
                    sinonFakeTimer.restore();
                });

                it('should work without params (default format hh:mm:ss)', () => {
                    expect(clockTime.getTimeValues().toString()).eq('01:02:15');
                });

                it('should change the values returned with the units param', () => {
                    expect(
                        clockTime.getTimeValues().toString({
                            units: [Unit.DAYS, Unit.HOURS, Unit.MINUTES, Unit.SECONDS, Unit.SECOND_TENTHS],
                        }),
                    ).eq('00:01:02:15:0');
                });
                it('should change the separator with the separator param', () => {
                    expect(clockTime.getTimeValues().toString({ separator: ',' })).eq('01,02,15');
                });

                it('should change the left zero padding with leftZeroPadding param', () => {
                    expect(clockTime.getTimeValues().toString({ leftZeroPadding: 4 })).eq('0001:0002:0015');
                });

                it('should change show days with all the digits when days >= 100', () => {
                    const timerWith100days = new AwesomeTimer();
                    timerWith100days.start({
                        startValues: { days: 205, seconds: 30 },
                    });
                    expect(
                        timerWith100days.getTimeValues().toString({
                            units: [Unit.DAYS, Unit.HOURS, Unit.MINUTES, Unit.SECONDS, Unit.SECOND_TENTHS],
                        }),
                    ).eq('205:00:00:30:0');
                });
            });
        });
    });

    describe('stop function', () => {
        beforeEach(() => {
            sinonFakeTimer = sinon.useFakeTimers();
        });

        afterEach(() => {
            sinonFakeTimer.restore();
        });

        it('should stop the timer and reset values', () => {
            clockTime.start();
            sinonFakeTimer.tick(60000);
            clockTime.stop();
            expect(clockTime.isRunning()).eq(false);
            assertTimes(clockTime, [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
        });

        it('should trigger stopped event', () => {
            const callback = sinon.spy();
            clockTime.addEventListener('stopped', callback);
            clockTime.start();
            clockTime.stop();
            sinon.assert.callCount(callback, 1);
            expect(clockTime).eq(callback.args[0][0].detail.timer);
        });
    });

    describe('pause function', () => {
        let params: AwesomeTimerConfig;
        beforeEach(() => {
            params = {
                startValues: { seconds: 120 },
                countdown: true,
                callback: sinon.spy(),
            };
            sinonFakeTimer = sinon.useFakeTimers();
        });

        afterEach(() => {
            sinonFakeTimer.restore();
        });

        it('should trigger paused event', () => {
            const callback = sinon.spy();
            clockTime.addEventListener('paused', callback);
            clockTime.start();
            clockTime.pause();
            sinon.assert.callCount(callback, 1);
            expect(clockTime).eq(callback.args[0][0].detail.timer);
        });

        describe('with regular timer', () => {
            it('should stop the timer', () => {
                clockTime.start();
                sinonFakeTimer.tick(60000);
                clockTime.pause();
                expect(clockTime.isRunning()).eq(false);
                assertTimes(clockTime, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
            });

            it('should resume the timer when paused', () => {
                clockTime.start();
                sinonFakeTimer.tick(60000);
                clockTime.pause();
                sinonFakeTimer.tick(60000);
                clockTime.start();
                sinonFakeTimer.tick(60000);
                expect(clockTime.isRunning()).eq(true);
                assertTimes(clockTime, [0, 0, 2, 0, 0], [1200, 120, 2, 0, 0]);
            });
        });

        describe('with countdown timer', () => {
            it('should stop the timer', () => {
                clockTime.start(params);
                sinonFakeTimer.tick(60000);
                clockTime.pause();
                expect(clockTime.isRunning()).eq(false);
                assertTimes(clockTime, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
            });

            it('should resume the timer when paused', () => {
                clockTime.start(params);
                sinonFakeTimer.tick(60000);
                clockTime.pause();
                sinonFakeTimer.tick(60000);
                clockTime.start();
                sinonFakeTimer.tick(30000);
                expect(clockTime.isRunning()).eq(true);
                assertTimes(clockTime, [0, 30, 0, 0, 0], [300, 30, 0, 0, 0]);
            });
        });
    });

    describe('reset function', function () {
        beforeEach(function () {
            sinonFakeTimer = sinon.useFakeTimers();
        });

        afterEach(function () {
            sinonFakeTimer.restore();
        });

        it('should trigger reset event', function () {
            const callback = sinon.spy();
            clockTime.addEventListener('reset', callback);
            clockTime.start();
            clockTime.reset();
            sinon.assert.callCount(callback, 1);
            expect(clockTime).eq(callback.args[0][0].detail.timer);
        });

        it('should reset the timer', function () {
            clockTime.start();
            sinonFakeTimer.tick(60000);
            clockTime.reset();
            sinonFakeTimer.tick(10000);
            expect(clockTime.isRunning()).eq(true);
            assertTimes(clockTime, [0, 10, 0, 0, 0], [100, 10, 0, 0, 0]);
        });

        it('should reset the timer with startValues', function () {
            clockTime.start({ startValues: { seconds: 60 }, callback: sinon.spy() });
            sinonFakeTimer.tick(60000);
            clockTime.reset();
            sinonFakeTimer.tick(10000);
            expect(clockTime.isRunning()).eq(true);
            assertTimes(clockTime, [0, 10, 1, 0, 0], [700, 70, 1, 0, 0]);
        });

        it('should reset the timer when the target is achieved', function (done) {
            clockTime.start({ target: { seconds: 59 }, callback: sinon.spy() });
            clockTime.addEventListener('targetAchieved', () => {
                clockTime.reset();

                sinonFakeTimer.tick(10000);
                expect(clockTime.isRunning()).eq(true);
                assertTimes(clockTime, [0, 10, 0, 0, 0], [100, 10, 0, 0, 0]);

                done();
            });

            sinonFakeTimer.tick(60000);
        });
    });

    describe('removeEventListener function', function () {
        let secondsUpdatedListener: SinonSpy;
        let secondTimer: AwesomeTimer;
        beforeEach(function () {
            sinonFakeTimer = sinon.useFakeTimers();
            secondsUpdatedListener = sinon.spy();
            clockTime.start();
            secondTimer = new AwesomeTimer();
            secondTimer.start();
        });

        afterEach(function () {
            sinonFakeTimer.restore();
            clockTime.stop();
            secondTimer.stop();
        });

        it('should remove the listener from the event', function () {
            clockTime.addEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(2000);
            sinon.assert.callCount(secondsUpdatedListener, 2);

            clockTime.removeEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(2000);
            sinon.assert.callCount(secondsUpdatedListener, 2);

            secondTimer.addEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(1000);
            sinon.assert.callCount(secondsUpdatedListener, 3);

            clockTime.addEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(1000);
            sinon.assert.callCount(secondsUpdatedListener, 5);

            secondTimer.removeEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(1000);
            sinon.assert.callCount(secondsUpdatedListener, 6);

            clockTime.removeEventListener('secondsUpdated', secondsUpdatedListener);
            sinonFakeTimer.tick(1000);
            sinon.assert.callCount(secondsUpdatedListener, 6);
        });
    });

    describe('with instance default params', () => {
        let timer: AwesomeTimer;
        const callback = () => {
            return;
        };

        beforeEach(() => {
            timer = new AwesomeTimer({
                startValues: { seconds: 10 },
                target: { seconds: 20 },
                precision: Unit.MINUTES,
                callback,
            });
        });

        afterEach(() => {
            timer.stop();
        });

        it('should start the timer with the default params set in the instance creation', () => {
            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });

            timer.start();
            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });
        });

        it('should merge the default params with the params set in the start function', () => {
            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });

            timer.start({
                precision: Unit.SECONDS,
                target: { minutes: 1 },
                startValues: { minutes: 1, seconds: 30 },
                countdown: true,
            });
            expect(timer.getConfig()).deep.eq({
                precision: Unit.SECONDS,
                callback,
                countdown: true,
                target: {
                    secondTenths: 0,
                    seconds: 0,
                    minutes: 1,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 30,
                    minutes: 1,
                    hours: 0,
                    days: 0,
                },
            });
        });

        it('should keep the default values when the timer is stopped and started again', () => {
            timer.start();
            timer.stop();
            timer.start();

            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });
        });

        it('should keep the default values when the timer is reset', () => {
            timer.start();
            timer.reset();

            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });
        });

        it('should keep the default values when the timer is paused', () => {
            timer.start();
            timer.pause();

            expect(timer.getConfig()).deep.eq({
                precision: Unit.MINUTES,
                callback,
                countdown: false,
                target: {
                    secondTenths: 0,
                    seconds: 20,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
                startValues: {
                    secondTenths: 0,
                    seconds: 10,
                    minutes: 0,
                    hours: 0,
                    days: 0,
                },
            });
        });

        it('should run like a timer without default params', () => {
            sinonFakeTimer = sinon.useFakeTimers();
            const target: TimeValues = {
                seconds: 5,
                minutes: 5,
            };
            timer.start({
                target: target,
                precision: Unit.SECONDS,
                startValues: { seconds: 0 },
            });
            assertEventTriggered(timer, 'targetAchieved', 305000, 1);
            expect(!timer.isRunning()).to.be.true;
            sinonFakeTimer.restore();
        });
    });
});

const assertTimes = (timer: AwesomeTimer, timesValues: number[], totalTimesValues: number[]) => {
    const times = timer.getTimeValues();
    const totalTimes = timer.getTotalTimeValues();

    expect(times.secondTenths).eq(timesValues[0]);
    expect(times.seconds).eq(timesValues[1]);
    expect(times.minutes).eq(timesValues[2]);
    expect(times.hours).eq(timesValues[3]);
    expect(times.days).eq(timesValues[4]);

    expect(totalTimes.secondTenths).eq(totalTimesValues[0]);
    expect(totalTimes.seconds).eq(totalTimesValues[1]);
    expect(totalTimes.minutes).eq(totalTimesValues[2]);
    expect(totalTimes.hours).eq(totalTimesValues[3]);
    expect(totalTimes.days).eq(timesValues[4]);
};

const assertEventTriggered = (timer: AwesomeTimer, event: EventTypes, millisecons: number, timesTriggered: number) => {
    const callback = sinon.spy();
    timer.addEventListener(event, callback);
    sinonFakeTimer.tick(millisecons);
    sinon.assert.callCount(callback, timesTriggered);
    expect(timer).eq(callback.args[0][0].detail.timer);
};
