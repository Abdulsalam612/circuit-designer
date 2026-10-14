import { GRID_SIZE, getPartPoints, isSpotFree, pointKey, type Point } from './grid';
import { COMPONENT_DEFS } from './components';
import type { CircuitComponent, Wire } from '@/types/circuit';

export type WireSegment = Omit<Wire, 'id'>;

let idCounter = 0;
export const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

// Every grid point along a wire, end to end
export const getWirePoints = (w: WireSegment): Point[] => {
  const steps = Math.max(Math.abs(w.x2 - w.x1), Math.abs(w.y2 - w.y1)) / GRID_SIZE;
  const sx = Math.sign(w.x2 - w.x1) * GRID_SIZE;
  const sy = Math.sign(w.y2 - w.y1) * GRID_SIZE;
  return Array.from({ length: steps + 1 }, (_, i) => ({ x: w.x1 + i * sx, y: w.y1 + i * sy }));
};

// One key per grid cell edge the wire runs along, used to stop wires overlapping
const getWireEdges = (w: WireSegment) => {
  const points = getWirePoints(w);
  return points.slice(1).map((p, i) => [pointKey(points[i]), pointKey(p)].sort().join('|'));
};

export const getWireOccupiedPoints = (wires: Wire[]) =>
  new Set(wires.flatMap(getWirePoints).map(pointKey));

const segment = (a: Point, b: Point): WireSegment => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

// Wires follow the grid lines: a straight piece, or an L shape with the longer leg first
export const routeWire = (start: Point, end: Point): WireSegment[] => {
  if (start.x === end.x && start.y === end.y) return [];
  if (start.x === end.x || start.y === end.y) return [segment(start, end)];
  const corner = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
    ? { x: end.x, y: start.y }
    : { x: start.x, y: end.y };
  return [segment(start, corner), segment(corner, end)];
};

// New wires may not cross a component body or run along an existing wire
export const canAddWires = (segments: WireSegment[], components: CircuitComponent[], wires: Wire[]) => {
  if (segments.length === 0) return false;
  const bodies = new Set(components.flatMap(c => getPartPoints(c).body).map(pointKey));
  const takenEdges = new Set(wires.flatMap(getWireEdges));
  return segments.every(s =>
    getWirePoints(s).every(p => !bodies.has(pointKey(p))) &&
    getWireEdges(s).every(e => !takenEdges.has(e))
  );
};

export interface ConnectionPoint {
  point: Point;
  // How many lead ends / wire ends meet here: 1 = unconnected, 3+ = junction
  count: number;
  // Components with a lead end here
  componentIds: string[];
}

export const getConnectionPoints = (components: CircuitComponent[], wires: Wire[]) => {
  const byKey = new Map<string, ConnectionPoint>();
  const add = (point: Point, componentId?: string) => {
    const key = pointKey(point);
    const entry = byKey.get(key) ?? { point, count: 0, componentIds: [] };
    entry.count++;
    if (componentId) entry.componentIds.push(componentId);
    byKey.set(key, entry);
  };
  components.forEach(c => getPartPoints(c).pins.forEach(p => add(p, c.id)));
  wires.forEach(w => {
    add({ x: w.x1, y: w.y1 });
    add({ x: w.x2, y: w.y2 });
  });
  return [...byKey.values()];
};

// The whole layout is valid when no component bodies overlap, no wire touches a
// component body, and no two wires run along the same grid edge
export const isLayoutValid = (components: CircuitComponent[], wires: WireSegment[]) => {
  for (let i = 0; i < components.length; i++) {
    if (!isSpotFree(components[i], components.slice(i + 1))) return false;
  }
  const bodies = new Set(components.flatMap(c => getPartPoints(c).body).map(pointKey));
  if (wires.some(w => getWirePoints(w).some(p => bodies.has(pointKey(p))))) return false;
  const edges = new Set<string>();
  for (const edge of wires.flatMap(getWireEdges)) {
    if (edges.has(edge)) return false;
    edges.add(edge);
  }
  return true;
};

