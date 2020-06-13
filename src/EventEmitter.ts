export type EventTypes =
    | 'started'
    | 'reset'
    | 'daysUpdated'
    | 'paused'
    | 'hoursUpdated'
    | 'secondsUpdated'
    | 'minutesUpdated'
    | 'secondTenthsUpdated'
    | 'targetAchieved'
    | 'stopped';

export class EventEmitter {
    events: { [key: string]: ((data?: any) => void)[] } = {};

    on(event: EventTypes, listener: (data?: any) => void) {
        if (!this.events[event]) {
            this.events[event] = [listener];
            return;
        }
        this.events[event].push(listener);
    }

    removeListener(event: EventTypes, listener: (data?: any) => void) {
        const e = this.events[event];
        if (e) {
            this.events[event] = e.filter((f) => f !== listener);
        }
    }

    emit(event: EventTypes, data?: any) {
        const listeners = this.events[event];
        if (listeners && listeners.length) {
            listeners.forEach((listen) => listen(data));
        }
    }
}
