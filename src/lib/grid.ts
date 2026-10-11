// Snap grid for the circuit editor, in canvas units (before zoom)
export const GRID_SIZE = 20;
// A darker line every MAJOR_EVERY cells
export const MAJOR_EVERY = 5;
// Every component is this many grid cells long, lead end to lead end. Must be even so
// that with the part centred on a grid point, both lead ends are on grid points too.
export const PART_CELLS = 4;

export const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

export interface Point {
  x: number;
  y: number;
}

interface Placement {
  x: number; // centre
  y: number;
  rotation: number;
}

export const pointKey = (p: Point) => `${p.x},${p.y}`;

// Grid points a component covers along its length: the two lead ends ("pins")
// and the points in between ("body")
export const getPartPoints = ({ x, y, rotation }: Placement) => {
  const rad = (rotation * Math.PI) / 180;
  const dx = Math.round(Math.cos(rad));
  const dy = Math.round(Math.sin(rad));
  const half = PART_CELLS / 2;
  const pins: Point[] = [];
  const body: Point[] = [];
  for (let k = -half; k <= half; k++) {
    const point = { x: x + k * GRID_SIZE * dx, y: y + k * GRID_SIZE * dy };
    (Math.abs(k) === half ? pins : body).push(point);
  }
  return { pins, body };
};

// Two parts may share lead ends (that's how they connect), but nothing may touch a body
const overlaps = (a: Placement, b: Placement) => {
  const pa = getPartPoints(a);
  const pb = getPartPoints(b);
  const aBody = new Set(pa.body.map(pointKey));
  const bBody = new Set(pb.body.map(pointKey));
  return [...pb.pins, ...pb.body].some(p => aBody.has(pointKey(p))) ||
    pa.pins.some(p => bBody.has(pointKey(p)));
};

// wirePoints: grid points covered by wires (see getWireOccupiedPoints). A lead end may
// sit on a wire, which connects it; the body may not.
export const isSpotFree = (candidate: Placement, others: Placement[], wirePoints?: Set<string>) =>
  others.every(other => !overlaps(candidate, other)) &&
  (!wirePoints || getPartPoints(candidate).body.every(p => !wirePoints.has(pointKey(p))));