// Where a wire could go after the points it's attached to move. moved maps an old grid
// point (pointKey) to its new position. Returns the possible routes, best first (see
// candidateRoutes); each route is a list of wires.
const followWire = (w: Wire, moved: Map<string, Point>): { routes: Wire[][]; rerouted: boolean } => {
  const a = { x: w.x1, y: w.y1 };
  const b = { x: w.x2, y: w.y2 };
  const a2 = moved.get(pointKey(a));
  const b2 = moved.get(pointKey(b));
  if (!a2 && !b2) return { routes: [[w]], rerouted: false };

  const newA = a2 ?? a;
  const newB = b2 ?? b;
  // Both ends moved by the same amount: just slide the wire along
  if (a2 && b2 && a2.x - a.x === b2.x - b.x && a2.y - a.y === b2.y - b.y) {
    return { routes: [[{ ...w, ...segment(newA, newB) }]], rerouted: false };
  }
  // Route from the end that stayed put (or from a, if both moved)
  const [from, to] = a2 && !b2 ? [newB, newA] : [newA, newB];
  return { routes: candidateRoutes(w.id, from, to, w.y1 === w.y2), rerouted: true };
};

// How far (in grid cells) a detour may swing out to get around something
const MAX_DETOUR_CELLS = 8;

// Every route a wire may take between two points, best first:
//  1. straight, or an L bending the preferred way, then the other way
//  2. detours with three straight pieces (U and Z shapes) that step sideways to get
//     around parts and wires in the way, shortest first
const candidateRoutes = (id: string, from: Point, to: Point, horizontalFirst: boolean): Wire[][] => {
  if (from.x === to.x && from.y === to.y) return [[]];

  const toRoute = (points: Point[]): Wire[] | null => {
    const route: Wire[] = [];
    for (let i = 1; i < points.length; i++) {
      const [p, q] = [points[i - 1], points[i]];
      if (p.x === q.x && p.y === q.y) continue;
      if (p.x !== q.x && p.y !== q.y) return null;
      route.push({ id: route.length === 0 ? id : makeId('wire'), ...segment(p, q) });
    }
    return route;
  };

  const direct: Wire[][] = [];
  if (from.x === to.x || from.y === to.y) {
    direct.push(toRoute([from, to])!);
  } else {
    const viaX = { x: to.x, y: from.y };
    const viaY = { x: from.x, y: to.y };
    direct.push(toRoute(horizontalFirst ? [from, viaX, to] : [from, viaY, to])!);
    direct.push(toRoute(horizontalFirst ? [from, viaY, to] : [from, viaX, to])!);
  }

  const detours: Wire[][] = [];
  const span = MAX_DETOUR_CELLS * GRID_SIZE;
  for (let d = -span; d <= span; d += GRID_SIZE) {
    // Out sideways to a new row (or column), across, then back in
    const rows = [from.y + d, to.y + d];
    const cols = [from.x + d, to.x + d];
    for (const y of rows) {
      const r = toRoute([from, { x: from.x, y }, { x: to.x, y }, to]);
      if (r && r.length === 3) detours.push(r);
    }
    for (const x of cols) {
      const r = toRoute([from, { x, y: from.y }, { x, y: to.y }, to]);
      if (r && r.length === 3) detours.push(r);
    }
  }
  detours.sort((r1, r2) => totalLength(r1) - totalLength(r2));
  return [...direct, ...detours];
};

// Follows a run of wire from `start` through plain bends (points where exactly two
// wires meet and nothing else) until it reaches something real: a lead end, a junction,
// a loose end or a point that is moving. Returns the wires in the run and that anchor.
const traceRun = (
  first: Wire,
  start: Point,
  wires: Wire[],
  stopAt: Set<string>,
): { run: Wire[]; anchor: Point } => {
  const otherEnd = (w: Wire, p: Point) =>
    w.x1 === p.x && w.y1 === p.y ? { x: w.x2, y: w.y2 } : { x: w.x1, y: w.y1 };
  const run = [first];
  let point = otherEnd(first, start);
  while (!stopAt.has(pointKey(point))) {
    const here = wires.filter(w =>
      (w.x1 === point.x && w.y1 === point.y) || (w.x2 === point.x && w.y2 === point.y)
    );
    const next = here.length === 2 ? here.find(w => !run.includes(w)) : undefined;
    if (!next) break;
    run.push(next);
    point = otherEnd(next, point);
  }
  return { run, anchor: point };
};

