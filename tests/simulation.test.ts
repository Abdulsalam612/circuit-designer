// Checks the DC solver against circuits worked out by hand. Run with: npm test
import { simulate } from '../src/lib/simulation';
import type { CircuitComponent, ComponentType } from '../src/types/circuit';

type Extra = Partial<Pick<CircuitComponent, 'rotation' | 'closed'>>;

let fails = 0, passes = 0;
const near = (a: number, b: number, tol = 0.01) => Math.abs(a - b) <= Math.max(tol, Math.abs(b) * 0.01);
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};
let n = 0;
const id = (t: string) => `${t}-${n++}`;
// Horizontal part centred at (x,y): ends at x-40 and x+40 (first end = left)
const part = (type: ComponentType, x: number, y: number, value?: number, extra: Extra = {}): CircuitComponent =>
  ({ id: id(type), type, x, y, rotation: 0, ...(value !== undefined ? { value } : {}), ...extra });
const wire = (x1: number, y1: number, x2: number, y2: number) => ({ id: id('w'), x1, y1, x2, y2 });

// A loop: battery on the bottom row (y=200, + end at x=60, - end at x=140), parts in a
// chain on the top row starting at x=60, joined at both sides
const loop = (top: CircuitComponent[], batV = 9) => {
  const bat = part('battery', 100, 200, batV);
  const rightEnd = 60 + 80 * top.length;
  const ws = [wire(60, 200, 60, 0), wire(140, 200, rightEnd, 200), wire(rightEnd, 200, rightEnd, 0)];
  return { comps: [bat, ...top], ws, bat };
};
const topRow = (types: [ComponentType, number?, Extra?][]) => types.map(([t, v, e], i) => part(t, 100 + 80 * i, 0, v, e));

