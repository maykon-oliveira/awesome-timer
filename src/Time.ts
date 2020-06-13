import { leftPadding } from './utils';
import { Unit } from './types';

const defaultUnits = [Unit.HOURS, Unit.MINUTES, Unit.SECONDS];
const defaultSeparator = ':';
const defaultLeftZeroPadding = 2;

export class Time {
    secondTenths = 0;
    seconds = 0;
    minutes = 0;
    hours = 0;
    days = 0;

    reset() {
        this.secondTenths = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.days = 0;
    }

    toString({
        units = defaultUnits,
        separator = defaultSeparator,
        leftZeroPadding = defaultLeftZeroPadding,
    } = {}): string {
        const mapUnit = (unit: Unit) => {
            if (unit === Unit.SECOND_TENTHS) {
                return this.secondTenths;
            } else {
                return leftPadding(this.getProperty(unit), leftZeroPadding, '0');
            }
        };

        const arrayTime = units.map(mapUnit);

        return arrayTime.join(separator);
    }

    private getProperty(unit: Unit): number {
        switch (unit) {
            case Unit.DAYS:
                return this.days;
            case Unit.HOURS:
                return this.hours;
            case Unit.MINUTES:
                return this.minutes;
            case Unit.SECONDS:
                return this.seconds;
            default:
                return 0;
        }
    }
}