// A rerouted wire must not create connections nobody drew: it may not pass through a
// lead end or another wire's end, and its bends may not sit on any other wire
const routeMakesNoNewConnections = (route: Wire[], others: Wire[], components: CircuitComponent[]) => {
  if (route.length === 0) return true;
  const ends = new Set([
    ...components.flatMap(c => getPartPoints(c).pins),
    ...others.flatMap(w => [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]),
  ].map(pointKey));
  const otherWirePoints = new Set(others.flatMap(getWirePoints).map(pointKey));
  const throughSomething = route.some(w => getWirePoints(w).slice(1, -1).some(p => ends.has(pointKey(p))));
  const bends = route.slice(0, -1).map(w => pointKey({ x: w.x2, y: w.y2 }));
  const bendOnSomething = bends.some(k => ends.has(k) || otherWirePoints.has(k));
  return !throughSomething && !bendOnSomething;
};

// Joins two straight wires that meet end to end in a line with nothing else at that
// point, so repeated moves don't leave the wire chopped into pieces
export const mergeWires = (wires: Wire[], components: CircuitComponent[]): Wire[] => {
  const pins = new Set(components.flatMap(c => getPartPoints(c).pins).map(pointKey));
  let result = wires;
  let merged = true;
  while (merged) {
    merged = false;
    const endsAt = new Map<string, Wire[]>();
    for (const w of result) {
      for (const k of [pointKey({ x: w.x1, y: w.y1 }), pointKey({ x: w.x2, y: w.y2 })]) {
        endsAt.set(k, [...(endsAt.get(k) ?? []), w]);
      }
    }
    for (const [key, ends] of endsAt) {
      if (ends.length !== 2 || pins.has(key) || ends[0] === ends[1]) continue;
      const [w1, w2] = ends;
      const horizontal = (w: Wire) => w.y1 === w.y2;
      if (horizontal(w1) !== horizontal(w2)) continue;
      const far = (w: Wire) => (pointKey({ x: w.x1, y: w.y1 }) === key ? { x: w.x2, y: w.y2 } : { x: w.x1, y: w.y1 });
      const joined = { id: w1.id, ...segment(far(w1), far(w2)) };
      result = [...result.filter(w => w !== w1 && w !== w2), joined];
      merged = true;
      break;
    }
  }
  return result;
};

// Works out the wires for a move: components go from `components` to `nextComponents`
// (moved and/or rotated), whole wires in movedWireIds slide by delta, and every other
// wire end attached to something that moved follows it. Returns null if no valid
// layout exists, in which case the move should not happen.
export const planMove = (
  components: CircuitComponent[],
  wires: Wire[],
  nextComponents: CircuitComponent[],
  movedWireIds: Set<string> = new Set(),
  delta: Point = { x: 0, y: 0 },
): Wire[] | null => {
  // swapEnds: when a part is turned, its two lead ends are interchangeable, so the
  // wires may attach the other way round if that routes better. Never for polarized
  // parts (battery, LED): that would silently reverse them in the circuit.
  const plan = (swapEnds: boolean) => {
    const moved = new Map<string, Point>();
    const nextById = new Map(nextComponents.map(c => [c.id, c]));
    for (const c of components) {
      const n = nextById.get(c.id);
      if (!n || (n.x === c.x && n.y === c.y && n.rotation === c.rotation)) continue;
      const oldPins = getPartPoints(c).pins;
      let newPins = getPartPoints(n).pins;
      // A half turn puts the lead ends on the same two points, just swapped: the
      // wires can stay exactly where they are
      const samePoints = new Set(oldPins.map(pointKey));
      if (newPins.every(p => samePoints.has(pointKey(p)))) continue;
      if (swapEnds && n.rotation !== c.rotation && !COMPONENT_DEFS[n.type].polarized) newPins = [...newPins].reverse();
      oldPins.forEach((p, i) => moved.set(pointKey(p), newPins[i]));
    }
    for (const w of wires) {
      if (!movedWireIds.has(w.id)) continue;
      for (const end of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
        moved.set(pointKey(end), { x: end.x + delta.x, y: end.y + delta.y });
      }
    }
    return routeAfterMove(components, wires, nextComponents, moved);
  };

  const isTurning = nextComponents.some(n => {
    const c = components.find(o => o.id === n.id);
    return c && c.rotation !== n.rotation;
  });
  const options = (isTurning ? [plan(false), plan(true)] : [plan(false)])
    .filter((o): o is Wire[] => o !== null);
  if (options.length === 0) return null;
  return options.reduce((best, o) => (totalLength(o) < totalLength(best) ? o : best));
};

