export enum Unit {
    HOURS = 'hours',
    MINUTES = 'minutes',
    SECONDS = 'seconds',
    SECOND_TENTHS = 'secondTenths',
    DAYS = 'days',
}

export interface TimeValues {
    secondTenths?: number;
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
}

export interface ClockTimerConfig {
    precision?: Unit;
    callback?: () => void;
    countdown?: boolean;
    startValues?: TimeValues;
    target?: TimeValues;
}
