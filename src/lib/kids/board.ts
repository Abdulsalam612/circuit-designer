import type { CircuitComponent, CircuitLayout, ComponentType, Wire } from '@/types/circuit';
import type { CircuitGoal, PartKind, Piece, PieceKind, Stud, ThingKind } from '@/types/kids';
import { simulate, type SimulationResult } from '@/lib/simulation';
import { COMPONENT_DEFS } from '@/lib/components';

// The CirKit Kids snap board. Studs sit STUD units apart (two cells of the editor's 20-unit
// grid). A wire piece spans one gap between neighbouring studs; a part spans two gaps, with
// its middle stud covered. Pieces whose ends meet on a stud are connected – the circuit
// editor's own rule – so a board turns straight into a real CircuitLayout for the solver.

export const STUD = 40;

// Everyday things for "Does it conduct?". Metals let electricity through; the board treats a
// conductor as a wire and an insulator as nothing at all (the loop stays open), which is what
// the solver would see.
export const THINGS: Record<ThingKind, { name: string; material: string; conducts: boolean }> = {
  coin: { name: 'Coin', material: 'metal', conducts: true },
  key: { name: 'Key', material: 'metal', conducts: true },
  clip: { name: 'Paper clip', material: 'metal', conducts: true },
  eraser: { name: 'Eraser', material: 'rubber', conducts: false },
  stick: { name: 'Lolly stick', material: 'wood', conducts: false },
  spoon: { name: 'Plastic spoon', material: 'plastic', conducts: false },
};

export const isThing = (kind: PieceKind): kind is ThingKind => kind in THINGS;

export const pieceLength = (kind: PieceKind) => (kind === 'wire' || isThing(kind) ? 1 : 2);

const COMPONENT_OF: Record<PartKind, ComponentType> = {
  battery: 'battery',
  motor: 'motor',
  lamp: 'lamp',
  switch: 'switch',
  resistor: 'resistor',
};

// Kid-friendly part values: a 4.5 V battery (a classic 3 x AA pack, so two in series make the
// motor's full 9 V), the editor's motor, a bright bulb, and a resistor that clearly slows the motor
const VALUE: Partial<Record<PieceKind, number>> = { battery: 4.5, motor: 20, lamp: 30, resistor: 20 };

const studKey = (s: Stud) => `${s.c},${s.r}`;
const step = (s: Stud, dir: 'h' | 'v', n: number): Stud => (dir === 'h' ? { c: s.c + n, r: s.r } : { c: s.c, r: s.r + n });

// The gaps a piece covers ("c,r,h" = the gap to the right of stud c,r; "v" = below it)
export const pieceGaps = (p: Pick<Piece, 'kind' | 'at' | 'dir'>) =>
  Array.from({ length: pieceLength(p.kind) }, (_, i) => `${studKey(step(p.at, p.dir, i))},${p.dir}`);

// The two studs it connects at
export const pieceEnds = (p: Pick<Piece, 'kind' | 'at' | 'dir'>): [Stud, Stud] => [p.at, step(p.at, p.dir, pieceLength(p.kind))];

// Studs a part's body covers (nothing else may connect there)
const coveredStuds = (p: Pick<Piece, 'kind' | 'at' | 'dir'>) =>
  pieceLength(p.kind) === 2 ? [step(p.at, p.dir, 1)] : [];

export interface Board { cols: number; rows: number }

const inBounds = (s: Stud, board: Board) => s.c >= 0 && s.r >= 0 && s.c < board.cols && s.r < board.rows;

// Whether a piece fits: on the board, no gap already filled, and no end landing on a part's body
export const canPlace = (pieces: Piece[], candidate: Pick<Piece, 'kind' | 'at' | 'dir'>, board: Board): boolean => {
  const [a, b] = pieceEnds(candidate);
  if (!inBounds(a, board) || !inBounds(b, board)) return false;
  const usedGaps = new Set(pieces.flatMap(pieceGaps));
  if (pieceGaps(candidate).some(g => usedGaps.has(g))) return false;
  const covered = new Set(pieces.flatMap(coveredStuds).map(studKey));
  if ([a, b].some(s => covered.has(studKey(s)))) return false;
  const ends = new Set(pieces.flatMap(pieceEnds).map(studKey));
  if (coveredStuds(candidate).some(s => ends.has(studKey(s)) || covered.has(studKey(s)))) return false;
  return true;
};

// The stud a part's body sits on
export const partMiddle = (p: Pick<Piece, 'at' | 'dir'>): Stud => step(p.at, p.dir, 1);