// Drags one wire sideways (across its own direction) by `offset`. Whatever its ends were
// attached to stays put and is stretched to it: attached wires bend or lengthen, and a
// lead end gets a new wire up to it. Movement along the wire is ignored (it would only
// slide over its own connections). Returns null if there's no valid layout.
export const moveWire = (
  components: CircuitComponent[],
  wires: Wire[],
  wireId: string,
  offset: Point,
): Wire[] | null => {
  const w = wires.find(x => x.id === wireId);
  if (!w) return null;
  const horizontal = w.y1 === w.y2;
  const delta = horizontal ? { x: 0, y: offset.y } : { x: offset.x, y: 0 };
  if (delta.x === 0 && delta.y === 0) return wires;
  return planMove(components, wires, components, new Set([wireId]), delta);
};

// The grid point on a wire closest to p (where a branch would start)
export const nearestPointOnWire = (w: WireSegment, p: Point): Point => {
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
  const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;
  return w.y1 === w.y2
    ? { x: clamp(snap(p.x), w.x1, w.x2), y: w.y1 }
    : { x: w.x1, y: clamp(snap(p.y), w.y1, w.y2) };
};

const totalLength = (ws: WireSegment[]) =>
  ws.reduce((sum, w) => sum + Math.abs(w.x2 - w.x1) + Math.abs(w.y2 - w.y1), 0);

