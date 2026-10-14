import type { Piece } from '@/types/kids';

// The finished "Make it go" loop on a 6 x 5 board, which later Part 1 missions start from:
//
//   o──o──o[ motor ]o
//   │              │
//  [+]             │
//  [battery]       │
//   o──o──o──o──o──o
//
// Ids are fixed so the tests can find the battery and the motor.

const wire = (c: number, r: number, dir: 'h' | 'v'): Piece => ({ id: `start-wire-${c}-${r}-${dir}`, kind: 'wire', at: { c, r }, dir });

export const FIRST_LOOP: Piece[] = [
  { id: 'start-battery', kind: 'battery', at: { c: 0, r: 1 }, dir: 'v' },
  { id: 'start-motor', kind: 'motor', at: { c: 2, r: 0 }, dir: 'h' },
  wire(0, 0, 'v'), wire(0, 0, 'h'), wire(1, 0, 'h'), wire(4, 0, 'h'),
  wire(5, 0, 'v'), wire(5, 1, 'v'), wire(5, 2, 'v'),
  wire(0, 3, 'h'), wire(1, 3, 'h'), wire(2, 3, 'h'), wire(3, 3, 'h'), wire(4, 3, 'h'),
];