// A part is placed with two taps: the stud where it starts, then the stud where it finishes,
// two studs away in a straight line. The first stud is the part's first end (a battery's +,
// the end a motor turns "forwards" from), so the child chooses the direction, not the board.
// Pieces are stored running right or down from `at`; a part tapped right-to-left or
// bottom-to-top is the same place, turned around.
export const partBetween = (
  pieces: Piece[],
  kind: PieceKind,
  from: Stud,
  to: Stud,
  board: Board,
): Pick<Piece, 'kind' | 'at' | 'dir' | 'flipped'> | null => {
  const dc = to.c - from.c, dr = to.r - from.r;
  const straight = (Math.abs(dc) === 2 && dr === 0) || (Math.abs(dr) === 2 && dc === 0);
  if (!straight || pieceLength(kind) !== 2) return null;
  const dir = dr === 0 ? 'h' : 'v';
  const backwards = dc < 0 || dr < 0;
  const candidate = { kind, at: backwards ? to : from, dir, flipped: backwards } as const;
  return canPlace(pieces, candidate, board) ? candidate : null;
};

// The studs a part could finish at, once it starts at `from`
export const partEndOptions = (pieces: Piece[], kind: PieceKind, from: Stud, board: Board) =>
  [{ c: 2, r: 0 }, { c: -2, r: 0 }, { c: 0, r: 2 }, { c: 0, r: -2 }]
    .map(d => ({ c: from.c + d.c, r: from.r + d.r }))
    .flatMap(to => {
      const placement = partBetween(pieces, kind, from, to, board);
      return placement ? [{ to, placement }] : [];
    });

// The same part turned a quarter round on its middle stud, if there's room
export const rotated = (pieces: Piece[], piece: Piece, board: Board): Piece | null => {
  const dir = piece.dir === 'h' ? 'v' : 'h';
  const turned = { ...piece, dir, at: step(partMiddle(piece), dir, -1) } as Piece;
  return canPlace(pieces.filter(p => p.id !== piece.id), turned, board) ? turned : null;
};

export const allStuds = (board: Board): Stud[] =>
  Array.from({ length: board.cols * board.rows }, (_, i) => ({ c: i % board.cols, r: Math.floor(i / board.cols) }));

// Every gap on the board, for drawing tap targets
export const allGaps = (board: Board) => {
  const gaps: { at: Stud; dir: 'h' | 'v' }[] = [];
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (c + 1 < board.cols) gaps.push({ at: { c, r }, dir: 'h' });
      if (r + 1 < board.rows) gaps.push({ at: { c, r }, dir: 'v' });
    }
  }
  return gaps;
};

// ---- Board -> real circuit ----

const point = (s: Stud) => ({ x: s.c * STUD, y: s.r * STUD });

export const boardToLayout = (pieces: Piece[]): CircuitLayout => {
  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];
  for (const p of pieces) {
    const [a, b] = pieceEnds(p);
    if (p.kind === 'wire' || (isThing(p.kind) && THINGS[p.kind].conducts)) {
      wires.push({ id: p.id, x1: point(a).x, y1: point(a).y, x2: point(b).x, y2: point(b).y });
      continue;
    }
    if (isThing(p.kind)) continue;
    const type = COMPONENT_OF[p.kind];
    // Pin 0 (a battery's +) is at the start stud unless the part is turned around
    const base = p.dir === 'h' ? 0 : 90;
    const c: CircuitComponent = {
      id: p.id,
      type,
      x: (point(a).x + point(b).x) / 2,
      y: (point(a).y + point(b).y) / 2,
      rotation: p.flipped ? base + 180 : base,
    };
    if (COMPONENT_DEFS[type].value) c.value = VALUE[p.kind] ?? COMPONENT_DEFS[type].value!.default;
    if (p.kind === 'switch') c.closed = !!p.closed;
    components.push(c);
  }
  return { components, wires };
};

// ---- Goals ----

export interface GoalCheck { goal: CircuitGoal; met: boolean }

// `tested`: the things tried so far in this mission (see testedThings)
export const checkGoals = (
  pieces: Piece[],
  goals: CircuitGoal[],
  result = simulate(boardToLayout(pieces)),
  tested: ReadonlySet<ThingKind> = new Set(),
): GoalCheck[] =>
  goals.map(goal => ({ goal, met: goal.kind === 'things-tested' ? tested.size >= goal.count : goalMet(pieces, goal, result) }));

// Whether anything is moving or glowing
const isGoing = (pieces: Piece[], result: SimulationResult) =>
  pieces.some(p => (p.kind === 'motor' && Math.abs(result.readings[p.id]?.speed ?? 0) > 0.05)
    || (p.kind === 'lamp' && (result.readings[p.id]?.brightness ?? 0) > 0.05));

// The things on the board that are being tested right now: in a place where, if they were a
// wire, the loop would work. Whether it then actually works is the test's answer.
export const testedThings = (pieces: Piece[]): Piece[] =>
  pieces.filter(t => isThing(t.kind)
    && isGoing(pieces, simulate(boardToLayout(pieces.map(p => (p.id === t.id ? { ...p, kind: 'wire' as const } : p))))));

