import type { KidsCircuitMission } from '@/types/kids';
import { FIRST_LOOP } from './first-loop';

// Part 1, mission 5 – not a car: a desk fan. The motor drives the fan blades. Straight from
// the battery it runs at half speed and the papers blow off the desk, so the child adds a
// resistor, which makes it harder for electricity to flow: the fan slows to a quarter speed,
// a gentle breeze. One answer (tests check it): take two bottom wires off, put the resistor
// there.

const gentleBreeze: KidsCircuitMission = {
  kind: 'circuit',
  id: 'gentle-breeze',
  title: 'Gentle breeze',
  story: 'It’s a hot day and the desk fan is blowing so hard that all the homework flies away!',
  brief: 'Slow the fan down to a gentle breeze, so it still spins but the papers stay on the desk. Try the resistor.',
  hint: 'A resistor makes it harder for electricity to flow, so less gets through the motor. Take two wires out of the loop and put the resistor in their place.',
  topic: 'Resistors',
  learn: 'a resistor slows the electricity down',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'battery', count: 1 },
    { kind: 'motor', count: 1 },
    { kind: 'resistor', count: 1 },
    { kind: 'wire', count: 12 },
  ],
  start: FIRST_LOOP,
  goals: [
    { kind: 'motor-spins', text: 'The fan spins', minSpeed: 0.15 },
    { kind: 'motor-spins', text: 'Gentle enough that the papers stay on the desk', minSpeed: 0.15, maxSpeed: 0.35 },
    { kind: 'no-short', text: 'No short circuit' },
  ],
  scene: 'fan',
};

export default gentleBreeze;