// Moves wires to follow `moved` (old grid point -> new point), see planMove
const routeAfterMove = (
  components: CircuitComponent[],
  wires: Wire[],
  nextComponents: CircuitComponent[],
  moved: Map<string, Point>,
): Wire[] | null => {
  // Places where a run of wire must stop: lead ends (before the move) and moving points
  const stopAt = new Set([
    ...components.flatMap(c => getPartPoints(c).pins).map(pointKey),
    ...moved.keys(),
  ]);

  // A bent wire whose two ends both move by the same amount (e.g. between two parts
  // moved together) keeps its shape: its bends move along with it
  for (const [key, to] of [...moved]) {
    const [x, y] = key.split(',').map(Number);
    const offset = { x: to.x - x, y: to.y - y };
    for (const w of wires) {
      const atEnd = (w.x1 === x && w.y1 === y) || (w.x2 === x && w.y2 === y);
      if (!atEnd) continue;
      const { run, anchor } = traceRun(w, { x, y }, wires, stopAt);
      const anchorTo = moved.get(pointKey(anchor));
      if (run.length < 2 || !anchorTo || anchorTo.x - anchor.x !== offset.x || anchorTo.y - anchor.y !== offset.y) continue;
      for (const r of run) {
        for (const p of [{ x: r.x1, y: r.y1 }, { x: r.x2, y: r.y2 }]) {
          if (!moved.has(pointKey(p))) moved.set(pointKey(p), { x: p.x + offset.x, y: p.y + offset.y });
        }
      }
    }
  }

  // Wires that keep their shape go in first; then each rerouted wire takes the first of
  // its routes that fits around everything placed so far
  const followed: { wire: Wire; routes: Wire[][]; rerouted: boolean; added?: boolean }[] =
    wires.map(w => ({ wire: w, ...followWire(w, moved) }));

  // A lead end that was touching a part that isn't moving was connected to it directly,
  // with no wire in between. Add a wire so the two stay connected as they separate.
  const nextById = new Map(nextComponents.map(c => [c.id, c]));
  for (const c of components) {
    const n = nextById.get(c.id);
    if (!n || n.x !== c.x || n.y !== c.y || n.rotation !== c.rotation) continue; // moving
    for (const pin of getPartPoints(c).pins) {
      const to = moved.get(pointKey(pin));
      if (!to) continue;
      const id = makeId('wire');
      followed.push({
        wire: { id, ...segment(pin, pin) },
        routes: candidateRoutes(id, pin, to, true),
        rerouted: true,
        added: true,
      });
    }
  }

  let placed = followed.filter(f => !f.rerouted).map(f => f.routes[0]).flat();
  if (!isLayoutValid(nextComponents, placed)) return null;

  const fitsAmong = (route: Wire[], others: Wire[]) =>
    isLayoutValid(nextComponents, [...others, ...route]) &&
    routeMakesNoNewConnections(route, others, nextComponents);

  for (const { wire, routes, added } of followed.filter(f => f.rerouted)) {
    const options: Wire[][] = [];

    // Option 1: bend just this wire, keeping the rest of its run as drawn
    const bent = routes.find(route => fitsAmong(route, placed));
    if (bent) options.push([...placed, ...bent]);

    // Option 2: redraw its whole run, from the moved end back to the nearest real
    // anchor (straightens out detours left by earlier moves)
    const movedEndOld = [{ x: wire.x1, y: wire.y1 }, { x: wire.x2, y: wire.y2 }]
      .find(p => moved.has(pointKey(p)));
    if (movedEndOld && !added) {
      const movedEndNew = moved.get(pointKey(movedEndOld))!;
      const { run, anchor } = traceRun(wire, movedEndOld, wires, stopAt);
      // Only redraw runs that end at something fixed
      if (run.length >= 2 && !moved.has(pointKey(anchor))) {
        const runIds = new Set(run.map(w => w.id));
        const others = placed.filter(w => !runIds.has(w.id));
        const last = run[run.length - 1];
        const redrawn = candidateRoutes(last.id, anchor, movedEndNew, last.y1 === last.y2)
          .find(route => fitsAmong(route, others));
        if (redrawn) options.push([...others, ...redrawn]);
      }
    }

    if (options.length === 0) return null;
    // Prefer whichever uses less wire
    placed = options.reduce((best, o) => (totalLength(o) < totalLength(best) ? o : best));
  }
  return placed;
};

// Final clean-up after any change: cut wires where ends land along them, then rejoin
// pieces that are no longer needed
export const normalizeWires = (wires: Wire[], components: CircuitComponent[]) =>
  mergeWires(splitWiresAtConnections(wires, components), components);

// Keeps the rule "only ends connect": a wire with a lead end or another wire's end
// lying along it is cut there, so that point becomes a shared end (a T-junction).
// Wires that merely cross each other stay whole and are not connected.
export const splitWiresAtConnections = (wires: Wire[], components: CircuitComponent[]): Wire[] => {
  const ends = new Set([
    ...components.flatMap(c => getPartPoints(c).pins),
    ...wires.flatMap(w => [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]),
  ].map(pointKey));

  return wires.flatMap(w => {
    const points = getWirePoints(w);
    const cuts = points
      .map((_, i) => i)
      .filter(i => i > 0 && i < points.length - 1 && ends.has(pointKey(points[i])));
    if (cuts.length === 0) return [w];
    const bounds = [0, ...cuts, points.length - 1];
    return bounds.slice(1).map((end, i) => ({
      id: i === 0 ? w.id : makeId('wire'),
      ...segment(points[bounds[i]], points[end]),
    }));
  });
};
