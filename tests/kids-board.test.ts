// CirKit Kids snap board: placement rules, board -> real circuit, goals and kid feedback.
// Run with: npm test
import { simulate } from '../src/lib/simulation';
import { isLayoutValid } from '../src/lib/wires';
import { allGaps, boardToLayout, canPlace, checkGoals, kidsFeedback, pieceGaps, placementFor, type Board } from '../src/lib/kids/board';
import makeItGo from '../src/content/kids/missions/make-it-go';
import { CIRCUIT_MISSIONS } from '../src/content/kids';
import type { Piece, PieceKind } from '../src/types/kids';

let fails = 0, passes = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passes++;
  else { fails++; console.log('FAIL', name, detail); }
};

let n = 0;
const piece = (kind: PieceKind, c: number, r: number, dir: 'h' | 'v', extra: Partial<Piece> = {}): Piece =>
  ({ id: `${kind}${n++}`, kind, at: { c, r }, dir, ...extra });
const wires = (spec: [number, number, 'h' | 'v'][]) => spec.map(([c, r, d]) => piece('wire', c, r, d));

const board: Board = makeItGo.board;

// ---- Placement ----
{
  const w = piece('wire', 0, 0, 'h');
  check('place: a wire fits an empty gap', canPlace([], w, board));
  check('place: off the board is refused', !canPlace([], piece('wire', 5, 0, 'h'), board));
  check('place: one piece per gap', !canPlace([w], piece('wire', 0, 0, 'h'), board));
  const motor = piece('motor', 1, 1, 'h');
  check('place: a part covers two gaps', pieceGaps(motor).length === 2);
  check('place: nothing may end on a part\'s middle', !canPlace([motor], piece('wire', 2, 1, 'v'), board) && !canPlace([motor], piece('wire', 2, 0, 'v'), board));
  check('place: wires may end on a part\'s ends', canPlace([motor], piece('wire', 1, 1, 'v'), board) && canPlace([motor], piece('wire', 3, 1, 'v'), board));
  check('place: a part can\'t sit across another piece\'s end', !canPlace([piece('wire', 2, 2, 'v')], piece('battery', 1, 2, 'h'), board));
  const atEdge = placementFor([], 'battery', { at: { c: 4, r: 0 }, dir: 'h' }, board);
  check('place: a part tapped at the edge ends there instead', atEdge?.at.c === 3, JSON.stringify(atEdge));
  check('place: every gap is offered once', allGaps(board).length === (board.cols - 1) * board.rows + board.cols * (board.rows - 1));
}

// ---- "Make it go": a solution, built only from the tray ----
const solution = (): Piece[] => [
  piece('battery', 0, 1, 'v'),
  piece('motor', 2, 0, 'h'),
  ...wires([[0, 0, 'v'], [0, 0, 'h'], [1, 0, 'h'], [4, 0, 'h'], [5, 0, 'v'], [5, 1, 'v'], [5, 2, 'v'],
    [0, 3, 'h'], [1, 3, 'h'], [2, 3, 'h'], [3, 3, 'h'], [4, 3, 'h']]),
];
{
  const pieces = solution();
  // Each piece placed in turn must be allowed
  const built: Piece[] = [];
  for (const p of pieces) {
    check(`solution: ${p.kind} at ${p.at.c},${p.at.r} ${p.dir} can be placed`, canPlace(built, p, board));
    built.push(p);
  }
  const counts = new Map<PieceKind, number>();
  pieces.forEach(p => counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1));
  check('solution: uses only what the tray offers', makeItGo.tray.every(t => (counts.get(t.kind) ?? 0) <= t.count) && [...counts.keys()].every(k => makeItGo.tray.some(t => t.kind === k)));

  const layout = boardToLayout(pieces);
  check('solution: the board is a valid circuit', isLayoutValid(layout.components, layout.wires));
  const result = simulate(layout);
  const motor = result.readings[pieces[1].id];
  check('solution: the motor runs forwards at half speed (one 4.5 V battery)', Math.abs((motor.speed ?? 0) - 0.5) < 0.02, JSON.stringify(motor));
  check('solution: every goal is met', checkGoals(pieces, makeItGo.goals).every(g => g.met));
  check('solution: kids are told it works', kidsFeedback(pieces, result).tone === 'good');
}

