import { GRID_SIZE, getPartPoints, pointKey, type Point } from './grid';
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
