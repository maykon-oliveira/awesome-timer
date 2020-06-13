import { Time } from './Time';
import {
    SECOND_TENTHS_PER_SECOND,
    SECONDS_PER_MINUTE,
    MINUTES_PER_HOUR,
    HOURS_PER_DAY,
    SECOND_TENTHS_POSITION,
    SECONDS_POSITION,
    MINUTES_POSITION,
    HOURS_POSITION,
    DAYS_POSITION,
    DAYS,
} from './constants';
import { ClockTimerConfig as ClockTimeConfig, Unit, TimeValues } from './types';
import { calculateIntegerUnitQuotient, mod } from './utils';
import { EventEmitter, EventTypes } from './EventEmitter';

const unitsInMilliseconds = {
    [Unit.SECOND_TENTHS]: 100,
    [Unit.SECONDS]: 1000,
    [Unit.MINUTES]: 60000,
    [Unit.HOURS]: 3600000,
    [Unit.DAYS]: 86400000,
};

const groupedUnits = {
    secondTenths: SECOND_TENTHS_PER_SECOND,
    seconds: SECONDS_PER_MINUTE,
    minutes: MINUTES_PER_HOUR,
    hours: HOURS_PER_DAY,
};

const easyTimerDefaultParams: ClockTimeConfig = {
    precision: Unit.SECONDS,
    callback: () => {
        return;
    },
    countdown: false,
    startValues: {
        days: 0,
        hours: 0,
        minutes: 0,
        secondTenths: 0,
        seconds: 0,
    },
};

export class ClockTime {
    private time = new Time();
    private totalTime = new Time();
    private clockInterval?: any;
    private eventEmitter = new EventEmitter();
    private _running = false;
    private _paused = false;
    private precision: Unit = Unit.SECONDS;
    private timerTypeFactor = 1;
    private clockCallback?: any;
    private clockConfig: ClockTimeConfig = {};
    private currentParams: ClockTimeConfig;
    private targetValues?: TimeValues;
    private startValues: TimeValues = {};
    private countdown = false;
    private startingDate = 0;
    private targetDate = 0;
    private eventData = {
        detail: {
            timer: this,
        },
    };

    constructor(defaultParams: ClockTimeConfig = easyTimerDefaultParams) {
        this.currentParams = defaultParams;
        this.setParams(defaultParams);
    }

    private setParams(params: ClockTimeConfig) {
        this.precision = params.precision || this.precision;
        this.countdown = params.countdown || this.countdown;
        this.clockCallback = params.callback || this.clockConfig.callback;

        this.timerTypeFactor = this.countdown ? -1 : 1;

        this.setStartValues(params.startValues);

        this.startingDate = this.calculateStartingDate();

        this.updateTimer();

        if (typeof params.target === 'object') {
            this.setTarget(params.target);
        } else if (this.countdown) {
            params.target = { seconds: 0 };
            this.setTarget(params.target);
        } else {
            this.targetValues = undefined;
        }

        let startValues = this.startValues as any;
        if (params.startValues) {
            startValues = {
                secondTenths: params.startValues.secondTenths || 0,
                seconds: params.startValues.seconds || 0,
                minutes: params.startValues.minutes || 0,
                hours: params.startValues.hours || 0,
                days: params.startValues.days || 0,
            };
        }

        this.clockConfig = {
            precision: this.precision,
            callback: this.clockCallback,
            countdown: typeof params === 'object' && params.countdown === true,
            target: this.targetValues,
            startValues,
        };

        this.currentParams = params;
    }

    private setStartValues({ secondTenths = 0, seconds = 0, minutes = 0, hours = 0, days = 0 }: TimeValues = {}) {
        this.startValues = this.calculateQuotients({
            secondTenths,
            seconds,
            minutes,
            hours,
            days,
        });
        this.time.secondTenths = this.startValues.secondTenths || 0;
        this.time.seconds = this.startValues.seconds || 0;
        this.time.minutes = this.startValues.minutes || 0;
        this.time.hours = this.startValues.hours || 0;
        this.time.days = this.startValues.days || 0;

        this.totalTime = this.calculateTotalCounterFromValues(this.startValues, this.totalTime);
    }

