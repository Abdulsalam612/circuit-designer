import type { KidsCircuitMission } from '@/types/kids';
import { FIRST_LOOP } from './first-loop';

// Part 1, mission 2: starts from a finished "Make it go" loop. The car crawls at half speed
// and can't be stopped, so the child takes wires off the bottom of the loop to make room for
// a second battery (two in a row push twice as hard: full speed) and a switch (start and stop).
// One answer (tests check it):
//
//   o──o──o[ motor ]o
//   │              │
//  [+]             │
//  [battery]       │
//   o[+ battery]o[switch]o──o
//
// A battery facing the wrong way cancels the first one out, and the kid feedback says so.

const faster: KidsCircuitMission = {
  kind: 'circuit',
  id: 'faster',
  title: 'Faster!',
  story: 'The car works, but it crawls along and there is no way to stop it. Give it more push and an on/off switch.',
  brief: 'Add a second battery so the motor runs at full speed, and a switch so you can start and stop the car. Take wires off the loop to make room.',
  hint: 'Take two wires off the bottom of the loop for each new piece. Point both batteries’ + ends the same way round the loop, or they cancel out.',
  topic: 'More power',
  learn: 'two batteries in a row push harder, and a switch opens and closes the loop',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'battery', count: 2 },
    { kind: 'motor', count: 1 },
    { kind: 'switch', count: 1 },
    { kind: 'wire', count: 12 },
  ],
  start: FIRST_LOOP,
  goals: [
    { kind: 'motor-spins', text: 'The car goes at full speed', minSpeed: 0.9 },
    { kind: 'switch-controls', text: 'The switch starts and stops the car' },
    { kind: 'no-short', text: 'No short circuit' },
  ],
};

export default faster;