// ---- Common mistakes ----
{
  const gap = solution().filter((p, i) => i !== 6); // one wire missing on the right
  const result = simulate(boardToLayout(gap));
  check('gap: the motor stops', Math.abs(result.readings[gap[1].id].speed ?? 0) < 1e-6);
  check('gap: goal not met', !checkGoals(gap, makeItGo.goals)[0].met);
  check('gap: kids are told to complete the loop', kidsFeedback(gap, result).text.includes('complete loop'));

  const flipped = solution();
  flipped[0] = { ...flipped[0], flipped: true };
  const back = simulate(boardToLayout(flipped)).readings[flipped[1].id].speed ?? 0;
  check('flipped battery: the motor runs backwards', back < -0.45, `${back}`);
  check('flipped battery: "the motor spins" still counts', checkGoals(flipped, makeItGo.goals)[0].met);
  check('flipped battery: a "backwards" goal sees it', checkGoals(flipped, [{ kind: 'motor-spins', text: '', direction: 'backwards' }])[0].met);

  // A loop of wire straight round the battery
  const short = [piece('battery', 1, 1, 'h'), ...wires([[1, 1, 'v'], [1, 2, 'h'], [2, 2, 'h'], [3, 1, 'v']])];
  const shortResult = simulate(boardToLayout(short));
  check('short: the simulator calls it a short circuit', shortResult.warnings.some(w => w.kind === 'short-circuit'));
  check('short: no-short goal fails', !checkGoals(short, [{ kind: 'no-short', text: '' }])[0].met);
  check('short: kids are warned', kidsFeedback(short, shortResult).text.startsWith('Short circuit'));

  check('empty board: asks for a battery', kidsFeedback([], simulate(boardToLayout([]))).text.includes('battery'));
}

// ---- A switch in the loop ----
{
  // Swap the two left-hand bottom wires for a switch
  const base = solution().filter(p => !(p.kind === 'wire' && p.at.r === 3 && p.at.c < 2));
  const off = [...base, piece('switch', 0, 3, 'h', { closed: false })];
  const on = [...base, piece('switch', 0, 3, 'h', { closed: true })];
  check('switch off: motor still', !checkGoals(off, makeItGo.goals)[0].met);
  check('switch off: kids are told to turn it on', kidsFeedback(off, simulate(boardToLayout(off))).text.includes('switch is off'));
  check('switch on: motor spins', checkGoals(on, makeItGo.goals)[0].met);
}

// ---- Two batteries in series run the motor at full speed (for "Faster!") ----
{
  const two = solution();
  // Replace the left column (battery + top wire) with two batteries stacked: (0,0)-(0,2) and (0,2)-(0,4)
  const pieces = [
    piece('battery', 0, 0, 'v'), piece('battery', 0, 2, 'v'), two[1],
    ...wires([[0, 0, 'h'], [1, 0, 'h'], [4, 0, 'h'], [5, 0, 'v'], [5, 1, 'v'], [5, 2, 'v'], [5, 3, 'v'],
      [0, 4, 'h'], [1, 4, 'h'], [2, 4, 'h'], [3, 4, 'h'], [4, 4, 'h']]),
  ];
  const speed = simulate(boardToLayout(pieces)).readings[two[1].id].speed ?? 0;
  check('two batteries: the motor runs at full speed', speed > 0.97, `${speed}`);
}

// ---- Content checks ----
for (const m of CIRCUIT_MISSIONS) {
  if (m.kind !== 'circuit') continue;
  check(`${m.id}: start pieces fit`, m.start.every((p, i) => canPlace(m.start.slice(0, i), p, m.board)));
  check(`${m.id}: start is not already solved`, !checkGoals(m.start, m.goals).every(g => g.met));
  check(`${m.id}: has goals`, m.goals.length > 0);
}

console.log(fails ? `${fails} board checks FAILED, ${passes} passed` : `all ${passes} board checks passed`);
if (fails) process.exit(1);
