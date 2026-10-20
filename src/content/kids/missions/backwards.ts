import type { KidsCircuitMission } from '@/types/kids';
import { FIRST_LOOP } from './first-loop';

// Part 1, mission 4: the car is parked nose-first against the garage wall and must reverse
// out. Turning the battery round reverses the current, so the motor (and the car) runs the
// other way. Turning the motor round works too – both are right, and the tests check both.

const backwards: KidsCircuitMission = {
  kind: 'circuit',
  id: 'backwards',
  title: 'Backwards',
  story: 'The car parked nose-first against the garage wall. To get out, it has to drive backwards.',
  brief: 'Make the motor run the other way so the car reverses out of the garage. You don’t need any new pieces.',
  hint: 'Electricity flows out of the battery’s + end and back into its − end. What happens if you tap the battery and turn it around?',
  topic: 'Which way round',
  learn: 'turning the battery round makes the electricity, and the motor, go the other way',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'battery', count: 1 },
    { kind: 'motor', count: 1 },
    { kind: 'wire', count: 12 },
  ],
  start: FIRST_LOOP,
  goals: [
    { kind: 'motor-spins', text: 'The car drives backwards', direction: 'backwards' },
    { kind: 'no-short', text: 'No short circuit' },
  ],
};

export default backwards;