const withSwitch = (pieces: Piece[], id: string, closed: boolean) =>
  pieces.map(p => (p.id === id ? { ...p, closed } : p));

const goalMet = (pieces: Piece[], goal: CircuitGoal, result: SimulationResult): boolean => {
  const of = (kind: PieceKind) => pieces.filter(p => p.kind === kind).map(p => result.readings[p.id]).filter(Boolean);
  switch (goal.kind) {
    case 'motor-spins': {
      const min = goal.minSpeed ?? 0.3;
      return of('motor').some(r => {
        const s = r.speed ?? 0;
        if (goal.maxSpeed !== undefined && Math.abs(s) > goal.maxSpeed) return false;
        if (goal.direction === 'backwards') return s <= -min;
        if (goal.direction === 'forwards') return s >= min;
        return Math.abs(s) >= min;
      });
    }
    case 'lamp-lit':
      return of('lamp').filter(r => (r.brightness ?? 0) >= (goal.minBrightness ?? 0.3)).length >= (goal.count ?? 1);
    case 'switch-controls':
      // Judged with the switch on and off, whichever way it's set now
      return pieces.some(sw => sw.kind === 'switch'
        && isGoing(pieces, simulate(boardToLayout(withSwitch(pieces, sw.id, true))))
        && !isGoing(pieces, simulate(boardToLayout(withSwitch(pieces, sw.id, false)))));
    case 'things-tested':
      return false; // needs the mission's history: checkGoals handles it
    case 'no-short':
      // Only counts once there's something that could short
      return pieces.some(p => p.kind === 'battery') && !result.warnings.some(w => w.kind === 'short-circuit');
  }
};

// What to tell a child about their circuit, in their words. The first problem wins.
export const kidsFeedback = (pieces: Piece[], result: SimulationResult): { tone: 'good' | 'problem' | 'idle'; text: string } => {
  const kinds = new Set(result.warnings.map(w => w.kind));
  if (!pieces.some(p => p.kind === 'battery')) return { tone: 'idle', text: 'Every circuit needs a battery to push the electricity round.' };
  if (kinds.has('short-circuit')) {
    return { tone: 'problem', text: 'Short circuit! The electricity is taking a shortcut straight back to the battery. That makes real batteries hot. Take a wire out.' };
  }
  if (isGoing(pieces, result)) {
    const lamps = pieces.filter(p => p.kind === 'lamp').map(p => result.readings[p.id]?.brightness ?? 0);
    if (lamps.some(b => b > 0.05) && lamps.some(b => b <= 0.05)) {
      return { tone: 'problem', text: "One bulb is still dark: it isn’t part of a complete loop yet." };
    }
    if (lamps.length > 1 && Math.max(...lamps) < 0.6) {
      return { tone: 'problem', text: "Your bulbs are on, but dim. Bulbs in a row share the battery’s push. Can you give each bulb its own path from one end of the battery to the other?" };
    }
    const conductor = testedThings(pieces).find(p => isThing(p.kind) && THINGS[p.kind].conducts);
    if (conductor && isThing(conductor.kind)) {
      const t = THINGS[conductor.kind];
      return { tone: 'good', text: `The ${t.name.toLowerCase()} lets electricity through: it’s a conductor! It’s made of ${t.material}.` };
    }
    return { tone: 'good', text: 'Electricity is flowing round your loop!' };
  }
  const insulator = testedThings(pieces).find(p => isThing(p.kind) && !THINGS[p.kind].conducts);
  if (insulator && isThing(insulator.kind)) {
    const t = THINGS[insulator.kind];
    return { tone: 'problem', text: `The ${t.name.toLowerCase()} doesn’t let electricity through: it’s an insulator. It’s made of ${t.material}.` };
  }
  if (pieces.some(p => p.kind === 'switch' && !p.closed)) {
    return { tone: 'problem', text: 'The switch is off, so the loop is broken. Tap the switch to turn it on.' };
  }
  // Two batteries facing opposite ways cancel out: turning one round would make it go
  const batteries = pieces.filter(p => p.kind === 'battery');
  if (batteries.length > 1 && batteries.some(b =>
    isGoing(pieces, simulate(boardToLayout(pieces.map(p => (p.id === b.id ? { ...p, flipped: !p.flipped } : p))))))) {
    return { tone: 'problem', text: 'Your batteries are pushing against each other, so they cancel out. Turn one of them around so their + ends point the same way round the loop.' };
  }
  const through = pieces.some(p => p.kind === 'motor') ? 'the motor' : pieces.some(p => p.kind === 'lamp') ? 'the bulb' : 'your parts';
  return { tone: 'problem', text: `Nothing is happening yet. Electricity needs a complete loop: out of the battery, through ${through}, and back to the battery.` };
};