    private calculateQuotients({
        secondTenths = 0,
        seconds = 0,
        minutes = 0,
        hours = 0,
        days = 0,
    }: TimeValues): TimeValues {
        const values: number[] = [secondTenths, seconds, minutes, hours, days];
        const secondTenthsPos = values[SECOND_TENTHS_POSITION];
        let secondsPos = values[SECONDS_POSITION];
        let minutesPos = values[MINUTES_POSITION];
        let hoursPos = values[HOURS_POSITION];
        let daysPos = values[DAYS_POSITION];

        secondsPos += calculateIntegerUnitQuotient(secondTenthsPos, SECOND_TENTHS_PER_SECOND);
        minutesPos += calculateIntegerUnitQuotient(secondsPos, SECONDS_PER_MINUTE);
        hoursPos += calculateIntegerUnitQuotient(minutesPos, MINUTES_PER_HOUR);
        daysPos += calculateIntegerUnitQuotient(hoursPos, HOURS_PER_DAY);

        values[SECOND_TENTHS_POSITION] = secondTenthsPos % SECOND_TENTHS_PER_SECOND;
        values[SECONDS_POSITION] = secondsPos % SECONDS_PER_MINUTE;
        values[MINUTES_POSITION] = minutesPos % MINUTES_PER_HOUR;
        values[HOURS_POSITION] = hoursPos % HOURS_PER_DAY;
        values[DAYS_POSITION] = daysPos;

        return {
            secondTenths: values[SECOND_TENTHS_POSITION],
            seconds: values[SECONDS_POSITION],
            minutes: values[MINUTES_POSITION],
            hours: values[HOURS_POSITION],
            days: values[DAYS_POSITION],
        };
    }

    private calculateTotalCounterFromValues(
        { days = 0, hours = 0, minutes = 0, seconds = 0, secondTenths = 0 }: TimeValues,
        outputCounter: any = {},
    ) {
        const total = outputCounter;

        total.days = days;
        total.hours = total.days * HOURS_PER_DAY + hours;
        total.minutes = total.hours * MINUTES_PER_HOUR + minutes;
        total.seconds = total.minutes * SECONDS_PER_MINUTE + seconds;
        total.secondTenths = total.seconds * SECOND_TENTHS_PER_SECOND + secondTenths;

        return total;
    }

    private calculateStartingDate() {
        return (
            this.roundTimestamp(Date.now()) -
            this.totalTime.secondTenths * unitsInMilliseconds[Unit.SECOND_TENTHS] * this.timerTypeFactor
        );
    }

    private roundTimestamp(timestamp: number) {
        return Math.floor(timestamp / unitsInMilliseconds[this.precision]) * unitsInMilliseconds[this.precision];
    }

    private updateTimer(currentTime = this.roundTimestamp(Date.now())) {
        const elapsedTime =
            this.timerTypeFactor > 0 ? currentTime - this.startingDate : this.startingDate - currentTime;

        return {
            [Unit.SECOND_TENTHS]: this.updateSecondTenths(elapsedTime),
            [Unit.SECONDS]: this.updateSeconds(elapsedTime),
            [Unit.MINUTES]: this.updateMinutes(elapsedTime),
            [Unit.HOURS]: this.updateHours(elapsedTime),
            [Unit.DAYS]: this.updateDays(elapsedTime),
        };
    }

    private updateDays(value: number) {
        return this.updateUnitByPrecision(value, Unit.DAYS);
    }

    private updateHours(value: number) {
        return this.updateUnitByPrecision(value, Unit.HOURS);
    }

    private updateMinutes(value: number) {
        return this.updateUnitByPrecision(value, Unit.MINUTES);
    }

    private updateSeconds(value: number) {
        return this.updateUnitByPrecision(value, Unit.SECONDS);
    }

    private updateSecondTenths(value: number) {
        return this.updateUnitByPrecision(value, Unit.SECOND_TENTHS);
    }

    private updateUnitByPrecision(value: number, precision: Unit) {
        const previousValue = this.totalTime[precision];
        this.updateCounters(precision, calculateIntegerUnitQuotient(value, unitsInMilliseconds[precision]));

        return this.totalTime[precision] !== previousValue;
    }

    private setTarget({ secondTenths = 0, seconds = 0, minutes = 0, hours = 0, days = 0 }: TimeValues = {}) {
        this.targetValues = this.calculateQuotients({
            secondTenths,
            seconds,
            minutes,
            hours,
            days,
        });
        const targetCounter = this.calculateTotalCounterFromValues(this.targetValues);
        this.targetDate =
            this.startingDate +
            targetCounter.secondTenths * unitsInMilliseconds[Unit.SECOND_TENTHS] * this.timerTypeFactor;
    }

