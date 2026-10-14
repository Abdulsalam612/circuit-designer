import type { KidsCircuitMission } from '@/types/kids';

// Part 1, mission 3: two headlight bulbs from one 4.5 V battery. Most children put the bulbs
// in a row first: both light, but each gets half the push (about a third as bright), so only
// the first goal is met and the feedback nudges them on. Side by side (in parallel) each bulb
// gets the battery's full push and both shine brightly. One answer (tests check it):
//
//   o──o[ bulb ]o──o
//   │              │
//  [+]──o[ bulb ]o──o
//  [battery]       │
//   o──o──o──o──o──o
//
// (The "in a row" version is in the tests too.)

const lightsOn: KidsCircuitMission = {
  kind: 'circuit',
  id: 'lights-on',
  title: 'Lights on',
  story: 'It’s getting dark and the car has to drive home. It needs two bright headlights first.',
  brief: 'Light up both headlight bulbs from one battery, and make them both shine brightly.',
  hint: 'Two bulbs in a row share the battery’s push, so both are dim. Give each bulb its own path from one end of the battery to the other.',
  learn: 'bulbs in a row share the push; side by side, each gets all of it',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'battery', count: 1 },
    { kind: 'lamp', count: 2 },
    { kind: 'wire', count: 14 },
  ],
  start: [],
  goals: [
    { kind: 'lamp-lit', text: 'Both headlights are on', count: 2, minBrightness: 0.2 },
    { kind: 'lamp-lit', text: 'Both headlights shine brightly', count: 2, minBrightness: 0.8 },
    { kind: 'no-short', text: 'No short circuit' },
  ],
};

export default lightsOn;
