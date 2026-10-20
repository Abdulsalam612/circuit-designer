import type { KidsCircuitMission, Piece } from '@/types/kids';

// Part 1, mission 6: the torch's circuit is built but a bit of wire is missing. The child
// tries six everyday things in the gap. Metal ones (coin, key, paper clip) let electricity
// through and the torch lights; rubber, wood and plastic don't. Every result is recorded in
// "What you found out"; the mission is done when all six are tested and the torch shines.
//
//   o──o[ bulb ]o──o──o
//   │                 │
//  [+]                │
//  [battery]          │
//   o──o──o  TEST  o──o──o      (the gap is from column 3 to 4 on the bottom row)

const fixed = (p: Omit<Piece, 'fixed'>): Piece => ({ ...p, fixed: true });
const wire = (c: number, r: number, dir: 'h' | 'v') => fixed({ id: `torch-wire-${c}-${r}-${dir}`, kind: 'wire', at: { c, r }, dir });

const doesItConduct: KidsCircuitMission = {
  kind: 'circuit',
  id: 'does-it-conduct',
  title: 'Does it conduct?',
  story: 'The cat is hiding under the bed and it’s dark. The torch is broken: a bit of wire is missing. What in your pocket could fill the gap?',
  brief: 'Test each thing in the gap to see if it lets electricity through. Test all six, then get the torch shining.',
  hint: 'Things that let electricity through are called conductors. Look at what each thing is made of: what do the ones that work have in common?',
  topic: 'Conductors',
  learn: 'metals let electricity through (conductors); rubber, wood and plastic don’t (insulators)',
  board: { cols: 6, rows: 5 },
  tray: [
    { kind: 'coin', count: 1 },
    { kind: 'eraser', count: 1 },
    { kind: 'key', count: 1 },
    { kind: 'stick', count: 1 },
    { kind: 'clip', count: 1 },
    { kind: 'spoon', count: 1 },
  ],
  start: [
    fixed({ id: 'torch-battery', kind: 'battery', at: { c: 0, r: 1 }, dir: 'v' }),
    fixed({ id: 'torch-bulb', kind: 'lamp', at: { c: 1, r: 0 }, dir: 'h' }),
    wire(0, 0, 'v'), wire(0, 0, 'h'), wire(3, 0, 'h'), wire(4, 0, 'h'),
    wire(5, 0, 'v'), wire(5, 1, 'v'), wire(5, 2, 'v'),
    wire(0, 3, 'h'), wire(1, 3, 'h'), wire(3, 3, 'h'), wire(4, 3, 'h'),
  ],
  testGap: { at: { c: 2, r: 3 }, dir: 'h' },
  goals: [
    { kind: 'things-tested', text: 'Test all six things', count: 6 },
    { kind: 'lamp-lit', text: 'The torch shines' },
  ],
  scene: 'torch',
};

export default doesItConduct;
