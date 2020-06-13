import { ClockTime } from '../../src/ClockTime';

const clock = new ClockTime();

clock.start();

clock.addEventListener('started', () => {
    console.log(4654645);
});

clock.stop();
