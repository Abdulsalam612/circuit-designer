// Checks dragging a wire sideways (moveWire) and branch points. Run with: npm test
import { isLayoutValid, moveWire, nearestPointOnWire, normalizeWires } from '../src/lib/wires';
import { simulate } from '../src/lib/simulation';
import type { CircuitComponent, Wire } from '../src/types/circuit';

let fails = 0, passes = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};
const w = (id: string, x1: number, y1: number, x2: number, y2: number): Wire => ({ id, x1, y1, x2, y2 });
const has = (wires: Wire[], x1: number, y1: number, x2: number, y2: number) =>
  wires.some(v => (v.x1 === x1 && v.y1 === y1 && v.x2 === x2 && v.y2 === y2) || (v.x1 === x2 && v.y1 === y2 && v.x2 === x1 && v.y2 === y1));
const show = (wires: Wire[] | null) => JSON.stringify(wires?.map(v => [v.x1, v.y1, v.x2, v.y2]));

// Battery (+ at 60,200) and lamp joined by two vertical wires
const battery: CircuitComponent = { id: 'b', type: 'battery', x: 100, y: 200, rotation: 0, value: 9 };
const lamp: CircuitComponent = { id: 'l', type: 'lamp', x: 100, y: 0, rotation: 0, value: 100 };
const parts = [battery, lamp];
const loop = [w('left', 60, 200, 60, 0), w('right', 140, 200, 140, 0)];

{ // Moving a wire between two lead ends: it moves, and each lead end gets a stub to it
  const moved = moveWire(parts, loop, 'left', { x: -40, y: 0 });
  check('move returns layout', moved !== null);
  const tidy = normalizeWires(moved!, parts);
  check('wire moved out', has(tidy, 20, 200, 20, 0), show(tidy));
  check('stub at battery', has(tidy, 60, 200, 20, 200), show(tidy));
  check('stub at lamp', has(tidy, 60, 0, 20, 0), show(tidy));
  check('still valid', isLayoutValid(parts, tidy));
  // Still the same circuit: the lamp stays lit
  const lit = simulate({ components: parts, wires: tidy }).readings.l.brightness ?? 0;
  check('lamp still lit', lit > 0.9, String(lit));
}

{ // Movement along the wire is ignored
  const moved = moveWire(parts, loop, 'left', { x: 0, y: 40 });
  check('along-axis move ignored', moved === loop);
}

{ // Can't drag a wire across a part's body
  const moved = moveWire(parts, loop, 'left', { x: 40, y: 0 });
  check('blocked by body', moved === null, show(moved));
}

{ // An attached wire running the way the wire moves just stretches (no detour)
  //   top wire (0,0)-(100,0), side wire (100,0)-(100,100); move top down by 40
  const wires = [w('top', 0, 0, 100, 0), w('side', 100, 0, 100, 100)];
  const moved = normalizeWires(moveWire([], wires, 'top', { x: 0, y: 40 })!, []);
  check('top moved', has(moved, 0, 40, 100, 40), show(moved));
  check('side shortened', has(moved, 100, 40, 100, 100), show(moved));
  check('no extra wires', moved.length === 2, show(moved));
}

{ // Moving back restores the original wires
  const there = normalizeWires(moveWire(parts, loop, 'left', { x: -40, y: 0 })!, parts);
  const movedId = there.find(v => v.x1 === 20 && v.x2 === 20)!.id;
  const back = normalizeWires(moveWire(parts, there, movedId, { x: 40, y: 0 })!, parts);
  check('moved back straight', has(back, 60, 200, 60, 0) && back.length === 2, show(back));
}

// Branch points snap to the grid and stay on the wire
check('branch snaps', JSON.stringify(nearestPointOnWire(w('h', 0, 0, 100, 0), { x: 47, y: 9 })) === '{"x":40,"y":0}');
check('branch clamps', JSON.stringify(nearestPointOnWire(w('v', 20, 0, 20, 60), { x: 30, y: 200 })) === '{"x":20,"y":60}');

console.log(fails ? `${fails} wire checks FAILED, ${passes} passed` : `all ${passes} wire checks passed`);
if (fails) process.exit(1);
