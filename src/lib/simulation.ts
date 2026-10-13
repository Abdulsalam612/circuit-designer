import type { CircuitComponent, CircuitLayout, Wire } from '@/types/circuit';
import { getPartPoints, pointKey } from './grid';
import { COMPONENT_DEFS } from './components';

// ---------------------------------------------------------------------------------
// DC circuit solver
//
// 1. Connected grid points are merged into electrical nodes: everything joined by
//    wires is one node, and all grounds are one node (0 V).
// 2. Every part becomes a simple model:
//      resistor, lamp ........ resistance
//      battery ............... voltage source with a small internal resistance
//      closed switch, inductor  (almost) zero resistance
//      open switch, capacitor  open circuit (no DC current)
//      LED ................... off below its forward voltage; above it, the forward
//                              voltage plus a small resistance
// 3. Nodal analysis: one equation per node (currents in = currents out), solved for
//    the node voltages. LEDs are on/off, so the solve repeats until their states agree.
// ---------------------------------------------------------------------------------

// Model constants
const BATTERY_INTERNAL_OHMS = 0.05;
const WIRE_LIKE_OHMS = 1e-3;        // closed switch, inductor at DC
const LED_ON_OHMS = 10;             // LED resistance once it's conducting
const LED_OFF_SIEMENS = 1e-9;       // tiny leakage when off
const GMIN = 1e-12;                 // tiny path to ground from every node, so floating parts don't break the maths
const MAX_LED_ITERATIONS = 50;

// Thresholds for feedback
export const LED_MAX_SAFE_AMPS = 0.03;   // ~20 mA typical, 30 mA absolute max
const LED_FULL_BRIGHT_AMPS = 0.02;
const LAMP_FULL_BRIGHT_WATTS = 0.5;
const NO_CURRENT_AMPS = 1e-6;

export interface PartReading {
  voltage: number;     // across the part, first end minus second end
  current: number;     // through the part, first end to second end (battery: current it delivers)
  power: number;       // watts used (or supplied, for a battery)
  brightness?: number; // 0..1 for lamps and LEDs
  overloaded?: boolean;
}

export type WarningKind =
  | 'no-battery'
  | 'short-circuit'
  | 'open-circuit'
  | 'unconnected'
  | 'led-overload'
  | 'led-reversed'
  | 'led-underpowered';

export interface SimulationWarning {
  kind: WarningKind;
  message: string;
  componentIds: string[];
}

export interface SimulationResult {
  readings: Record<string, PartReading>;
  // Voltage at each connection point (pointKey -> volts), relative to ground
  pointVoltages: Map<string, number>;
  // Current in each wire (wire id -> amps). Positive means it flows from the wire's
  // first end (x1, y1) to its second end (x2, y2).
  wireCurrents: Record<string, number>;
  // Electrical node of each lead end (component id -> one node id per pin). Ends with
  // the same node id are connected; used to tell series from parallel.
  pinNodes: Record<string, string[]>;
  warnings: SimulationWarning[];
}

// ---- Nodes ----

