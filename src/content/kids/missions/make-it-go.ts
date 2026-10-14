import type { KidsCircuitMission } from '@/types/kids';

// Part 1, mission 1: the very first circuit. A battery, a motor and wire pieces; the car only
// moves once the loop is complete. The board is 6 x 5 studs; one tidy solution (tests check it):
//
//   o──o──o[ motor ]o
//   │              │
//  [+]             o
//  [battery]       │
//   o──o──o──o──o──o
//
// The battery is 4.5 V, so the motor runs at half speed – "Faster!" (two batteries) comes next.

const makeItGo: KidsCircuitMission = {
  kind: 'circuit',
  id: 'make-it-go',
  title: 'Make it go',
  story: 'The car has a battery and a motor, but nothing joins them up. Build the loop that makes it drive.',
  brief: 'Place the battery and the motor, then join them with wires so electricity can flow out of the battery, through the motor, and back again.',
  hint: 'Follow the path with your finger: can you get from one end of the battery all the way round to the other end?',
  learn: 'a circuit must be a complete loop',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'battery', count: 1 },
    { kind: 'motor', count: 1 },
    { kind: 'wire', count: 12 },
  ],
  start: [],
  goals: [
    { kind: 'motor-spins', text: 'The motor spins' },
    { kind: 'no-short', text: 'No short circuit' },
  ],
};

export default makeItGo;