{ // 1. 9 V across 1 kΩ -> ~9 mA
  const top = topRow([['resistor', 1000]]);
  const { comps, ws, bat } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  const R = r.readings[top[0].id];
  check('1k current', near(R.current, 0.009, 0.0002), JSON.stringify(R));
  check('1k voltage', near(R.voltage, 9, 0.01), JSON.stringify(R));
  check('battery delivers', near(r.readings[bat.id].current, 0.009, 0.0002));
  check('no warnings', r.warnings.length === 0, JSON.stringify(r.warnings));
}
{ // 2. Voltage divider 1k + 2k on 9 V -> 3 V and 6 V
  const top = topRow([['resistor', 1000], ['resistor', 2000]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('divider 1k', near(r.readings[top[0].id].voltage, 3), JSON.stringify(r.readings[top[0].id]));
  check('divider 2k', near(r.readings[top[1].id].voltage, 6));
}
{ // 3. LED + 330 Ω on 9 V, Vf 2 V -> (9-2)/(330+10) ≈ 20.6 mA, lit, not overloaded
  const top = topRow([['led', 2], ['resistor', 330]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  const L = r.readings[top[0].id];
  check('led current', near(L.current, 7 / 340, 0.0005), JSON.stringify(L));
  check('led lit', (L.brightness ?? 0) > 0.9);
  check('led ok', !L.overloaded && r.warnings.length === 0, JSON.stringify(r.warnings));
}
{ // 4. LED alone on 9 V -> overload warning
  const top = topRow([['led', 2]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('led overload', !!r.readings[top[0].id].overloaded && r.warnings.some(w => w.kind === 'led-overload'), JSON.stringify(r.warnings));
}
{ // 5. LED flipped (rotation 180) -> no current, reversed warning
  const top = topRow([['led', 2, { rotation: 180 }], ['resistor', 330]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('reversed led dark', (r.readings[top[0].id].brightness ?? 0) === 0, JSON.stringify(r.readings[top[0].id]));
  check('reversed warning', r.warnings.some(w => w.kind === 'led-reversed'), JSON.stringify(r.warnings));
}
{ // 6. Battery shorted by a wire -> short-circuit warning
  const bat = part('battery', 100, 200, 9);
  const r = simulate({ components: [bat], wires: [wire(60, 200, 60, 160), wire(60, 160, 140, 160), wire(140, 160, 140, 200)] });
  check('short', r.warnings.some(w => w.kind === 'short-circuit'), JSON.stringify(r.warnings));
}
{ // 7. Open switch -> no current, open-circuit warning; closed -> current flows
  const top = topRow([['switch', undefined, { closed: false }], ['lamp', 100]]);
  const { comps, ws, bat } = loop(top);
  let r = simulate({ components: comps, wires: ws });
  check('open switch no current', r.readings[bat.id].current === 0 && r.warnings.some(w => w.kind === 'open-circuit'), JSON.stringify(r.warnings));
  check('open switch lamp dark', (r.readings[top[1].id].brightness ?? 0) === 0);
  top[0].closed = true;
  r = simulate({ components: comps, wires: ws });
  check('closed switch lamp current', near(r.readings[top[1].id].current, 0.09, 0.001), JSON.stringify(r.readings[top[1].id]));
  check('closed switch lamp lit', (r.readings[top[1].id].brightness ?? 0) > 0.5);
}
{ // 8. Capacitor blocks DC
  const top = topRow([['capacitor', 1e-6], ['resistor', 1000]]);
  const { comps, ws, bat } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('cap blocks', r.readings[bat.id].current === 0, JSON.stringify(r.readings[bat.id]));
  check('cap has battery voltage across it', near(r.readings[top[0].id].voltage, 9, 0.05), JSON.stringify(r.readings[top[0].id]));
}
{ // 9. Inductor passes DC
  const top = topRow([['inductor', 1e-3], ['resistor', 1000]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('inductor passes', near(r.readings[top[1].id].current, 0.009, 0.0002));
}
{ // 10. Two batteries in series (9 V + 9 V) across 1k -> 18 mA
  const b1 = part('battery', 100, 200, 9), b2 = part('battery', 180, 200, 9), res = part('resistor', 100, 0, 1000);
  const ws = [wire(60, 200, 60, 0), wire(140, 0, 220, 0), wire(220, 0, 220, 200)];
  const r = simulate({ components: [b1, b2, res], wires: ws });
  check('series batteries', near(r.readings[res.id].current, 0.018, 0.0003), JSON.stringify(r.readings[res.id]));
}
{ // 11. Ground sets 0 V: battery - end grounded -> + end at 9 V
  const top = topRow([['resistor', 1000]]);
  const { comps, ws } = loop(top);
  const g: CircuitComponent = { id: 'g', type: 'ground', x: 140, y: 240, rotation: 90 }; // lead end at (140,220)
  const r = simulate({ components: [...comps, g], wires: [...ws, wire(140, 200, 140, 220)] });
  check('ground ref', near(r.pointVoltages.get('60,200') ?? NaN, 9, 0.02) && near(r.pointVoltages.get('140,200') ?? NaN, 0, 0.001),
    `${r.pointVoltages.get('60,200')} ${r.pointVoltages.get('140,200')}`);
}
{ // 12. Unconnected end + no battery
  const res = part('resistor', 100, 0, 1000);
  const r = simulate({ components: [res], wires: [] });
  check('no battery warning', r.warnings.some(w => w.kind === 'no-battery'));
  check('unconnected warning', r.warnings.some(w => w.kind === 'unconnected'));
}
{ // 13. Parallel lamps (100 Ω || 100 Ω) on 9 V -> 180 mA from the battery
  const bat = part('battery', 100, 200, 9);
  const l1 = part('lamp', 100, 0, 100), l2 = part('lamp', 100, 100, 100);
  // Left ends joined to the battery's + end, right ends to its - end (only wire ends connect)
  const ws = [wire(60, 200, 60, 100), wire(60, 100, 60, 0),
    wire(140, 0, 180, 0), wire(140, 100, 180, 100), wire(180, 0, 180, 100), wire(180, 100, 180, 200), wire(180, 200, 140, 200)];
  const r = simulate({ components: [bat, l1, l2], wires: ws });
  check('parallel total', near(r.readings[bat.id].current, 0.18, 0.003), JSON.stringify(r.readings[bat.id]));
  check('parallel each', near(r.readings[l1.id].current, 0.09, 0.002) && near(r.readings[l2.id].current, 0.09, 0.002));
}
{ // 14. Empty circuit doesn't crash
  const r = simulate({ components: [], wires: [] });
  check('empty', r.warnings.length === 0);
}
{ // 15. Two LEDs in series with 220 Ω on 9 V -> (9-4)/(220+20) ≈ 20.8 mA
  const top = topRow([['led', 2], ['led', 2], ['resistor', 220]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('two leds', near(r.readings[top[0].id].current, 5 / 240, 0.0005) && near(r.readings[top[1].id].current, 5 / 240, 0.0005),
    JSON.stringify([r.readings[top[0].id], r.readings[top[1].id]]));
}
{ // 16. Battery too weak for the LED (1.5 V < 2 V) -> LED stays dark, no current
  const top = topRow([['led', 2], ['resistor', 100]]);
  const { comps, ws, bat } = loop(top, 1.5);
  const r = simulate({ components: comps, wires: ws });
  check('weak battery led dark', (r.readings[top[0].id].brightness ?? 0) === 0 && Math.abs(r.readings[bat.id].current) < 1e-6,
    JSON.stringify(r.readings[top[0].id]));
  check('weak battery explained', r.warnings.some(w => w.kind === 'led-underpowered') && !r.warnings.some(w => w.kind === 'open-circuit'),
    JSON.stringify(r.warnings));
}
{ // 17. Wire currents around a single loop: 9 V, 1 kΩ -> 9 mA in every wire, in the right direction
  const top = topRow([['resistor', 1000]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  // ws[0]: (60,200)->(60,0), battery + end up to the resistor: forwards
  // ws[1]: (140,200)->(140,200)... (battery - end to right column): current comes back into the battery: backwards
  // ws[2]: right column (140,200)->(140,0): current comes down from the resistor: backwards
  check('loop wire up', near(r.wireCurrents[ws[0].id], 0.009, 0.0002), JSON.stringify(r.wireCurrents));
  check('loop wires return', near(r.wireCurrents[ws[2].id], -0.009, 0.0002), JSON.stringify(r.wireCurrents));
}
{ // 18. Parallel lamps: the shared wire carries both currents, each branch wire carries one
  const bat = part('battery', 100, 200, 9);
  const l1 = part('lamp', 100, 0, 100), l2 = part('lamp', 100, 100, 100);
  const ws = [wire(60, 200, 60, 100), wire(60, 100, 60, 0),
    wire(140, 0, 180, 0), wire(140, 100, 180, 100), wire(180, 0, 180, 100), wire(180, 100, 180, 200), wire(180, 200, 140, 200)];
  const r = simulate({ components: [bat, l1, l2], wires: ws });
  const I = r.wireCurrents;
  check('shared wire from battery', near(I[ws[0].id], 0.18, 0.003), JSON.stringify(I));
  check('branch to top lamp', near(I[ws[1].id], 0.09, 0.002), JSON.stringify(I));
  check('return to battery', near(I[ws[6].id], 0.18, 0.003), JSON.stringify(I));
}
{ // 19. No current anywhere when the switch is open
  const top = topRow([['switch', undefined, { closed: false }], ['lamp', 100]]);
  const { comps, ws } = loop(top);
  const r = simulate({ components: comps, wires: ws });
  check('open switch: still wires', Object.values(r.wireCurrents).every(a => a === 0), JSON.stringify(r.wireCurrents));
}
console.log(fails === 0 ? `all ${passes} solver checks passed` : `${fails} failed, ${passes} passed`);