class UnionFind {
  private parent = new Map<string, string>();
  find(k: string): string {
    if (!this.parent.has(k)) this.parent.set(k, k);
    let root = k;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    // Path compression
    let cur = k;
    while (this.parent.get(cur) !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

const GROUND = '__ground__';

// ---- Linear algebra ----

// Solves A x = b by Gaussian elimination with partial pivoting. Returns null if singular.
const solveLinear = (A: number[][], b: number[]): number[] | null => {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-30) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = M[r][n];
    for (let c = r + 1; c < n; c++) sum -= M[r][c] * x[c];
    x[r] = sum / M[r][r];
  }
  return x;
};

// ---- Solver ----

const label = (c: CircuitComponent) => COMPONENT_DEFS[c.type].label;

export const simulate = (layout: CircuitLayout): SimulationResult => {
  const { components, wires } = layout;
  const uf = new UnionFind();

  // Wires join their two ends
  for (const w of wires) uf.union(pointKey({ x: w.x1, y: w.y1 }), pointKey({ x: w.x2, y: w.y2 }));
  // Every ground is the same 0 V node
  const pinsOf = new Map(components.map(c => [c.id, getPartPoints(c).pins.map(pointKey)]));
  for (const c of components) {
    if (c.type === 'ground') uf.union(pinsOf.get(c.id)![0], GROUND);
  }

  const node = (key: string) => uf.find(key);
  const batteries = components.filter(c => c.type === 'battery');
  const leds = components.filter(c => c.type === 'led');

  // Reference (0 V) node: ground if there is one, otherwise the first battery's - end
  const hasGround = components.some(c => c.type === 'ground');
  const reference = hasGround
    ? node(GROUND)
    : batteries.length > 0
      ? node(pinsOf.get(batteries[0].id)![1])
      : null;

  // Number the other nodes
  const allNodes = new Set<string>();
  for (const pins of pinsOf.values()) pins.forEach(k => allNodes.add(node(k)));
  const index = new Map<string, number>();
  for (const n of allNodes) if (n !== reference) index.set(n, index.size);
  const size = index.size;

  // Stamps two-terminal elements into the nodal equations G v = I
  const build = (ledOn: Map<string, boolean>) => {
    const G = Array.from({ length: size }, () => new Array(size).fill(0));
    const I = new Array(size).fill(0);
    const conductance = (a: string, b: string, g: number) => {
      const ia = index.get(node(a));
      const ib = index.get(node(b));
      if (ia !== undefined) G[ia][ia] += g;
      if (ib !== undefined) G[ib][ib] += g;
      if (ia !== undefined && ib !== undefined) {
        G[ia][ib] -= g;
        G[ib][ia] -= g;
      }
    };
    // A source of `volts` in series with conductance g, + at a (Norton equivalent)
    const source = (a: string, b: string, volts: number, g: number) => {
      conductance(a, b, g);
      const ia = index.get(node(a));
      const ib = index.get(node(b));
      if (ia !== undefined) I[ia] += volts * g;
      if (ib !== undefined) I[ib] -= volts * g;
    };

    for (const c of components) {
      const pins = pinsOf.get(c.id)!;
      if (pins.length < 2) continue;
      const [a, b] = pins;
      switch (c.type) {
        case 'resistor':
        case 'lamp':
          conductance(a, b, 1 / Math.max(c.value ?? 1, 1e-6));
          break;
        case 'battery':
          source(a, b, c.value ?? 0, 1 / BATTERY_INTERNAL_OHMS);
          break;
        case 'switch':
          if (c.closed) conductance(a, b, 1 / WIRE_LIKE_OHMS);
          break;
        case 'inductor':
          conductance(a, b, 1 / WIRE_LIKE_OHMS);
          break;
        case 'led':
          if (ledOn.get(c.id)) source(a, b, c.value ?? 2, 1 / LED_ON_OHMS);
          else conductance(a, b, LED_OFF_SIEMENS);
          break;
        case 'capacitor':
          break; // open at DC
      }
    }
    for (let i = 0; i < size; i++) G[i][i] += GMIN;
    return { G, I };
  };

  // Solve, flipping LEDs on/off until their states are consistent
  const ledOn = new Map(leds.map(l => [l.id, false]));
  let v: number[] | null = new Array(size).fill(0);
  const voltageAt = (key: string) => {
    const i = index.get(node(key));
    return i === undefined || !v ? 0 : v[i];
  };
  for (let iter = 0; iter < MAX_LED_ITERATIONS; iter++) {
    const { G, I } = build(ledOn);
    v = size > 0 ? solveLinear(G, I) : [];
    if (!v) break;
    let changed = false;
    for (const l of leds) {
      const [a, b] = pinsOf.get(l.id)!;
      const vd = voltageAt(a) - voltageAt(b);
      const vf = l.value ?? 2;
      const on = ledOn.get(l.id)!;
      if (!on && vd > vf + 1e-9) { ledOn.set(l.id, true); changed = true; }
      else if (on && vd < vf - 1e-9) { ledOn.set(l.id, false); changed = true; }
    }
    if (!changed) break;
  }
  if (!v) v = new Array(size).fill(0);

  // ---- Readings ----
  const readings: Record<string, PartReading> = {};
  for (const c of components) {
    const pins = pinsOf.get(c.id)!;
    if (pins.length < 2) {
      readings[c.id] = { voltage: voltageAt(pins[0]), current: 0, power: 0 };
      continue;
    }
    const vd = voltageAt(pins[0]) - voltageAt(pins[1]);
    let current = 0;
    switch (c.type) {
      case 'resistor':
      case 'lamp':
        current = vd / Math.max(c.value ?? 1, 1e-6);
        break;
      case 'battery':
        current = ((c.value ?? 0) - vd) / BATTERY_INTERNAL_OHMS;
        break;
      case 'switch':
        current = c.closed ? vd / WIRE_LIKE_OHMS : 0;
        break;
      case 'inductor':
        current = vd / WIRE_LIKE_OHMS;
        break;
      case 'led':
        // An LED that's off passes no current worth showing
        current = ledOn.get(c.id) ? (vd - (c.value ?? 2)) / LED_ON_OHMS : 0;
        break;
    }
    // Snap numerical noise to zero
    if (Math.abs(current) < 1e-9) current = 0;
    const reading: PartReading = { voltage: Math.abs(vd) < 1e-9 ? 0 : vd, current, power: Math.abs(vd * current) };
    if (c.type === 'led') {
      reading.brightness = Math.min(1, Math.max(0, current) / LED_FULL_BRIGHT_AMPS);
      reading.overloaded = current > LED_MAX_SAFE_AMPS;
    } else if (c.type === 'lamp') {
      reading.brightness = Math.min(1, reading.power / LAMP_FULL_BRIGHT_WATTS);
    }
    readings[c.id] = reading;
  }

  const pointVoltages = new Map<string, number>();
  for (const pins of pinsOf.values()) for (const k of pins) pointVoltages.set(k, voltageAt(k));
  for (const w of wires) {
    for (const k of [pointKey({ x: w.x1, y: w.y1 }), pointKey({ x: w.x2, y: w.y2 })]) {
      pointVoltages.set(k, voltageAt(k));
    }
  }

  // ---- Warnings ----
  const warnings: SimulationWarning[] = [];

  if (batteries.length === 0 && components.length > 0) {
    warnings.push({ kind: 'no-battery', message: 'Add a battery to power the circuit.', componentIds: [] });
  }

  for (const l of leds) {
    const r = readings[l.id];
    if (r.overloaded) {
      warnings.push({
        kind: 'led-overload',
        message: `The LED is getting ${formatAmps(r.current)}, far more than the ~20 mA it can take. Add a resistor in series (e.g. 330 Ω).`,
        componentIds: [l.id],
      });
    } else if (r.voltage < -0.5) {
      warnings.push({
        kind: 'led-reversed',
        message: 'An LED is facing the wrong way, so no current can flow through it. Use Flip direction.',
        componentIds: [l.id],
      });
    } else if (r.current === 0 && r.voltage > 0.3 * (l.value ?? 2)) {
      warnings.push({
        kind: 'led-underpowered',
        message: `An LED needs at least ${formatVolts(l.value ?? 2)} to light up, but it's only getting ${formatVolts(r.voltage)}. Use a bigger battery.`,
        componentIds: [l.id],
      });
    }
  }

  // A dark LED (backwards, or not enough voltage) already explains why nothing flows
  const ledExplainsNoCurrent = warnings.some(w => w.kind === 'led-reversed' || w.kind === 'led-underpowered');

  for (const bat of batteries) {
    const emf = bat.value ?? 0;
    const r = readings[bat.id];
    if (emf > 0 && r.voltage < emf * 0.5) {
      warnings.push({
        kind: 'short-circuit',
        message: `Short circuit: the battery's two ends are connected with almost no resistance (${formatAmps(r.current)} would flow). Add a resistor or a lamp.`,
        componentIds: [bat.id],
      });
    } else if (Math.abs(r.current) < NO_CURRENT_AMPS && !ledExplainsNoCurrent) {
      warnings.push({
        kind: 'open-circuit',
        message: 'No current flows from the battery: the circuit isn\'t a complete loop (check for gaps or an open switch).',
        componentIds: [bat.id],
      });
    }
  }


  // Lead ends that touch nothing
  const ends = new Map<string, number>();
  const bump = (k: string) => ends.set(k, (ends.get(k) ?? 0) + 1);
  for (const pins of pinsOf.values()) pins.forEach(bump);
  for (const w of wires) {
    bump(pointKey({ x: w.x1, y: w.y1 }));
    bump(pointKey({ x: w.x2, y: w.y2 }));
  }
  const loose = components.filter(c => pinsOf.get(c.id)!.some(k => ends.get(k) === 1));
  if (loose.length > 0) {
    const names = [...new Set(loose.map(label))].join(', ');
    warnings.push({
      kind: 'unconnected',
      message: `${loose.length === 1 ? 'A part has' : `${loose.length} parts have`} an unconnected end (${names}).`,
      componentIds: loose.map(c => c.id),
    });
  }

  const pinNodes: Record<string, string[]> = {};
  for (const [id, pins] of pinsOf) pinNodes[id] = pins.map(node);

  return { readings, pointVoltages, pinNodes, warnings, wireCurrents: computeWireCurrents(layout, readings, pinsOf) };
};

// ---- Current in each wire ----
//
// Wires have no resistance, so the solve doesn't say how current splits between them.
// It follows from the parts instead: every lead end pushes current into (or pulls it out
// of) the wires it touches. Within each connected group of wires, take a tree of them;
// the current along each tree wire is everything pushed in on its far side. (Wires that
// close a loop entirely made of wire carry nothing in this picture, which is fine for
// showing flow.)
const computeWireCurrents = (
  layout: CircuitLayout,
  readings: Record<string, PartReading>,
  pinsOf: Map<string, string[]>,
): Record<string, number> => {
  // Current flowing from parts into each point
  const injected = new Map<string, number>();
  const inject = (k: string, amps: number) => injected.set(k, (injected.get(k) ?? 0) + amps);
  for (const c of layout.components) {
    const pins = pinsOf.get(c.id)!;
    const r = readings[c.id];
    if (pins.length < 2 || !r || r.current === 0) continue;
    if (c.type === 'battery') {
      // A battery pushes current out of its + end and takes it back at its - end
      inject(pins[0], r.current);
      inject(pins[1], -r.current);
    } else {
      // Other parts carry current from their first end to their second
      inject(pins[0], -r.current);
      inject(pins[1], r.current);
    }
  }

  // Which wires touch each point
  const touching = new Map<string, Wire[]>();
  const end1 = (w: Wire) => pointKey({ x: w.x1, y: w.y1 });
  const end2 = (w: Wire) => pointKey({ x: w.x2, y: w.y2 });
  for (const w of layout.wires) {
    for (const k of [end1(w), end2(w)]) touching.set(k, [...(touching.get(k) ?? []), w]);
  }

  const currents: Record<string, number> = {};
  const visited = new Set<string>();
  for (const start of touching.keys()) {
    if (visited.has(start)) continue;
    // Walk the group, remembering how each point was reached
    const order: string[] = [];
    const parentWire = new Map<string, Wire>();
    const parentPoint = new Map<string, string>();
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const p = queue.shift()!;
      order.push(p);
      for (const w of touching.get(p) ?? []) {
        const q = end1(w) === p ? end2(w) : end1(w);
        if (visited.has(q)) continue;
        visited.add(q);
        parentWire.set(q, w);
        parentPoint.set(q, p);
        queue.push(q);
      }
    }
    // From the far ends inwards: what a point and everything beyond it push in has to
    // leave along the wire back towards the start
    const beyond = new Map<string, number>();
    for (let i = order.length - 1; i >= 0; i--) {
      const p = order[i];
      const total = (beyond.get(p) ?? 0) + (injected.get(p) ?? 0);
      const w = parentWire.get(p);
      if (!w) continue;
      const towards = parentPoint.get(p)!;
      beyond.set(towards, (beyond.get(towards) ?? 0) + total);
      // total flows from p to its parent; express it along the wire's own direction
      const amps = end1(w) === p ? total : -total;
      currents[w.id] = Math.abs(amps) < 1e-9 ? 0 : amps;
    }
  }
  for (const w of layout.wires) currents[w.id] ??= 0;
  return currents;
};

// ---- Formatting helpers for the UI ----

const withPrefix = (value: number, unit: string) => {
  const abs = Math.abs(value);
  if (abs === 0) return `0 ${unit}`;
  if (abs >= 1000) return `${(value / 1000).toPrecision(3)} k${unit}`;
  if (abs >= 1) return `${Number(value.toPrecision(3))} ${unit}`;
  if (abs >= 1e-3) return `${Number((value * 1e3).toPrecision(3))} m${unit}`;
  if (abs >= 1e-6) return `${Number((value * 1e6).toPrecision(3))} µ${unit}`;
  return `${Number((value * 1e9).toPrecision(3))} n${unit}`;
};

export const formatVolts = (v: number) => withPrefix(v, 'V');
export const formatAmps = (a: number) => withPrefix(a, 'A');
export const formatWatts = (w: number) => withPrefix(w, 'W');