    stop() {
        this.stopTimerAndResetCounters();
        this.dispatchEvent('stopped', this.eventData);
    }

    private stopTimerAndResetCounters() {
        this.stopTimer();
        this.resetCounters();
    }

    private resetCounters() {
        this.time.reset();
        this.totalTime.reset();
    }

    private stopTimer() {
        clearInterval(this.clockInterval);
        this.clockInterval = undefined;
        this._running = false;
        this._paused = false;
    }

    reset() {
        this.stopTimerAndResetCounters();
        this.setParamsAndStartTimer(this.currentParams);
        this.dispatchEvent('reset', this.eventData);
    }

    private setParamsAndStartTimer(params: ClockTimeConfig) {
        if (!this.isPaused()) {
            this.setParams(params);
        } else {
            this.startingDate = this.calculateStartingDate();
            this.setTarget(this.currentParams.target);
        }

        this.startTimer();
    }

    isRunning() {
        return this._running;
    }

    isPaused() {
        return this._paused;
    }

    getTimeValues() {
        return this.time;
    }

    getTotalTimeValues() {
        return this.totalTime;
    }

    getConfig() {
        return this.clockConfig;
    }

    private startTimer() {
        const interval = unitsInMilliseconds[this.precision];

        if (this.isTargetAchieved(this.roundTimestamp(Date.now()))) {
            return;
        }

        this.clockInterval = setInterval(this.updateTimerAndDispatchEvents, interval);

        this._running = true;

        this._paused = false;
    }

    private isTargetAchieved(currentDate: number) {
        const hasTarget = Object.keys(this.targetValues || {})
            .map((key) => (this.targetValues as any)[key])
            .some((v) => v !== 0);
        return hasTarget && currentDate >= this.targetDate;
    }

    private updateTimerAndDispatchEvents = () => {
        const currentTime = this.roundTimestamp(Date.now());
        const valuesUpdated = this.updateTimer();

        this.dispatchEvents(valuesUpdated);

        this.clockCallback(this.eventData.detail.timer);
        if (this.isTargetAchieved(currentTime)) {
            this.stop();
            this.dispatchEvent('targetAchieved', this.eventData);
        }
    };

    private dispatchEvents(valuesUpdated: any) {
        if (valuesUpdated[Unit.SECOND_TENTHS]) {
            this.dispatchEvent('secondTenthsUpdated', this.eventData);
        }
        if (valuesUpdated[Unit.SECONDS]) {
            this.dispatchEvent('secondsUpdated', this.eventData);
        }
        if (valuesUpdated[Unit.MINUTES]) {
            this.dispatchEvent('minutesUpdated', this.eventData);
        }
        if (valuesUpdated[Unit.HOURS]) {
            this.dispatchEvent('hoursUpdated', this.eventData);
        }
        if (valuesUpdated[Unit.DAYS]) {
            this.dispatchEvent('daysUpdated', this.eventData);
        }
    }

    start(params: ClockTimeConfig = this.clockConfig) {
        if (this.isRunning()) {
            return;
        }

        this.setParamsAndStartTimer(params);
        this.dispatchEvent('started', this.eventData);
    }

    pause() {
        this.stopTimer();
        this._paused = true;
        this.dispatchEvent('paused', this.eventData);
    }

    private updateCounters(precision: 'secondTenths' | 'seconds' | 'minutes' | 'hours' | 'days', roundedValue: number) {
        this.totalTime[precision] = roundedValue;

        if (precision === DAYS) {
            this.time[precision] = roundedValue;
        } else if (roundedValue >= 0) {
            this.time[precision] = mod(roundedValue, groupedUnits[precision]);
        } else {
            this.time[precision] = groupedUnits[precision] - mod(roundedValue, groupedUnits[precision]);
        }
    }

    addEventListener(type: EventTypes, listener: (data?: any) => void) {
        this.eventEmitter.on(type, listener);
    }

    removeEventListener(eventType: EventTypes, listener: any) {
        this.eventEmitter.removeListener(eventType, listener);
    }

    private dispatchEvent(type: EventTypes, data: any) {
        this.eventEmitter.emit(type, data);
    }
}
